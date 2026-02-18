// Quick API Connection Test
// Run this in a React Native screen to verify your API setup

import { api } from '../services/api';
import { BASE_URL } from '../config/api';
import client from '../api/client';

export const testAPIConnection = async () => {
  console.log('🧪 Testing API Connection...');
  console.log('📍 Base URL:', BASE_URL);
  
  const results = {
    baseURL: BASE_URL,
    tests: []
  };

  // Test 1: Check BASE_URL is not localhost
  console.log('\n✅ Test 1: Checking BASE_URL...');
  if (BASE_URL.includes('localhost')) {
    console.log('❌ FAIL: Still using localhost!');
    results.tests.push({ name: 'BASE_URL Check', status: 'FAIL', message: 'Using localhost' });
  } else {
    console.log('✅ PASS: Using IP address');
    results.tests.push({ name: 'BASE_URL Check', status: 'PASS' });
  }

  // Test 2: Try to fetch products (no auth required)
  console.log('\n✅ Test 2: Fetching products...');
  try {
    const response = await client.get('/products');
    console.log('✅ PASS: Products fetched successfully');
    console.log(`   Found ${response.data.products?.length || 0} products`);
    results.tests.push({ 
      name: 'Products API', 
      status: 'PASS', 
      count: response.data.products?.length || 0 
    });
  } catch (error) {
    console.log('❌ FAIL: Could not fetch products');
    console.log('   Error:', error.message);
    results.tests.push({ 
      name: 'Products API', 
      status: 'FAIL', 
      error: error.message 
    });
  }

  // Test 3: Check if token exists
  console.log('\n✅ Test 3: Checking authentication...');
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('✅ PASS: Token found in storage');
      results.tests.push({ name: 'Auth Token', status: 'PASS' });
      
      // Test 4: Try authenticated endpoint
      console.log('\n✅ Test 4: Testing authenticated endpoint...');
      try {
        const response = await client.get('/users/me');
        console.log('✅ PASS: Profile fetched successfully');
        console.log('   User:', response.data.user?.name || response.data.name);
        results.tests.push({ 
          name: 'Authenticated API', 
          status: 'PASS',
          user: response.data.user?.name || response.data.name
        });
      } catch (error) {
        console.log('❌ FAIL: Could not fetch profile');
        console.log('   Error:', error.message);
        results.tests.push({ 
          name: 'Authenticated API', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    } else {
      console.log('⚠️  SKIP: No token found (not logged in)');
      results.tests.push({ name: 'Auth Token', status: 'SKIP', message: 'Not logged in' });
    }
  } catch (error) {
    console.log('❌ FAIL: Could not check token');
    results.tests.push({ name: 'Auth Token', status: 'FAIL', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const failed = results.tests.filter(t => t.status === 'FAIL').length;
  const skipped = results.tests.filter(t => t.status === 'SKIP').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log('='.repeat(50));

  return results;
};

// Usage in a screen:
// import { testAPIConnection } from '../utils/apiTest';
// 
// const handleTest = async () => {
//   const results = await testAPIConnection();
//   Alert.alert('Test Complete', `Passed: ${results.tests.filter(t => t.status === 'PASS').length}`);
// };
