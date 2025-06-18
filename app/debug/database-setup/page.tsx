"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/api"

export default function DatabaseSetupPage() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState<{success: boolean; message: string; details?: any}[]>([])
  const [sqlStatements, setSqlStatements] = useState<string[]>([])
  
  const addResult = (success: boolean, message: string, details?: any) => {
    setResults(prev => [...prev, {success, message, details}])
  }

  const checkDatabaseSchema = async () => {
    setIsExecuting(true)
    setResults([])
    setSqlStatements([])
    
    try {
      addResult(true, "Checking database schema...")
      
      const response = await fetch('/api/check-db-schema')
      const data = await response.json()
      
      if (response.ok) {
        addResult(true, "Database schema check completed", data)
        
        if (data.sqlNeeded && data.sqlNeeded.length > 0) {
          setSqlStatements(data.sqlNeeded)
          addResult(true, "SQL statements needed to update schema", { statements: data.sqlNeeded })
        } else {
          addResult(true, "No schema changes needed")
        }
      } else {
        addResult(false, "Error checking database schema", data)
      }
    } catch (error) {
      addResult(false, "Unexpected error during schema check", error)
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
            <CardTitle>Check Database Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This tool will check if your prescriptions table has the necessary columns for storing AI-generated prescriptions.
            </p>
            <Button 
              onClick={checkDatabaseSchema} 
              disabled={isExecuting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? "Checking Schema..." : "Check Schema"}
            </Button>
          </CardContent>
        </Card>
        
        {sqlStatements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>SQL Statements to Execute</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Please execute these SQL statements in your Supabase SQL editor:
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm">
                  {sqlStatements.join('\n')}
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Note: You need to execute these statements manually in the Supabase dashboard SQL editor, 
                as browser-based apps don't have permission to modify database schemas directly.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500">Run the schema check to see results</p>
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
