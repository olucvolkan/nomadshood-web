import type { NomadVideo } from '@/types';
import { supabase } from './supabase';

/**
 * Fetches nomad videos from Supabase
 * SPAIN-ONLY: Filters videos where destination contains Spain-related keywords
 */
export async function getNomadVideos(limit: number = 10): Promise<NomadVideo[]> {
  try {
    const { data, error } = await supabase
      .from('nomad_videos')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching nomad videos from Supabase:', error);
      return [];
    }

    // Filter Spain-related videos in client (or add to WHERE clause if destination field is indexed)
    const spainVideos = (data || []).filter(video =>
      video.destination?.toLowerCase().includes('spain') ||
      video.destination?.toLowerCase().includes('españa') ||
      video.title?.toLowerCase().includes('spain') ||
      video.title?.toLowerCase().includes('españa')
    );

    return spainVideos.map(mapSupabaseToNomadVideo);
  } catch (error) {
    console.error('Error in getNomadVideos:', error);
    return [];
  }
}

/**
 * Fetches videos by specific destination
 */
export async function getVideosByDestination(destination: string): Promise<NomadVideo[]> {
  try {
    const { data, error } = await supabase
      .from('nomad_videos')
      .select('*')
      .ilike('destination', `%${destination}%`)
      .order('published_at', { ascending: false });

    if (error) {
      console.error(`Error fetching videos for destination ${destination}:`, error);
      return [];
    }

    return (data || []).map(mapSupabaseToNomadVideo);
  } catch (error) {
    console.error(`Error in getVideosByDestination(${destination}):`, error);
    return [];
  }
}

/**
 * Maps Supabase row to NomadVideo type
 */
function mapSupabaseToNomadVideo(row: any): NomadVideo {
  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    youtubeUrl: row.youtube_url,
    viewCount: row.view_count || 0,
    likeCount: row.like_count || 0,
    commentCount: row.comment_count || 0,
    duration: row.duration || 0,
    publishedAt: row.published_at,
    destination: row.destination,
    dataAiHint: row.data_ai_hint,
  };
}
