# Shopify theme accessibility patterns

Use these Liquid/JS patterns when auditing or fixing storefront a11y. Prefer native HTML; add ARIA only when native semantics are not enough. User-facing strings go through `{{ 'key' | t }}`.

## Skip link and main

```liquid
<a class="skip-to-content-link button visually-hidden" href="#MainContent">
  {{ 'accessibility.skip_to_content' | t }}
</a>

<main id="MainContent" tabindex="-1">
  {{ content_for_layout }}
</main>
```

Show the skip link on `:focus`. Do not use `user-scalable=no` or `maximum-scale` on the viewport meta.

## Images — always pass alt into `image_tag`

Shopify does **not** output `alt` when the asset has no admin alt and you do not pass one. Defaulting the **tag** is wrong:

```liquid
{% comment %} Wrong: default applies to the whole <img>, not alt {% endcomment %}
{{ image | image_url: width: 1200 | image_tag: alt: image.alt | default: 'Featured' }}
```

```liquid
{% comment %} Right: fallback string for alt {% endcomment %}
{{ image | image_url: width: 1200 | image_tag:
  alt: image.alt | default: product.title | escape
}}

{% comment %} Decorative {% endcomment %}
{{ image | image_url: width: 800 | image_tag: alt: '', role: 'presentation' }}
```

Product cards: `alt: preview_image.alt | default: product.title`.

## Unique IDs in loops

Every `id` used by `for`, `aria-labelledby`, `aria-controls`, or `<label>` must be unique per instance:

```liquid
<button type="submit" id="quick-add-{{ product.id }}-{{ section.id }}-submit">
  {{ 'products.product.add_to_cart' | t }}
</button>
```

If a snippet renders twice (mobile + desktop), suffix `-mobile` / `-desktop`. Cart line items: use `item.key`.

## Product card

```liquid
<article class="product-card" aria-labelledby="ProductTitle-{{ product.id }}-{{ section.id }}">
  <a href="{{ product.url }}" class="product-card__link">
    {{ product.featured_image
      | image_url: width: 600
      | image_tag: alt: product.featured_image.alt | default: product.title | escape
    }}
  </a>
  <h3 id="ProductTitle-{{ product.id }}-{{ section.id }}">
    <a href="{{ product.url }}">{{ product.title }}</a>
  </h3>
</article>
```

If a second image appears on hover, also show it on `.product-card:focus-within`.

## Sale vs regular price

```liquid
<div class="price">
  {% if product.compare_at_price > product.price %}
    <span class="visually-hidden">{{ 'products.product.price.sale_price' | t }}</span>
    <span>{{ product.price | money }}</span>
    <span class="visually-hidden">{{ 'products.product.price.regular_price' | t }}</span>
    <s aria-hidden="true">{{ product.compare_at_price | money }}</s>
  {% else %}
    <span class="visually-hidden">{{ 'products.product.price.regular_price' | t }}</span>
    <span>{{ product.price | money }}</span>
  {% endif %}
</div>
```

Announce variant-driven price/availability changes:

```html
<div class="visually-hidden" aria-live="polite" aria-atomic="true" data-product-status></div>
```

```js
announce(el, message) {
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}
```

## Variant picker fallback

```liquid
<noscript>
  <label for="Variant-{{ section.id }}">{{ 'products.product.select_variant' | t }}</label>
  <select name="id" id="Variant-{{ section.id }}">
    {% for variant in product.variants %}
      <option
        value="{{ variant.id }}"
        {% if variant == product.selected_or_first_available_variant %}selected{% endif %}
        {% unless variant.available %}disabled{% endunless %}
      >
        {{ variant.title }} — {{ variant.price | money }}
      </option>
    {% endfor %}
  </select>
</noscript>
```

## Mega menu — no nested interactives

Do not wrap a link in `<summary>`:

```liquid
{% comment %} Wrong {% endcomment %}
<summary><a href="{{ link.url }}">{{ link.title }}</a></summary>
```

