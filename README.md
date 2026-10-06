# December 2026 MTC Batch Homepage

A fast, lightweight web portal and registration system for the **December 2026 Missionary Training Center (MTC) Batch**, built with Node.js and backed by **Turso (LibSQL / SQLite)**.

---

## 🌟 Features

- **Batch Homepage**: Clean, mobile-friendly landing page welcoming future missionaries preparing for the December 2026 intake.
- **Missionary Registration**: Simple onboarding form collecting:
  - **Missionary Email** (e.g. `elder.salviejo@missionary.org`)
  - **First Name**
  - **Last Name**
- **Live Batch Roster**: Real-time missionary directory with search and intake badges.
- **Turso Database**: Zero-config local SQLite fallback with instant toggle to Turso Cloud.
- **Ultra-lightweight**: Built on native Node.js HTTP with minimal external dependencies (`@libsql/client` and `dotenv`).

---

## 🚀 Quick Start (Localhost)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already pre-configured for local development):
```bash
cp .env.example .env
```

By default, the server stores data in a local SQLite database (`data/batch.db`).

### 3. Start the Server
```bash
npm start
# or for development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Connecting to Turso Cloud

To connect this repository to your Turso Cloud database:

1. **Log in or create a database using the Turso CLI**:
   ```bash
   turso db create december-2026-mtc
   ```

2. **Retrieve your Database URL**:
   ```bash
   turso db show december-2026-mtc --url
   # Output: libsql://december-2026-mtc-[org].turso.io
   ```

3. **Generate an Auth Token**:
   ```bash
   turso db tokens create december-2026-mtc
   ```

4. **Update your `.env` file**:
   ```env
   PORT=3000
   TURSO_DATABASE_URL=libsql://december-2026-mtc-[org].turso.io
   TURSO_AUTH_TOKEN=your-turso-jwt-auth-token
   ```

5. **Restart the server**:
   The table `missionaries` and required indexes will be created automatically on startup!

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the December 2026 Batch Homepage |
| `GET` | `/api/health` | Healthcheck and Turso connection status |
| `GET` | `/api/missionaries` | List all registered missionaries |
| `POST` | `/api/register` | Register a missionary (`{ email, firstName, lastName }`) |

---

## 📁 Project Structure

```
december-2026-mtc-batch/
├── lib/
│   └── db.js          # Turso / LibSQL client & operations
├── public/
│   └── index.html     # Responsive Homepage & Registration UI
├── .env.example       # Example environment configuration
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies & scripts
├── README.md          # Project documentation
└── server.js          # Node HTTP server & API routes
```
