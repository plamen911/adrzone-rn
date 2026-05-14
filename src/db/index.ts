import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

const DB_NAME = 'adrzone.db';
const HASH_FILE = 'adrzone.db.hash';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = openDb();
  return dbPromise;
}

async function openDb(): Promise<SQLite.SQLiteDatabase> {
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  if (!sqliteDir.exists) sqliteDir.create({ intermediates: true });

  const target = new File(sqliteDir, DB_NAME);
  const hashFile = new File(sqliteDir, HASH_FILE);

  const asset = Asset.fromModule(require('../../assets/db/adrzone.db'));
  const bundledHash = asset.hash ?? '';
  const installedHash = hashFile.exists ? (await hashFile.text()).trim() : '';

  if (!target.exists || installedHash !== bundledHash) {
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error('Bundled DB asset has no localUri');
    if (target.exists) target.delete();
    const source = new File(asset.localUri);
    source.copy(target);
    hashFile.write(bundledHash);
  }

  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await ensureSearchIndex(db);
  return db;
}

// SQLite's LOWER() only handles ASCII, so we maintain a JS-lowercased
// column (Unicode-aware) for case-insensitive search over Cyrillic names.
async function ensureSearchIndex(db: SQLite.SQLiteDatabase): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(substances)`
  );
  if (!cols.some((c) => c.name === 'substance_lower')) {
    await db.execAsync(
      `ALTER TABLE substances ADD COLUMN substance_lower TEXT`
    );
  }
  const missing = await db.getAllAsync<{ id: number; substance: string | null }>(
    `SELECT id, substance FROM substances WHERE substance_lower IS NULL`
  );
  if (missing.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const row of missing) {
      await db.runAsync(
        `UPDATE substances SET substance_lower = ? WHERE id = ?`,
        [(row.substance ?? '').toLowerCase(), row.id]
      );
    }
  });
}
