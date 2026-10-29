import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(connectionString);

  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema and seed setup...');
  // Neon sql template tag or direct query. Note: neon client can execute multi-statement sql via sql.unauthenticated or sql`...` or sql statement execution. Wait, neon tagged template doesn't always support multiple statements unless we split or use sql(schemaSql) or similar. Let's check how @neondatabase/serverless runs raw sql strings, or if we can split by semicolon or use sql.
  // Actually, neon client supports executing queries. Let's write a robust runner that splits statements by semicolon or runs them.
  
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log('Database setup complete!\n');

  console.log('--- Restaurants Table ---');
  const restaurants = await sql`SELECT * FROM restaurants`;
  console.table(restaurants);

  console.log('\n--- Reviews Table ---');
  const reviews = await sql`SELECT * FROM reviews`;
  console.table(reviews);
}

main().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
