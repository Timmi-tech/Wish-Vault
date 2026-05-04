import { ensureClaimsTable, pool } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureClaimsTable();

    const result = await pool.query(`
      SELECT item_id
      FROM gift_claims
      WHERE is_unlimited = FALSE
      GROUP BY item_id
      HAVING COUNT(*) >= 2
      ORDER BY item_id ASC
    `);

    return res.status(200).json({
      claimedItemIds: result.rows.map((row) => row.item_id),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load claimed items',
    });
  }
}
