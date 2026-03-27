# Nous Nails - Shopify Theme

A modern, responsive Shopify theme designed for nail and cosmetic brands. Built with performance, accessibility, and user experience in mind.

## Brand Overview

This theme is custom-built for Nous Nails, featuring:

- Clean, minimalist design aesthetic
- Mobile-first responsive approach
- Accessibility-focused development
- Performance-optimized code

## Key Features

### E-commerce Functionality

- **Advanced Search Modal** - Predictive search with keyboard navigation and result caching
- **Product Galleries** - Swiper.js powered image galleries with slideshow support
- **Cart Drawer** - Smooth slide-out cart with quantity controls
- **Cart Product Recommendations** - Configurable upsell product shown in-cart (hidden if already in cart)
- **Variant Selection** - Radio button and dropdown variant selectors
- **Quick Add to Cart** - AJAX-powered product additions without page reload
- **Quantity Popover** - In-cart quantity info tooltip with hover/tap support
- **Product Sticky Button** - Floating add-to-cart button that syncs variant and quantity from main form
- **Product Expose Section** - Alternate product spotlight layout

### Custom Sections

- **HAE Hero** - Branded homepage hero with gradient assets
- **HAE Featured Collections** - Curated collection grid
- **HAE Brand About** - Brand story layout
- **HAE Marquee Banner** - Scrolling ticker/announcement strip
- **HAE Testimonials** - Customer testimonial display
- **Instagram Slideshow** - Swiper-powered social content slider with hover-to-pause autoplay
- **Product Expose** - Featured product highlight section
- **Floating CTA** - Sticky call-to-action overlay
- **Why HAE** - Brand value proposition section
- **FAQs** - Collapsible FAQ layout

### Media & Video

- **Social Video Player** - Custom element supporting hover-to-play (desktop) and tap-to-play (mobile), autoplay with IntersectionObserver, muted looping video
- **Product Media Gallery** - Full-featured gallery with zoom, modal, and slideshow modes
- **Swiper Slideshow** - Shared base class for all Swiper-powered sliders (Instagram, product gallery, etc.)

### Responsive Design

- **Mobile-First Approach** - Optimized for mobile devices
- **Breakpoints**: 768px (tablet), 1024px (desktop), 1300px (large desktop)
- **Touch-Friendly Interface** - Tap-to-play video, touch-optimized sliders
- **Progressive Enhancement** - Core functionality works without JavaScript

### Accessibility

- **WCAG Compliant** - Follows web accessibility guidelines
- **Keyboard Navigation** - Full keyboard support throughout
- **Screen Reader Support** - Proper ARIA labels and live regions
- **Focus Management** - Focus trapping in modals and drawers
- **Quantity Input Labels** - Accessible label associations with locale key support

### Performance

- **Critical CSS Pipeline** - Above-the-fold styles extracted and inlined via `snippets/critical-css.liquid`; a pre-commit Husky hook automates generation on every commit
- **Lazy Loading** - Images and non-critical resources deferred
- **Responsive Images** - Tuned `sizes` attributes across product cards, galleries, and section images for optimal candidate selection
- **CSS Optimization** - Modular stylesheets; render-blocking CSS deferred via `media=print` trick on product page
- **Swiper Consolidated** - Swiper bundle loaded once globally in the theme footer rather than per-section
- **Asset Organization** - Modular CSS and JS architecture

## Project Structure

