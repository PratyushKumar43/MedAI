import { NextResponse } from 'next/server';
import { supabase } from '@/lib/api';

export async function GET() {
  try {
    // First check if the prescriptions table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      return NextResponse.json({ 
        error: 'Failed to query tables', 
        details: tablesError 
      }, { status: 500 });
    }

    const prescriptionsTableExists = tables?.some(t => t.tablename === 'prescriptions');
    
    if (!prescriptionsTableExists) {
      return NextResponse.json({ 
        error: 'Prescriptions table does not exist',
        tables: tables?.map(t => t.tablename) 
      }, { status: 404 });
    }

    // Check for table columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'prescriptions');
    
    if (columnsError) {
      return NextResponse.json({ 
        error: 'Failed to query columns', 
        details: columnsError 
      }, { status: 500 });
    }

    // Check for the necessary columns
    const hasRequiredColumns = {
      id: false,
      patient_id: false,
      doctor_id: false,
      medication: false,
      dosage: false,
      frequency: false,
      duration: false,
      instructions: false,
      medication_details: false,
      is_ai_generated: false
    };

    columns?.forEach(col => {
      if (col.column_name in hasRequiredColumns) {
        hasRequiredColumns[col.column_name as keyof typeof hasRequiredColumns] = true;
      }
    });

    // Try to run a test query
    const { error: testQueryError } = await supabase
      .from('prescriptions')
      .select('id, patient_id, doctor_id, medication')
      .limit(1);

    return NextResponse.json({
      success: true,
      tableExists: prescriptionsTableExists,
      columns: columns,
      hasRequiredColumns,
      testQuerySuccessful: !testQueryError,
      testQueryError: testQueryError ? testQueryError.message : null
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to check prescriptions table', 
      details: error 
    }, { status: 500 });
  }
}
