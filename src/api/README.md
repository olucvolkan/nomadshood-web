# Supabase API Layer

This directory contains all Supabase database operations for the Nomadshood application.

## Overview

The API layer provides a clean interface for interacting with the Supabase PostgreSQL database. All data operations are centralized here, making it easy to maintain and update database queries.

## Files

### [supabase.ts](./supabase.ts)
Supabase client initialization and configuration.

**Exports**:
- `supabase` - Main Supabase client (uses anon key)
- `getServiceRoleClient()` - Returns service role client for elevated operations

**Environment Variables Required**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for service role operations)

### [database.types.ts](./database.types.ts)
TypeScript type definitions for the Supabase database schema.

**Exports**:
- `Database` - Complete database schema types
- `Json` - JSON type helper

### [colivings.ts](./colivings.ts)
Coliving space CRUD operations.

**Functions**:
- `getAllColivings()` - Fetch all Spain colivings (filtered by `country_code = 'ES'`)
- `getColivingById(id)` - Fetch single coliving by ID

**Spain-Only**: Yes, all queries filter for `country_code = 'ES'`

### [nearby-places.ts](./nearby-places.ts)
Nearby places queries for colivings.

**Functions**:
- `getNearbyPlacesForColiving(colivingId)` - Get categorized nearby places for a coliving

**Returns**: Array of `CategorizedNearbyPlaceGroup` with sorted places

### [reviews.ts](./reviews.ts)
Review data operations.

**Functions**:
- `getReviewsByColivingId(colivingId)` - Fetch Google reviews for a coliving

**Returns**: `ColivingReviewData` with sentiment analysis and review items

### [countries.ts](./countries.ts)
Country and community data operations.

**Functions**:
- `getAllCountries()` - Fetch all countries (Spain only: `code = 'ES'`)
- `getCountryByCode(code)` - Fetch country by code

**Spain-Only**: Yes, `getAllCountries()` filters for Spain only

### [newsletter.ts](./newsletter.ts)
Newsletter subscription operations.

**Functions**:
- `subscribeEmail(data)` - Subscribe email (automatically sets countries to ['Spain'])
- `checkEmailExists(email)` - Check if email already subscribed
- `getNewsletterSubscribers()` - Fetch all subscribers

**Spain-Only**: Yes, forces country to Spain on signup

### [videos.ts](./videos.ts)
Video content operations.

**Functions**:
- `getNomadVideos(limit)` - Fetch Spain-related nomad videos
- `getVideosByDestination(destination)` - Search videos by destination

**Spain-Only**: Yes, filters for Spain-related content

## Usage

Import functions from the API layer in your service files:

```typescript
import { getAllColivings, getColivingById } from '@/api/colivings';
import { getNearbyPlacesForColiving } from '@/api/nearby-places';
import { getReviewsByColivingId } from '@/api/reviews';

// Use in service layer
export async function getAllColivingSpaces() {
  return await getAllColivings(); // Spain-only
}
```

## Spain-Only Filtering

**IMPORTANT**: All API functions automatically filter for Spain-only data:

| Function | Filter Applied |
|----------|---------------|
| `getAllColivings()` | `.eq('country_code', 'ES')` |
| `getColivingById()` | `.eq('country_code', 'ES')` |
| `getAllCountries()` | `.eq('code', 'ES')` |
| `getNomadVideos()` | Spain destination filter |
| `subscribeEmail()` | Forces `countries: ['Spain']` |

To expand to other countries in the future, remove these filters from the respective API functions.

## Error Handling

All API functions include error handling:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return []; // or null
  }

  return processData(data);
} catch (error) {
  console.error('Unexpected error:', error);
  return []; // or null
}
```

## Data Mapping

Each API file includes mapping functions to convert Supabase rows to TypeScript types:

```typescript
function mapSupabaseToColivingSpace(row: any): ColivingSpace {
  return {
    id: row.id,
    name: row.name || 'Unnamed Space',
    // ... full type mapping
  };
}
```

## Performance Optimization

- Database indexes on frequently queried columns (defined in `SUPABASE_SCHEMA.sql`)
- Selective field fetching (use `.select('specific,fields')` when possible)
- Automatic Supabase edge caching

## Best Practices

1. **Always use TypeScript types** - Import from `@/types` or `database.types.ts`
2. **Handle errors gracefully** - Return empty arrays/null, log errors
3. **Keep mapping logic in API layer** - Don't leak database structure to services
4. **Use Spain filters** - Current project scope is Spain-only
5. **Document new functions** - Add JSDoc comments for clarity

## Future Enhancements

- [ ] Real-time subscriptions for live updates
- [ ] Batch operations for bulk data import
- [ ] Database migrations system
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Multi-country support (remove Spain filters)

## Related Files

- **Database Schema**: [../../SUPABASE_SCHEMA.sql](../../SUPABASE_SCHEMA.sql)
- **Service Layer**: [../services/](../services/)
- **TypeScript Types**: [../types/index.ts](../types/index.ts)
- **Migration Guide**: [../../MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md)
