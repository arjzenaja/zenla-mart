/**
 * Script untuk test endpoint server
 * Usage: node test-endpoint.js
 */

const http = require('http');

const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Testing Server Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing /health...');
    const health = await testEndpoint('/health');
    if (health.status === 200) {
      console.log('   ✅ Health check OK');
      console.log('   Response:', health.data);
    } else {
      console.log('   ❌ Health check failed:', health.status);
    }
  } catch (error) {
    console.log('   ❌ Server tidak berjalan atau tidak dapat diakses');
    console.log('   Error:', error.message);
    console.log('\n💡 Solusi:');
    console.log('   1. Pastikan server berjalan: cd server && npm start');
    console.log('   2. Cek apakah port 5000 sudah digunakan');
    process.exit(1);
  }

  // Test 2: Admin Login Endpoint (404 check)
  try {
    console.log('\n2. Testing /admin/login (POST)...');
    const login = await testEndpoint('/admin/login', 'POST', {
      email: 'test@test.com',
      password: 'test',
    });
    if (login.status === 401 || login.status === 400) {
      console.log('   ✅ Endpoint /admin/login dapat diakses');
      console.log('   Status:', login.status);
      console.log('   Response:', login.data.message || login.data);
    } else if (login.status === 404) {
      console.log('   ❌ Endpoint /admin/login tidak ditemukan (404)');
      console.log('   💡 Pastikan route sudah di-mount di app.js');
    } else {
      console.log('   ⚠️  Unexpected status:', login.status);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Admin Me Endpoint (should be 401 without token)
  try {
    console.log('\n3. Testing /admin/me (GET)...');
    const me = await testEndpoint('/admin/me', 'GET');
    if (me.status === 401) {
      console.log('   ✅ Endpoint /admin/me dapat diakses (401 = perlu auth)');
    } else if (me.status === 404) {
      console.log('   ❌ Endpoint /admin/me tidak ditemukan (404)');
    } else {
      console.log('   ⚠️  Status:', me.status);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n✅ Testing selesai!\n');
};

runTests().catch(console.error);
