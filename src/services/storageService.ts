
import { storage } from '@/lib/firebase'; // Assuming storage is initialized and exported from firebase.ts
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

/**
 * Gets a download URL for a file in Firebase Storage.
 * @param filePath The full path to the file in Firebase Storage (e.g., 'explore-top-destinations/colombia.jpg').
 * @returns A promise that resolves to the download URL string, or null if an error occurs.
 */
export async function getFirebaseStorageDownloadUrl(filePath: string): Promise<string | null> {
  if (!filePath) {
    console.warn('getFirebaseStorageDownloadUrl: filePath is required.');
    return null;
  }
  try {
    const fileStorageRef = storageRef(storage, filePath);
    const url = await getDownloadURL(fileStorageRef);
    return url;
  } catch (error: any) {
    // Handle common errors like 'object-not-found' or 'unauthorized'
    if (error.code === 'storage/object-not-found') {
      console.warn(`getFirebaseStorageDownloadUrl: File not found at path: ${filePath}`);
    } else if (error.code === 'storage/unauthorized') {
      console.error(`getFirebaseStorageDownloadUrl: Unauthorized to access file at path: ${filePath}. Check Storage security rules.`);
    } else {
      console.error(`getFirebaseStorageDownloadUrl: Error fetching download URL for ${filePath}:`, error);
    }
    return null;
  }
}
