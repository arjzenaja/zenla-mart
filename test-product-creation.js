const http = require('http');

const testLogin = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'admin@zenlamart.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Login failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const createProduct = (token) => {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: "Test Product Automated",
      price: 5000,
      stock: 100,
      categoryId: "mlkbsyp2qbi15gpanq", // ID from categories.json
      description: "Created by automated test",
      variants: [],
      images: []
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': productData.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Create Product failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(productData);
    req.end();
  });
};

const run = async () => {
  try {
    console.log('1. Logging in...');
    const loginRes = await testLogin();
    console.log('   Login successful. Token:', loginRes.data.token.substring(0, 20) + '...');

    console.log('2. Creating product...');
    const productRes = await createProduct(loginRes.data.token);
    console.log('   Product created successfully!');
    console.log('   Product ID:', productRes.product.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

run();
