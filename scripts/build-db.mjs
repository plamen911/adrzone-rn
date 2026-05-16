import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SRC = process.argv[2] ?? '/tmp/adrzone/assets/www/js/queries.js';
const OUT = process.argv[3] ?? '/tmp/dbbuild/adrzone.db';

const raw = readFileSync(SRC, 'utf8');
const queries = new Function(`${raw}\nreturn queries;`)();
console.log(`Loaded ${queries.length} SQL statements`);

if (existsSync(OUT)) unlinkSync(OUT);

const sqlPath = OUT + '.sql';
writeFileSync(sqlPath, queries.join(';\n') + ';\n');

execSync(`sqlite3 "${OUT}" < "${sqlPath}"`, { stdio: 'inherit' });
unlinkSync(sqlPath);

const tables = ['substances','hin_codes','adr_classes','classify_codes','packing_groups','distances','instructions'];
for (const t of tables) {
  const out = execSync(`sqlite3 "${OUT}" "SELECT COUNT(*) FROM ${t}"`).toString().trim();
  console.log(`  ${t.padEnd(16)} ${out}`);
}

execSync(`node ${import.meta.dirname}/add-substance-lower.mjs "${OUT}"`, { stdio: 'inherit' });

console.log(`\nWrote ${OUT}`);
