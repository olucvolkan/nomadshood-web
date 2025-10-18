# Firebase to Supabase Migration Guide

## Overview
This document provides step-by-step instructions for completing the migration from Firebase to Supabase for the Nomadshood web application.

## Current Status ✅
The following migration work has been completed:

### Code Migration
- ✅ Installed Supabase JavaScript client (`@supabase/supabase-js`)
- ✅ Created Supabase client initialization ([src/api/supabase.ts](src/api/supabase.ts))
- ✅ Created API layer for all data operations ([src/api/](src/api/))
- ✅ Migrated all service layer files to use Supabase
- ✅ Updated environment variables template
- ✅ Updated Next.js config for Supabase Storage
- ✅ Created database schema SQL file ([SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql))

### Spain-Only Filtering
All database queries are now filtered for Spain only (`country_code = 'ES'`):
- Colivings: `.eq('country_code', 'ES')`
- Countries: `.eq('code', 'ES')`
- Videos: Filtered for Spain-related content
- Newsletter: Automatically sets country to Spain

## Next Steps 🚀

### Step 1: Set Up Supabase Project

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up or log in
   - Create a new project

2. **Get Your Credentials**
   - From your Supabase project dashboard, go to Settings > API
   - Copy the following values:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

3. **Update .env File**
   ```bash
   # Replace these placeholders in your .env file:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Step 2: Create Database Tables

1. **Open SQL Editor**
   - In your Supabase dashboard, go to SQL Editor
   - Click "New query"

2. **Run Schema Creation**
   - Copy the entire contents of [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql)
   - Paste into the SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

3. **Verify Tables Created**
   - Go to Table Editor
   - You should see all 6 tables:
     - `colivings`
     - `coliving_nearby_places`
     - `coliving_reviews`
     - `countries`
     - `mail_subscriber`
     - `nomad_videos`

### Step 3: Set Up Supabase Storage

1. **Create Storage Buckets**
   - Go to Storage in Supabase dashboard
   - Create a new public bucket: `coliving-images`
   - Configure bucket to be publicly accessible

2. **Set Storage Policies**
   - Allow public read access
   - Restrict write access (if needed)

### Step 4: Migrate Data from Firebase

You have two options for data migration:

#### Option A: Manual Export/Import (Recommended for Small Datasets)

1. **Export from Firebase**
   ```bash
   # Use Firebase CLI to export Firestore data
   firebase firestore:export ./firebase-export
   ```

2. **Transform and Import**
   - Use the exported JSON files
   - Transform to match PostgreSQL schema
   - Import using Supabase SQL or JavaScript client

#### Option B: Supabase MCP Tool (If Available)

If you have Supabase MCP configured:
- Use the MCP tool to query and insert data programmatically
- Filter for Spain-only data during migration
- Verify data integrity after import

### Step 5: Migrate Images to Supabase Storage

1. **Download Firebase Storage Images**
   - Use Firebase Admin SDK or console to download images
   - Filter for Spain-related coliving images only

2. **Upload to Supabase Storage**
   ```javascript
   const { data, error } = await supabase.storage
     .from('coliving-images')
     .upload('path/to/file.jpg', file)
   ```

3. **Update Database URLs**
   - Update `logo_url`, `main_image_url`, `gallery` arrays in colivings table
   - Replace Firebase URLs with Supabase Storage URLs

### Step 6: Update Spain Country Data

The schema includes a default Spain entry. Update it with actual data:

```sql
UPDATE public.countries
SET
  popular_cities = ARRAY['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Málaga'],
  coliving_count = (SELECT COUNT(*) FROM public.colivings WHERE country_code = 'ES'),
  communities = '[
    {
      "id": "spain-nomads-whatsapp",
      "name": "Spain Digital Nomads",
      "platform": "WhatsApp",
      "groupLink": "https://chat.whatsapp.com/...",
      "memberCount": 500
    }
  ]'::jsonb[]
