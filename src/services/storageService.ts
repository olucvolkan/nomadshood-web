// Migrated to Supabase Storage
import { supabase } from '@/api/supabase';

/**
 * Gets a public URL for a file in Supabase Storage.
 * @param bucket The Supabase storage bucket name (e.g., 'coliving-images').
 * @param filePath The full path to the file in the bucket (e.g., 'explore-top-destinations/colombia.jpg').
 * @returns The public URL string, or null if an error occurs.
 */
export async function getSupabaseStorageUrl(bucket: string, filePath: string): Promise<string | null> {
  if (!bucket || !filePath) {
    console.warn('getSupabaseStorageUrl: bucket and filePath are required.');
    return null;
  }

  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      console.warn(`getSupabaseStorageUrl: Could not generate public URL for ${filePath} in bucket ${bucket}`);
      return null;
    }

    return data.publicUrl;
  } catch (error: any) {
    console.error(`getSupabaseStorageUrl: Error getting URL for ${filePath} in bucket ${bucket}:`, error);
    return null;
  }
}

/**
 * Legacy function name for backward compatibility
 * Defaults to 'coliving-images' bucket
 */
export async function getFirebaseStorageDownloadUrl(filePath: string): Promise<string | null> {
  return await getSupabaseStorageUrl('coliving-images', filePath);
}
