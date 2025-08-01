const ProductEnhancer = require('./product-enhancer');
const fs = require('fs');

async function testProductEnhancer() {
  console.log('🚀 Starting Product Enhancer Test...\n');
  
  const enhancer = new ProductEnhancer();
  
  // Sample products from PDF extraction (this would come from your workflow)
  const sampleProducts = [
    {
      title: 'DEWALT DWD024-B3 1/2" 710W VVR Hammer Drill/Driver',
      price: '199.99',
      vendor: 'DEWALT',
      model: 'DWD024-B3',
      category: 'Power Tools',
      description: 'Professional hammer drill with variable speed control'
    },
    {
      title: 'Makita XPH07Z 18V LXT Lithium-Ion Brushless Cordless 1/2" Hammer Driver-Drill',
      price: '159.99',
      vendor: 'Makita',
      model: 'XPH07Z',
      category: 'Power Tools',
      description: 'Cordless hammer drill with brushless motor technology'
    },
    {
      title: 'Milwaukee 2804-20 M18 FUEL 1/2" Hammer Drill/Driver',
      price: '229.99',
      vendor: 'Milwaukee',
      model: '2804-20',
      category: 'Power Tools',
      description: 'High-performance hammer drill with REDLITHIUM battery'
    }
  ];
  
  try {
    console.log(`📋 Processing ${sampleProducts.length} products...\n`);
    
    const enhancedProducts = await enhancer.enhanceProducts(sampleProducts);
    
    console.log('✅ Enhancement completed successfully!\n');
    
    // Save results to file
    const outputPath = 'enhanced-products.json';
    fs.writeFileSync(outputPath, JSON.stringify(enhancedProducts, null, 2));
    console.log(`💾 Results saved to: ${outputPath}\n`);
    
    // Display first product as example
    console.log('📦 Sample Enhanced Product:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(enhancedProducts[0], null, 2));
    console.log('='.repeat(50));
    
    // Summary statistics
    console.log('\n📊 Summary:');
    console.log(`- Total products processed: ${enhancedProducts.length}`);
    console.log(`- Products with search data: ${enhancedProducts.filter(p => p.product.metafields.some(m => m.key === 'overview')).length}`);
    console.log(`- Products with dimensions: ${enhancedProducts.filter(p => p.product.metafields.some(m => m.key === 'dimensions_de_product')).length}`);
    console.log(`- Products with voltage info: ${enhancedProducts.filter(p => p.product.metafields.some(m => m.key === 'voltaje')).length}`);
    
  } catch (error) {
    console.error('❌ Error during enhancement:', error);
  }
}

// Run the test
testProductEnhancer(); 