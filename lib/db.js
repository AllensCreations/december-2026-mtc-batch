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

  // 1. Missionaries Table
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

  // 2. Virtual Programs Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      occasion TEXT DEFAULT 'Batch Devotional',
      event_date TEXT,
      event_time TEXT,
      location TEXT,
      presiding TEXT,
      conducting TEXT,
      pianist TEXT,
      chorister TEXT,
      opening_hymn TEXT,
      invocation TEXT,
      scripture_theme TEXT,
      speaker_1 TEXT,
      musical_number TEXT,
      speaker_2 TEXT,
      testimonies_note TEXT,
      closing_remarks TEXT,
      closing_hymn TEXT,
      benediction TEXT,
      additional_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
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

async function listPrograms() {
  const db = getClient();
  const result = await db.execute(`
    SELECT id, slug, title, occasion, event_date, event_time, location, presiding, conducting, updated_at, created_at
    FROM programs
    ORDER BY updated_at DESC;
  `);

  return result.rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    occasion: row.occasion,
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    presiding: row.presiding,
    conducting: row.conducting,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function getProgramBySlugOrId(identifier) {
  const db = getClient();
  const isNumeric = /^\d+$/.test(String(identifier));

  const result = await db.execute({
    sql: isNumeric 
      ? `SELECT * FROM programs WHERE id = ? LIMIT 1`
      : `SELECT * FROM programs WHERE slug = ? LIMIT 1`,
    args: [identifier]
  });

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    occasion: row.occasion,
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    presiding: row.presiding,
    conducting: row.conducting,
    pianist: row.pianist,
    chorister: row.chorister,
    openingHymn: row.opening_hymn,
    invocation: row.invocation,
    scriptureTheme: row.scripture_theme,
    speaker1: row.speaker_1,
    musicalNumber: row.musical_number,
    speaker2: row.speaker_2,
    testimoniesNote: row.testimonies_note,
    closingRemarks: row.closing_remarks,
    closingHymn: row.closing_hymn,
    benediction: row.benediction,
    additionalNotes: row.additional_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function saveProgram(data) {
  const db = getClient();
  const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `program-${Date.now()}`).trim();
  const title = (data.title || 'December 2026 Batch Program').trim();

  const query = `
    INSERT INTO programs (
      slug, title, occasion, event_date, event_time, location,
      presiding, conducting, pianist, chorister,
      opening_hymn, invocation, scripture_theme,
      speaker_1, musical_number, speaker_2,
      testimonies_note, closing_remarks, closing_hymn, benediction,
      additional_notes, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      occasion = excluded.occasion,
      event_date = excluded.event_date,
      event_time = excluded.event_time,
      location = excluded.location,
      presiding = excluded.presiding,
      conducting = excluded.conducting,
      pianist = excluded.pianist,
      chorister = excluded.chorister,
      opening_hymn = excluded.opening_hymn,
      invocation = excluded.invocation,
      scripture_theme = excluded.scripture_theme,
      speaker_1 = excluded.speaker_1,
      musical_number = excluded.musical_number,
      speaker_2 = excluded.speaker_2,
      testimonies_note = excluded.testimonies_note,
      closing_remarks = excluded.closing_remarks,
      closing_hymn = excluded.closing_hymn,
      benediction = excluded.benediction,
      additional_notes = excluded.additional_notes,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await db.execute({
    sql: query,
    args: [
      slug,
      title,
      data.occasion || 'Batch Devotional',
      data.eventDate || '',
      data.eventTime || '',
      data.location || '',
      data.presiding || '',
      data.conducting || '',
      data.pianist || '',
      data.chorister || '',
      data.openingHymn || '',
      data.invocation || '',
      data.scriptureTheme || '',
      data.speaker1 || '',
      data.musicalNumber || '',
      data.speaker2 || '',
      data.testimoniesNote || '',
      data.closingRemarks || '',
      data.closingHymn || '',
      data.benediction || '',
      data.additionalNotes || ''
    ]
  });

  return await getProgramBySlugOrId(slug);
}

async function deleteProgram(idOrSlug) {
  const db = getClient();
  const isNumeric = /^\d+$/.test(String(idOrSlug));

  await db.execute({
    sql: isNumeric ? `DELETE FROM programs WHERE id = ?` : `DELETE FROM programs WHERE slug = ?`,
    args: [idOrSlug]
  });

  return { success: true };
}

async function getDbStatus() {
  const db = getClient();
  try {
    const missionaryCountRes = await db.execute(`SELECT COUNT(*) as count FROM missionaries;`);
    const programCountRes = await db.execute(`SELECT COUNT(*) as count FROM programs;`);

    const missionaryCount = Number(missionaryCountRes.rows[0]?.count || 0);
    const programCount = Number(programCountRes.rows[0]?.count || 0);

    return {
      connected: true,
      mode: connectionMode,
      totalMissionaries: missionaryCount,
      totalPrograms: programCount
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
  listPrograms,
  getProgramBySlugOrId,
  saveProgram,
  deleteProgram,
  getDbStatus
};
