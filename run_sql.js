const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.zowdrxhcebsjhprhktwl:BKnF7vmXMcm0wIVC@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected directly to Supabase via Pooler!");
    const sql = fs.readFileSync('C:\\Users\\Guestt\\Desktop\\WebApp\\supabase_init.sql', 'utf8');
    await client.query(sql);
    console.log("Database tables created successfully!");
  } catch (e) {
    console.error("Failed:", e);
  } finally {
    await client.end();
  }
}
run();
