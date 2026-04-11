const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.zowdrxhcebsjhprhktwl:BKnF7vmXMcm0wIVC@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    const userRes = await client.query(`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`);
    if(userRes.rows.length === 0) { console.log("No users found"); return }
    const uid = userRes.rows[0].id;
    console.log("Using uid:", uid);

    await client.query(`
      INSERT INTO public.profiles (id, full_name, email, role, mobile_number, student_number)
      VALUES (
        $1,
        'Test Name',
        'test@test.com',
        CAST('TEACHER' AS role_type),
        '1234567890',
        NULL
      );
    `, [uid]);
    console.log("Insert success!");
    await client.query(`DELETE FROM public.profiles WHERE id = $1`, [uid]);
  } catch (err) {
    console.error("TRIGGER INSERT ERROR:", err.message);
  } finally {
    await client.end();
  }
}
run();
