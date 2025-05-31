
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { NomadVideo } from '@/types';

const mapDocToNomadVideo = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): NomadVideo => {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document data is undefined for doc id: ${doc.id}`);
  }

  let thumbnailUrl = data.thumbnailUrl || 'https://placehold.co/400x225/E0E0E0/757575.png';
  // Basic URL validation for thumbnail
  try {
    new URL(thumbnailUrl);
  } catch (_) {
    thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  }
  
  let youtubeUrl = data.youtubeUrl || '#';
   try {
    new URL(youtubeUrl);
  } catch (_) {
    youtubeUrl = '#'; // Default to a safe non-functional link
  }


  return {
    id: doc.id,
    title: data.title || 'Untitled Video',
    thumbnailUrl: thumbnailUrl,
    youtubeUrl: youtubeUrl,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
    commentCount: typeof data.commentCount === 'number' ? data.commentCount : 0,
    duration: typeof data.duration === 'number' ? data.duration : 0, // in seconds
    publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString() : (typeof data.publishedAt === 'string' ? data.publishedAt : new Date(0).toISOString()),
    destination: data.destination || 'General',
    dataAiHint: data.dataAiHint || 'digital nomad lifestyle',
  };
};

export async function getDiscoveryVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
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
    // Fetch more than 4 to allow for robust calculation and sorting.
    // Ordering by likeCount or viewCount initially can help get relevant videos.
    const q = query(videosCollectionRef, orderBy('likeCount', 'desc'), limit(50)); 
    const querySnapshot = await getDocs(q);
    
    const videos = querySnapshot.docs.map(doc => {
      const video = mapDocToNomadVideo(doc);
      const engagementScore = video.duration > 0 
        ? (video.likeCount + video.commentCount) / video.duration 
        : 0;
      return { ...video, engagementScore };
    });

    videos.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
    
    return videos.slice(0, 4);
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
      orderBy('publishedAt', 'desc'), // Secondary sort for freshness within trending
      orderBy('viewCount', 'desc'), 
      limit(4)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToNomadVideo);
  } catch (error) {
    console.error("Error fetching fresh and trending videos:", error);
    return [];
  }
}
