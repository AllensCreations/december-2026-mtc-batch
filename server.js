require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./lib/db');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, filePath, contentType = 'text/html') {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // Health & DB status
    if (pathname === '/api/health' && req.method === 'GET') {
      const dbStatus = await db.getDbStatus();
      return sendJson(res, 200, {
        status: 'ok',
        service: 'december-2026-mtc-batch',
        db: dbStatus
      });
    }

    // List Missionaries
    if (pathname === '/api/missionaries' && req.method === 'GET') {
      const missionaries = await db.listMissionaries();
      return sendJson(res, 200, {
        success: true,
        count: missionaries.length,
        data: missionaries
      });
    }

    // Register Missionary
    if (pathname === '/api/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { email, firstName, lastName } = body;

      if (!email || !firstName || !lastName) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missionary Email, First Name, and Last Name are required.'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendJson(res, 400, {
          success: false,
          error: 'Please enter a valid missionary email address.'
        });
      }

      try {
        const missionary = await db.registerMissionary({
          email,
          firstName,
          lastName,
          batch: 'December 2026'
        });

        return sendJson(res, 201, {
          success: true,
          message: 'Missionary registered successfully.',
          missionary
        });
      } catch (err) {
        if (err.code === 'EMAIL_EXISTS') {
          return sendJson(res, 409, {
            success: false,
            error: err.message
          });
        }
        console.error('Registration error:', err);
        return sendJson(res, 500, {
          success: false,
          error: 'Database error occurred during registration.'
        });
      }
    }

    // Virtual Programs: List
    if (pathname === '/api/programs' && req.method === 'GET') {
      const programs = await db.listPrograms();
      return sendJson(res, 200, {
        success: true,
        count: programs.length,
        data: programs
      });
    }

    // Virtual Programs: Save (Create or Update)
    if (pathname === '/api/programs' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, {
          success: false,
          error: 'Program title is required.'
        });
      }

      try {
        const saved = await db.saveProgram(body);
        return sendJson(res, 201, {
          success: true,
          message: 'Virtual Program saved successfully.',
          data: saved
        });
      } catch (err) {
        console.error('Save program error:', err);
        return sendJson(res, 500, {
          success: false,
          error: 'Failed to save virtual program.'
        });
      }
    }

    // Virtual Programs: Get single program (/api/programs/:idOrSlug)
    if (pathname.startsWith('/api/programs/') && req.method === 'GET') {
      const identifier = decodeURIComponent(pathname.replace('/api/programs/', '').trim());
      if (!identifier) {
        return sendJson(res, 400, { success: false, error: 'Identifier required' });
      }

      const program = await db.getProgramBySlugOrId(identifier);
      if (!program) {
        return sendJson(res, 404, { success: false, error: 'Program not found' });
      }

      return sendJson(res, 200, { success: true, data: program });
    }

    // Virtual Programs: Delete program (/api/programs/:idOrSlug)
    if (pathname.startsWith('/api/programs/') && req.method === 'DELETE') {
      const identifier = decodeURIComponent(pathname.replace('/api/programs/', '').trim());
      if (!identifier) {
        return sendJson(res, 400, { success: false, error: 'Identifier required' });
      }

      await db.deleteProgram(identifier);
      return sendJson(res, 200, { success: true, message: 'Program deleted successfully.' });
    }

    // Static Frontend: Homepage
    if (pathname === '/' || pathname === '/index.html' || pathname.startsWith('/program/')) {
      return serveStatic(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html; charset=UTF-8');
    }

    // Unknown Route
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));

  } catch (err) {
    console.error('Server request error:', err);
    sendJson(res, 500, { error: 'Internal Server Error', details: err.message });
  }
});

async function start() {
  try {
    const initResult = await db.initDb();
    console.log(`Database initialized in [${initResult.mode}] mode.`);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(` December 2026 MTC Batch Portal & Program Maker`);
      console.log(` Localhost URL: http://localhost:${PORT}`);
      console.log(` Turso Mode:    ${initResult.mode}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  }
}

start();
