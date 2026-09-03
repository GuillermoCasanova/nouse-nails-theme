---
name: ada-accessibility-check
description: >
  Audit Shopify Liquid storefronts against WCAG 2.2 Level A/AA (the usual ADA
  Title III target). Use when the user asks for an ADA check, accessibility
  audit, WCAG/a11y review, keyboard or screen-reader testing, or fixes for
  alt text, focus, cart drawer, product forms, or theme landmarks. Not for
  Webflow Designer or visual-builder sites.
---

# ADA / Accessibility Check (Shopify stores)

Audit **Shopify Online Store 2.0 themes** (Liquid, CSS, JS) and the **live or preview storefront**. Goal: content usable by everyone, including people who use keyboards, screen readers, zoom, or reduced motion.

This is **not** a Webflow skill. Do not use Webflow Designer, Webflow MCP, element IDs, or CMS Collection templates. Map every finding to a theme file (`layout/`, `sections/`, `snippets/`, `assets/`, `locales/`) or label it **third-party / Shopify-hosted**.

Target: **WCAG 2.2 Level A and AA**. AAA is nice to have. An automated pass is not a legal certification.

Official references: [Shopify theme accessibility](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility) and [Theme Store accessibility requirements](https://shopify.dev/docs/storefronts/themes/store/requirements). Liquid/JS patterns: [shopify-patterns.md](shopify-patterns.md).

## WCAG principles (POUR)

| Principle | Meaning |
|-----------|---------|
| Perceivable | Content can be perceived through different senses |
| Operable | Interface can be operated by all users |
| Understandable | Content and interface are understandable |
| Robust | Content works with assistive technologies |

## Scope

**In scope (theme-owned)**

- `layout/theme.liquid` (skip link, `lang`, viewport, landmarks)
- Header, mega menu, search, cart icon, announcement bar, footer
- Product, collection, cart, search, contact, FAQ, account templates
- Cart drawer / AJAX cart, quick-add, variant pickers, quantity, filters
- Theme CSS/JS (focus, motion, drawers, live regions)

**Out of theme scope (still report, do not “fix” as theme bugs)**

- Shopify Checkout (hosted) unless the repo has checkout UI extensions
- App embeds / widgets (subscriptions, reviews, pixels, cookie banners)
- Merchant-entered content in admin (empty image alt, blank collection titles)
- Shopify web-pixel iframes

**Default storefront pages to cover** (adjust to the store): Home, Collection, Product, Cart (page + drawer), Search, Contact, and any high-traffic custom page (FAQ / How-to).

---

## Audit workflow

### 1. Confirm target

- Storefront URL or Shopify preview (`?preview_theme_id=…`)
- Theme root in this repo
- Scope: full store vs critical only vs named templates

If the live site and theme files disagree, treat the **rendered storefront** as source of truth and map back to Liquid.

### 2. Code pass (theme)

Search Liquid, CSS, and JS. Flag:

| Look for | Why |
|----------|-----|
| `image_tag` / `<img` without `alt` | WCAG 1.1.1; Shopify requires `alt` on every `img` |
| `alt: image.alt` with no fallback | Admin-blank alt omits the attribute |
| Nested interactives (`<a>` inside `<button>` / `<summary>`) | 4.1.2 |
| `outline: none` / `outline: 0` without `:focus-visible` replacement | 2.4.7 |
| `tabindex` other than `0` or `-1`, or `autofocus` | Shopify + 2.4.3 |
| `user-scalable=no` / `maximum-scale` on viewport | Zoom required |
| Duplicate `id=` inside `{% for %}` | 4.1.2; breaks `aria-labelledby` |
| `aria-hidden="true"` on containers that still have focusable descendants | 4.1.2 |
| `role="dialog"` / `aria-modal="true"` on persistent launchers (not the open overlay) | Invalid dialog |
| `role="menu"` / `role="menuitem"` on site nav | Shopify: do not use menu roles for navigation |
| Hover-only CSS (`:hover` image swap, mega menu) with no `:focus-within` / keyboard | 2.1.1, 1.4.13 |
| Infinite animation / autoplay video without pause or `prefers-reduced-motion` | 2.2.2 |
| Empty headings bound to settings that can be blank | 1.3.1 |
| Extra `h1` in drawers that stay in the DOM | 1.3.1 |
| Icon-only controls without `aria-label` or visually hidden text | 4.1.2 |
| `aria-label` that **overrides** visible text with a generic string | 2.5.3 Label in Name |

### 3. Live pass (storefront)

Run automated + keyboard review on each in-scope URL:

```bash
npx lighthouse <url> --only-categories=accessibility
npx @axe-core/cli <url> --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa
```

Then manually:

1. **Keyboard:** Tab / Shift+Tab through the page. Enter/Space activate. Esc closes drawers/menus and returns focus to the launcher.
2. **Skip link:** First Tab shows “Skip to content”; activating it moves focus to `#MainContent` (or equivalent with `tabindex="-1"`).
3. **Cart drawer + search + mobile nav:** Open each. Focus must trap while open; background must not be tabbable (`inert` or `tabindex="-1"` on focusable descendants). No focusable nodes inside `aria-hidden="true"`.
4. **Product:** Change variant; confirm price/availability changes are announced (`aria-live`). Quantity ± and add-to-cart have names. Gallery arrows/zoom have names.
5. **Collection:** Filters/sort are keyboard operable; result count updates are announced.
6. **Zoom:** Usable at 200%. Pinch-zoom not disabled.
7. **Motion:** `prefers-reduced-motion: reduce` stops marquees, autoplay videos, and decorative animation.
8. **Target size:** Primary controls ≥ 24×24 CSS px (WCAG 2.2 AA). Shopify also expects **44×44** on primary touch targets (menu, search, cart, add to cart, close, variants, quantity).

### 4. Score and report

Start at 100. Deduct **per unique issue type** (not per node): Critical −10, Serious −5, Moderate −2. Floor 0.

Map each finding to a file + WCAG criterion. Offer theme fixes after the report; do not auto-edit until the user asks.

Use this report shape:

```
═══════════════════════════════════════════════════
ACCESSIBILITY AUDIT: [Page or site]
═══════════════════════════════════════════════════

CRITICAL (X issue types)
───────────────────
[A11Y] Element: …
  Issue: …
  Location: template URL + theme file
  Current: …
  Fix: …
  WCAG: …

SERIOUS / MODERATE — same shape

═══════════════════════════════════════════════════
SUMMARY
Total issue types: X (Critical / Serious / Moderate)
Accessibility Score: XX/100
Most common: …
Quick wins: …
Third-party / out of scope: …
═══════════════════════════════════════════════════
```

---

## Shopify storefront checks

These are **in addition to** general website WCAG below.

### Document and landmarks

- `<html lang="{{ shop.locale }}">` (or equivalent), never a missing `lang`
- Viewport allows zoom: `width=device-width, initial-scale=1` — no `user-scalable=no`
- Skip link is the first focusable element, visible on focus, targets main with `tabindex="-1"`
- One `<header>`, one `<main>`, one `<footer>` per page. Multiple `<nav>` need distinct `aria-label`
- Strings from `{{ 'key' | t }}` in `locales/` — including skip link, close, cart, search

### Images (`image_tag`)

Shopify omits `alt` when the asset has no admin alt **and** the filter is not given a fallback. Always pass a string:

```liquid
{{ image | image_url: width: 1200 | image_tag:
  alt: image.alt | default: product.title | escape
}}
```

Decorative: `alt: ''` (empty, not missing). Product/content images need a real description (admin alt or title fallback). Never rely on ` | default: '…'` **after** `image_tag` — that defaults the whole tag, not alt.

### Product information

- Sale vs regular price: visual difference **and** visually hidden text (e.g. “Sale price” / “Regular price”)
- Variant change updates price, availability, and SKU to screen readers via `aria-live`
- `<noscript>` fallback `<select name="id">` for variant pickers that require JS
- Quantity: labeled input; ± buttons have names that include the product title in cart
- Unique `id`s in loops (`product.id`, `item.key`, `section.id`, `forloop.index`) — never reuse `product-form-{{ id }}-submit` twice on the same card

### Product cards and collection grids

- Prefer one primary tab stop per card (the product link). Extra actions (quick-add) need their own name
- Hover image swap also on `:focus-within` (or drop hover-only content)
- Card images: `alt: preview_image.alt | default: product.title`

### Navigation and mega menu

- Wrap nav in `<nav aria-label="…">`. Use `aria-current="page"` on the current item
- Disclosure: `aria-expanded` + `aria-controls` on the launcher; Esc closes and restores focus
- **Do not** nest `<a>` inside `<summary>` or `<button>`
- Do not use `role="menu"` / `menuitem` for storefront nav (Shopify guidance)

### Drawers, modals, predictive search

- Open overlay: `role="dialog"`, `aria-modal="true"`, labelled by a visible heading
- Focus moves into the dialog; Tab cycles inside; Esc closes; focus returns to launcher
- Closed state: `inert` or remove descendants from tab order. Never leave focusable controls in `aria-hidden="true"`
- Persistent widgets (floating CTA, chat launcher) are **not** dialogs — `role="complementary"` or no role; `aria-modal` only while a real modal is open
- Cart count / AJAX line-item changes: `aria-live="polite"` region
- Remove-item and icon close buttons: `aria-label` with product title / “Close”

### Cart and checkout entry

- Cart page and cart drawer both keyboard-complete (quantity, remove, checkout)
- Empty and populated states each have a sensible heading (not multiple competing `h1`s)
- Checkout button is a real link/button with clear text

### Filters, search, forms

- Every input has a label (`<label for>`, wrapping label, or `aria-label`). IDs unique
- Required: `required` (and `aria-required="true"` if you add ARIA)
- `autocomplete` on email, name, address, password fields
- Errors: `aria-invalid="true"`, `aria-describedby` → message, `role="alert"` or live region, focus first error
- Contact, newsletter, login, and storefront password forms all count
- Filter result counts announced when they change
- Accessible authentication (WCAG 2.2 3.3.8): do not block paste/autofill on password fields

### Media, motion, carousels

- Prefer no autoplay. If a muted decorative loop is required: `aria-hidden="true"`, honor `prefers-reduced-motion`, provide pause
- Informative video: captions (`<track kind="captions">`) and a pause control; Space pauses
- Marquees / auto-rotating slideshows: pause/stop (2.2.2); next/previous controls; live region off during auto-rotation
- 3D/model viewers: single-pointer alternative to multi-finger gestures

### Third-party

Report separately: apps that inject `aria-hidden` with focusable nodes, unlabeled close buttons, or iframes without `title`. Do not rewrite app markup in the theme unless an app block/snippet in the repo owns it.

---

## General website WCAG (still applies)

### Text alternatives (1.1)

Icon-only buttons need an accessible name (`aria-label` or `.visually-hidden` text). Hide decorative SVGs with `aria-hidden="true"`.

### Color contrast (1.4.3, 1.4.11)

| Text / UI | AA |
|-----------|----|
| Normal text (&lt; 18px / &lt; 14px bold) | 4.5:1 |
| Large text (≥ 18px / ≥ 14px bold) | 3:1 |
| UI components, graphics, input borders, focus rings | 3:1 |

Do not rely on color alone (errors, sale, availability). Pair with text or an icon.

### Keyboard (2.1) and focus (2.4.7, 2.4.11)

Prefer native `<button>`, `<a href>`, and form controls. Custom widgets need `tabindex="0"`, a role, and Enter/Space — do not add that on a native `<button>` (double-fires).

Never remove outlines without `:focus-visible` replacement (≥ 3:1). Sticky header/announcement/cart bar must not fully hide the focused control (`scroll-margin-top` / 2.4.11).

Target size **24×24** CSS px (2.5.8 AA); **44×44** recommended for primary storefront controls.

Dragging (2.5.7): any drag action needs a single-pointer alternative (buttons, inputs).

### Timing and motion (2.2, 2.3)

Session timeouts need extend/log-out. Honor `prefers-reduced-motion`. Nothing flashes more than 3 times per second.

### Understandable (3.x)

Consistent nav order across templates (3.2.3). Repeated help (chat, FAQ, contact) stays in the same relative order (3.2.6). Do not force re-entry of data already given in the same flow (3.3.7), e.g. shipping = billing.

### Robust ARIA (4.1)

Native elements over ARIA. Live regions for cart, filters, toasts, variant changes — don’t move focus unless it’s an error.

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Severity

**Critical (fix immediately)**  
Missing form labels · missing image `alt` · insufficient contrast · keyboard traps · no focus indicators · focusable content inside `aria-hidden` · nested interactive controls that block names

**Serious (fix before launch)**  
Missing `lang` · heading structure / empty headings · non-descriptive links · auto-playing media / marquee without pause · missing skip link · drawers without focus trap or Esc · hover-only content · touch targets below 24px · generic `aria-label` hiding visible text

**Moderate (fix soon)**  
Missing names on icon buttons · inconsistent nav · missing error identification · landmarks / content outside regions · extra `h1` in hidden drawers · invalid `role="dialog"` on non-modals · third-party iframe `title`

---

## Manual testing checklist

- [ ] Keyboard: full page, menus, filters, product form, cart drawer, search
- [ ] Screen reader: VoiceOver (Mac/iOS), NVDA (Windows), or TalkBack — Home, Product, Cart
- [ ] Skip link works and is visible on focus
- [ ] Zoom 200% usable; pinch-zoom enabled
- [ ] Reduced motion stops marquees/autoplay
- [ ] Focus order matches visual order; no positive `tabindex`
- [ ] Primary controls meet 24×24 (prefer 44×44)
- [ ] Variant/price/cart updates announced

---

## What this skill does not replace

- Legal ADA certification or a VPAT
- Visual contrast on gradient/photo overlays (measure with a picker; axe often marks these incomplete)
- Copy clarity and reading level
- Checkout accessibility owned by Shopify

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Shopify theme accessibility](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility)
- [Theme Store requirements — Accessibility](https://shopify.dev/docs/storefronts/themes/store/requirements)
- Tools: axe DevTools, Lighthouse, WAVE, Accessibility Insights
- Theme patterns: [shopify-patterns.md](shopify-patterns.md)
