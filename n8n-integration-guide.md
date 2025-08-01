# n8n Integration Guide for Product Enhancer

## Overview

This guide shows you how to integrate the Product Enhancer into your n8n workflow to automatically enhance products with Google search data.

## Workflow Setup

### Step 1: Add Code Node

After your "Extract from File" node, add a new **Code** node:

1. Click the **+** button after your "Extract from File" node
2. Search for "Code" and select it
3. Configure the Code node as follows:

### Step 2: Configure Code Node

**Node Name:** `Product Enhancer`

**JavaScript Code:**

```javascript
// Import required modules
const axios = require("axios");
const cheerio = require("cheerio");

class ProductEnhancer {
  constructor() {
    this.searchResults = new Map();
  }

  async enhanceProducts(products) {
    console.log(`Starting enhancement for ${products.length} products...`);

    const enhancedProducts = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(
        `Processing product ${i + 1}/${products.length}: ${
          product.title || product.name
        }`
      );

      try {
        const enhancedProduct = await this.enhanceSingleProduct(product);
        enhancedProducts.push(enhancedProduct);

        // Add delay to avoid rate limiting
        if (i < products.length - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        console.error(
          `Error processing product ${product.title || product.name}:`,
          error.message
        );
        // Add basic structure even if search fails
        enhancedProducts.push(this.createBasicProductStructure(product));
      }
    }

    return enhancedProducts;
  }

  async enhanceSingleProduct(product) {
    const searchQuery = this.generateSearchQuery(product);
    const searchData = await this.searchGoogle(searchQuery);

    return this.structureProduct(product, searchData);
  }

  generateSearchQuery(product) {
    const title = product.title || product.name || "";
    const brand = product.brand || product.vendor || "";
    const model = product.model || "";

    let query = title;
    if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
      query = `${brand} ${title}`;
    }
    if (model && !query.includes(model)) {
      query = `${query} ${model}`;
    }

    query = `${query} specifications features dimensions`;

    return query.trim();
  }

  async searchGoogle(query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;

      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const searchData = this.extractSearchData($);

      return searchData;
    } catch (error) {
      console.error("Google search failed:", error.message);
      return {};
    }
  }

  extractSearchData($) {
    const data = {
      overview: "",
      specifications: {},
      features: [],
      dimensions: "",
      brand: "",
      model: "",
      color: "",
      voltage: "",
      distributor: "",
    };

    // Extract featured snippets
    $(".hgKElc, .IZ6rdc, .mod").each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 50) {
        data.overview = text;
      }
    });

    // Extract knowledge graph data
    $(".kno-fv").each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        data.overview = text;
      }
    });

    // Extract specifications from search results
    $(".g").each((i, el) => {
      const snippet = $(el).find(".VwiC3b").text().trim();
      if (snippet) {
        if (snippet.includes("dimension") || snippet.includes("size")) {
          data.dimensions = this.extractDimensions(snippet);
        }
        if (snippet.includes("voltage") || snippet.includes("V")) {
          data.voltage = this.extractVoltage(snippet);
        }
        if (snippet.includes("color") || snippet.includes("colour")) {
          data.color = this.extractColor(snippet);
        }
      }
    });

    return data;
  }

  extractDimensions(text) {
    const dimensionRegex = /(\d+(?:\.\d+)?\s*(?:inches?|in|"|cm|mm|ft|feet))/gi;
    const matches = text.match(dimensionRegex);
    return matches ? matches.join(" x ") : "";
  }

  extractVoltage(text) {
    const voltageRegex = /(\d+(?:\.\d+)?\s*V)/gi;
    const match = text.match(voltageRegex);
    return match ? match[0] : "";
  }

  extractColor(text) {
    const colors = [
      "black",
      "white",
      "red",
      "blue",
      "green",
      "yellow",
      "orange",
      "purple",
      "pink",
      "brown",
      "gray",
      "grey",
    ];
    const textLower = text.toLowerCase();
    for (const color of colors) {
      if (textLower.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    return "";
  }

  structureProduct(originalProduct, searchData) {
    const product = {
      product: {
        title: originalProduct.title || originalProduct.name || "Product Title",
        body_html: this.generateBodyHtml(originalProduct, searchData),
        vendor:
          originalProduct.vendor || originalProduct.brand || "Product Vendor",
        product_type:
          originalProduct.product_type ||
          originalProduct.category ||
          "Product Type",
        status: "active",
        price: originalProduct.price || "9.99",
        inventory_quantity: originalProduct.inventory_quantity || 1,
        requires_shipping: true,
        published: true,
        metafields: this.generateMetafields(originalProduct, searchData),
      },
    };

    return product;
  }

  generateBodyHtml(originalProduct, searchData) {
    const title =
      originalProduct.title || originalProduct.name || "Product Title";
    const overview =
      searchData.overview ||
      originalProduct.description ||
      "Product description not available.";

    return `<h2><strong>${title}</strong></h2>
