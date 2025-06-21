# 📬 Nomadshood – Country-Based Coliving Email Campaign

This service sends personalized coliving recommendation emails to subscribers based on their country preferences. Each email contains a featured coliving space, nearby spots, and local community links — tailored to the user's interests.

---

## 🎯 Goal

Send a weekly email to each subscriber using:
- Their **selected countries**
- Matching colivings from that country
- Extra details (walkable locations & community groups)

---

## 🗃️ Firestore Collections

| Collection           | Purpose                                               |
|----------------------|-------------------------------------------------------|
| `mail_subscriber`    | List of users with: `email`, `language`, `countries[]` |
| `colivings`          | Coliving spaces with location data                    |
| `coliving_nearby_places` | Nearby gyms, cafes, etc. linked by `coliving_id`      |
| `countries`          | Country-level WhatsApp, Telegram, Facebook links     |

---

## 🔁 Workflow

```mermaid
flowchart TD
  Cron[Weekly Trigger (Cloud Function)] --> Users[Fetch mail_subscriber list]
  Users --> Loop[For each subscriber]
  Loop --> PickCountry[Pick one country from subscriber's list]
  PickCountry --> Coliving[Find a coliving in that country]
  Coliving --> Nearby[Get nearby places from coliving_nearby_places]
  Coliving --> Communities[Get community links from countries]
  Nearby --> Render[Render Liquid mail template]
  Communities --> Render
  Render --> Send[Send mail via Resend API]