# Product Enhancer for Shopify

This tool enhances products extracted from PDFs by searching Google for additional information and structuring the data according to your Shopify product format with metafields.

## Features

- 🔍 **Google Search Integration**: Automatically searches for each product to gather specifications
- 📦 **Shopify Structure**: Formats products according to your example JSON structure
- 🏷️ **Metafields Generation**: Creates comprehensive metafields including:
  - Overview (rich text)
  - Dimensions
  - Color
  - Model
  - Brand/Marca
  - Voltage
  - Distributor
  - Pies cubicos
- ⚡ **Rate Limiting**: Built-in delays to avoid Google search rate limiting
- 🛡️ **Error Handling**: Graceful fallback when search fails

## Installation

1. Install dependencies:
```bash
npm install
```

2. The required dependencies are:
- `axios`: For HTTP requests to Google
- `cheerio`: For parsing HTML search results

## Usage

### Basic Usage

```javascript
const ProductEnhancer = require('./product-enhancer');

const enhancer = new ProductEnhancer();

// Your products from PDF extraction
const products = [
  {
    title: 'DEWALT DWD024-B3 Hammer Drill',
    price: '199.99',
    vendor: 'DEWALT',
    model: 'DWD024-B3'
  }
];

// Enhance products
const enhancedProducts = await enhancer.enhanceProducts(products);
```

### Integration with Your Workflow

Add this step to your automation workflow after the "Extract from File" step:

```javascript
// In your workflow code block
const ProductEnhancer = require('./product-enhancer');

// Get products from previous step (PDF extraction)
const productsFromPDF = input; // Your extracted products array

const enhancer = new ProductEnhancer();
const enhancedProducts = await enhancer.enhanceProducts(productsFromPDF);

// Return enhanced products for next step
return enhancedProducts;
```

## Workflow Integration

Your enhanced workflow should look like this:

1. **Google Drive Trigger** → `fileCreated`
2. **Validate PDF Upload** → Check if file is PDF
3. **Google Drive** → `download: file`
4. **Extract from File** → `Extract From PDF`
5. **Code** → **Product Enhancer** (this tool)
6. **Next Step** → Use enhanced products (e.g., upload to Shopify)

## Input Format

The enhancer expects products in this format from your PDF extraction:

```javascript
[
  {
    title: "Product Name",
    price: "99.99",
    vendor: "Brand Name",
    model: "MODEL123",
    category: "Product Category",
    description: "Product description"
  }
]
```

## Output Format

The enhancer outputs products in your specified Shopify format:

```javascript
[
  {
    "product": {
      "title": "Product Title",
      "body_html": "<h2><strong>Product Title</strong></h2>...",
      "vendor": "Product Vendor",
      "product_type": "Product Type",
      "status": "active",
      "price": "9.99",
      "inventory_quantity": 1,
      "requires_shipping": true,
      "published": true,
      "metafields": [
        {
          "namespace": "custom",
          "key": "overview",
          "value": "Product overview from Google search...",
          "type": "rich_text_field"
        },
        {
          "namespace": "custom",
          "key": "dimensions_de_product",
          "value": "11.70\" (L) x 2.90\" (W) x 9.29\" (H)",
          "type": "single_line_text_field"
        }
        // ... more metafields
      ]
    }
  }
]
```

## Testing

Run the test to see the enhancer in action:

```bash
npm test
```

This will:
1. Process sample products
2. Search Google for each product
3. Generate enhanced products with metafields
4. Save results to `enhanced-products.json`
5. Display statistics

## Configuration

### Search Query Generation

The enhancer automatically generates search queries by combining:
- Product title
- Brand/vendor name
- Model number
- Common search terms (specifications, features, dimensions)

### Rate Limiting

Built-in 2-second delays between searches to avoid Google rate limiting.

### Error Handling

If Google search fails for a product, the enhancer will:
1. Log the error
2. Create a basic product structure with default values
3. Continue processing other products

## Metafields Generated

| Key | Type | Description |
|-----|------|-------------|
| `overview` | `rich_text_field` | Product description from Google search |
| `dimensions_de_product` | `single_line_text_field` | Product dimensions |
| `color` | `single_line_text_field` | Product color |
| `model` | `single_line_text_field` | Product model number |
| `marca` | `single_line_text_field` | Brand name |
| `voltaje` | `single_line_text_field` | Voltage specification |
| `distribuidor` | `single_line_text_field` | Default distributor |
| `pies_cubicos` | `single_line_text_field` | Default cubic feet |

## Notes

- **Google Search**: Uses web scraping approach. For production use, consider Google Custom Search API
- **Rate Limiting**: 2-second delays between searches to be respectful to Google
- **Fallback**: If search fails, creates basic structure with default values
- **Extensibility**: Easy to add more metafields or modify search logic

## Next Steps

After enhancement, you can:
1. Upload products to Shopify via API
2. Save to database
3. Export to CSV
4. Send to other systems

The enhanced products are ready for your Shopify integration!
