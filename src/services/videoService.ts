
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { NomadVideo } from '@/types';

const mapDocToNomadVideo = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): NomadVideo => {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document data is undefined for doc id: ${doc.id}`);
  }

  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png'; // Default placeholder
  if (data.thumbnails) {
    if (data.thumbnails.high && typeof data.thumbnails.high.url === 'string') {
      thumbnailUrl = data.thumbnails.high.url;
    } else if (data.thumbnails.medium && typeof data.thumbnails.medium.url === 'string') {
      thumbnailUrl = data.thumbnails.medium.url;
    } else if (data.thumbnails.default && typeof data.thumbnails.default.url === 'string') {
      thumbnailUrl = data.thumbnails.default.url;
    }
  } else if (typeof data.thumbnailUrl === 'string') { // Fallback to direct thumbnailUrl field if 'thumbnails' object is not present
    thumbnailUrl = data.thumbnailUrl;
  }
  // Basic URL validation for thumbnail
  try { new URL(thumbnailUrl); } catch (_) { thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png'; }

  let youtubeUrl = '#';
  if (typeof data.url === 'string') { // Prefer 'url' from example
    youtubeUrl = data.url;
  } else if (typeof data.youtubeUrl === 'string') { // Fallback to 'youtubeUrl'
    youtubeUrl = data.youtubeUrl;
  }
  try { new URL(youtubeUrl); } catch (_) { youtubeUrl = '#'; }

  const stats = data.statistics || {}; // Handle cases where statistics object might be missing or not an object

  const getStat = (statName: string): number => {
    if (typeof stats === 'object' && stats !== null && typeof stats[statName] === 'number') {
      return stats[statName];
    }
    if (typeof data[statName] === 'number') { // Fallback to top-level field
      return data[statName];
    }
    return 0;
  };

  let publishedAtValue: string = new Date(0).toISOString();
  if (data.publishedAt instanceof Timestamp) {
    publishedAtValue = data.publishedAt.toDate().toISOString();
  } else if (typeof data.publishedAt === 'string') {
    // Attempt to parse if it's a string, could be ISO or other format
    try {
        const date = new Date(data.publishedAt);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
            publishedAtValue = date.toISOString();
        }
    } catch (e) {
        // If parsing fails, keep default. Log an error or warning if needed.
        console.warn(`Failed to parse publishedAt string: ${data.publishedAt} for video ID: ${doc.id}`);
    }
  }


  return {
    id: doc.id, // Firestore document ID
    title: typeof data.title === 'string' ? data.title : 'Untitled Video',
    thumbnailUrl: thumbnailUrl,
    youtubeUrl: youtubeUrl,
    viewCount: getStat('viewCount'),
    likeCount: getStat('likeCount'),
    commentCount: getStat('commentCount'),
    duration: getStat('duration'), // in seconds
    publishedAt: publishedAtValue,
    destination: typeof data.destination === 'string' ? data.destination : 'General',
    dataAiHint: typeof data.dataAiHint === 'string' ? data.dataAiHint : 'digital nomad lifestyle',
    // engagementScore can be calculated later where needed
  };
};

export async function getDiscoveryVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    // For Discovery, sort by viewCount and take top 4.
    // No explicit grouping by destination here, relying on viewCount to surface diverse popular content.
    const q = query(videosCollectionRef, orderBy('viewCount', 'desc'), limit(4));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToNomadVideo);
  } catch (error) {
    console.error("Error fetching discovery videos:", error);
    return [];
  }
}

export async function getCommunityFavoritesVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    // Fetch a larger set to calculate engagement score robustly
    const q = query(videosCollectionRef, orderBy('likeCount', 'desc'), limit(50)); 
    const querySnapshot = await getDocs(q);
    
    const videos = querySnapshot.docs.map(doc => {
      const video = mapDocToNomadVideo(doc);
      // Ensure duration is positive to avoid division by zero or negative scores
      const engagementScore = video.duration > 0 
        ? (video.likeCount + video.commentCount) / video.duration 
        : 0;
      return { ...video, engagementScore };
    });

    // Sort by the calculated engagement score
    videos.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
    
    return videos.slice(0, 4); // Return top 4 by engagement
  } catch (error) {
    console.error("Error fetching community favorites videos:", error);
    return [];
  }
}

export async function getFreshAndTrendingVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    const date90DaysAgo = new Date();
    date90DaysAgo.setDate(date90DaysAgo.getDate() - 90);
    const firestoreTimestamp90DaysAgo = Timestamp.fromDate(date90DaysAgo);

    const q = query(
      videosCollectionRef, 
      where('publishedAt', '>=', firestoreTimestamp90DaysAgo),
      orderBy('publishedAt', 'desc'), 
      orderBy('viewCount', 'desc'), 
      limit(4)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToNomadVideo);
  } catch (error) {
    console.error("Error fetching fresh and trending videos:", error);
    // If the error is about an index, it needs to be created in Firebase Console
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.warn("Firestore query requires a composite index. Please create it in the Firebase Console. The error message should contain a link to create it.");
    }
    return [];
  }
}
