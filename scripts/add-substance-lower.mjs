#!/usr/bin/env node
// Adds a Unicode-lowercased `substance_lower` column to a built ADR DB and
// populates it using Node.js's `String.prototype.toLowerCase` (which is
// Unicode-correct, unlike Hermes on iOS and SQLite's ASCII-only LOWER()).
//
// Idempotent: safe to run on a DB that already has the column.
// Usage: node scripts/add-substance-lower.mjs [path-to-db]

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DB = resolve(process.argv[2] ?? 'assets/db/adrzone.db');
if (!existsSync(DB)) {
  console.error(`DB not found: ${DB}`);
  process.exit(1);
}

const db = new DatabaseSync(DB);

const cols = db.prepare(`PRAGMA table_info(substances)`).all();
const hasCol = cols.some((c) => c.name === 'substance_lower');
if (!hasCol) {
  db.exec(`ALTER TABLE substances ADD COLUMN substance_lower TEXT`);
}

const rows = db.prepare(`SELECT id, substance FROM substances`).all();
const upd = db.prepare(`UPDATE substances SET substance_lower = ? WHERE id = ?`);
db.exec('BEGIN');
let updated = 0;
for (const r of rows) {
  upd.run((r.substance ?? '').toLowerCase(), r.id);
  updated++;
}
db.exec('COMMIT');

db.exec(`CREATE INDEX IF NOT EXISTS idx_substance_lower ON substances(substance_lower)`);

console.log(`Updated ${updated} rows in ${DB}`);

// Sanity check: verify ХЛОР has been lowercased correctly
const chlor = db.prepare(`SELECT substance, substance_lower FROM substances WHERE un_number = '1017'`).get();
if (chlor) {
  console.log(`UN 1017: substance="${chlor.substance}" substance_lower="${chlor.substance_lower}"`);
}

db.close();
