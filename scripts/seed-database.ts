import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // prevent the client from trying to store a session
    persistSession: false,
  },
});

// --- Data Generation ---

const getRandomElement = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const generatePatients = (count: number) => {
  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email(),
      phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      date_of_birth: faker.date.past({ years: 50, refDate: '2004-01-01' }),
      address: faker.location.streetAddress(),
      medical_history: faker.lorem.sentence(),
      room_number: `${faker.helpers.arrayElement(['A', 'B', 'C'])}-${faker.number.int({ min: 101, max: 599 })}`,
    };
  });
};

const generateDoctors = (count: number) => {
  const specializations = ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics', 'General'];
  const qualifications = ['MD', 'PhD', 'MBBS', 'DO'];

  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email(),
      specialization: getRandomElement(specializations),
      phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      license_number: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
      years_of_experience: faker.number.int({ min: 2, max: 30 }),
      qualifications: `${getRandomElement(qualifications)}, ${getRandomElement(qualifications)}`,
      working_hours: '9AM-5PM',
      consultation_fee: faker.finance.amount({ min: 50, max: 300, dec: 2 }),
      bio: faker.lorem.paragraph(),
      availability_status: 'Available',
    };
  });
};

const generateAppointments = (patients: any[], doctors: any[], count: number) => {
  const reasons = ['Routine Check-up', 'Follow-up', 'New Symptom', 'Emergency', 'Consultation'];
  const statuses = ['scheduled', 'completed', 'cancelled'];
  return Array.from({ length: count }, () => ({
    patient_id: getRandomElement(patients).id,
    doctor_id: getRandomElement(doctors).id,
    appointment_date: faker.date.recent({ days: 90 }),
    reason: getRandomElement(reasons),
    status: getRandomElement(statuses),
    created_at: faker.date.recent({ days: 90 }),
  }));
};

const generatePrescriptions = (patients: any[], doctors: any[], count: number) => {
  const medications = ['Lisinopril', 'Atorvastatin', 'Metformin', 'Amlodipine', 'Metoprolol', 'Ibuprofen', 'Acetaminophen'];
  const dosages = ['10mg', '20mg', '500mg', '5mg', '50mg', '200mg', '500mg'];
  const frequencies = ['Once a day', 'Twice a day', 'As needed', 'Every 4-6 hours'];
  const durations = ['30 days', '60 days', 'Until next visit', '1 week', '10 days'];

  return Array.from({ length: count }, () => ({
    patient_id: getRandomElement(patients).id,
    doctor_id: getRandomElement(doctors).id,
    medication: getRandomElement(medications),
    dosage: getRandomElement(dosages),
    frequency: getRandomElement(frequencies),
    duration: getRandomElement(durations),
    instructions: 'Take with a full glass of water. Contact doctor if side effects occur.',
    created_at: faker.date.recent({ days: 90 }),
    is_ai_generated: faker.datatype.boolean(),
    medication_details: {
      brand_name: faker.commerce.productName(),
      class: faker.lorem.word(),
      common_side_effects: [faker.lorem.word(), faker.lorem.word()],
    },
  }));
};

const generateEmergencyCases = (count: number) => {
  const emergencyTypes = ['Cardiac Arrest', 'Severe Injury', 'Stroke', 'Breathing Difficulty', 'Allergic Reaction'];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  const statuses: ('pending' | 'dispatched' | 'en-route' | 'arrived' | 'completed')[] = ['pending', 'dispatched', 'en-route', 'arrived', 'completed'];

  return Array.from({ length: count }, () => {
    const patientName = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const location = {
      address: faker.location.streetAddress(),
      coordinates: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
    };
    return {
      patient_name: patientName,
      location: location,
      emergency_type: getRandomElement(emergencyTypes),
      severity: getRandomElement(severities),
      status: getRandomElement(statuses),
      time_reported: faker.date.recent({ days: 2 }),
      estimated_arrival: faker.date.soon({ days: 1 }),
      ambulance_id: `AMB-${faker.string.alphanumeric(3).toUpperCase()}`,
      description: faker.lorem.sentence(),
    };
  });
};

