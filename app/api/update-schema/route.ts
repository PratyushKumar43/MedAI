import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    // We'll update the schema directly instead of using functions
    // First check if columns exist
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'prescriptions');
    
    if (columnsError) {
      return NextResponse.json({ 
        error: 'Failed to check columns', 
        details: columnsError 
      }, { status: 500 });
    }
    
    const columns = columnsData.map(c => c.column_name);
    const results = { added: [] as string[], errors: [] as any[] };
    
    // Add medication_details column if it doesn't exist
    if (!columns.includes('medication_details')) {
      try {
        // Use raw SQL via functions API
        const { error: mdError } = await supabase.functions.invoke('execute-sql', {
          body: { 
            sql: 'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_details JSONB;'
          }
        });
        
        if (mdError) {
          results.errors.push({
            column: 'medication_details',
            error: mdError
          });
        } else {
          results.added.push('medication_details');
        }
      } catch (error) {
        results.errors.push({
          column: 'medication_details',
          error
        });
      }
    }
    
    // Add is_ai_generated column if it doesn't exist
    if (!columns.includes('is_ai_generated')) {
      try {
        // Use raw SQL via functions API
        const { error: aiError } = await supabase.functions.invoke('execute-sql', {
          body: { 
            sql: 'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;'
          }
        });
        
        if (aiError) {
          results.errors.push({
            column: 'is_ai_generated',
            error: aiError
          });
        } else {
          results.added.push('is_ai_generated');
  RETURNS void AS $$
  BEGIN
    EXECUTE sql_query;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Execute the function creation
  const { error } = await supabase.rpc('execute_sql', { 
    sql_query: createFunctionsSQL 
  });
  
  // If we can't create the functions with execute_sql, try direct SQL
  if (error) {
    console.warn('Could not create functions with RPC, trying direct SQL');
    await supabase.from('_sql').rpc('drop_public_function_if_exists', { name: 'add_medication_details_column' });
    await supabase.from('_sql').rpc('drop_public_function_if_exists', { name: 'add_is_ai_generated_column' });
    await supabase.from('_sql').rpc('drop_public_function_if_exists', { name: 'execute_sql' });
    
    // Create SQL functions one by one
    await supabase.from('_sql').select(`
      CREATE OR REPLACE FUNCTION add_medication_details_column()
      RETURNS void AS $$
      BEGIN
        ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS medication_details JSONB;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    await supabase.from('_sql').select(`
      CREATE OR REPLACE FUNCTION add_is_ai_generated_column()
      RETURNS void AS $$
      BEGIN
        ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    await supabase.from('_sql').select(`
      CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }
}