```
nous-nails/
├── assets/                              # CSS, JS, images, and fonts
│   ├── base-core.css                   # Base styles and CSS variables (no fonts)
│   ├── grid.css                        # Grid system
│   ├── global.js                       # Global JavaScript utilities
│   ├── theme.js                        # Theme-level JavaScript
│   ├── component-*.css                 # Component-specific styles
│   ├── cart-recommendation.css         # Cart upsell component styles
│   ├── cart.js                         # Cart page JS
│   ├── cart-drawer.js                  # Cart drawer JS
│   ├── instagram-slideshow.js          # Instagram slideshow custom element
│   ├── klaviyo-bis-form.css            # Klaviyo Back-in-Stock form overrides
│   ├── marquee-banner.css              # Marquee/ticker styles
│   ├── product-expose.css              # Product expose section styles
│   ├── product-info.js                 # Product info custom element
│   ├── product-sticky-button.js        # Sticky ATC button (syncs variant + qty)
│   ├── quantity-popover.css/.js        # Quantity popover component
│   ├── social-video-player.js          # Hover/tap video player custom element
│   ├── swiper-bundle.min.js            # Swiper (loaded globally)
│   └── swiper-slideshow.js             # Base Swiper slideshow class
├── config/                             # Theme configuration
│   ├── settings_data.json             # Theme settings data
│   └── settings_schema.json           # Theme settings schema
├── layout/                            # Layout templates
│   ├── theme.liquid                   # Main theme layout
│   ├── gift_card.liquid               # Gift card layout
│   └── password.liquid                # Password page layout
├── locales/                           # Translation files (52 languages)
├── scripts/                           # Node.js build scripts
│   └── extract-critical-css.js        # Critical CSS extraction + restore
├── sections/                          # Theme sections (46 sections)
├── snippets/                          # Reusable Liquid snippets (87 snippets)
│   ├── cart-product-recommendation.liquid  # In-cart upsell product snippet
│   ├── critical-css.liquid            # Auto-generated inlined critical CSS
│   └── floating-sticker.liquid        # Floating badge/sticker overlay
└── templates/                        # Page templates
    ├── index.json                     # Homepage
    ├── product.json                   # Default product page
    ├── product.nail-remover.json      # Custom product template
    ├── collection.json                # Default collection
    ├── collection.dynamic.json        # Dynamic filtered collection
    ├── collection.accessories.json    # Accessories collection
    ├── collection.art-school-collection.json
    ├── collection.caffeinated-collection.json
    ├── collection.jelly-collection.json
    ├── collection.nail-club-subscription.json
    ├── collection.new-arrivals.json
    ├── page.affiliate.json            # Affiliate program page
    ├── page.collapsibles.json         # FAQ / collapsible content page
    ├── page.creator-program.json      # Creator program page
    ├── page.smile-landing-page.json   # Smile rewards landing page
    ├── page.why-hae.json              # Brand story page
    ├── page.press.json                # Press page
    └── search.json                    # Search results
```

## Core Components

### Search Modal System

- **Location**: `assets/component-predictive-search.css` + `assets/predictive-search.js`
- **Features**: Real-time search, keyboard navigation, result caching
- **Accessibility**: ARIA labels, focus management, screen reader support

### Header & Navigation

- **Sticky Header**: Auto-hide on scroll, customizable behavior
- **Mega Menu**: Hover-activated dropdown menus
- **Mobile Drawer**: Slide-out navigation for mobile devices

### Product Features

- **Media Gallery**: Swiper.js powered image carousels with zoom and modal
- **Variant Selection**: Radio buttons with visual feedback
- **Product Forms**: AJAX-powered add-to-cart
- **Sticky ATC Button**: Scrolls with the page; syncs selected variant and quantity from the main product form in real time
- **Quantity Popover**: Info tooltip for bundle/subscription quantity rules

### Cart System

- **Cart Drawer**: Slide-out cart with smooth animations
- **Cart Notifications**: Toast-style add-to-cart confirmations
- **Quantity Controls**: Increment/decrement with validation
- **Product Recommendation**: Configurable upsell product displayed in cart drawer; suppressed if the product is already in the cart

### Media

- **Social Video Player**: Custom element (`<social-video-player>`) — hover-to-play on desktop, tap-to-toggle on mobile, optional `data-autoplay` with viewport detection via IntersectionObserver
- **Instagram Slideshow**: Extends `SwiperSlideshow`; pauses autoplay on mouse enter, resumes on leave

## Development Setup

### Prerequisites

- Node.js (for build scripts and hooks)
- Shopify CLI (for theme development)
- Git (for version control)

