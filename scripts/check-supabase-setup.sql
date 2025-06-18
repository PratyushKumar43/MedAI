-- Check if tables exist and have data
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('doctors', 'patients', 'prescriptions');

-- Check row counts
SELECT 'doctors' as table_name, COUNT(*) as row_count FROM doctors
UNION ALL
SELECT 'patients' as table_name, COUNT(*) as row_count FROM patients
UNION ALL
SELECT 'prescriptions' as table_name, COUNT(*) as row_count FROM prescriptions;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('doctors', 'patients', 'prescriptions');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('doctors', 'patients', 'prescriptions');
