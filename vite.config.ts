import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import type { IncomingMessage, ServerResponse } from "http"

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const RECIPIENT_NAME = 'Oreoluwa'

type PgPool = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>
  connect: () => Promise<PgClient>
}

type PgClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>
  release: () => void
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })

    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

let devPoolPromise: Promise<PgPool> | undefined
let devInitPromise: Promise<unknown> | undefined

async function getDevPool(connectionString: string): Promise<PgPool> {
  devPoolPromise ||= (async () => {
    // @ts-expect-error pg does not ship bundled TypeScript declarations in this project.
    const pg = await import('pg')
    const Pool = pg.default?.Pool || pg.Pool

    return new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  })()

  return devPoolPromise
}

async function ensureDevClaimsTable(pool: PgPool) {
  devInitPromise ||= pool.query(`
    CREATE TABLE IF NOT EXISTS gift_claims (
      id BIGSERIAL PRIMARY KEY,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      claimer_name TEXT NOT NULL,
      claimer_email TEXT,
      claimer_phone TEXT,
      message TEXT,
      is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DROP INDEX IF EXISTS gift_claims_once_per_item_idx;

    CREATE INDEX IF NOT EXISTS gift_claims_item_id_idx
      ON gift_claims (item_id);

    CREATE INDEX IF NOT EXISTS gift_claims_created_at_idx
      ON gift_claims (created_at DESC);
  `)

  await devInitPromise
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function brevoDevApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'brevo-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST')
          return sendJson(res, 405, { error: 'Method not allowed' })
        }

        const apiKey = env.BREVO_API_KEY
        const senderName = env.BREVO_SENDER_NAME || 'My wishlist'
        const senderEmail = env.BREVO_SENDER_EMAIL || 'odufowokanayotomiwa@gmail.com'
        const recipientEmail = env.BIRTHDAY_RECIPIENT_EMAIL || senderEmail

        if (!apiKey) {
          return sendJson(res, 500, { error: 'Brevo API key is not configured' })
        }

        try {
          const body = JSON.parse(await readBody(req)) as {
            subject?: string
            textContent?: string
            htmlContent?: string
          }

          if (!body.subject || !body.textContent) {
            return sendJson(res, 400, { error: 'Missing email subject or content' })
          }

          const brevoResponse = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'api-key': apiKey,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: {
                name: senderName,
                email: senderEmail,
              },
              to: [
                {
                  email: recipientEmail,
                  name: RECIPIENT_NAME,
                },
              ],
              subject: body.subject,
              textContent: body.textContent,
              htmlContent: body.htmlContent,
            }),
          })

          const responseText = await brevoResponse.text()
          const responsePayload = responseText ? JSON.parse(responseText) : { success: true }

          return sendJson(res, brevoResponse.status, responsePayload)
        } catch (error) {
          return sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Failed to send email',
          })
        }
      })

      server.middlewares.use('/api/claimed-items', async (req, res) => {
        if (req.method !== 'GET') {
          res.setHeader('Allow', 'GET')
          return sendJson(res, 405, { error: 'Method not allowed' })
        }

        const connectionString = env.DATABASE_URL || env.POSTGRES_URL

        if (!connectionString) {
          return sendJson(res, 500, { error: 'DATABASE_URL is not configured' })
        }

        try {
          const pool = await getDevPool(connectionString)
          await ensureDevClaimsTable(pool)
          const result = await pool.query(`
            SELECT item_id
            FROM gift_claims
            WHERE is_unlimited = FALSE
            GROUP BY item_id
            HAVING COUNT(*) >= 2
            ORDER BY item_id ASC
          `)

          return sendJson(res, 200, {
            claimedItemIds: result.rows.map((row) => row.item_id),
          })
        } catch (error) {
          return sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Failed to load claimed items',
          })
        }
      })

      server.middlewares.use('/api/claims', async (req, res) => {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST')
          return sendJson(res, 405, { error: 'Method not allowed' })
        }

        const connectionString = env.DATABASE_URL || env.POSTGRES_URL

        if (!connectionString) {
          return sendJson(res, 500, { error: 'DATABASE_URL is not configured' })
        }

        try {
          const body = JSON.parse(await readBody(req)) as Record<string, unknown>
          const itemId = Number(body.itemId)
          const itemName = cleanText(body.itemName)
          const category = cleanText(body.category)
          const name = cleanText(body.name)
          const email = cleanText(body.email) || null
          const phone = cleanText(body.phone) || null
          const message = cleanText(body.message) || null
          const allowMultipleClaims = itemId === 9 || itemName.toLowerCase() === 'cash gift'

          if (!Number.isInteger(itemId) || itemId <= 0 || !itemName || !category || !name) {
            return sendJson(res, 400, { error: 'Missing required claim fields' })
          }

          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return sendJson(res, 400, { error: 'Invalid email format' })
          }

          const pool = await getDevPool(connectionString)
          await ensureDevClaimsTable(pool)
          const client = await pool.connect()

          try {
            await client.query('BEGIN')
            await client.query('SELECT pg_advisory_xact_lock($1)', [itemId])

            if (!allowMultipleClaims) {
              const countResult = await client.query(
                'SELECT COUNT(*)::int AS claim_count FROM gift_claims WHERE item_id = $1 AND is_unlimited = FALSE',
                [itemId],
              )

              if (Number(countResult.rows[0].claim_count) >= 2) {
                await client.query('ROLLBACK')
                return sendJson(res, 409, { error: 'This gift has already been claimed twice' })
              }
            }

            const result = await client.query(
              `
                INSERT INTO gift_claims (
                  item_id,
                  item_name,
                  category,
                  claimer_name,
                  claimer_email,
                  claimer_phone,
                  message,
                  is_unlimited
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
              `,
              [itemId, itemName, category, name, email, phone, message, allowMultipleClaims],
            )

            const countAfterInsert = allowMultipleClaims
              ? 0
              : Number((await client.query(
                'SELECT COUNT(*)::int AS claim_count FROM gift_claims WHERE item_id = $1 AND is_unlimited = FALSE',
                [itemId],
              )).rows[0].claim_count)

            await client.query('COMMIT')

            return sendJson(res, 201, {
              claimId: result.rows[0].id,
              createdAt: result.rows[0].created_at,
              isClaimed: !allowMultipleClaims && countAfterInsert >= 2,
            })
          } catch (error) {
            await client.query('ROLLBACK')
            throw error
          } finally {
            client.release()
          }
        } catch (error) {
          return sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Failed to save claim',
          })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    plugins: [brevoDevApiPlugin(env), inspectAttr(), react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
