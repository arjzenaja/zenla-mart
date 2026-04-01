const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@zenlamart.com';
const ADMIN_PASSWORD = 'admin123';

async function testSlides() {
  try {
    console.log('1. Logging in as admin...');
    const loginRes = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login successful. Token received.');

    console.log('2. Fetching slides as ADMIN...');
    const adminSlidesRes = await fetch(`${API_URL}/api/slides`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminSlidesData = await adminSlidesRes.json();
    const adminSlides = adminSlidesData.slides;
    console.log(`Admin Slides Count: ${adminSlides.length}`);
    adminSlides.forEach(s => console.log(` - ID: ${s.id}, Active: ${s.isActive}`));

    console.log('3. Fetching slides as PUBLIC (no token)...');
    const publicSlidesRes = await fetch(`${API_URL}/api/slides`);
    const publicSlidesData = await publicSlidesRes.json();
    const publicSlides = publicSlidesData.slides;
    console.log(`Public Slides Count: ${publicSlides.length}`);
    publicSlides.forEach(s => console.log(` - ID: ${s.id}, Active: ${s.isActive}`));

    console.log('4. Fetching home-slides endpoint...');
    const homeSlidesRes = await fetch(`${API_URL}/api/home-slides`);
    const homeSlides = await homeSlidesRes.json();
    console.log(`Home Slides Count: ${homeSlides.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSlides();