```liquid
{% comment %} Disclosure for children; separate link for the parent URL if needed {% endcomment %}
<button
  type="button"
  aria-expanded="false"
  aria-controls="Submenu-{{ forloop.index }}"
>
  {{ link.title }}
</button>
<ul id="Submenu-{{ forloop.index }}" hidden>
  {% for child in link.links %}
    <li>
      <a href="{{ child.url }}" {% if child.current %}aria-current="page"{% endif %}>
        {{ child.title }}
      </a>
    </li>
  {% endfor %}
</ul>
```

Use `<nav aria-label="…">`. Do not put `role="menu"` / `menuitem` on storefront navigation. Esc closes; focus returns to the launcher.

## FAQ / accordion

Native `<details>` / `<summary>` is enough. Do not set `aria-label` on `<summary>` unless it **includes** the visible question (WCAG 2.5.3). Prefer no `aria-label` so the question is the name.

```liquid
<details>
  <summary>{{ block.settings.question }}</summary>
  <div>{{ block.settings.answer }}</div>
</details>
```

Skip empty headings:

```liquid
{% if block.settings.heading != blank %}
  <h2>{{ block.settings.heading }}</h2>
{% endif %}
```

## Cart drawer (dialog)

```liquid
<div
  id="CartDrawer"
  class="cart-drawer"
  role="dialog"
  aria-modal="true"
  aria-labelledby="CartDrawer-Title"
  hidden
>
  <h2 id="CartDrawer-Title">{{ 'cart.general.title' | t }}</h2>
  <button type="button" aria-label="{{ 'accessibility.close' | t }}">{% render 'icon-close' %}</button>

  <div aria-live="polite" aria-atomic="true" class="visually-hidden">
    {{ 'cart.general.item_count' | t: count: cart.item_count }}
  </div>

  {% for item in cart.items %}
    <label for="Quantity-{{ item.key }}">
      {{ 'cart.quantity.label' | t }} ({{ item.product.title | escape }})
    </label>
    <button type="button" aria-label="{{ 'cart.quantity.decrease' | t: title: item.product.title }}">−</button>
    <input id="Quantity-{{ item.key }}" type="number" name="updates[]" value="{{ item.quantity }}" min="0">
    <button type="button" aria-label="{{ 'cart.quantity.increase' | t: title: item.product.title }}">+</button>
    <button type="button" aria-label="{{ 'cart.general.remove' | t: title: item.product.title }}">
      {% render 'icon-remove' %}
    </button>
  {% endfor %}
</div>
```

When open: move focus into the drawer, trap Tab, close on Esc, return focus to the cart launcher. When closed: `hidden` or `inert` — no tab stops inside `aria-hidden="true"`.

A persistent floating widget is not a dialog. Use `role="complementary"` (or no role) on the launcher; `role="dialog"` only on the overlay that actually modalizes the page.

## Forms

```liquid
<label for="ContactForm-email">{{ 'contact.form.email' | t }}</label>
<input
  type="email"
  id="ContactForm-email"
  name="contact[email]"
  autocomplete="email"
  required
  aria-describedby="ContactForm-email-error"
>
<p id="ContactForm-email-error" class="form__message" role="alert" hidden>
  {{ 'contact.form.email_error' | t }}
</p>
```

On invalid: `aria-invalid="true"`, show the message, focus the first error. Allow paste on password fields (`autocomplete="current-password"`).

## Collection filters

Launcher: `aria-expanded` + `aria-controls`. Fieldset + legend for each group. Announce result counts with `aria-live="polite"`.

## Carousel / marquee

- Next/previous buttons with `aria-label`
- Auto-rotation: pause control; pause on hover/focus; `aria-live="off"` while auto-playing
- Inactive slides: `aria-hidden="true"` and not focusable
- Marquee: `@media (prefers-reduced-motion: reduce) { animation: none; }` plus a pause control if motion stays on by default

## Icon buttons

```liquid
<button type="button" aria-label="{{ 'accessibility.close' | t }}">
  <svg aria-hidden="true" focusable="false"><!-- … --></svg>
</button>
```

## Focus and motion (CSS)

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 60px;
}

@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid LinkText;
  }
}

button,
[role="button"],
.header__icon {
  min-width: 44px;
  min-height: 44px;
}
```

Never `outline: none` without a visible `:focus-visible` replacement.
