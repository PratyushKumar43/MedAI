import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/api';

export async function GET() {
  try {
    // Check if the prescriptions table exists
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'prescriptions');
    
    if (tablesError) {
      return NextResponse.json({ 
        error: 'Failed to check if table exists', 
        details: tablesError 
      }, { status: 500 });
    }
    
    const tableExists = tablesData && tablesData.length > 0;
    
    if (!tableExists) {
      return NextResponse.json({ 
        error: 'Prescriptions table does not exist',
        action: 'Please create the prescriptions table first'
      }, { status: 404 });
    }
    
    // Check existing columns
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'prescriptions');
    
    if (columnsError) {
      return NextResponse.json({ 
        error: 'Failed to check columns', 
        details: columnsError 
      }, { status: 500 });
    }
    
    const columns = columnsData.reduce((acc: {[key: string]: string}, col) => {
      acc[col.column_name] = col.data_type;
      return acc;
    }, {});
    
    // Use direct SQL query to modify the table
    // This would require appropriate permissions in Supabase
    // Creating SQL statements for debugging purposes
    const sqlStatements = [];
    
    if (!columns['medication_details']) {
      sqlStatements.push('ALTER TABLE prescriptions ADD COLUMN medication_details JSONB;');
    }
    
    if (!columns['is_ai_generated']) {
      sqlStatements.push('ALTER TABLE prescriptions ADD COLUMN is_ai_generated BOOLEAN DEFAULT FALSE;');
    }
    
    // We can't actually execute these in the Edge runtime without permissions
    // But we can return what needs to be executed
    
    return NextResponse.json({
      success: true,
      tableExists,
      columns,
      sqlNeeded: sqlStatements,
      message: "Please execute these SQL statements in your Supabase SQL editor",
      note: "This API endpoint can't directly modify your database schema due to permissions. Use the SQL editor in the Supabase dashboard."
    });
  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json({ 
      error: 'Failed to check schema', 
      details: error 
    }, { status: 500 });
  }
}
