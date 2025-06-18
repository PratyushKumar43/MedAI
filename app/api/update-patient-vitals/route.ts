import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/api';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the SQL file content
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'update-patient-vitals.sql');
    let sqlContent = '';
    
    try {
      sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      console.log("SQL file read successfully");
    } catch (readError) {
      console.error("Error reading SQL file:", readError);
      return NextResponse.json({
        error: "Failed to read SQL file",
        details: readError
      }, { status: 500 });
    }

    // Execute SQL statements - needs to be run through a Supabase Edge Function
    // or directly via SQL client in production. For demo, we'll log the SQL.
    console.log("Executing SQL:", sqlContent);
    
    try {
      // For demo purposes, we'll do a simpler update instead of running the whole SQL file
      // In production, use a proper migration tool or Supabase functions
      
      // Update patients with vital signs
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id');
        
      if (patientsError) {
        throw patientsError;
      }
      
      const updates = await Promise.all(patientsData.map(async (patient) => {
        // Generate random vitals for each patient
        const bloodPressureOptions = ['120/80', '130/85', '140/90', '110/70', '125/82'];
        const bloodPressure = bloodPressureOptions[Math.floor(Math.random() * bloodPressureOptions.length)];
        const heartRate = Math.floor(60 + Math.random() * 40);
        const temperature = 97.6 + Math.random() * 2;
        const weight = 150 + Math.floor(Math.random() * 50);
        const height = 65 + Math.floor(Math.random() * 15);
        const bmi = Math.round((weight / (height * height) * 703) * 10) / 10;
        
        // Update the patient record
        const { data, error } = await supabase
          .from('patients')
          .update({
            vital_signs: {
              blood_pressure: bloodPressure,
              heart_rate: heartRate,
              temperature: temperature,
              weight: weight,
              height: height,
              bmi: bmi
            },
            diagnosis: Math.random() > 0.6 
              ? ['Hypertension', 'Type 2 Diabetes']
              : Math.random() > 0.3 
                ? ['Asthma']
                : ['Routine checkup'],
            current_medications: Math.random() > 0.5 
              ? ['Lisinopril', 'Metformin'] 
              : Math.random() > 0.3 
                ? ['Atorvastatin']
                : [],
            allergies: Math.random() > 0.7
              ? ['Penicillin', 'Shellfish']
              : Math.random() > 0.4
                ? ['Peanuts']
                : [],
            emergency_contact: {
              name: 'Emergency Contact',
              relationship: 'Spouse',
              phone: '(555) 123-4567'
            }
          })
          .eq('id', patient.id)
          .select();
          
        if (error) {
          console.error(`Error updating patient ${patient.id}:`, error);
          throw error;
        }
        
        return data;
      }));
      
      return NextResponse.json({
        success: true,
        message: "Patient vitals updated successfully",
        updatedCount: updates.length
      });
    } catch (sqlError) {
      console.error("Error executing SQL:", sqlError);
      return NextResponse.json({
        error: "Failed to update patient vitals",
        details: sqlError
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ 
      error: 'Failed to update patient vitals',
      details: error
    }, { status: 500 });
  }
}
