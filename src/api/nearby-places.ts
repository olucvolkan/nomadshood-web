import type { CategorizedNearbyPlaceGroup, NearbyPlace } from '@/types';
import { supabase } from './supabase';

/**
 * Fetches nearby places for a coliving from Supabase
 */
export async function getNearbyPlacesForColiving(colivingId: string): Promise<CategorizedNearbyPlaceGroup[]> {
  if (!colivingId) {
    console.error('getNearbyPlacesForColiving: colivingId is required.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('coliving_nearby_places')
      .select('*')
      .eq('coliving_id', colivingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`No nearby places found for coliving_id: ${colivingId}`);
        return [];
      }
      console.error(`Error fetching nearby places for coliving_id ${colivingId}:`, error);
      return [];
    }

    if (!data || !data.nearby_places) {
      return [];
    }

    return processNearbyPlaces(data.nearby_places, colivingId);
  } catch (error) {
    console.error(`Error in getNearbyPlacesForColiving(${colivingId}):`, error);
    return [];
  }
}

/**
 * Processes nearby places JSON into categorized groups
 */
function processNearbyPlaces(nearbyPlacesData: any, colivingId: string): CategorizedNearbyPlaceGroup[] {
  const categorizedPlaces: CategorizedNearbyPlaceGroup[] = [];

  if (typeof nearbyPlacesData !== 'object' || nearbyPlacesData === null) {
    return [];
  }

  for (const categoryKey in nearbyPlacesData) {
    const categoryPlacesData = nearbyPlacesData[categoryKey];

    if (Array.isArray(categoryPlacesData) && categoryPlacesData.length > 0) {
      const places: NearbyPlace[] = categoryPlacesData.map(place => {
        let locationLink;
        if (place.coordinates?.lat && place.coordinates?.lng) {
          locationLink = `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
        }

        const defaultDataAiHint = `${categoryKey.toLowerCase()} ${place.name?.toLowerCase() || 'place'}`.trim().substring(0, 50);

        return {
          id: place.place_id,
          coliving_id: colivingId,
          name: place.name || 'Unnamed Place',
          type: categoryKey,
          googleTypes: place.types || [],
          distance_meters: typeof place.distance_meters === 'number' ? place.distance_meters : undefined,
          distance_walking_time: typeof place.distance_walking_time === 'number' ? place.distance_walking_time : null,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          price_level: place.price_level,
          address_vicinity: place.vicinity,
          coordinates: place.coordinates,
          business_status: place.business_status,
          locationLink: locationLink,
          dataAiHint: defaultDataAiHint,
        };
      }).sort((a, b) => (a.distance_meters ?? Infinity) - (b.distance_meters ?? Infinity));

      // Create user-friendly display name
      let categoryDisplayName = categoryKey.replace(/_/g, ' ');
      categoryDisplayName = categoryDisplayName.charAt(0).toUpperCase() + categoryDisplayName.slice(1);
      if (!categoryDisplayName.toLowerCase().endsWith('s') &&
          categoryDisplayName.toLowerCase() !== 'food' &&
          categoryDisplayName.toLowerCase() !== 'nightlife' &&
          categoryDisplayName.toLowerCase() !== 'shopping') {
        categoryDisplayName += 's';
      }

      categorizedPlaces.push({
        categoryKey: categoryKey,
        categoryDisplayName: categoryDisplayName,
        places: places,
      });
    }
  }

  return categorizedPlaces;
}
