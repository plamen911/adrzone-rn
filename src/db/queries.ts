import { getDb } from './index';
import { lowerCyrillicSafe } from './caseFold';
import type {
  AdrClass,
  DistanceRow,
  Instruction,
  SubstanceDetails,
  SubstanceListRow,
} from './types';

export type SearchParams = { query: string; adrClass?: string; limit?: number };

export async function searchSubstances({
  query,
  adrClass,
  limit = 100,
}: SearchParams): Promise<SubstanceListRow[]> {
  const db = await getDb();
  const where: string[] = [];
  const selectParams: (string | number)[] = [];
  const whereParams: (string | number)[] = [];

  const q = query.trim();
  const qLower = q ? lowerCyrillicSafe(q) : '';
  const qUpper = q ? q.toUpperCase() : '';

  // Relevance rank: exact name match (0) → name prefix (1) → exact UN/HIN (2) → substring (3).
  // Ensures pure "ХЛОР" beats compounds like "ХЛОРИД" within the LIMIT window.
  let rankSelect = '0 AS rank';
  if (q) {
    rankSelect = `CASE
      WHEN s.substance_lower = ? THEN 0
      WHEN s.substance_lower LIKE ? THEN 1
      WHEN s.un_number = ? OR s.hin = ? THEN 2
      ELSE 3
    END AS rank`;
    selectParams.push(qLower, `${qLower}%`, q, qUpper);
  }

  if (q) {
    if (/^[Xx]?\d+$/.test(q)) {
      where.push(
        `(s.hin LIKE ? OR s.un_number LIKE ? OR s.substance_lower LIKE ?)`
      );
      whereParams.push(`%${qUpper}%`, `%${q}%`, `%${qLower}%`);
    } else {
      where.push(`s.substance_lower LIKE ?`);
      whereParams.push(`%${qLower}%`);
    }
  }

  if (adrClass) {
    where.push(`s.adr_class = ?`);
    whereParams.push(adrClass);
  }

  if (where.length === 0) return [];

  const sql = `
    SELECT s.*,
           c.danger_labels AS danger_labels,
           EXISTS(SELECT 1 FROM distances d WHERE d.un_number = s.un_number) AS has_distance,
           ${rankSelect}
    FROM substances s
    LEFT JOIN adr_classes c ON c.class_code = s.adr_class
    WHERE ${where.join(' AND ')}
    ORDER BY rank, s.substance, s.un_number
    LIMIT ?
  `;
  return db.getAllAsync<SubstanceListRow>(sql, [...selectParams, ...whereParams, limit]);
}

export async function getSubstanceDetails(id: number): Promise<SubstanceDetails | null> {
  const db = await getDb();
  return db.getFirstAsync<SubstanceDetails>(
    `SELECT s.*, h.hin_descr AS hin_descr, c.danger_labels AS danger_labels,
            c.class_descr AS class_descr, g.group_descr AS group_descr,
            f.code_descr AS code_descr
     FROM substances s
     LEFT JOIN hin_codes h ON h.hin_code = s.hin
     LEFT JOIN adr_classes c ON c.class_code = s.adr_class
     LEFT JOIN classify_codes f ON f.classify_code = s.classify_code
     LEFT JOIN packing_groups g ON g.group_code = s.packing_group
     WHERE s.id = ?`,
    [id]
  );
}

export async function getInstruction(id: number): Promise<Instruction | null> {
  const db = await getDb();
  return db.getFirstAsync<Instruction>(
    `SELECT s.substance AS substance, i.id AS id, i.instruction AS instruction
     FROM substances s
     LEFT JOIN instructions i ON i.id = s.instruction_id
     WHERE s.id = ?`,
    [id]
  );
}

export async function getDistances(substanceId: number): Promise<DistanceRow[]> {
  const db = await getDb();
  return db.getAllAsync<DistanceRow>(
    `SELECT d.*
     FROM distances d
     INNER JOIN substances s ON s.un_number = d.un_number
     WHERE s.id = ?`,
    [substanceId]
  );
}

export async function getSubstancesByIds(ids: number[]): Promise<SubstanceListRow[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  const rows = await db.getAllAsync<SubstanceListRow>(
    `SELECT s.*,
            c.danger_labels AS danger_labels,
            EXISTS(SELECT 1 FROM distances d WHERE d.un_number = s.un_number) AS has_distance
     FROM substances s
     LEFT JOIN adr_classes c ON c.class_code = s.adr_class
     WHERE s.id IN (${placeholders})`,
    ids
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is SubstanceListRow => !!r);
}

export async function countSubstances(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM substances`
  );
  return row?.n ?? 0;
}

export async function listAdrClasses(): Promise<AdrClass[]> {
  const db = await getDb();
  return db.getAllAsync<AdrClass>(
    `SELECT c.*,
            (SELECT COUNT(*) FROM substances s WHERE s.adr_class = c.class_code) AS substance_count
     FROM adr_classes c
     ORDER BY c.is_subclass, c.class_code`
  );
}
