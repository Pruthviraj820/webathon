import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const { rows } = await pool.query('SELECT * FROM users WHERE id = 1');
console.log('Column keys:', Object.keys(rows[0]));
console.log('id:', rows[0].id, typeof rows[0].id);
console.log('dailySuggestionsShown:', rows[0].dailySuggestionsShown, '| key exists:', 'dailySuggestionsShown' in rows[0]);
console.log('dateOfBirth:', rows[0].dateOfBirth, '| key exists:', 'dateOfBirth' in rows[0]);
console.log('isBanned:', rows[0].isBanned, '| key exists:', 'isBanned' in rows[0]);
await pool.end();