WHERE code = 'ES';
```

### Step 7: Test the Application

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Key Features**
   - ✅ Homepage loads with Spain colivings
   - ✅ Coliving listing page shows only Spain locations
   - ✅ Individual coliving detail pages work
   - ✅ Nearby places display correctly
   - ✅ Reviews load properly
   - ✅ Newsletter signup works
   - ✅ Images load from Supabase Storage

3. **Check Console for Errors**
   - Look for Supabase connection errors
   - Verify no Firebase errors
   - Check data mapping issues

### Step 8: Remove Firebase Dependencies (Optional)

Once everything is working:

1. **Remove Firebase Packages**
   ```bash
   npm uninstall firebase @tanstack-query-firebase/react
   ```

2. **Delete Firebase Files**
   - Delete `src/lib/firebase.ts`
   - Remove Firebase Functions directory (if not needed)

3. **Clean Up Environment Variables**
   - Remove all `NEXT_PUBLIC_FIREBASE_*` variables from `.env`

## Spain-Only Configuration

### Database Filtering
All queries are automatically filtered for Spain:

```typescript
// Colivings
.eq('country_code', 'ES')

// Countries
.eq('code', 'ES')

// Videos
.ilike('destination', '%Spain%')
```

### UI Changes
The following UI elements are Spain-focused:
- Country selection removed from filters
- Newsletter signup defaults to Spain
- All listings show only Spanish locations
- Breadcrumbs and navigation reflect Spain-only content

## Expanding to Other Countries

When ready to expand beyond Spain:

1. **Remove Country Code Filters**
   - In `src/api/colivings.ts`: Remove `.eq('country_code', 'ES')`
   - In `src/api/countries.ts`: Remove `.eq('code', 'ES')`
   - In `src/api/videos.ts`: Remove Spain-specific filtering

2. **Add Countries to Database**
   ```sql
   INSERT INTO public.countries (code, name, flag, flag_image_url, continent, currency)
   VALUES ('PT', 'Portugal', '🇵🇹', '/flags/pt.png', 'Europe', 'EUR');
   ```

3. **Update UI**
   - Re-enable country selection in filters
   - Update newsletter signup to allow multiple countries
   - Update navigation and breadcrumbs

## Troubleshooting

### Common Issues

1. **"Missing NEXT_PUBLIC_SUPABASE_URL" Error**
   - Ensure `.env` file has correct Supabase credentials
   - Restart development server after updating `.env`

2. **Images Not Loading**
   - Check Supabase Storage bucket is public
   - Verify image URLs in database are correct
   - Check Next.js `remotePatterns` config

3. **No Data Returned**
   - Verify tables have data (check Table Editor)
   - Check RLS policies allow public read access
   - Verify Spain country code is 'ES' (uppercase)

4. **Type Errors**
   - Run `npm run typecheck` to find issues
   - Verify `database.types.ts` matches actual schema

### Getting Help

- Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Review error logs in browser console
- Check Supabase Dashboard > Logs for server-side errors

## Rollback Plan

If migration issues occur:

1. Keep Firebase configuration in `.env` (marked as DEPRECATED)
2. Firebase code is removed but can be restored from git history
3. Revert commits if needed:
   ```bash
   git revert HEAD~1
   ```

## Success Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables updated in `.env`
- [ ] Database tables created successfully
- [ ] Storage buckets configured
- [ ] Spain coliving data imported
- [ ] Images migrated to Supabase Storage
- [ ] All pages load without errors
- [ ] Newsletter signup works
- [ ] No Firebase errors in console
- [ ] Application tested end-to-end

## Deployment Notes

Before deploying to production:

1. **Update Production Environment Variables**
   - Add Supabase credentials to hosting platform (Vercel, etc.)
   - Remove Firebase credentials (if fully migrated)

2. **Database Backups**
   - Enable automatic backups in Supabase
   - Export initial data snapshot

3. **Monitoring**
   - Set up Supabase project monitoring
   - Configure error tracking (Sentry, etc.)

4. **Performance**
   - Enable database indexes (already in schema)
   - Configure connection pooling if needed

---

**Migration Completed**: The codebase is now fully migrated to Supabase with Spain-only filtering. Follow the steps above to complete the data migration and deployment.
