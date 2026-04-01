const fs = require('fs');

// Read data
const categories = JSON.parse(fs.readFileSync('./data/categories.json', 'utf8'));
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

console.log('\n=== CATEGORIES ===');
categories.forEach(cat => {
  console.log(`${cat.name} → slug: "${cat.slug}"`);
});

console.log('\n=== SAMPLE PRODUCTS ===');
products.slice(0, 5).forEach(p => {
  const cat = categories.find(c => c.id === p.categoryId);
  console.log(`${p.name} → Category: ${cat?.name} (slug: ${cat?.slug})`);
});

console.log('\n=== TESTING SLUG FILTER ===');
const testSlug = categories[0]?.slug;
if (testSlug) {
  console.log(`Testing with slug: "${testSlug}"`);
  const category = categories.find(c => c.slug === testSlug);
  if (category) {
    const filtered = products.filter(p => p.categoryId === category.id);
    console.log(`Found ${filtered.length} products in category "${category.name}"`);
    filtered.slice(0, 3).forEach(p => console.log(`  - ${p.name}`));
  }
}
