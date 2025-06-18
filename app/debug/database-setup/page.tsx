"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/api"

export default function DatabaseSetupPage() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState<{success: boolean; message: string; details?: any}[]>([])
  
  const addResult = (success: boolean, message: string, details?: any) => {
    setResults(prev => [...prev, {success, message, details}])
  }

  const updatePrescriptionsSchema = async () => {
    setIsExecuting(true)
    setResults([])
    
    try {
      // 1. Check if the prescriptions table exists
      addResult(true, "Starting database schema update...")
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'prescriptions')
      
      if (tablesError) {
        addResult(false, "Error checking if prescriptions table exists", tablesError)
        return
      }
      
      if (!tables || tables.length === 0) {
        addResult(false, "Prescriptions table does not exist. Please create it first.")
        return
      }
      
      addResult(true, "Prescriptions table exists")
      
      // 2. Check if medication_details column exists
      const { data: mdColumn, error: mdError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'prescriptions')
        .eq('column_name', 'medication_details')
      
      if (mdError) {
        addResult(false, "Error checking for medication_details column", mdError)
        return
      }
      
      // 3. Add medication_details column if it doesn't exist
      if (!mdColumn || mdColumn.length === 0) {
        addResult(true, "Adding medication_details column...")
        
        const { error: addMdError } = await supabase.rpc('add_medication_details_column')
        
        if (addMdError) {
          addResult(false, "Error adding medication_details column", addMdError)
          
          // Try direct SQL as fallback
          const { error: sqlError } = await supabase.rpc('execute_sql', {
            sql_query: 'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_details JSONB;'
          })
          
          if (sqlError) {
            addResult(false, "Failed to add medication_details column with direct SQL", sqlError)
            return
          } else {
            addResult(true, "Added medication_details column with direct SQL")
          }
        } else {
          addResult(true, "Added medication_details column")
        }
      } else {
        addResult(true, "medication_details column already exists")
      }
      
      // 4. Check if is_ai_generated column exists
      const { data: aiColumn, error: aiError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'prescriptions')
        .eq('column_name', 'is_ai_generated')
      
      if (aiError) {
        addResult(false, "Error checking for is_ai_generated column", aiError)
        return
      }
      
      // 5. Add is_ai_generated column if it doesn't exist
      if (!aiColumn || aiColumn.length === 0) {
        addResult(true, "Adding is_ai_generated column...")
        
        const { error: addAiError } = await supabase.rpc('add_is_ai_generated_column')
        
        if (addAiError) {
          addResult(false, "Error adding is_ai_generated column", addAiError)
          
          // Try direct SQL as fallback
          const { error: sqlError } = await supabase.rpc('execute_sql', {
            sql_query: 'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;'
          })
          
          if (sqlError) {
            addResult(false, "Failed to add is_ai_generated column with direct SQL", sqlError)
            return
          } else {
            addResult(true, "Added is_ai_generated column with direct SQL")
          }
        } else {
          addResult(true, "Added is_ai_generated column")
        }
      } else {
        addResult(true, "is_ai_generated column already exists")
      }
      
      // 6. Final verification
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'prescriptions')
      
      if (colError) {
        addResult(false, "Error verifying final schema", colError)
        return
      }
      
      const columnNames = columns.map(c => c.column_name)
      addResult(true, "Final schema verification", { columns: columnNames })
      
      addResult(true, "Database schema update completed successfully")
    } catch (error) {
      addResult(false, "Unexpected error during schema update", error)
    } finally {
      setIsExecuting(false)
    }
  }
  
  return (
    <div className="page-content">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Database Setup</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Update Prescriptions Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This tool will update the prescriptions table schema to add the necessary columns for AI prescription storage.
            </p>
            <Button 
              onClick={updatePrescriptionsSchema} 
              disabled={isExecuting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? "Updating Schema..." : "Update Schema"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500">Run the schema update to see results</p>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Alert key={index} variant={result.success ? "default" : "destructive"}>
                    <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {result.message}
                      {result.details && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
