import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import type { IncomingMessage, ServerResponse } from "http"

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const RECIPIENT_NAME = 'Oreoluwa'

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
