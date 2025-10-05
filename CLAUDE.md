# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nomadshood** is a Next.js 15 web application for digital nomads to discover coliving spaces worldwide, featuring AI-powered recommendations, personalized email campaigns, and comprehensive coliving information with nearby places and community links.

The project consists of two main components:
1. **Next.js Web App** (`/src`) - Public-facing website with coliving listings, search, and AI recommendations
2. **Firebase Cloud Functions** (`/functions`) - Automated email campaigns and serverless backend

## Commands

### Development
```bash
npm run dev              # Start Next.js dev server on port 9002 with Turbopack
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking (no emit)
```

### AI/Genkit Development
```bash
npm run genkit:dev       # Start Genkit developer UI
npm run genkit:watch     # Start Genkit with file watching
```

### Firebase Functions (in `/functions` directory)
```bash
cd functions
npm run build            # Compile TypeScript functions
npm run deploy           # Deploy all functions to Firebase
firebase deploy --only functions:weeklyPersonalizedEmails      # Deploy specific function
firebase deploy --only functions:manualPersonalizedEmails     # Deploy manual trigger
```

## Architecture

### Data Layer - Firebase Integration

**Primary Database**: Firestore (not Realtime Database)
- Firebase SDK initialization in [src/lib/firebase.ts](src/lib/firebase.ts)
- Exports: `app`, `db` (Firestore), `storage`, `functions`
- All Firebase config via `NEXT_PUBLIC_FIREBASE_*` environment variables

**Core Firestore Collections**:
- `colivings` - Coliving spaces with location, pricing, amenities
- `coliving_nearby_places` - Curated nearby attractions by category (cafes, gyms, restaurants)
- `coliving_reviews` - Google Places reviews with sentiment analysis
- `countries` - Country metadata with community links (WhatsApp, Telegram, Facebook groups)
- `mail_subscriber` - Newsletter subscribers with country preferences and language
- `nomad_videos` - YouTube video content by destination

**Services Architecture** (`/src/services`):
- [colivingService.ts](src/services/colivingService.ts) - Fetches colivings with filtering and nearby places
- [newsletterService.ts](src/services/newsletterService.ts) - Newsletter subscription management
- [storageService.ts](src/services/storageService.ts) - Firebase Storage URL resolution
- [videoService.ts](src/services/videoService.ts) - YouTube video data

### AI/ML Integration - Genkit

**Framework**: Firebase Genkit with Google AI (Gemini 2.0 Flash)
- Configuration: [src/ai/genkit.ts](src/ai/genkit.ts)
- Model: `googleai/gemini-2.0-flash`

**AI Flows**:
- [coliving-recommendations.ts](src/ai/flows/coliving-recommendations.ts) - Generates top 3 coliving recommendations based on location, budget, interests
- [trip-planner-flow.ts](src/ai/flows/trip-planner-flow.ts) - Creates detailed trip itineraries with daily activities

### Email Campaign System - Firebase Functions

**Location**: `/functions/src/`

**Architecture**:
- **Personalized Country-Based System**: Each subscriber receives colivings from their selected countries
- **Weekly Automation**: Scheduled function runs every Monday 10 AM UTC (`0 10 * * 1`)
- **Batch Processing**: 25 subscribers per batch with 3-second delays

**Key Functions**:
1. `weeklyPersonalizedEmails` - Automated weekly scheduler
2. `manualPersonalizedEmails` - HTTP trigger for testing
3. `subscriberTrigger` - Handles new subscriber events
4. `generateGuide` - Creates PDF starter guide for new subscribers

**Email Flow**:
1. Fetch active subscribers with country preferences from `mail_subscriber`
2. For each subscriber: randomly select one of their preferred countries
3. Find active, rated coliving in selected country
4. Aggregate nearby places (4+ star rating) and community links
5. Render personalized HTML/plain text email in subscriber's language
6. Send via Resend API with tracking metadata

**Analytics Collections**:
- `personalized_campaign_runs` - Campaign execution metrics
- `personalized_email_success` - Successful sends with metadata
- `subscriber_processing_failures` - Error tracking

See [functions/PERSONALIZED_EMAIL_SYSTEM_README.md](functions/PERSONALIZED_EMAIL_SYSTEM_README.md) for comprehensive system documentation.

### Frontend Architecture

**Framework**: Next.js 15 with App Router
- TypeScript with build error ignoring enabled (clean up gradually)
- Tailwind CSS + shadcn/ui component library
- Radix UI primitives for accessible components

**Key Routes**:
- `/` - Homepage with hero, featured colivings
- `/colivings` - Listing page with filters
- `/colivings/[country]` - Country-specific listings
- `/colivings/[country]/[slug]` - Individual coliving detail page
- `/recommender` - AI-powered recommendation form
- `/newsletter/*` - Subscription success/cancel pages

**UI Component Library**: shadcn/ui
- Location: [src/components/ui/](src/components/ui/)
- Pre-built accessible components using Radix UI + Tailwind
- Configured via [components.json](components.json)

**Custom Components**:
- [ColivingCard.tsx](src/components/ColivingCard.tsx) - Coliving listing card
- [ColivingFilters.tsx](src/components/ColivingFilters.tsx) - Search and filter UI
- [NearbyPlacesTabs.tsx](src/components/NearbyPlacesTabs.tsx) - Categorized nearby places display
- [NewsletterSignup.tsx](src/components/NewsletterSignup.tsx) - Newsletter subscription form
- [RecommenderForm.tsx](src/components/RecommenderForm.tsx) - AI recommendation input form

### Type System

**Central Types**: [src/types/index.ts](src/types/index.ts)

