# December 2026 MTC Batch Portal & Virtual Program Maker

A lightweight web application for the **December 2026 Missionary Training Center (MTC) Batch**, featuring a **Missionary Intake Registry** and a **Virtual Program Maker & Bulletin Generator** backed by **Turso (LibSQL / SQLite)**.

---

## Features

### 1. Missionary Registration & Batch Roster
- Collects missionary information:
  - **Missionary Email** (validated format, duplicate check)
  - **First Name**
  - **Last Name**
- Live searchable batch roster table.
- One-click missionary assignment directly into virtual meeting agendas.

### 2. Virtual Program Maker & Bulletin Generator
- Complete order-of-service editor for:
  - Batch Devotionals
  - Missionary Farewells
  - District Testimony Meetings
  - Orientation Assemblies
- Fields for leadership, conducting officers, hymns, prayers, speakers, scripture themes, and musical items.
- Live, authentic church program bulletin preview.
- One-click templates (Batch Devotional and Farewell).
- Print-ready (`window.print()` / `@media print`) layout formatted for US Letter / A4 paper or PDF export.
- Saves and loads custom programs directly to/from Turso SQLite.

### 3. Turso Database Integration
- Uses official `@libsql/client`.
- Runs immediately out-of-the-box with local SQLite fallback (`file:data/batch.db`).
- Seamless toggle to Turso Cloud by setting `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `.env`.
- Auto-initializes tables and indexes on server startup.

### 4. High-Craft Frontend Design
- Grounded, dignified liturgical aesthetic avoiding common AI design clichés (zero gradients, zero em-dashes, no generic card glassmorphism, high contrast accessibility).

---

## Quick Start (Localhost)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
npm start
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Connecting to Turso Cloud

1. Create your database via Turso CLI:
   ```bash
   turso db create december-2026-mtc
   ```

2. Get database URL & auth token:
   ```bash
   turso db show december-2026-mtc --url
   turso db tokens create december-2026-mtc
   ```

3. Add them to your `.env` file:
   ```env
   PORT=3000
   TURSO_DATABASE_URL=libsql://december-2026-mtc-[org].turso.io
   TURSO_AUTH_TOKEN=your-turso-jwt-auth-token
   ```

4. Restart the server. Tables are auto-migrated.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Portal UI (Registration & Program Maker) |
| `GET` | `/api/health` | Server and Turso database connection status |
| `GET` | `/api/missionaries` | List all registered missionaries |
| `POST` | `/api/register` | Register a new missionary (`{ email, firstName, lastName }`) |
| `GET` | `/api/programs` | List all saved virtual programs |
| `GET` | `/api/programs/:slug` | Retrieve a specific virtual program |
| `POST` | `/api/programs` | Create or update a virtual program |
| `DELETE` | `/api/programs/:slug` | Delete a virtual program |

---

## Repository Structure

```
december-2026-mtc-batch/
├── lib/
│   └── db.js            # Turso LibSQL client, missionaries & programs CRUD
├── public/
│   └── index.html       # Single-page app with tabs, roster, program editor & bulletin
├── graphify-out/        # Codebase knowledge graph
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Package configuration
├── README.md            # Documentation
└── server.js            # Node HTTP server & REST API
```
