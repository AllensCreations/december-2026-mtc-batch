const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

let client = null;
let connectionMode = 'local';

function resolveDbConfig() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && (url.startsWith('libsql://') || url.startsWith('https://') || url.startsWith('http://')) && !url.includes('your-database-name')) {
    connectionMode = 'turso-cloud';
    return { url, authToken };
  }

  // Local SQLite fallback via LibSQL
  connectionMode = 'local-sqlite';
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const localFile = url && url.startsWith('file:') 
    ? (path.isAbsolute(url.replace('file:', '')) ? url : `file:${path.resolve(__dirname, '..', url.replace('file:', ''))}`)
    : `file:${path.join(dataDir, 'batch.db')}`;

  return { url: localFile };
}

function getClient() {
  if (!client) {
    const config = resolveDbConfig();
    client = createClient(config);
  }
  return client;
}

async function initDb() {
  const db = getClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS missionaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      batch TEXT DEFAULT 'December 2026',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_missionaries_email ON missionaries(email);
  `);

  return {
    mode: connectionMode,
    ready: true
  };
}

async function registerMissionary({ email, firstName, lastName, batch = 'December 2026' }) {
  const db = getClient();
  const cleanEmail = email.trim().toLowerCase();
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();

  try {
    const result = await db.execute({
      sql: `INSERT INTO missionaries (email, first_name, last_name, batch) VALUES (?, ?, ?, ?)`,
      args: [cleanEmail, cleanFirstName, cleanLastName, batch]
    });

    return {
      success: true,
      id: Number(result.lastInsertRowid),
      email: cleanEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      batch
    };
  } catch (err) {
    if (err.message && (err.message.includes('UNIQUE constraint failed') || err.message.includes('code: 2067') || err.message.includes('SQLITE_CONSTRAINT'))) {
      const error = new Error(`Missionary email "${cleanEmail}" is already registered.`);
      error.code = 'EMAIL_EXISTS';
      throw error;
    }
    throw err;
  }
}

async function listMissionaries() {
  const db = getClient();
  const result = await db.execute(`
    SELECT id, email, first_name, last_name, batch, created_at
    FROM missionaries
    ORDER BY created_at DESC;
  `);

  return result.rows.map(row => ({
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    batch: row.batch,
    createdAt: row.created_at
  }));
}

async function getDbStatus() {
  const db = getClient();
  try {
    const countResult = await db.execute(`SELECT COUNT(*) as count FROM missionaries;`);
    const count = Number(countResult.rows[0]?.count || 0);
    return {
      connected: true,
      mode: connectionMode,
      totalMissionaries: count
    };
  } catch (err) {
    return {
      connected: false,
      mode: connectionMode,
      error: err.message
    };
  }
}

module.exports = {
  getClient,
  initDb,
  registerMissionary,
  listMissionaries,
  getDbStatus
};
