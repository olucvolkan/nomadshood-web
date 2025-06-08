import { getAllColivingSpaces } from '@/services/colivingService';
import { createColivingSlug, slugify } from '@/utils/slugify';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nomadshood.com';
  
  // Get all coliving spaces
  const allSpaces = await getAllColivingSpaces();
  
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/coliving`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-hub`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Get unique countries and cities
  const uniqueCountries = Array.from(
    new Set(
      allSpaces
        .filter(space => space.country)
        .map(space => ({ slug: slugify(space.country!), name: space.country! }))
    )
  );

  const uniqueCities = Array.from(
    new Set(
      allSpaces
        .filter(space => space.country && space.city)
        .map(space => ({
          countrySlug: slugify(space.country!),
          citySlug: slugify(space.city!),
          country: space.country!,
          city: space.city!
        }))
    )
  );

  // Country pages
  const countryRoutes: MetadataRoute.Sitemap = uniqueCountries.map(country => ({
    url: `${baseUrl}/colivings/${country.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // City pages
  const cityRoutes: MetadataRoute.Sitemap = uniqueCities.map(city => ({
    url: `${baseUrl}/colivings/${city.countrySlug}/${city.citySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Individual coliving space pages with new URL structure
  const colivingRoutes: MetadataRoute.Sitemap = allSpaces
    .filter(space => space.country && space.city && space.name)
    .map(space => ({
      url: `${baseUrl}/colivings/${slugify(space.country!)}/${slugify(space.city!)}/${createColivingSlug(space.name, space.id)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [
    ...staticRoutes,
    ...countryRoutes,
    ...cityRoutes,
    ...colivingRoutes,
  ];
} 