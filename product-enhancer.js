const axios = require('axios');
const cheerio = require('cheerio');

class ProductEnhancer {
  constructor() {
    this.searchResults = new Map();
  }

  /**
   * Main function to enhance products with Google search data
   * @param {Array} products - Array of products from PDF extraction
   * @returns {Array} - Enhanced products with metafields
   */
  async enhanceProducts(products) {
    console.log(`Starting enhancement for ${products.length} products...`);
    
    const enhancedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}/${products.length}: ${product.title || product.name}`);
      
      try {
        const enhancedProduct = await this.enhanceSingleProduct(product);
        enhancedProducts.push(enhancedProduct);
        
        // Add delay to avoid rate limiting
        if (i < products.length - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        console.error(`Error processing product ${product.title || product.name}:`, error.message);
        // Add basic structure even if search fails
        enhancedProducts.push(this.createBasicProductStructure(product));
      }
    }
    
    return enhancedProducts;
  }

  /**
   * Enhance a single product with Google search data
   */
  async enhanceSingleProduct(product) {
    const searchQuery = this.generateSearchQuery(product);
    const searchData = await this.searchGoogle(searchQuery);
    
    return this.structureProduct(product, searchData);
  }

  /**
   * Generate search query for Google
   */
  generateSearchQuery(product) {
    const title = product.title || product.name || '';
    const brand = product.brand || product.vendor || '';
    const model = product.model || '';
    
    // Create a comprehensive search query
    let query = title;
    if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
      query = `${brand} ${title}`;
    }
    if (model && !query.includes(model)) {
      query = `${query} ${model}`;
    }
    
    // Add common search terms for better results
    query = `${query} specifications features dimensions`;
    
    return query.trim();
  }

  /**
   * Search Google for product information
   */
  async searchGoogle(query) {
    try {
      // Using a simple web scraping approach
      // In production, you might want to use Google Custom Search API
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const searchData = this.extractSearchData($);
      
      return searchData;
    } catch (error) {
      console.error('Google search failed:', error.message);
      return {};
    }
  }

  /**
   * Extract relevant data from Google search results
   */
  extractSearchData($) {
    const data = {
      overview: '',
      specifications: {},
      features: [],
      dimensions: '',
      brand: '',
      model: '',
      color: '',
      voltage: '',
      distributor: ''
    };

    // Extract featured snippets
    $('.hgKElc, .IZ6rdc, .mod').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 50) {
        data.overview = text;
      }
    });

    // Extract knowledge graph data
    $('.kno-fv').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        data.overview = text;
      }
    });

    // Extract specifications from search results
    $('.g').each((i, el) => {
      const snippet = $(el).find('.VwiC3b').text().trim();
      if (snippet) {
        // Look for specific patterns
        if (snippet.includes('dimension') || snippet.includes('size')) {
          data.dimensions = this.extractDimensions(snippet);
        }
        if (snippet.includes('voltage') || snippet.includes('V')) {
          data.voltage = this.extractVoltage(snippet);
        }
        if (snippet.includes('color') || snippet.includes('colour')) {
          data.color = this.extractColor(snippet);
        }
      }
    });

    return data;
  }

  /**
   * Extract dimensions from text
   */
  extractDimensions(text) {
    const dimensionRegex = /(\d+(?:\.\d+)?\s*(?:inches?|in|"|cm|mm|ft|feet))/gi;
    const matches = text.match(dimensionRegex);
    return matches ? matches.join(' x ') : '';
  }

  /**
   * Extract voltage from text
   */
  extractVoltage(text) {
    const voltageRegex = /(\d+(?:\.\d+)?\s*V)/gi;
    const match = text.match(voltageRegex);
    return match ? match[0] : '';
  }

  /**
   * Extract color from text
   */
  extractColor(text) {
    const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
    const textLower = text.toLowerCase();
    for (const color of colors) {
      if (textLower.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    return '';
  }

  /**
   * Structure product according to example JSON format
   */
  structureProduct(originalProduct, searchData) {
    const product = {
      product: {
        title: originalProduct.title || originalProduct.name || 'Product Title',
        body_html: this.generateBodyHtml(originalProduct, searchData),
        vendor: originalProduct.vendor || originalProduct.brand || 'Product Vendor',
        product_type: originalProduct.product_type || originalProduct.category || 'Product Type',
        status: 'active',
        price: originalProduct.price || '9.99',
        inventory_quantity: originalProduct.inventory_quantity || 1,
        requires_shipping: true,
        published: true,
        metafields: this.generateMetafields(originalProduct, searchData)
      }
    };

    return product;
  }

  /**
   * Generate body HTML with product description
   */
  generateBodyHtml(originalProduct, searchData) {
    const title = originalProduct.title || originalProduct.name || 'Product Title';
    const overview = searchData.overview || originalProduct.description || 'Product description not available.';
    
    return `<h2><strong>${title}</strong></h2>
<p class="ds-markdown-paragraph">${overview}</p>
<p class="ds-markdown-paragraph"><strong>Product Features:</strong></p>
<ul>
${this.generateFeaturesList(originalProduct, searchData)}
</ul>`;
  }

  /**
   * Generate features list
   */
  generateFeaturesList(originalProduct, searchData) {
    const features = [];
    
    if (searchData.features && searchData.features.length > 0) {
      features.push(...searchData.features);
    }
    
    // Add default features if none found
    if (features.length === 0) {
      features.push(
        'High-quality construction and materials',
        'Professional-grade performance',
        'Durable and long-lasting design',
        'User-friendly operation',
        'Comprehensive warranty coverage'
      );
    }
    
    return features.map(feature => `<li class="ds-markdown-paragraph"><strong>${feature}:</strong> Professional-grade feature for optimal performance.</li>`).join('\n');
  }

  /**
   * Generate metafields array
   */
  generateMetafields(originalProduct, searchData) {
    const metafields = [];

    // Overview metafield
    if (searchData.overview) {
      metafields.push({
        namespace: 'custom',
        key: 'overview',
        value: searchData.overview,
        type: 'rich_text_field'
      });
    }

    // Dimensions
    if (searchData.dimensions) {
      metafields.push({
        namespace: 'custom',
        key: 'dimensions_de_product',
        value: searchData.dimensions,
        type: 'single_line_text_field'
      });
    }

    // Color
    if (searchData.color) {
      metafields.push({
        namespace: 'custom',
        key: 'color',
        value: searchData.color,
        type: 'single_line_text_field'
      });
    }

    // Model
    if (originalProduct.model || searchData.model) {
      metafields.push({
        namespace: 'custom',
        key: 'model',
        value: originalProduct.model || searchData.model || '',
        type: 'single_line_text_field'
      });
    }

    // Brand/Marca
    if (originalProduct.brand || originalProduct.vendor || searchData.brand) {
      metafields.push({
        namespace: 'custom',
        key: 'marca',
        value: originalProduct.brand || originalProduct.vendor || searchData.brand || '',
        type: 'single_line_text_field'
      });
    }

    // Voltage
    if (searchData.voltage) {
      metafields.push({
        namespace: 'custom',
        key: 'voltaje',
        value: searchData.voltage,
        type: 'single_line_text_field'
      });
    }

    // Distributor (default)
    metafields.push({
      namespace: 'custom',
      key: 'distribuidor',
      value: 'Lewar Logistic Distributors, INC.',
      type: 'single_line_text_field'
    });

    // Pies cubicos (default)
    metafields.push({
      namespace: 'custom',
      key: 'pies_cubicos',
      value: '3ft',
      type: 'single_line_text_field'
    });

    return metafields;
  }

  /**
   * Create basic product structure when search fails
   */
  createBasicProductStructure(originalProduct) {
    return this.structureProduct(originalProduct, {});
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
module.exports = ProductEnhancer;

// Example usage
if (require.main === module) {
  const ProductEnhancer = require('./product-enhancer');
  
  async function main() {
    const enhancer = new ProductEnhancer();
    
    // Example products from PDF extraction
    const products = [
      {
        title: 'DEWALT DWD024-B3 Hammer Drill',
        price: '199.99',
        vendor: 'DEWALT',
        model: 'DWD024-B3'
      },
      {
        title: 'Makita XPH07Z Impact Driver',
        price: '159.99',
        vendor: 'Makita',
        model: 'XPH07Z'
      }
    ];
    
    try {
      const enhancedProducts = await enhancer.enhanceProducts(products);
      console.log(JSON.stringify(enhancedProducts, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  main();
} 