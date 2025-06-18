"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Database, RefreshCcw } from "lucide-react";

export default function UpdatePatientVitalsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePatientVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/update-patient-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to update patient vitals:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Update Patient Vitals</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-6 w-6 text-red-500" />
            Patient Vitals Database Update
          </CardTitle>
          <CardDescription>
            Update all patients with realistic vital signs, diagnoses, medications, and allergies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This utility will update all patients in your database with mock vital signs data that matches
            the format shown in the patient details view. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Blood pressure readings (systolic/diastolic)</li>
            <li>Heart rate measurements</li>
            <li>Temperature readings</li>
            <li>BMI calculations based on height and weight</li>
            <li>Current diagnoses</li>
            <li>Current medications</li>
            <li>Known allergies</li>
            <li>Emergency contact information</li>
          </ul>
          <p className="text-amber-600">
            <strong>Note:</strong> This will overwrite any existing vital signs data for all patients.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={updatePatientVitals}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Updating Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Update Patient Vitals
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Update Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">Successfully updated {result.updatedCount} patient records with vital signs.</p>
            <pre className="bg-white p-4 rounded-md mt-4 text-sm overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Update Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
