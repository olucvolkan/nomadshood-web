import type { ColivingSpace } from '@/types';
import { supabase } from './supabase';

/**
 * Fetches all colivings from Supabase
 * SPAIN-ONLY: Filters colivings where country_code = 'ES'
 */
export async function getAllColivings(): Promise<ColivingSpace[]> {
  try {
    const { data, error } = await supabase
      .from('colivings')
      .select('*')
      .eq('country_code', 'ES') // Spain-only filter
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching colivings from Supabase:', error);
      return [];
    }

    return (data || []).map(mapSupabaseToColivingSpace);
  } catch (error) {
    console.error('Error in getAllColivings:', error);
    return [];
  }
}

/**
 * Fetches a single coliving by ID
 */
export async function getColivingById(id: string): Promise<ColivingSpace | null> {
  try {
    if (!id) {
      console.error('Error: No ID provided to getColivingById');
      return null;
    }

    const { data, error } = await supabase
      .from('colivings')
      .select('*')
      .eq('id', id)
      .eq('country_code', 'ES') // Spain-only filter
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`No coliving found with id: ${id}`);
        return null;
      }
      console.error(`Error fetching coliving with id ${id}:`, error);
      return null;
    }

    return data ? mapSupabaseToColivingSpace(data) : null;
  } catch (error) {
    console.error(`Error in getColivingById(${id}):`, error);
    return null;
  }
}

/**
 * Maps Supabase database row to ColivingSpace type
 */
function mapSupabaseToColivingSpace(row: any): ColivingSpace {
  return {
    id: row.id,
    name: row.name || 'Unnamed Space',
    address: row.address || 'Location not specified',
    logoUrl: row.logo_url || row.logo || 'https://placehold.co/80x80/E0E0E0/757575.png',
    mainImageUrl: row.main_image_url || (Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery[0] : 'https://placehold.co/600x400/E0E0E0/757575.png'),
    videoUrl: row.video_url || row.youtube_video_link,
    whatsappLink: row.whatsapp_link || row.contact?.whatsapp,
    websiteUrl: row.website_url,
    tags: row.tags || [],
    dataAiHint: row.data_ai_hint || `${row.city?.toLowerCase() || ''} ${row.country?.toLowerCase() || ''}`.trim(),
    country: row.country || 'Spain',
    city: row.city || 'Unknown City',
    region: row.region,
    coordinates: row.coordinates ? {
      latitude: row.coordinates.latitude,
      longitude: row.coordinates.longitude,
    } : undefined,
    average_budget: row.average_budget,
    budget_range: row.budget_range,
    gallery: row.gallery || [],
    coworking_access: row.coworking_access,
    amenities: row.amenities || [],
    room_types: row.room_types || [],
    vibe: row.vibe,
    contact: row.contact,
    capacity: row.capacity,
    minimum_stay: row.minimum_stay,
    check_in: row.check_in,
    languages: row.languages || [],
    age_range: row.age_range,
    rating: row.rating,
    reviews_count: row.reviews_count,
    wifi_speed: row.wifi_speed,
    climate: row.climate,
    timezone: row.timezone,
    nearby_attractions: row.nearby_attractions || [],
    transportation: row.transportation,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status: row.status,
    brand: row.brand,
    monthlyPrice: row.monthly_price || row.min_price || row.budget_range?.min || 0,
    hasPrivateBathroom: row.has_private_bathroom || false,
    hasCoworking: row.has_coworking || false,
    email: row.email,
    phone: row.phone,
    currency: row.currency || row.budget_range?.currency,
    min_price: row.min_price,
    cover_image: row.cover_image,
    logo: row.logo,
    youtube_video_link: row.youtube_video_link,
    flag_url: row.flag_url,
    flag_code: row.flag_code,
    country_code: row.country_code,
    website: row.website_url,
  };
}
