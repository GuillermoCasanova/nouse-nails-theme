# Media Queries Report

**Standard breakpoints:** 750px = medium, 940px = large (updated across the project)

---

## Summary by breakpoint

| Breakpoint | Meaning | Used in |
|------------|--------|--------|
| **750px** (min-width) | Medium and up (tablet/desktop) | Most CSS, JS matchMedia, image `sizes` |
| **749px** (max-width) | Below medium (mobile) | CSS, theme.js |
| **940px** (min-width) | Large and up (desktop) | Layout, header, cart, nav, image `sizes` |
| **939px** (max-width) | Below large | quantity-popover.css |
| **1300px** (min-width) | Wide layout | critical-css.liquid, component-header.css |
| **1400px** (min-width) | Widescreen / theme.breakpoints.widescreen | section-header.css, theme.liquid |
| **330px** (max-width) | Very small viewport | template-dynamic-collection.css |
| **480px** (max-width) | Small mobile | grid.css |
| **1200px** (min-width) | Page-width context | product-media.liquid (sizes only) |

---

## By file

### Layout
- **layout/theme.liquid** – `theme.breakpoints`: medium 750, large 940, widescreen 1400; `window.mediaQueries`: mediumUp 600px, largeUp 940px

### JavaScript
- **assets/theme.js** – matchMedia: mobile (max 749px), tabletAndUp (min 750px), mediaQueryMediumUp (min 750px), mediaQuerySmall (max 749px); also uses `theme.breakpoints.medium` for dynamic queries
- **assets/swiper-slideshow.js** – mediumUp (min 750px), largeUp (min 940px); Swiper breakpoints key 750
- **assets/product-sticky-button.js** – `window.innerWidth >= 750`
- **assets/media-gallery.js** – matchMedia (min-width: 750px)
- **assets/quantity-popover.js** – mql (min 940px), mqlTablet (min 750px)

### Liquid (snippets & sections)
- **snippets/critical-css.liquid** – @media: min-width 750px, 940px, 1300px; max-width 749px; max-height 750px
- **sections/main-404.liquid** – @media min-width 750px
- **snippets/product-thumbnail.liquid** – sizes: page_width, 940px, 750px
- **snippets/product-media.liquid** – sizes: 1200px, 750px
- **sections/product-media.liquid** – sizes: 1200px, 750px
- **snippets/product-card-grid.liquid** – sizes: max-width 750px, 940px
- **snippets/image-with-aspect-ratio.liquid** – sizes: 940px, 750px (and default 750px)
- **sections/product-expose.liquid** – sizes: min-width 750px (×4)
- **sections/product-template.liquid** – sizes: page_width, 940px, 750px
- **sections/dynamic-collection-grid.liquid** – sizes: 940px, 750px
- **sections/instagram-slideshow.liquid** – sizes: max-width 750px, 940px (×4)

### CSS – assets
- **assets/base.css** – min-width 750px, 940px; also 1440px, 1800px, 2000px for root font-size only
- **assets/grid.css** – min 750px, 940px; max 749px, 480px
- **assets/component-predictive-search.css** – min 940px
- **assets/component-header.css** – min 940px, 1300px
- **assets/component-header-menu.css** – min 940px
- **assets/component-cart-drawer.css** – min 750px, 940px; max-height 750px
- **assets/component-cart.css** – min 750px, 940px; max 749px
- **assets/component-cart-items.css** – min 750px, 940px; commented range 768–939
- **assets/component-totals.css** – min 750px
- **assets/component-discounts.css** – min 750px
- **assets/component-rte.css** – min 750px
- **assets/component-rating.css** – min 750px
- **assets/component-product-media-gallery.css** – min 750px, 940px; max 749px, 939px (range)
- **assets/component-breadcrumbs.css** – min 940px
- **assets/component-menu-drawer.css** – min 940px
- **assets/component-floating-cta.css** – min 750px, 940px
- **assets/component-rte.css** – min 750px
- **assets/forms.css** – min 750px
- **assets/product-card-grid.css** – min 750px
- **assets/product-expose.css** – min 750px, 940px
- **assets/section-main-product.css** – min 750px, 940px; max 749px
- **assets/section-recommended-product.css** – min 750px
- **assets/section-footer.css** – min 750px
- **assets/section-header.css** – min 750px, 1400px; max 749px
- **assets/instagram-slideshow.css** – min 750px, 940px
- **assets/template-dynamic-collection.css** – min 750px, 940px; max 330px
- **assets/template-password.css** – min 750px; max 749px
- **assets/template-search.css** – (if any; not in grep)
- **assets/quantity-popover.css** – min 940px; max 939px
- **assets/collection-template.css** – min 750px, 940px
- **assets/hae-featured-collections.css** – min 748px, 940px *(unchanged 748)*
- **assets/hae-hero.css** – min 750px, 940px
- **assets/hae-brand-about.css** – min 750px
- **assets/testimonials.css** – min 750px; max 749px

---

## Other media conditions (unchanged)

- **prefers-reduced-motion** – base.css
- **forced-colors: active** – section-main-product.css, component-product-media-gallery.css, critical-css.liquid
- **hover: hover** – component-product-media-gallery.css

---

*Generated after standardizing breakpoints to 750 (medium) and 940 (large).*