### Installation

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd nous-nails
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Restore local dev CSS links**

   After clone or pull, uncomment the stylesheet `<link>` tags that the pre-commit hook comments out:

   ```bash
   npm run extract-critical-css:restore
   ```

### Critical CSS Workflow

The theme inlines above-the-fold CSS for performance. The committed/pushed version has `<link>` tags commented out and styles inlined via `snippets/critical-css.liquid`. Local dev should have uncommented links.

| Situation | Command |
|---|---|
| After clone / pull (local dev) | `npm run extract-critical-css:restore` |
| Extract header critical CSS only | `npm run extract-critical-css:header` |
| Extract product critical CSS only | `npm run extract-critical-css:product` |
| Extract all (runs automatically on commit) | `npm run extract-critical-css` |

The **pre-commit Husky hook** runs `npm run extract-critical-css` automatically before every commit, then stages `snippets/critical-css.liquid` and any modified layout/section/snippet/template files.

### Development Workflow

1. **Start local development**

   ```bash
   shopify theme dev --store=hae-beauty
   ```

2. **Deploy to development store**

   ```bash
   shopify theme push --development
   ```

3. **Deploy to production**

   ```bash
   shopify theme push --live
   ```

## CSS Architecture

### Base Styles (Split Architecture)

**`snippets/base-fonts.liquid`** - Font declarations with optimized asset URLs:
- @font-face declarations with Liquid templating
- Always inlined for performance

**`assets/base-core.css`** - Core base styles (toggleable via extraction system):
- CSS custom properties (variables)
- Typography system
- Color palette
- Spacing system
- Reset styles

### Component-Based CSS

- **Naming Convention**: `component-[name].css`
- **Modular Structure**: Each component has its own stylesheet
- **Responsive Design**: Mobile-first with progressive enhancement

### Key CSS Files

| File | Purpose |
|---|---|
| `base-core.css` | Foundation styles and variables (no fonts) |
| `base-fonts.liquid` | Font declarations with optimized asset URLs |
| `grid.css` | Grid system and layout utilities |
| `component-header.css` | Header and navigation styles |
| `component-predictive-search.css` | Search modal styles |
| `component-cart-drawer.css` | Cart drawer styles |
| `component-product-media-gallery.css` | Product gallery styles |
| `component-floating-cta.css` | Floating CTA overlay |
| `cart-recommendation.css` | In-cart upsell product component |
| `quantity-popover.css` | Quantity popover tooltip |
| `klaviyo-bis-form.css` | Klaviyo Back-in-Stock form overrides |
| `marquee-banner.css` | Scrolling ticker/announcement strip |
| `product-expose.css` | Product expose section |
| `instagram-slideshow.css` | Instagram-specific slider styles |

### CSS Development Workflow

The theme uses a split base CSS architecture with critical CSS extraction:

**Development Mode** (external CSS files for easier editing):
```bash
npm run extract-critical-css:restore
```

**Production Mode** (inlined CSS for performance):
```bash
npm run extract-critical-css
```

**Key Benefits:**
- Font declarations remain optimized with Liquid templating (always inlined)
- Base styles can be edited as external files during development
- Production builds inline CSS for optimal performance
- Seamless switching between development and production modes

## Design System

### Typography

- **Primary Font**: Mabry (custom font files included — `.woff2`, `.woff`, `.ttf`, `.eot`)
- **Weights**: Regular (400), Medium (500)
- **Letter Spacing**: 4px for uppercase text
- **Line Heights**: Optimized for readability

### Color System

- **CSS Variables**: Consistent color management
- **Semantic Naming**: `--color-base-text`, `--color-base-background`, `--color-button-primary-*`
- **Theme Support**: Easy color customization via Shopify theme settings

### Spacing System

- **CSS Variables**: `--space-1` through `--space-10` (and legacy `--level1`–`--level10`)
- **Consistent Spacing**: Modular spacing scale
- **Responsive Adjustments**: Different spacing for mobile/desktop

## JavaScript Architecture

### Custom Elements