<p class="ds-markdown-paragraph">${overview}</p>
<p class="ds-markdown-paragraph"><strong>Product Features:</strong></p>
<ul>
${this.generateFeaturesList(originalProduct, searchData)}
</ul>`;
  }

  generateFeaturesList(originalProduct, searchData) {
    const features = [];

    if (searchData.features && searchData.features.length > 0) {
      features.push(...searchData.features);
    }

    if (features.length === 0) {
      features.push(
        "High-quality construction and materials",
        "Professional-grade performance",
        "Durable and long-lasting design",
        "User-friendly operation",
        "Comprehensive warranty coverage"
      );
    }

    return features
      .map(
        (feature) =>
          `<li class="ds-markdown-paragraph"><strong>${feature}:</strong> Professional-grade feature for optimal performance.</li>`
      )
      .join("\n");
  }

  generateMetafields(originalProduct, searchData) {
    const metafields = [];

    if (searchData.overview) {
      metafields.push({
        namespace: "custom",
        key: "overview",
        value: searchData.overview,
        type: "rich_text_field",
      });
    }

    if (searchData.dimensions) {
      metafields.push({
        namespace: "custom",
        key: "dimensions_de_product",
        value: searchData.dimensions,
        type: "single_line_text_field",
      });
    }

    if (searchData.color) {
      metafields.push({
        namespace: "custom",
        key: "color",
        value: searchData.color,
        type: "single_line_text_field",
      });
    }

    if (originalProduct.model || searchData.model) {
      metafields.push({
        namespace: "custom",
        key: "model",
        value: originalProduct.model || searchData.model || "",
        type: "single_line_text_field",
      });
    }

    if (originalProduct.brand || originalProduct.vendor || searchData.brand) {
      metafields.push({
        namespace: "custom",
        key: "marca",
        value:
          originalProduct.brand ||
          originalProduct.vendor ||
          searchData.brand ||
          "",
        type: "single_line_text_field",
      });
    }

    if (searchData.voltage) {
      metafields.push({
        namespace: "custom",
        key: "voltaje",
        value: searchData.voltage,
        type: "single_line_text_field",
      });
    }

    metafields.push({
      namespace: "custom",
      key: "distribuidor",
      value: "Lewar Logistic Distributors, INC.",
      type: "single_line_text_field",
    });

    metafields.push({
      namespace: "custom",
      key: "pies_cubicos",
      value: "3ft",
      type: "single_line_text_field",
    });

    return metafields;
  }

  createBasicProductStructure(originalProduct) {
    return this.structureProduct(originalProduct, {});
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  try {
    // Get products from previous node
    const productsFromPDF = $input.all()[0].json;

    // Initialize enhancer
    const enhancer = new ProductEnhancer();

    // Enhance products
    const enhancedProducts = await enhancer.enhanceProducts(productsFromPDF);

    // Return enhanced products
    return enhancedProducts;
  } catch (error) {
    console.error("Error in Product Enhancer:", error);
    throw error;
  }
}

// Execute and return
return await main();
```

### Step 3: Install Dependencies

You need to install the required npm packages in your n8n environment:

**Option A: Using n8n CLI (Recommended)**

```bash
# Navigate to your n8n installation directory
cd /path/to/n8n

# Install dependencies
npm install axios cheerio
```

**Option B: Using Docker (if using n8n Docker)**

```bash
# Add to your docker-compose.yml or Dockerfile
RUN npm install axios cheerio
```

**Option C: Using n8n Cloud**

- Contact n8n support to install the required packages
- Or use the HTTP Request node instead (see Alternative Method below)

### Step 4: Connect Nodes

Connect your workflow like this:

```
Google Drive Trigger → Validate PDF Upload → Google Drive → Extract from File → Product Enhancer → Next Step
```

## Alternative Method: Using HTTP Request Node

If you can't install npm packages, you can use HTTP Request nodes:

### Step 1: Create HTTP Request for Google Search

**Node Name:** `Google Search`

**Method:** GET

**URL:** `https://www.google.com/search?q={{encodeURIComponent($json.product_title)}}`

**Headers:**

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### Step 2: Create Code Node for Parsing

**Node Name:** `Parse Search Results`

**JavaScript Code:**

