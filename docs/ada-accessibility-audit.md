# ADA / WCAG 2.1 Accessibility Audit

**Site:** [https://nousnails.com/](https://nousnails.com/)  
**Date:** 2 September 2026  
**Standard:** WCAG 2.1 Level A and AA (the usual ADA Title III target)  
**Scope:** Full audit of Home, New Arrivals, Product (Matcha Jelly), How To / FAQ, Contact, and Cart  

**Method**

- Automated scan with axe-core 4.13 (WCAG 2.0/2.1/2.2 A + AA tags)
- Custom checks matching the accessibility-audit checklist: buttons, forms, links, focus, headings, keyboard, landmarks, alt text, touch targets
- Manual keyboard and visual review of the live storefront

Webflow Designer was not connected (this is a Shopify theme). The audit was run against the live site and mapped back to theme files.

---

## Site-wide summary

```
═══════════════════════════════════════════════════
SITE-WIDE ACCESSIBILITY AUDIT: nousnails.com
═══════════════════════════════════════════════════

OVERALL SCORE: 47/100

Pages audited: 6
Unique issue types: 15
- Critical: 2 (must fix)
- Serious:  6 (should fix)
- Moderate: 7 (consider fixing)

Scoring: start 100; −10 per critical type; −5 per serious type; −2 per moderate type.
```

| Page | URL | Axe violations | Score |
|------|-----|----------------|-------|
| Home | `/` | 6 rules / 9 nodes | **42/100** |
| New Arrivals | `/collections/new-arrivals` | 2 / 4 | 58/100 |
| Product — Matcha Jelly | `/products/matcha-jelly` | 3 / 5 | 54/100 |
| How To / FAQ | `/pages/how-to` | 2 / 4 | 56/100 |
| Contact | `/pages/contact` | 3 / 5 | 58/100 |
| Cart | `/cart` | 2 / 4 | 60/100 |

Most issues live in **global chrome** (header mega menu, search, floating CTA, marquee). Fixing those once improves every page.

---

## What already works

- Skip link “Skip to content.” is present and becomes visible on first Tab (`layout/theme.liquid`)
- `html lang="en"` is set
- Main landmark (`#MainContent`) is present
- Visible focus rings work on skip link, banner close, logo, nav, search, and cart
- Tab order is logical: skip → announcement close → logo → nav → search → cart
- Visible buttons have accessible names (`aria-label` or text)
- Form controls have labels, `aria-label`, or associated `<label>` (contact, search, quantity)
- FAQ uses native `<details>` / `<summary>` (keyboard-operable with Enter/Space)
- No positive `tabindex` values

<img alt="Skip to content link visible on first Tab" src="/opt/cursor/artifacts/ada_skip_to_content.webp" />

<img alt="Homepage hero and announcement bar" src="/opt/cursor/artifacts/ada_hero.webp" />

---

## CRITICAL (2 issue types)

Must fix. These block screen-reader or assistive-tech users.

---

### [A11Y] Images missing alternative text

- **Issue:** `<img>` elements have no `alt` attribute
- **WCAG:** 1.1.1 Non-text Content (Level A)
- **Impact:** Screen readers announce the file name or skip the image; product and hero photos are not described

**Home hero** (axe confirmed, 1 node)

Shopify `image_tag` omits `alt` when the asset has no alt in admin. The fallback in `sections/hae-hero.liquid` is applied to the whole tag, not to the alt string:

```liquid
| image_tag:
    class: 'responsive-image',
    alt: section.settings['hero-image'].alt
| default: 'Featured content'
```

**Fix:** Always pass a non-empty alt, e.g. `alt: section.settings['hero-image'].alt | default: section.settings['header-text'] | strip_html | truncate: 125`. Decorative images should use `alt: ''` plus `role: 'presentation'`.

**Site-wide product / promo images** (4 images on every page)

Missing `alt` on:

- `Iced-Out-4.jpg`
- `Stars-Aligned-3.jpg`
- `Strange-Terrain-2.jpg`
- `Geometric-Jelly-2.jpg`

Same Shopify `image_tag` behavior in `snippets/product-card-grid.liquid` (`alt: preview_image.alt` / `alt: product.images[1].alt`) and mega-menu promotions when both image alt and promo text are blank.

**Fix:** `alt: preview_image.alt | default: product.title`. Fill product image alt text in Shopify admin for media that is not decorative.

Homepage also has **19 images with empty `alt=""`** (treated as decorative). Confirm those are truly decorative and not product photos.

---

### [A11Y] Duplicate IDs used by `aria-labelledby`

- **Issue:** Quick-add submit buttons reuse the same `id` (`product-form-{id}-submit`) twice per product card
- **Location:** `snippets/quick-add.liquid` (mobile button ~line 34 and desktop button ~line 99)
- **WCAG:** 4.1.1 Parsing / 4.1.2 Name, Role, Value (Level A)
- **Impact:** `aria-labelledby` pointing at a duplicated id is ambiguous; axe flagged this as needs-review (`duplicate-id-aria`, 9–12 nodes on collection-style pages)

Also duplicated: `BlogTitle-` (3 times).

**Fix:** Unique ids per instance (`product-form-{{ product.id }}-submit-mobile` / `-desktop`). Keep one accessible name source.

---

## SERIOUS (6 issue types)

Should fix. Significant impact on keyboard, motion-sensitive, or mobile users.

---

### [A11Y] Nested interactive controls in the header mega menu

- **Element:** `<summary class="header__menu-summary">` wrapping `<a class="header__menu-item">`
- **Location:** `snippets/header-mega-menu.liquid` (Shop All, New — axe target `#Shop All`, `#New`)
- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Screen readers and keyboard users get two controls in one. Tab may focus both the disclosure and the link; activation is unpredictable.
- **Current:** `<summary><a href="...">Shop All</a></summary>`
- **Fix:** Put the link text in the summary (no inner `<a>`), or use a button for the disclosure and a separate link. Do not nest `<a>` inside `<summary>`.

This fires on **every page**.

---

### [A11Y] Focusable content inside `aria-hidden="true"`

- **Element:** Floating CTA modal `#FloatingCtaModal-template--…__floating_cta_z4EYG4`
- **Location:** `sections/floating-cta.liquid`
- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Keyboard users can tab into a hidden dialog (close, form fields) that screen readers are told to ignore.

**Also on product:** Bold Subscriptions collapsible `#bsub-sub-details-collapsible-…` is `aria-hidden="true"` while still containing a focusable control (third-party widget).

**Fix:** When the modal is closed, set `inert` or `tabindex="-1"` on all focusable descendants, or remove them from the tab order in JS. Open state should set `aria-hidden="false"` and trap focus.

---

### [A11Y] Auto-scrolling marquee with no pause control

- **Element:** `.marquee-banner__text` (“15-MINUTES. CLEAN ALTERNATIVE. DAMAGE-FREE.”)
- **Location:** `sections/hae-marquee-banner.liquid`, `assets/marquee-banner.css`
- **WCAG:** 2.2.2 Pause, Stop, Hide (Level A)
- **Impact:** Animation runs infinitely with no pause/stop. Users with vestibular disorders or who need more time to read cannot stop it.
- **Current:** `animation-iteration-count: infinite` for 60s ticker; no `prefers-reduced-motion` override
- **Fix:**

```css
@media (prefers-reduced-motion: reduce) {
  .marquee-banner__text {
    animation: none;
    padding-right: 0;
    flex-wrap: wrap;
    white-space: normal;
  }
}
```

Add a pause control if the motion stays on by default.

---

### [A11Y] Autoplaying videos without captions or pause

- **Home:** 19 `<video>` elements; **0** have `<track>` captions
- **Hero / product cards / Instagram slideshow:** `autoplay`, `loop`, `muted`, no `controls`
- **WCAG:** 1.2.1 Audio-only and Video-only (Level A), 2.2.2 Pause, Stop, Hide (Level A)
- **Impact:** Motion cannot be paused. If a clip conveys information (how-to, product demo), it needs captions or a text alternative. Decorative muted loops should be `aria-hidden="true"` and honor reduced motion.

**Fix:** For decorative clips, `aria-hidden="true"` and pause when `prefers-reduced-motion: reduce`. For informative clips, add captions (`<track kind="captions">`) and a pause control.

---

### [A11Y] Search and cart touch targets are too small

- **Elements:** Header Search button **19×19 px**, Cart link **19×19 px**
- **WCAG:** 2.5.8 Target Size (Minimum) (Level AA, WCAG 2.2); 2.5.5 Target Size is AAA at 44×44
- **Impact:** Hard to tap accurately on mobile; adjacent targets increase mis-taps
- **Fix:** `min-width` / `min-height: 44px` (or at least 24px) with padding on `.header__icon`

Product quantity − / + buttons are **23×31 px** (just under 24px width).

<img alt="Keyboard focus on header cart icon" src="/opt/cursor/artifacts/ada_keyboard_focus_cart.webp" />

---

### [A11Y] FAQ `aria-label` overrides the visible question

- **Element:** `<summary class="faq-list__item__question" aria-label="Open FAQ answer for question {{ forloop.index }}">`
- **Location:** `sections/hae-faqs.liquid`
- **WCAG:** 2.5.3 Label in Name (Level A), 4.1.2 Name, Role, Value
- **Impact:** The accessible name becomes “Open FAQ answer for question 1” instead of “How long do they last?”. Keyboard users can still open the accordion (`<details>`), but screen-reader users do not hear the question.

**Fix:** Remove `aria-label`, or use `aria-label="{{ block.settings.question }}, show answer"`. Prefer visible text as the name.

<img alt="FAQ accordion on How To page" src="/opt/cursor/artifacts/ada_faq_accordion.webp" />

---

## MODERATE (7 issue types)

Consider fixing. Improves structure and consistency.

---

### [A11Y] Empty headings

- **Element:** `<h3 class="featured-collections__column__eyebrow">` with no text
- **Location:** Home, Featured Collections (`sections/hae-featured-collections.liquid`)
- **WCAG:** 1.3.1 Info and Relationships / 2.4.6 Headings and Labels
- **Current:** Eyebrow is an `h3` bound to `block.settings.collection.title`, which is empty for these blocks
- **Fix:** Don’t render the `h3` when the title is blank, or use a `<p>` instead of a heading

---

### [A11Y] Multiple `h1` elements on every page

- Search drawer heading **“LOOKING FOR SOMETHING?”** is always in the DOM as an `h1`
- Page also has its real `h1` (Home “Nous Nails”, collection “The Nous Standard”, product title, etc.)
- Cart has **three** `h1`s (search + “My Cart” + “Your cart is empty”)
- **WCAG:** 1.3.1 Info and Relationships
- **Fix:** Change the search heading to `h2` (or hide it until the drawer opens and keep a single page `h1`)

---

### [A11Y] Content outside landmarks

- Skip link and announcement bar are not inside `header` / `main` / `nav`
- **WCAG:** Best practice (axe `region`); related to 1.3.1
- **Fix:** Wrap the announcement bar in `<div role="banner">` or include it in `<header>`. Skip links are commonly exempt; this is low priority.

---

### [A11Y] Invalid `role="dialog"` on the floating CTA launcher

- **Element:** `<aside class="floating-cta" role="dialog" aria-modal="true" …>`
- **Location:** `sections/floating-cta.liquid`
- **WCAG:** 4.1.2 / ARIA in HTML
- **Impact:** A persistent corner widget is not a dialog. `aria-modal="true"` tells AT the rest of the page is inert when it is not.
- **Also:** `aria-describedby="floating-cta-description"` points at a missing id.

**Fix:** Use `role="complementary"` (or no role) on the launcher. Keep `role="dialog"` only on the modal overlay when it is open. Add the describedby target or remove the attribute.

---

### [A11Y] Contact page heading skip (`h1` → `h3`)

- Footer “Quick Links” / “Stay Updated” are `h3` after the page `h1` (no `h2` in between)
- **WCAG:** 1.3.1 Info and Relationships
- **Fix:** Use `h2` for footer column titles, or keep them visually styled but sequentially correct

---

### [A11Y] Product-card hover image swap has no keyboard equivalent

- Hover swaps the product photo; keyboard and touch users never see the second image
- **WCAG:** 1.4.13 Content on Hover or Focus / 2.1.1 Keyboard
- **Fix:** Show the second image on `:focus-within`, or drop hover-only content

---

### [A11Y] Email signup popup / sticky widget — icon-only close and submit

- Close is an “X”; submit is an arrow
- Theme does add `aria-label` on the floating CTA close (“Hide floating CTA”, `accessibility.close`)
- **WCAG:** 2.4.6 Headings and Labels (visible label is AAA-adjacent; name is present)
- **Fix:** Keep `aria-label`; consider visible “Close” / “Subscribe” text for the popup

<img alt="Email signup popup and sticky widget" src="/opt/cursor/artifacts/ada_email_popup.webp" />

---

## Pages audited

### Home — 42/100

<img alt="Nous Nails homepage" src="/opt/cursor/artifacts/ada_homepage.png" />

Axe: `aria-allowed-role`, `aria-hidden-focus`, `empty-heading`, `image-alt`, `nested-interactive`, `region`.

Hero, marquee, Instagram videos, empty collection eyebrows, and floating CTA are concentrated here.

### New Arrivals — 58/100

<img alt="New Arrivals collection page" src="/opt/cursor/artifacts/ada_collection_new_arrivals.png" />

Same header issues. Duplicate quick-add ids appear on this grid.

### Product (Matcha Jelly) — 54/100

<img alt="Matcha Jelly product page" src="/opt/cursor/artifacts/ada_product_matcha_jelly.png" />

Add to cart and Shop Pay have visible names. Quantity −/+ are slightly under 24px. Bold Subscriptions widget leaves focusable content in `aria-hidden`. Icon-only zoom / gallery arrows have (or should keep) `aria-label`s.

### How To / FAQ — 56/100

<img alt="How To page with FAQ accordion" src="/opt/cursor/artifacts/ada_how_to_faq.png" />

Accordion is a native `<details>` element (keyboard OK). `aria-label` on `<summary>` hides the question from screen readers.

### Contact — 58/100

<img alt="Contact page" src="/opt/cursor/artifacts/ada_contact.png" />

Form labels passed automated checks. Heading order skips `h2` into footer `h3`s.

### Cart — 60/100

<img alt="Empty cart page" src="/opt/cursor/artifacts/ada_cart.png" />

<img alt="Empty cart drawer overlay" src="/opt/cursor/artifacts/ada_cart_drawer.webp" />

Empty state is clear. Multiple `h1`s. Confirm focus is trapped when the **drawer** is open (drawer uses `role="dialog"` in `snippets/cart-popup.liquid` / cart drawer).

---

## Needs review (axe incomplete — not counted as failures)

| Check | Notes |
|-------|--------|
| **Color contrast** | 14–31 nodes could not be measured because of background **gradients** (Instagram slideshow product titles/prices). Hero italic “small talk” is `rgb(109, 5, 6)` on cream — likely passes 4.5:1 on a solid cream background. Verify overlay text on photos with a contrast picker. |
| **Video captions** | Incomplete because axe cannot tell decorative vs informative. Treat autoplay product videos as serious until marked decorative. |
| **aria-valid-attr-value** | Search toggle `aria-controls="search-modal"` and floating CTA `aria-controls` — axe cannot confirm the popup id while closed. Worth verifying the ids exist. |
| **Third-party iframe** | Shopify web-pixel sandbox iframe has no `title`. Low priority; not theme-owned. |

Cookiebot markup is in the DOM (`cookiebot-us-banner-suppress`). A visible cookie banner did not appear during the US-based visual pass.

---

## Prioritized fix list

### Quick wins (theme, high impact)

1. **Hero and product `image_tag`:** always output `alt` with `product.title` / heading fallback  
2. **Mega menu:** stop wrapping `<a>` in `<summary>`  
3. **Quick-add:** unique button ids  
4. **FAQs:** remove generic `aria-label` on `<summary>`  
5. **Marquee:** `prefers-reduced-motion: reduce { animation: none; }`  
6. **Floating CTA:** `role="complementary"` on launcher; `inert` on closed modal  
7. **Empty `h3`:** wrap in `{% if block.settings.collection.title != blank %}`  
8. **Search drawer `h1`:** demote to `h2`

### Design / content

9. Increase search/cart hit area to 44×44  
10. Pause control (or static text) for marquee  
11. Captions or `aria-hidden` on looping videos  
12. Fill image alt text in Shopify admin  

### Third-party

13. Bold Subscriptions collapsible `aria-hidden` + focus  
14. Shopify pixel iframe title (optional)

---

## Suggested theme touch list

| File | Change |
|------|--------|
| `sections/hae-hero.liquid` | Non-empty `alt` on `image_tag` |
| `snippets/product-card-grid.liquid` | `alt: product.title` fallback |
| `snippets/header-mega-menu.liquid` | Don’t nest link inside `<summary>` |
| `snippets/quick-add.liquid` | Unique `id`s |
| `sections/hae-faqs.liquid` | Drop or rewrite `aria-label` |
| `sections/hae-marquee-banner.liquid` / `assets/marquee-banner.css` | Reduced-motion + pause |
| `sections/floating-cta.liquid` | Correct roles; inert when closed |
| `sections/hae-featured-collections.liquid` | Skip empty `h3` |
| `sections/header.liquid` / search drawer | Single `h1` per page |
| `sections/instagram-slideshow.liquid` | `aria-hidden` or captions on videos |

---

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
- [Understanding 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
- Manual follow-up: Tab / Shift+Tab / Enter / Space; NVDA or VoiceOver on Home + Product + Cart drawer
- Re-scan with axe DevTools or Lighthouse after fixes

---

*This report is an automated + expert review, not a legal certification. ADA conformance is typically demonstrated with WCAG 2.1 AA, including manual screen-reader testing.*
