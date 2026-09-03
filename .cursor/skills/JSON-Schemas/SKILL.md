---
name: json-schema-markup
description: >
  Generate JSON-LD structured data (schema.org) for client websites — primarily
  Webflow builds. Use when creating, auditing, or fixing schema markup for a
  page or CMS collection template. Produces a matched .json + .html pair per
  page following the team's house conventions. Triggers: "create schema for X",
  "add JSON-LD", "structured data", "schema markup", "rich snippets".
---

# JSON-LD Schema Markup

House skill for producing schema.org structured data for client sites (mostly
Webflow, occasionally Astro/Next.js). The goal is valid, conservative,
deploy-ready markup that never fabricates data and reuses entities cleanly via
`@id`.

## Golden rules (do not break these)

1. **Never fabricate data.** No invented `aggregateRating`, `review`, `price`,
   review counts, ratings, dates, or employee lists. Only use data you have
   verified from the live/staging site, the client brief, or saved memory. If a
   value isn't known, omit the property — an absent property is always better
   than a fake one.
2. **Two files per page, always.** For every page produce:
   - `<page>.json` — raw JSON, no wrapper (for validators, review, version control).
   - `<page>.html` — the *same* JSON wrapped in `<script type="application/ld+json">…</script>` (paste-ready for Webflow custom code / page `<head>`).
   The JSON body inside both must be byte-for-byte identical.
3. **Wrap the HTML version** in `<script type="application/ld+json">` … `</script>` — nothing else, no surrounding `<html>`/`<head>`.
4. **Use the production URL** for all `@id`, `url`, and `item` values — even when
   the build is on a `*.webflow.io` staging domain. Schema ships with the
   production domain.
5. **`@id` points to the client's own site**, never to `schema.org`. A common
   real bug: `@id` accidentally set to a schema.org URL. Use
   `https://www.client.com/#fragment` form.

## File & folder conventions

- Store under `Project Checker/{ClientName}/JSON Schemas/`.
  (A few older clients — e.g. Neon Cyber — sit directly at `{ClientName}/JSON Schemas/`. Match the existing client's location; check memory/`MEMORY.md` first.)
- One pair per page: `homepage.json` + `homepage.html`, `blog-template.json` + `blog-template.html`, etc. Some clients use numeric prefixes (`01-homepage.html`) — match the existing convention in that client's folder.
- After finishing a client, update `MEMORY.md` with the client's URL, logo raster URL, schema file count, and file location.

## The `@graph` pattern

Use a single `@context` with an `@graph` array of linked nodes rather than
separate disconnected blocks. Cross-reference nodes by `@id` so each entity is
defined once and reused.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.client.com/#organization",
      "name": "Client",
      "url": "https://www.client.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.client.com/#logo",
        "url": "https://cdn.prod.website-files.com/…/logo.png",
        "contentUrl": "https://cdn.prod.website-files.com/…/logo.png"
      },
      "description": "One-sentence factual description of the company.",
      "foundingDate": "2024",
      "sameAs": [
        "https://www.linkedin.com/company/client/",
        "https://x.com/client"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.client.com/#website",
      "name": "Client",
      "url": "https://www.client.com/",
      "publisher": { "@id": "https://www.client.com/#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.client.com/#webpage",
      "name": "Page title",
      "description": "Page meta description.",
      "url": "https://www.client.com/",
      "isPartOf": { "@id": "https://www.client.com/#website" },
      "about": { "@id": "https://www.client.com/#organization" }
    }
  ]
}
```

### Stable `@id` fragments
- `#organization`, `#website`, `#logo` — site-wide, identical on every page.
- `#webpage` — the current page.
- `#breadcrumb`, `#article`, `#software`, `#product`, `#faq` — node-specific, suffix the page URL (e.g. `https://www.client.com/blog/slug#article`).

Reference a previously-defined node with just `{ "@id": "…#organization" }` — do
not redefine its full body.

## Logo

