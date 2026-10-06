# Graph Report - december-2026-mtc-batch  (2026-10-05)

## Corpus Check
- 4 files · ~6,770 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .example 1, (none) 1)

## Summary
- 58 nodes · 72 edges · 7 communities
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f7faeae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- server.js
- db.js
- server
- dependencies
- scripts
- December 2026 MTC Batch Portal & Virtual Program Maker

## God Nodes (most connected - your core abstractions)
1. `getClient()` - 10 edges
2. `December 2026 MTC Batch Portal & Virtual Program Maker` - 6 edges
3. `server` - 5 edges
4. `Features` - 5 edges
5. `getProgramBySlugOrId()` - 3 edges
6. `saveProgram()` - 3 edges
7. `scripts` - 3 edges
8. `Quick Start (Localhost)` - 3 edges
9. `resolveDbConfig()` - 2 edges
10. `initDb()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.20
Nodes (9): author, description, keywords, license, main, name, version, dotenv (+1 more)

### Community 1 - "server.js"
Cohesion: 0.20
Nodes (5): db, fs, http, path, PUBLIC_DIR

### Community 2 - "db.js"
Cohesion: 0.25
Nodes (13): { createClient }, deleteProgram(), fs, getClient(), getDbStatus(), getProgramBySlugOrId(), initDb(), listMissionaries() (+5 more)

### Community 4 - "server"
Cohesion: 0.40
Nodes (5): parseJsonBody(), sendCsv(), sendJson(), server, serveStatic()

### Community 5 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, dotenv, @libsql/client

### Community 6 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, dev, start

### Community 7 - "December 2026 MTC Batch Portal & Virtual Program Maker"
Cohesion: 0.15
Nodes (12): 1. Install Dependencies, 1. Missionary Registration & Batch Roster, 2. Run the Server, 2. Virtual Program Maker & Bulletin Generator, 3. Turso Database Integration, 4. High-Craft Frontend Design, API Endpoints, Connecting to Turso Cloud (+4 more)

## Knowledge Gaps
- **29 isolated node(s):** `fs`, `path`, `{ createClient }`, `name`, `version` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 32 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@libsql/client` connect `package.json` to `db.js`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ createClient }` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._