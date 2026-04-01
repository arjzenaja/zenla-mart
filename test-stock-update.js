/**
 * Manual Test Script for Stock Update Fix
 * 
 * This script tests the stock update functionality to verify:
 * 1. Stock updates work for products with variants
 * 2. Stock is properly distributed to variants
 * 3. Database persistence works correctly
 */

const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 5000;
const PRODUCT_ID = 'mlot1b3k7kwbl5me6p5'; // French Fries 2000

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse response: ' + body));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testStockUpdate() {
  console.log('🧪 Testing Stock Update Fix\n');
  
  try {
    // Step 1: Get current product state
    console.log('📥 Step 1: Fetching current product...');
    const getResponse = await makeRequest('GET', `/api/products/${PRODUCT_ID}`);
    const currentProduct = getResponse.product;
    
    console.log('Current state:');
    console.log(`  Stock: ${currentProduct.stock}`);
    console.log(`  Variants:`, currentProduct.variants.map(v => ({
      name: v.name,
      stock: v.stock
    })));
    console.log('');
    
    // Step 2: Update stock to 10
    console.log('📤 Step 2: Updating stock to 10...');
    const updatePayload = {
      name: currentProduct.name,
      description: currentProduct.description,
      price: currentProduct.price,
      stock: 10, // Update stock to 10
      categoryId: currentProduct.categoryId,
      brand: currentProduct.brand,
      variant: currentProduct.variant,
      composition: currentProduct.composition,
      allergyInfo: currentProduct.allergyInfo,
      expiryEstimate: currentProduct.expiryEstimate,
      shippingOrigin: currentProduct.shippingOrigin,
      shippingEstimate: currentProduct.shippingEstimate,
      variants: currentProduct.variants, // Send existing variants
      images: currentProduct.images,
      weight: currentProduct.weight,
      unit: currentProduct.unit,
      isActive: currentProduct.isActive,
      isFeatured: currentProduct.isFeatured,
      rating: currentProduct.rating
    };
    
    const updateResponse = await makeRequest('PUT', `/api/products/${PRODUCT_ID}`, updatePayload);
    console.log('Raw update response:', JSON.stringify(updateResponse, null, 2));
    
    if (!updateResponse.product) {
      console.error('❌ No product in response!');
      console.error('Full response:', updateResponse);
      return false;
    }
    
    const updatedProduct = updateResponse.product;
    
    console.log('Updated state:');
    console.log(`  Stock: ${updatedProduct.stock}`);
    console.log(`  Variants:`, updatedProduct.variants.map(v => ({
      name: v.name,
      stock: v.stock
    })));
    console.log('');
    
    // Step 3: Verify by fetching again
    console.log('🔍 Step 3: Verifying update...');
    const verifyResponse = await makeRequest('GET', `/api/products/${PRODUCT_ID}`);
    const verifiedProduct = verifyResponse.product;
    
    console.log('Verified state:');
    console.log(`  Stock: ${verifiedProduct.stock}`);
    console.log(`  Variants:`, verifiedProduct.variants.map(v => ({
      name: v.name,
      stock: v.stock
    })));
    console.log('');
    
    // Step 4: Check results
    console.log('📊 Test Results:');
    const stockCorrect = verifiedProduct.stock === 10;
    const variantStockCorrect = verifiedProduct.variants.every(v => v.stock > 0);
    const totalVariantStock = verifiedProduct.variants.reduce((sum, v) => sum + v.stock, 0);
    const stockMatches = totalVariantStock === verifiedProduct.stock;
    
    console.log(`  ${stockCorrect ? '✅' : '❌'} Stock updated to 10: ${stockCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`  ${variantStockCorrect ? '✅' : '❌'} Variant stock > 0: ${variantStockCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`  ${stockMatches ? '✅' : '❌'} Total variant stock matches product stock: ${stockMatches ? 'PASS' : 'FAIL'}`);
    console.log('');
    
    if (stockCorrect && variantStockCorrect && stockMatches) {
      console.log('🎉 ALL TESTS PASSED!');
      return true;
    } else {
      console.log('❌ SOME TESTS FAILED!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testStockUpdate()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

