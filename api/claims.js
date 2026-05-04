import { ensureClaimsTable, pool } from './_db.js';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const itemId = Number(req.body?.itemId);
  const itemName = cleanText(req.body?.itemName);
  const category = cleanText(req.body?.category);
  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email) || null;
  const phone = cleanText(req.body?.phone) || null;
  const message = cleanText(req.body?.message) || null;
  const allowMultipleClaims = itemId === 9 || itemName.toLowerCase() === 'cash gift';

  if (!Number.isInteger(itemId) || itemId <= 0 || !itemName || !category || !name) {
    return res.status(400).json({ error: 'Missing required claim fields' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await ensureClaimsTable();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [itemId]);

      if (!allowMultipleClaims) {
        const countResult = await client.query(
          'SELECT COUNT(*)::int AS claim_count FROM gift_claims WHERE item_id = $1 AND is_unlimited = FALSE',
          [itemId],
        );

        if (countResult.rows[0].claim_count >= 2) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'This gift has already been claimed twice' });
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
      );

      const countAfterInsert = allowMultipleClaims
        ? 0
        : (await client.query(
          'SELECT COUNT(*)::int AS claim_count FROM gift_claims WHERE item_id = $1 AND is_unlimited = FALSE',
          [itemId],
        )).rows[0].claim_count;

      await client.query('COMMIT');

      return res.status(201).json({
        claimId: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        isClaimed: !allowMultipleClaims && countAfterInsert >= 2,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to save claim',
    });
  }
}