```javascript
// Parse the HTML response from Google search
const cheerio = require("cheerio");

function parseSearchResults(html, product) {
  const $ = cheerio.load(html);

  const searchData = {
    overview: "",
    dimensions: "",
    voltage: "",
    color: "",
  };

  // Extract featured snippets
  $(".hgKElc, .IZ6rdc, .mod").each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 50) {
      searchData.overview = text;
    }
  });

  // Extract knowledge graph data
  $(".kno-fv").each((i, el) => {
    const text = $(el).text().trim();
    if (text) {
      searchData.overview = text;
    }
  });

  return structureProduct(product, searchData);
}

function structureProduct(originalProduct, searchData) {
  return {
    product: {
      title: originalProduct.title || originalProduct.name || "Product Title",
      body_html: generateBodyHtml(originalProduct, searchData),
      vendor:
        originalProduct.vendor || originalProduct.brand || "Product Vendor",
      product_type:
        originalProduct.product_type ||
        originalProduct.category ||
        "Product Type",
      status: "active",
      price: originalProduct.price || "9.99",
      inventory_quantity: originalProduct.inventory_quantity || 1,
      requires_shipping: true,
      published: true,
      metafields: generateMetafields(originalProduct, searchData),
    },
  };
}

function generateBodyHtml(originalProduct, searchData) {
  const title =
    originalProduct.title || originalProduct.name || "Product Title";
  const overview =
    searchData.overview ||
    originalProduct.description ||
    "Product description not available.";

  return `<h2><strong>${title}</strong></h2>
<p class="ds-markdown-paragraph">${overview}</p>
<p class="ds-markdown-paragraph"><strong>Product Features:</strong></p>
<ul>
<li class="ds-markdown-paragraph"><strong>High-quality construction:</strong> Professional-grade feature for optimal performance.</li>
<li class="ds-markdown-paragraph"><strong>Professional-grade performance:</strong> Professional-grade feature for optimal performance.</li>
<li class="ds-markdown-paragraph"><strong>Durable and long-lasting design:</strong> Professional-grade feature for optimal performance.</li>
</ul>`;
}

function generateMetafields(originalProduct, searchData) {
  const metafields = [];

  if (searchData.overview) {
    metafields.push({
      namespace: "custom",
      key: "overview",
      value: searchData.overview,
      type: "rich_text_field",
    });
  }

  if (searchData.dimensions) {
    metafields.push({
      namespace: "custom",
      key: "dimensions_de_product",
      value: searchData.dimensions,
      type: "single_line_text_field",
    });
  }

  if (originalProduct.model) {
    metafields.push({
      namespace: "custom",
      key: "model",
      value: originalProduct.model,
      type: "single_line_text_field",
    });
  }

  if (originalProduct.brand || originalProduct.vendor) {
    metafields.push({
      namespace: "custom",
      key: "marca",
      value: originalProduct.brand || originalProduct.vendor,
      type: "single_line_text_field",
    });
  }

  metafields.push({
    namespace: "custom",
    key: "distribuidor",
    value: "Lewar Logistic Distributors, INC.",
    type: "single_line_text_field",
  });

  metafields.push({
    namespace: "custom",
    key: "pies_cubicos",
    value: "3ft",
    type: "single_line_text_field",
  });

  return metafields;
}

// Process each product
const products = $input.all()[0].json;
const enhancedProducts = [];

for (const product of products) {
  const html = $("Google Search").all()[0].json; // Get HTML from previous node
  const enhancedProduct = parseSearchResults(html, product);
  enhancedProducts.push(enhancedProduct);
}

return enhancedProducts;
```

## Testing Your Workflow

### Step 1: Test with Sample Data

Create a test workflow with sample products:

```javascript
// Test data in a Code node
return [
  {
    title: "DEWALT DWD024-B3 Hammer Drill",
    price: "199.99",
    vendor: "DEWALT",
    model: "DWD024-B3",
  },
  {
    title: "Makita XPH07Z Impact Driver",
    price: "159.99",
    vendor: "Makita",
    model: "XPH07Z",
  },
];
```

### Step 2: Run the Workflow

1. Click "Execute Workflow"
2. Check the output of each node
3. Verify the enhanced products have the correct structure

## Troubleshooting

### Common Issues:

1. **Module not found error:**

   - Install dependencies: `npm install axios cheerio`
   - Restart n8n after installation

2. **Google search blocked:**

   - Add delays between requests
   - Use different User-Agent headers
   - Consider using Google Custom Search API

3. **Rate limiting:**

   - Increase delays between searches
   - Process fewer products per run

4. **Empty search results:**
   - Check if search query is properly formatted
   - Verify product titles are meaningful

### Debug Tips:

1. Add console.log statements in your code
2. Check n8n execution logs
3. Test with a single product first
4. Verify input data format

## Next Steps

After successful enhancement:

1. **Upload to Shopify:** Add Shopify node to create products
2. **Save to Database:** Add database node to store enhanced products
3. **Export to File:** Add file node to save results
4. **Send Notifications:** Add notification node for completion alerts

## Complete Workflow Example

```
Google Drive Trigger
    ↓
Validate PDF Upload (Conditional)
    ↓ (true)
Google Drive (Download)
    ↓
Extract from File (PDF)
    ↓
Product Enhancer (Code Node)
    ↓
Shopify Create Product (HTTP Request)
    ↓
Send Notification (Email/Slack)
```

This setup will automatically enhance your PDF-extracted products with Google search data and structure them according to your Shopify format!
