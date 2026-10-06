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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // API: Health & DB status
    if (pathname === '/api/health' && req.method === 'GET') {
      const dbStatus = await db.getDbStatus();
      return sendJson(res, 200, {
        status: 'ok',
        service: 'december-2026-mtc-batch',
        db: dbStatus
      });
    }

    // API: List Missionaries
    if (pathname === '/api/missionaries' && req.method === 'GET') {
      const missionaries = await db.listMissionaries();
      return sendJson(res, 200, {
        success: true,
        count: missionaries.length,
        data: missionaries
      });
    }

    // API: Register Missionary
    if (pathname === '/api/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { email, firstName, lastName } = body;

      if (!email || !firstName || !lastName) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required fields: Missionary Email, First Name, and Last Name are required.'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return sendJson(res, 400, {
          success: false,
          error: 'Please enter a valid email address.'
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
          message: 'Missionary registered successfully!',
          missionary
        });
      } catch (err) {
        if (err.code === 'EMAIL_EXISTS') {
          return sendJson(res, 409, {
            success: false,
            error: err.message
          });
        }
        console.error('Registration DB error:', err);
        return sendJson(res, 500, {
          success: false,
          error: 'Database error occurred during registration.'
        });
      }
    }

    // Static Frontend: Homepage
    if (pathname === '/' || pathname === '/index.html') {
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
      console.log(` December 2026 MTC Batch Homepage is Live!`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(` Database:  ${initResult.mode}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  }
}

start();