**Key Interfaces**:
- `ColivingSpace` - Complete coliving data structure (60+ fields)
- `NearbyPlace` - Google Places data with ratings, distance, categories
- `FirestoreNearbyPlacesDoc` - Firestore document structure for nearby places
- `CountryData` / `CountryWithCommunities` - Country metadata with community groups
- `NewsletterSubscription` - Subscriber data with country preferences
- `TripPlanInput` / `TripPlanOutput` - AI trip planner schemas

### SEO Implementation

**Cursor Rules**: [.cursorrules/seo.mdc](.cursorrules/seo.mdc)

**SEO Requirements for All Pages**:
- Unique `<title>` (max 60 chars) and meta description (max 160 chars)
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Canonical URL via `<link rel="canonical">`
- Single `<h1>` per page with clear heading hierarchy
- Mobile viewport meta tag
- Image optimization with descriptive alt text

**Generated Files**:
- [src/app/sitemap.ts](src/app/sitemap.ts) - Dynamic XML sitemap
- [src/app/robots.ts](src/app/robots.ts) - Robots.txt configuration

### Image Handling

**Next.js Image Configuration**: [next.config.ts](next.config.ts)
- Remote patterns for: Firebase Storage, Unsplash, YouTube thumbnails, coliving websites
- Firebase Storage URLs via [storageService.ts](src/services/storageService.ts)

**Usage**:
```typescript
import { getFirebaseStorageUrl } from '@/services/storageService';
const imageUrl = await getFirebaseStorageUrl('path/to/image.jpg');
```

## Development Workflow

### Environment Variables

**Required for Next.js App**:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=  # Optional for RTDB
```

**Required for Firebase Functions**:
```bash
RESEND_API_KEY=  # Email delivery via Resend
OPENAI_API_KEY=  # For PDF guide generation (if used)
```

### Adding New Colivings

1. Add document to `colivings` collection with country/city/coordinates
2. Optionally add nearby places to `coliving_nearby_places` with categorized ratings
3. Images should be uploaded to Firebase Storage and referenced via `logoUrl`, `mainImageUrl`, `gallery[]`
4. Ensure `status: 'active'` for inclusion in email campaigns

### Modifying Email Templates

**Location**: `functions/src/countryBasedColivingEmail.ts`
- `generatePersonalizedHtml()` - HTML email template
- `generatePersonalizedPlainText()` - Plain text fallback
- Both functions receive `PersonalizedRecommendationData` with coliving, nearby places, and communities
- Use subscriber's `language` field for localization

### Newsletter Subscription Flow

**Implementation**: [src/components/NewsletterSignup.tsx](src/components/NewsletterSignup.tsx)

**Value Proposition** (Cursor Rule):
- Must prominently feature "Nomad Starter Guide" bonus PDF
- Visual representation of PDF (icon/image)
- CTA should reference PDF ("Get the Guide")
- List PDF contents: packing list, budget, fitness tips
- Mention both weekly newsletter and bonus PDF

**Firestore Write**:
```typescript
// Written to 'mail_subscriber' collection
{
  email: string,
  countries: string[],  // User-selected countries for personalization
  language?: string,
  status: 'active',
  createdAt: timestamp
}
```

### Testing Email Campaigns

**Manual Trigger** (requires Firebase Functions deployment):
```typescript
// Call manualPersonalizedEmails HTTP function
POST https://us-central1-{project}.cloudfunctions.net/manualPersonalizedEmails
{
  "testMode": true,
  "testEmail": "your-test@email.com",
  "testCountries": ["Portugal", "Spain"]
}
```

**Local Testing**:
```bash
cd functions
npm run build
firebase emulators:start --only functions
```

## Data Quality Guidelines

### Nearby Places
- Only include places with 4+ star ratings
- Maximum 8 places per email to maintain readability
- Categories: cafes, coworking_spaces, gyms, restaurants, supermarkets, parks, attractions
- Include `distance_walking_time` when available

### Community Links
- Verify links are active before adding to `countries` collection
- Include platform type: WhatsApp, Telegram, Facebook
- Add `memberCount` or `membersText` for transparency
- Prefer city/country-specific groups over generic nomad groups

### Coliving Data
- `status: 'active'` required for email campaigns
- `country` field must match subscriber's country preferences exactly (case-sensitive)
- Include `rating` and `monthlyPrice` for better recommendations
- `dataAiHint` field can provide context for AI recommendation systems

## Common Patterns

### Fetching Colivings with Nearby Places
```typescript
import { getAllColivingsWithNearby } from '@/services/colivingService';
const colivings = await getAllColivingsWithNearby();
// Returns ColivingSpace[] with nearbyPlaces populated
```

### Using AI Recommendations
```typescript
import { getColivingRecommendations } from '@/ai/flows/coliving-recommendations';
const result = await getColivingRecommendations({
  location: 'Lisbon',
  budget: 'medium',
  interests: 'surfing, coworking, nightlife'
});
// Returns { recommendations: Array<{name, address, description}> }
```

### Newsletter Subscription
```typescript
import { subscribeToNewsletter } from '@/services/newsletterService';
await subscribeToNewsletter({
  email: 'user@example.com',
  countries: ['Portugal', 'Spain', 'Mexico'],
  language: 'en'
});
```

## Important Notes

- TypeScript errors are currently ignored in build (`ignoreBuildErrors: true`) - address type issues when making changes
- Firebase Functions use separate `package.json` in `/functions` directory
- Email system uses Resend API, not SendGrid or AWS SES
- All coliving images should use Next.js `<Image>` component with appropriate remote patterns
- Genkit flows must have `'use server'` directive for server-side execution
- Country matching in email campaigns is case-sensitive and uses both `country` and `country_code` fields
