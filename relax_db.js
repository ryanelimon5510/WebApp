const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.zowdrxhcebsjhprhktwl:BKnF7vmXMcm0wIVC@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

const sql = `
  -- Convert enum columns to VARCHAR to prevent strict type casting crashes in triggers
  ALTER TABLE public.profiles ALTER COLUMN role TYPE VARCHAR(50);
  ALTER TABLE public.attendance_logs ALTER COLUMN status TYPE VARCHAR(50);

  -- Recreate the trigger without strict enum casting
  CREATE OR REPLACE FUNCTION public.handle_new_user() 
  RETURNS TRIGGER AS $$
  BEGIN
      INSERT INTO public.profiles (id, full_name, email, role, mobile_number, student_number)
      VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.email,
          COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'STUDENT'),
          NEW.raw_user_meta_data->>'mobile_number',
          NEW.raw_user_meta_data->>'student_number'
      );
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log("Database updated successfully to use VARCHAR!");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}
run();
