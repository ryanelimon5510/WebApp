const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.zowdrxhcebsjhprhktwl:BKnF7vmXMcm0wIVC@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // Attempt the exact query the trigger does
    await client.query(`
      INSERT INTO public.profiles (id, full_name, email, role, mobile_number, student_number)
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Test Name',
        'test@test.com',
        CAST('TEACHER' AS role_type),
        '1234567890',
        NULL
      );
    `);
    console.log("Insert success!");
    // delete it
    await client.query(`DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111'`);
  } catch (err) {
    console.error("TRIGGER INSERT ERROR:", err.message);
  } finally {
    await client.end();
  }
}
run();
