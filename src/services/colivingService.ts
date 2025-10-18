// Migrated to Supabase - Spain-only colivings
import { getAllColivings, getColivingById } from '@/api/colivings';
import { getAllCountries } from '@/api/countries';
import { getNearbyPlacesForColiving } from '@/api/nearby-places';
import { getReviewsByColivingId } from '@/api/reviews';
import type { CategorizedNearbyPlaceGroup, ColivingReviewData, ColivingSpace, CountryWithCommunities } from '@/types';

/**
 * Fetches all coliving spaces from Supabase
 * SPAIN-ONLY: Returns only colivings where country_code = 'ES'
 */
export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  return await getAllColivings();
}

/**
 * Fetches a single coliving space by ID from Supabase
 */
export async function getColivingSpaceById(id: string): Promise<ColivingSpace | null> {
  return await getColivingById(id);
}

/**
 * Fetches all countries from Supabase
 * SPAIN-ONLY: Returns only Spain (code = 'ES')
 */
export async function getAllCountriesFromDB(): Promise<CountryWithCommunities[]> {
  return await getAllCountries();
}

/**
 * Fetches reviews for a specific coliving from Supabase
 */
export async function getColivingReviewsByColivingId(colivingId: string): Promise<ColivingReviewData | null> {
  return await getReviewsByColivingId(colivingId);
}

/**
 * Fetches nearby places for a specific coliving from Supabase
 */
export async function getNearbyPlaces(colivingId: string): Promise<CategorizedNearbyPlaceGroup[]> {
  return await getNearbyPlacesForColiving(colivingId);
}
