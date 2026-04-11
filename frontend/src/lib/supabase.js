import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zowdrxhcebsjhprhktwl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2RyeGhjZWJzamhwcmhrdHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTYyOTYsImV4cCI6MjA5MTQ3MjI5Nn0.Tc-sSvrkAnQKgwsASjusPPZz8vTCU3KDqWg_Dii4oOw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
