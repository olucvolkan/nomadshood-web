// Migrated to Supabase - Nomad videos
import { getNomadVideos, getVideosByDestination } from '@/api/videos';
import type { NomadVideo } from '@/types';

/**
 * Fetches nomad videos from Supabase
 * SPAIN-ONLY: Filters for Spain-related videos
 */
export async function getNomadsHoodPodcastVideosFromFirestore(limit: number = 10): Promise<NomadVideo[]> {
  return await getNomadVideos(limit);
}

/**
 * Fetches videos for a specific destination
 */
export async function getVideosByLocation(destination: string): Promise<NomadVideo[]> {
  return await getVideosByDestination(destination);
}
