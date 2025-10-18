import type { ColivingReviewData, ReviewItem } from '@/types';
import { supabase } from './supabase';

/**
 * Fetches reviews for a specific coliving from Supabase
 */
export async function getReviewsByColivingId(colivingId: string): Promise<ColivingReviewData | null> {
  if (!colivingId) {
    console.error('getReviewsByColivingId: colivingId is required.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('coliving_reviews')
      .select('*')
      .eq('coliving_id', colivingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`No reviews found for coliving_id: ${colivingId}`);
        return null;
      }
      console.error(`Error fetching reviews for coliving_id ${colivingId}:`, error);
      return null;
    }

    return data ? mapSupabaseToColivingReviewData(data) : null;
  } catch (error) {
    console.error(`Error in getReviewsByColivingId(${colivingId}):`, error);
    return null;
  }
}

/**
 * Maps Supabase row to ColivingReviewData type
 */
function mapSupabaseToColivingReviewData(row: any): ColivingReviewData {
  const reviewsArray: ReviewItem[] = Array.isArray(row.reviews)
    ? row.reviews.map((reviewItem: any, index: number): ReviewItem => ({
        id: reviewItem.id || `${row.id}_review_${index}`,
        coliving_id: reviewItem.coliving_id || row.coliving_id,
        coliving_name: reviewItem.coliving_name || row.coliving_name,
        author_name: reviewItem.author_name || 'Anonymous',
        author_url: reviewItem.author_url,
        profile_photo_url: reviewItem.profile_photo_url || 'https://placehold.co/48x48.png',
        rating: typeof reviewItem.rating === 'number' ? reviewItem.rating : 0,
        relative_time_description: reviewItem.relative_time_description || 'sometime ago',
        time: typeof reviewItem.time === 'number' ? reviewItem.time : 0,
        text: typeof reviewItem.text === 'string' ? reviewItem.text : (reviewItem.text === null ? null : 'No review text provided.'),
        language: reviewItem.language,
        translated: reviewItem.translated,
        original_language: reviewItem.original_language,
        review_length: reviewItem.review_length,
        is_recent: reviewItem.is_recent,
        sentiment_score: reviewItem.sentiment_score,
      }))
    : [];

  return {
    id: row.id,
    coliving_id: row.coliving_id,
    coliving_name: row.coliving_name,
    coliving_city: row.coliving_city,
    coliving_country: row.coliving_country,
    coliving_website: row.coliving_website,
    google_place_id: row.google_place_id,
    google_name: row.google_name,
    google_address: row.google_address,
    google_rating: typeof row.google_rating === 'number' ? row.google_rating : undefined,
    google_total_ratings: typeof row.google_total_ratings === 'number' ? row.google_total_ratings : undefined,
    google_website: row.google_website,
    google_phone: row.google_phone,
    total_reviews: typeof row.total_reviews === 'number' ? row.total_reviews : reviewsArray.length,
    recent_reviews_count: row.recent_reviews_count,
    average_sentiment: row.average_sentiment,
    reviews: reviewsArray,
    crawled_at: row.crawled_at,
    api_status: row.api_status,
  };
}