| Element | File | Purpose |
|---|---|---|
| `SearchToggle` | `predictive-search.js` | Search modal open/close |
| `PredictiveSearch` | `predictive-search.js` | Search API calls and results |
| `MenuDrawer` | `details-modal.js` | Mobile navigation drawer |
| `VariantSelects` | `product-form.js` | Variant radio/dropdown selection |
| `QuantityInput` | `global.js` | Quantity controls with validation |
| `ProductStickyButton` | `product-sticky-button.js` | Sticky ATC syncing variant/qty |
| `QuantityPopover` | `quantity-popover.js` | In-cart quantity info tooltip |
| `SocialVideoPlayer` | `social-video-player.js` | Hover/tap video playback |
| `InstagramSlideshow` | `instagram-slideshow.js` | Social content Swiper slider |
| `SwiperSlideshow` | `swiper-slideshow.js` | Base Swiper class (extended by others) |

### Performance Optimizations

- **Debounced Functions**: Prevents excessive API calls on search input
- **Event Delegation**: Efficient event handling
- **Lazy Loading**: Images and non-critical resources
- **Caching**: Search results and DOM queries
- **IntersectionObserver**: Autoplay videos only when in viewport

## Responsive Breakpoints

```css
/* Mobile First — base: 320px+ */

@media screen and (min-width: 768px) { /* Tablet */ }
@media screen and (min-width: 1024px) { /* Desktop */ }
@media screen and (min-width: 1300px) { /* Large Desktop */ }
```

## Customization

### Theme Settings

- **Header**: Logo, navigation, sticky behavior
- **Colors**: Primary and secondary color palette
- **Typography**: Font selection and sizing
- **Layout**: Column counts, spacing, animations
- **Cart Recommendation**: Enable/disable, select product, set title label

### Collection Templates

Seven custom collection templates (`collection.*.json`) allow per-collection section configurations — useful for category-specific layouts such as New Arrivals, Accessories, Jelly Collection, etc.

### Custom Page Templates

Dedicated templates exist for affiliate, creator program, press, Smile rewards landing, FAQ/collapsibles, and the Why HAE brand page.

## Multi-Language Support

- **52 Language Files**: Complete localization support
- **RTL Support**: Right-to-left language compatibility
- **Dynamic Content**: Product descriptions, cart text, form labels, quantity input labels

## Performance

### Critical CSS Pipeline

1. `scripts/extract-critical-css.js` scans layout and section files for `<link>` tags marked for inlining
2. Extracted styles are written to `snippets/critical-css.liquid` and rendered in `<head>`
3. Original `<link>` tags are commented out in the committed source
4. Run `npm run extract-critical-css:restore` locally to uncomment them for hot-reload dev

### Core Web Vitals

- **LCP**: Preloaded hero/product images; optimized `fetchpriority` and `loading` attributes
- **FID/INP**: Deferred non-critical JS; efficient custom element initialization
- **CLS**: Stable image aspect ratios; no layout shifts from late-loading fonts

### Loading Optimizations

- Swiper JS and CSS loaded once globally (theme footer) rather than per-section
- Render-blocking CSS on product page deferred via `media="print"` swap trick
- `preload: none` on image-with-text background videos to avoid bandwidth waste

## Third-Party Integrations

| Integration | Purpose |
|---|---|
| **Swiper.js** | All carousels and slideshows |
| **Klaviyo** | Back-in-Stock form (CSS overrides in `klaviyo-bis-form.css`) |
| **Shopify Product Recommendations API** | Cart upsell and related products |
| **Smile.io** | Loyalty/rewards landing page template |

## Git Hooks (Husky)

| Hook | Trigger | Action |
|---|---|---|
| `pre-commit` | `git commit` | Runs `extract-critical-css`, stages generated files |
| `pre-push` | `git push` | (configured — see `.husky/pre-push`) |

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Accessibility**: Screen reader tested
- **Performance**: Lighthouse / Core Web Vitals monitored

## License

This theme is proprietary software developed for Nous Nails. All rights reserved.

---

**Built for Nous Nails** - A modern, accessible, and performant Shopify theme.
