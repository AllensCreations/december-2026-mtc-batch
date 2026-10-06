# Graph Report - december-2026-mtc-batch  (2026-10-05)

## Corpus Check
- 4 files · ~5,689 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .example 1, (none) 1)

## Summary
- 54 nodes · 67 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59f05f5a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- server.js
- db.js
- getClient
- server
- dependencies
- scripts
- December 2026 MTC Batch Homepage
- getProgramBySlugOrId

## God Nodes (most connected - your core abstractions)
1. `getClient()` - 10 edges
2. `December 2026 MTC Batch Homepage` - 6 edges
3. `server` - 4 edges
4. `🚀 Quick Start (Localhost)` - 4 edges
5. `getProgramBySlugOrId()` - 3 edges
6. `saveProgram()` - 3 edges
7. `scripts` - 3 edges
8. `resolveDbConfig()` - 2 edges
9. `initDb()` - 2 edges
10. `registerMissionary()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `getDbStatus()` --calls--> `getClient()`  [EXTRACTED]
  lib/db.js → lib/db.js  _Bridges community 3 → community 2_
- `getProgramBySlugOrId()` --calls--> `getClient()`  [EXTRACTED]
  lib/db.js → lib/db.js  _Bridges community 3 → community 8_

## Import Cycles
- None detected.

## Communities (9 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.20
Nodes (9): author, description, keywords, license, main, name, version, dotenv (+1 more)

### Community 1 - "server.js"
Cohesion: 0.20
Nodes (5): db, fs, http, path, PUBLIC_DIR

### Community 2 - "db.js"
Cohesion: 0.33
Nodes (5): { createClient }, fs, getDbStatus(), listPrograms(), path

### Community 3 - "getClient"
Cohesion: 0.33
Nodes (6): deleteProgram(), getClient(), initDb(), listMissionaries(), registerMissionary(), resolveDbConfig()

### Community 4 - "server"
Cohesion: 0.50
Nodes (4): parseJsonBody(), sendJson(), server, serveStatic()

### Community 5 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, dotenv, @libsql/client

### Community 6 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, dev, start

### Community 7 - "December 2026 MTC Batch Homepage"
Cohesion: 0.20
Nodes (9): 1. Install Dependencies, 2. Configure Environment, 3. Start the Server, 📡 API Endpoints, 🗄️ Connecting to Turso Cloud, December 2026 MTC Batch Homepage, 🌟 Features, 📁 Project Structure (+1 more)

## Knowledge Gaps
- **27 isolated node(s):** `fs`, `path`, `{ createClient }`, `name`, `version` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 30 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@libsql/client` connect `package.json` to `db.js`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ createClient }` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._