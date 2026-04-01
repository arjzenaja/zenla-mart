/**
 * Direct Test - Simulates the updateProduct function
 */

const { updateProduct } = require('./services/product.service');

async function testDirectUpdate() {
  console.log('🧪 Direct Stock Update Test\n');
  
  const PRODUCT_ID = 'mlot1b3k7kwbl5me6p5';
  
  try {
    console.log('📤 Updating product stock to 10...\n');
    
    const updateData = {
      stock: 10
    };
    
    const result = await updateProduct(PRODUCT_ID, updateData);
    
    console.log('✅ Update successful!');
    console.log(`Product: ${result.name}`);
    console.log(`Stock: ${result.stock}`);
    console.log(`Variants:`, result.variants.map(v => ({
      name: v.name,
      stock: v.stock
    })));
    console.log('');
    
    // Verify
    const stockCorrect = result.stock === 10;
    const variantStockCorrect = result.variants.every(v => v.stock > 0);
    const totalVariantStock = result.variants.reduce((sum, v) => sum + v.stock, 0);
    const stockMatches = totalVariantStock === result.stock;
    
    console.log('📊 Test Results:');
    console.log(`  ${stockCorrect ? '✅' : '❌'} Stock = 10: ${stockCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`  ${variantStockCorrect ? '✅' : '❌'} All variants have stock > 0: ${variantStockCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`  ${stockMatches ? '✅' : '❌'} Total variant stock matches product stock: ${stockMatches ? 'PASS' : 'FAIL'}`);
    
    if (stockCorrect && variantStockCorrect && stockMatches) {
      console.log('\n🎉 ALL TESTS PASSED!');
      return true;
    } else {
      console.log('\n❌ SOME TESTS FAILED');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

testDirectUpdate()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
