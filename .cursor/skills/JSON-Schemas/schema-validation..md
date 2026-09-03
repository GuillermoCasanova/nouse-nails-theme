## Critical Global Finding: FAQPage Rich Results Restricted

Since August 2023, Google restricts FAQPage rich results to **well-known, authoritative government and health websites only**. Our website is a cybersecurity SaaS company and **will NOT receive FAQ rich snippets** in Google Search.

**Recommendation:** Keep FAQPage markup for AI/LLM training signals and content structure benefits, but do NOT rely on it for Google rich results. Consider supplementing with `HowTo` or other eligible schema types where appropriate.

Sources:

- [Google Official Announcement](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Google FAQPage Documentation](https://developers.google.com/search/docs/appearance/structured-data/faqpage)

---

## Google Rich Results Requirements Reference

### SoftwareApplication (eligible for rich results)

| Property                      | Required              | Notes                                  |
| ----------------------------- | --------------------- | -------------------------------------- |
| `name`                        | **Required**          | Name of the app                        |
| `offers.price`                | **Required**          | Must include price; use `"0"` for free |
| `offers.priceCurrency`        | Recommended           | ISO 4217 currency code                 |
| `aggregateRating` OR `review` | **Required (one of)** | Must have at least one                 |
| `applicationCategory`         | Recommended           |                                        |
| `operatingSystem`             | Recommended           |                                        |

### Product (eligible for rich results)

| Property                                 | Required              | Notes                 |
| ---------------------------------------- | --------------------- | --------------------- |
| `name`                                   | **Required**          |                       |
| `image`                                  | **Required**          | For merchant listings |
| `review`, `aggregateRating`, OR `offers` | **Required (one of)** |                       |
| `offers.price`                           | Required in Offer     | Number type           |
| `offers.priceCurrency`                   | Recommended           | ISO 4217              |
| `offers.availability`                    | Recommended           | schema.org enum       |
| `offers.priceValidUntil`                 | Recommended           | ISO 8601 date         |

### VideoObject (eligible for rich results)

| Property                   | Required     | Notes                           |
| -------------------------- | ------------ | ------------------------------- |
| `name`                     | **Required** | Unique per video                |
| `thumbnailUrl`             | **Required** | Direct image URL                |
| `uploadDate`               | **Required** | ISO 8601                        |
| `contentUrl` OR `embedUrl` | Recommended  | Direct video file URL preferred |
| `description`              | Recommended  | Unique per video                |
| `duration`                 | Recommended  | ISO 8601 duration               |

### BreadcrumbList (eligible for rich results)

| Property            | Required     | Notes                       |
| ------------------- | ------------ | --------------------------- |
| `itemListElement`   | **Required** | Min 2 ListItems             |
| `ListItem.position` | **Required** | Integer                     |
| `ListItem.name`     | **Required** | Display text                |
| `ListItem.item`     | **Required** | URL (optional on last item) |

### Review / AggregateRating (eligible for rich results)

| Property                                       | Required              | Notes                          |
| ---------------------------------------------- | --------------------- | ------------------------------ |
| `Review.author`                                | **Required**          | Person or Organization         |
| `Review.reviewRating`                          | **Required**          | Rating object with ratingValue |
| `AggregateRating.ratingValue`                  | **Required**          |                                |
| `AggregateRating.ratingCount` OR `reviewCount` | **Required (one of)** |                                |
| `bestRating`                                   | Optional              | Defaults to 5                  |
| `worstRating`                                  | Optional              | Defaults to 1                  |

---
