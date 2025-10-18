import type { Community, CountryWithCommunities } from '@/types';
import { supabase } from './supabase';

/**
 * Fetches all countries from Supabase
 * SPAIN-ONLY: Currently returns only Spain (code = 'ES')
 */
export async function getAllCountries(): Promise<CountryWithCommunities[]> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('code', 'ES') // Spain-only filter
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching countries from Supabase:', error);
      return [];
    }

    return (data || []).map(mapSupabaseToCountryWithCommunities);
  } catch (error) {
    console.error('Error in getAllCountries:', error);
    return [];
  }
}

/**
 * Fetches a single country by code
 */
export async function getCountryByCode(code: string): Promise<CountryWithCommunities | null> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`No country found with code: ${code}`);
        return null;
      }
      console.error(`Error fetching country with code ${code}:`, error);
      return null;
    }

    return data ? mapSupabaseToCountryWithCommunities(data) : null;
  } catch (error) {
    console.error(`Error in getCountryByCode(${code}):`, error);
    return null;
  }
}

/**
 * Maps Supabase row to CountryWithCommunities type
 */
function mapSupabaseToCountryWithCommunities(row: any): CountryWithCommunities {
  const communitiesArray: Community[] = Array.isArray(row.communities)
    ? row.communities.map((communityData: any, index: number): Community => {
        if (!communityData || typeof communityData.name !== 'string' || typeof communityData.platform !== 'string' || typeof communityData.groupLink !== 'string') {
          console.warn(`Community object at index ${index} for country ${row.name} (ID: ${row.id}) is missing required fields.`);
          return {
            id: communityData?.id || `community_${row.id}_${index}_error`,
            name: 'Error: Invalid Community Data',
            platform: 'Unknown',
            groupLink: '#',
          };
        }
        return {
          id: communityData.id || `community_${row.id}_${index}`,
          name: communityData.name,
          platform: communityData.platform,
          city: typeof communityData.city === 'string' ? communityData.city : undefined,
          groupLink: communityData.groupLink,
          memberCount: typeof communityData.memberCount === 'number' ? communityData.memberCount : undefined,
          membersText: typeof communityData.membersText === 'string' ? communityData.membersText : undefined,
          tags: Array.isArray(communityData.tags) ? communityData.tags.filter((t: any) => typeof t === 'string') : [],
          requirementToJoin: typeof communityData.requirementToJoin === 'string' ? communityData.requirementToJoin : undefined,
          flag: typeof communityData.flag === 'string' ? communityData.flag : row.flag,
        };
      })
    : [];

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    cover_image: typeof row.cover_image === 'string' ? row.cover_image : undefined,
    flag: typeof row.flag === 'string' ? row.flag : '🏳️',
    flagImageUrl: row.flag_image_url,
    continent: typeof row.continent === 'string' ? row.continent : undefined,
    currency: typeof row.currency === 'string' ? row.currency : undefined,
    timezone: typeof row.timezone === 'string' ? row.timezone : undefined,
    popular_cities: Array.isArray(row.popular_cities) ? row.popular_cities.filter((pc: any) => typeof pc === 'string') : [],
    coliving_count: typeof row.coliving_count === 'number' ? row.coliving_count : undefined,
    source: typeof row.source === 'string' ? row.source : undefined,
    community_count: typeof row.community_count === 'number' ? row.community_count : (Array.isArray(row.communities) ? row.communities.length : 0),
    community_members: typeof row.community_members === 'number' ? row.community_members : undefined,
    community_cities: Array.isArray(row.community_cities) ? row.community_cities.filter((cc: any) => typeof cc === 'string') : [],
    community_platforms: Array.isArray(row.community_platforms) ? row.community_platforms.filter((cp: any) => typeof cp === 'string') : [],
    communities: communitiesArray,
  };
}
