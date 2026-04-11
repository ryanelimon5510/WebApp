const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.zowdrxhcebsjhprhktwl:BKnF7vmXMcm0wIVC@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // Check if table profiles exists
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `);
    console.log("Profiles columns:", res.rows);

    // Check enums
    const enums = await client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('role_type', 'status_type');
    `);
    console.log("Enums:", enums.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}
run();