const generatePatientVitals = (patients: any[], doctors: any[]) => {
  return patients.map(patient => ({
    doctor_id: getRandomElement(doctors).id,
    patient_id: patient.id,
    heart_rate: faker.number.int({ min: 55, max: 125 }),
    blood_pressure: `${faker.number.int({ min: 90, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
    temperature: faker.number.float({ min: 97.0, max: 102.0, fractionDigits: 1 }),
    oxygen_saturation: faker.number.int({ min: 88, max: 100 }),
    respiratory_rate: faker.number.int({ min: 12, max: 26 }),
    last_updated: faker.date.recent({ days: 1 }),
  }));
};

// --- Seeding Logic ---

const clearDatabase = async () => {
  console.log('Clearing database...');

  console.log('STEP 0.1: Deleting emergency cases...');
  const { error: emergencyCasesError } = await supabase.from('emergency_cases').delete().not('id', 'is', null);
  if (emergencyCasesError) console.error('Error deleting emergency cases:', { message: emergencyCasesError.message });

  console.log('STEP 0.2: Deleting prescriptions...');
  const { error: prescriptionsError } = await supabase.from('prescriptions').delete().not('id', 'is', null);
  if (prescriptionsError) console.error('Error deleting prescriptions:', { message: prescriptionsError.message });

  console.log('STEP 0.3: Deleting appointments...');
  const { error: appointmentsError } = await supabase.from('appointments').delete().not('id', 'is', null);
  if (appointmentsError) console.error('Error deleting appointments:', { message: appointmentsError.message });

  console.log('STEP 0.4: Deleting patient vitals...');
  const { error: vitalsError } = await supabase.from('patient_vitals').delete().not('id', 'is', null);
  if (vitalsError) console.error('Error deleting patient vitals:', { message: vitalsError.message });

  console.log('STEP 0.5: Deleting patients...');
  const { error: patientsError } = await supabase.from('patients').delete().not('id', 'is', null);
  if (patientsError) console.error('Error deleting patients:', { message: patientsError.message });

  console.log('STEP 0.6: Deleting doctors...');
  const { error: doctorsError } = await supabase.from('doctors').delete().not('id', 'is', null);
  if (doctorsError) console.error('Error deleting doctors:', { message: doctorsError.message });

  console.log('Database cleared successfully! 🧹');
};

const seedDatabase = async () => {
  await clearDatabase();
  console.log('Starting database seeding...');
  let doctors: any[] = [];
  let patients: any[] = [];

  try {
    // 1. Seed Doctors
    console.log('STEP 1: Seeding doctors...');
    const doctorsToSeed = generateDoctors(5);
    console.log(`Generated ${doctorsToSeed.length} doctors to seed.`);
    for (const doctor of doctorsToSeed) {
      const { data, error } = await supabase.from('doctors').insert(doctor).select();
      if (error) {
        console.error(`Error seeding doctor ${doctor.email}:`, error);
        // Skip this doctor and continue
      } else {
        doctors.push(data[0]);
      }
    }
    console.log(`SUCCESS: ${doctors.length} doctors seeded.`);

    // 2. Seed Patients
    console.log('STEP 2: Seeding patients...');
    const patientsToSeed = generatePatients(15);
    console.log(`Generated ${patientsToSeed.length} patients to seed.`);
    const { data: seededPatients, error: patientsError } = await supabase.from('patients').insert(patientsToSeed).select();
    if (patientsError) {
      console.error('Error seeding patients:', patientsError);
      throw patientsError;
    }
    patients = seededPatients;
    console.log(`SUCCESS: ${patients.length} patients seeded.`);

    // 3. Seed Appointments
    console.log('STEP 3: Seeding appointments...');
    const appointmentsToSeed = generateAppointments(patients, doctors, 40);
    console.log(`Generated ${appointmentsToSeed.length} appointments to seed.`);
    const { error: appointmentsError } = await supabase.from('appointments').insert(appointmentsToSeed);
    if (appointmentsError) {
      console.error('Error seeding appointments:', appointmentsError);
      throw appointmentsError;
    }
    console.log(`SUCCESS: ${appointmentsToSeed.length} appointments seeded.`);

    // 4. Seed Patient Vitals
    console.log('STEP 4: Seeding patient vitals...');
    const vitalsToSeed = generatePatientVitals(patients, doctors);
    console.log(`Generated ${vitalsToSeed.length} vitals to seed.`);
    const { error: vitalsError } = await supabase.from('patient_vitals').insert(vitalsToSeed);
    if (vitalsError) {
      console.error('Error seeding patient vitals:', vitalsError);
      throw vitalsError;
    }
        console.log(`SUCCESS: ${vitalsToSeed.length} patient vitals seeded.`);

    // 5. Seed Prescriptions
    console.log('STEP 5: Seeding prescriptions...');
    const prescriptionsToSeed = generatePrescriptions(patients, doctors, 50);
    console.log(`Generated ${prescriptionsToSeed.length} prescriptions to seed.`);
    const { error: prescriptionsError } = await supabase.from('prescriptions').insert(prescriptionsToSeed);
    if (prescriptionsError) {
      console.error('Error seeding prescriptions:', prescriptionsError);
      throw prescriptionsError;
    }
    console.log(`SUCCESS: ${prescriptionsToSeed.length} prescriptions seeded.`);

    // 6. Seed Emergency Cases
    console.log('STEP 6: Seeding emergency cases...');
    const emergencyCasesToSeed = generateEmergencyCases(10);
    console.log(`Generated ${emergencyCasesToSeed.length} emergency cases to seed.`);
    const { error: emergencyCasesError } = await supabase.from('emergency_cases').insert(emergencyCasesToSeed);
    if (emergencyCasesError) {
      console.error('Error seeding emergency cases:', emergencyCasesError);
      throw emergencyCasesError;
    }
    console.log(`SUCCESS: ${emergencyCasesToSeed.length} emergency cases seeded.`);

    console.log('Database seeding completed successfully! ✅');
    
  } catch (error: any) {
    console.error('CRITICAL ERROR: Error seeding database:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    process.exit(1);
  } finally {
    console.log('Seeding script finished.');
    process.exit(0);
  }
};

seedDatabase();
