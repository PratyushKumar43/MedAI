import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const testFetch = async () => {
  console.log('Testing connection with fetch...');
  const testUrl = `${supabaseUrl}/rest/v1/doctors?select=*&limit=1`;
  console.log(`Fetching from: ${testUrl}`);

  try {
    const response = await fetch(testUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Fetch test failed.');
      process.exit(1);
    } else {
      console.log('Fetch test successful! ✅');
      process.exit(0);
    }
  } catch (error) {
    console.error('An error occurred during the fetch test:', error);
    process.exit(1);
  }
};

testFetch();