- Always use a **raster** logo (PNG/JPG), never an SVG — Google's structured
  data guidelines reject SVG for `logo`. Pull the raster URL from memory if the
  client is already recorded there.
- Provide both `url` and `contentUrl` on the `ImageObject`.

## Per-page-type recipes

**Homepage** — `Organization` + `WebSite` + `WebPage`, plus a product node
(`SoftwareApplication` or `Product`) when the client sells software. Add
`founder`/`employee` Person arrays only when you have verified names, titles,
and (ideally) LinkedIn `sameAs` URLs.

**Software / product page** — `SoftwareApplication` with `applicationCategory`
(e.g. `"SecurityApplication"`, `"DeveloperApplication"`), `operatingSystem`
(usually `"Web"`), `featureList` (array of real features), and `provider`
referencing `#organization`.

**Pricing / contact-sales** — when pricing is "contact sales" / enterprise, use:
```json
"offers": {
  "@type": "Offer",
  "price": "0",
  "priceCurrency": "USD",
  "description": "Contact sales for pricing.",
  "availability": "https://schema.org/OnlineOnly"
}
```
Never invent a real dollar figure.

**Blog post template (CMS)** — `BlogPosting` (or `Article`) + `BreadcrumbList`.
For Webflow CMS templates, use placeholder tokens that the team maps to Webflow
dynamic fields rather than hardcoded values, e.g. `BLOG_POST_TITLE`,
`BLOG_POST_SLUG`, `BLOG_POST_EXCERPT`, `BLOG_POST_IMAGE_URL`,
`BLOG_POST_PUBLISHED_DATE`, `BLOG_POST_MODIFIED_DATE`, `BLOG_POST_AUTHOR_NAME`,
`BLOG_POST_TAGS`. Decide `author` type per client: **Person** when posts have
real bylines, **Organization** (referencing `#organization`) when they don't —
this varies per client, so confirm.

**News / press release template** — same idea; author is typically a `Person`
CMS field. Use `NewsArticle`.

**Index / collection page** (blog index, resource center) — `CollectionPage`
or `WebPage` + `BreadcrumbList`. Don't enumerate every CMS item.

**FAQ** — `FAQPage` with `mainEntity` array of `Question` → `acceptedAnswer`
`Answer`. Only include Q&As that genuinely appear on the page.

**Breadcrumbs** — `BreadcrumbList` with `itemListElement` `ListItem`s
(`position`, `name`, `item`), Home first.

## Meta tags (often the real win)

Many client sites ship with **no Open Graph / Twitter Card tags**, which makes
Google (and social) pull the wrong content into snippets. When auditing, check
for this and, if missing, produce a `META-TAGS-REFERENCE.html` alongside the
schemas with OG + Twitter tags for each page. This has repeatedly been the
highest-impact fix (see the 1011VC engagement).

## Workflow

1. Read the live/staging page (and the client's entry in `MEMORY.md`) for real
   names, descriptions, URLs, social links, logo raster URL.
2. Pick the node types for the page from the recipes above.
3. Build the `@graph`, reusing `#organization`/`#website` by `@id`.
4. Write `<page>.json`.
5. Write `<page>.html` = same JSON wrapped in the `ld+json` script tag.
6. Validate mentally against schema.org required/recommended props; drop
   anything you can't back with real data.
7. Update `MEMORY.md` for the client (file count, location, logo URL, notes).

## Quick checklist before handing off

- [ ] `.json` and `.html` pair exist and the JSON matches.
- [ ] `.html` wrapped in `<script type="application/ld+json">`.
- [ ] All `@id`/`url` use the production domain, not staging or schema.org.
- [ ] Logo is a raster PNG/JPG with `url` + `contentUrl`.
- [ ] No fabricated ratings, reviews, prices, dates, or people.
- [ ] Entities reused via `@id`, not redefined.
- [ ] Stored under the correct `…/JSON Schemas/` folder.
- [ ] CMS templates use placeholder tokens, not hardcoded sample content.
