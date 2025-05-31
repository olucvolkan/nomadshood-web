
import type { NomadVideo, NomadVideoJsonItem } from '@/types';
import videosData from '@/data/nomad-videos.json'; // Import the local JSON for "Most Watched"
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';

// Helper to convert Firestore Timestamp to ISO string
const formatDateFromTimestamp = (timestampField: any): string => {
  if (timestampField instanceof Timestamp) {
    return timestampField.toDate().toISOString();
  }
  // Fallback for string dates, assuming ISO format
  if (typeof timestampField === 'string') {
    try {
      return new Date(timestampField).toISOString();
    } catch (e) {
      console.warn(`formatDateFromTimestamp: Could not parse date string '${timestampField}'. Using current date as fallback.`);
      return new Date().toISOString();
    }
  }
  console.warn(`formatDateFromTimestamp: Unexpected date format for timestampField: ${JSON.stringify(timestampField)}. Using current date as fallback.`);
  return new Date().toISOString();
};

// Helper function to map the JSON video structure to our NomadVideo type
const mapJsonVideoToNomadVideo = (videoJson: NomadVideoJsonItem): NomadVideo => {
  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  if (videoJson.thumbnails) {
    if (videoJson.thumbnails.high?.url) thumbnailUrl = videoJson.thumbnails.high.url;
    else if (videoJson.thumbnails.medium?.url) thumbnailUrl = videoJson.thumbnails.medium.url;
    else if (videoJson.thumbnails.default?.url) thumbnailUrl = videoJson.thumbnails.default.url;
  }
  try { new URL(thumbnailUrl); } catch (_) {
    console.warn(`mapJsonVideoToNomadVideo: Video ID ${videoJson.videoId} has an invalid thumbnail URL '${thumbnailUrl}'. Using placeholder.`);
    thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  }

  let youtubeUrl = videoJson.url || '#';
  try { new URL(youtubeUrl); } catch (_) {
    console.warn(`mapJsonVideoToNomadVideo: Video ID ${videoJson.videoId} has an invalid YouTube URL '${youtubeUrl}'. Using '#'.`);
    youtubeUrl = '#';
  }

  const getStatAsNumber = (statValue: number | string | undefined): number => {
    if (typeof statValue === 'number') return statValue;
    if (typeof statValue === 'string') {
      const parsed = parseInt(statValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const stats = videoJson.statistics || {};

  const video: NomadVideo = {
    id: videoJson.videoId,
    title: videoJson.title || 'Untitled Video',
    thumbnailUrl,
    youtubeUrl,
    viewCount: getStatAsNumber(stats.viewCount),
    likeCount: getStatAsNumber(stats.likeCount),
    commentCount: getStatAsNumber(stats.commentCount),
    duration: getStatAsNumber(stats.duration),
    publishedAt: videoJson.publishedAt, // Already an ISO string
    destination: videoJson.destination || 'General',
    dataAiHint: videoJson.dataAiHint || videoJson.title?.toLowerCase().substring(0, 50) || 'digital nomad lifestyle',
  };

  if (video.title === 'Untitled Video' && videoJson.title !== undefined) {
    console.warn(`mapJsonVideoToNomadVideo: Video ID ${video.id} resulted in 'Untitled Video'. Original title data:`, videoJson.title);
  }
  return video;
};

// Helper to map Firestore document to NomadVideo type
const mapFirestoreDocToNomadVideo = (doc: QueryDocumentSnapshot<DocumentData>): NomadVideo => {
  const data = doc.data();

  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  if (data.thumbnails?.high?.url) thumbnailUrl = data.thumbnails.high.url;
  else if (data.thumbnails?.medium?.url) thumbnailUrl = data.thumbnails.medium.url;
  else if (data.thumbnails?.default?.url) thumbnailUrl = data.thumbnails.default.url;
  else if (data.thumbnailUrl) thumbnailUrl = data.thumbnailUrl; // Fallback if structure is flatter

  try { new URL(thumbnailUrl); } catch (_) {
    console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid thumbnail URL '${thumbnailUrl}'. Using placeholder.`);
    thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  }

  let youtubeUrl = data.url || data.youtubeUrl || '#';
  try { new URL(youtubeUrl); } catch (_) {
    console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid YouTube URL '${youtubeUrl}'. Using '#'.`);
    youtubeUrl = '#';
  }
  
  const getStatAsNumber = (statValue: any): number => {
    if (typeof statValue === 'number') return statValue;
    if (typeof statValue === 'string') {
      const parsed = parseInt(statValue, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const stats = data.statistics || {};

  return {
    id: data.videoId || doc.id,
    title: data.title || 'Untitled Video from Firestore',
    thumbnailUrl,
    youtubeUrl,
    viewCount: getStatAsNumber(stats.viewCount ?? data.viewCount),
    likeCount: getStatAsNumber(stats.likeCount ?? data.likeCount),
    commentCount: getStatAsNumber(stats.commentCount ?? data.commentCount),
    duration: getStatAsNumber(stats.duration ?? data.duration),
    publishedAt: data.publishedAt ? formatDateFromTimestamp(data.publishedAt) : new Date(0).toISOString(),
    destination: data.destination || 'General',
    dataAiHint: data.dataAiHint || data.title?.toLowerCase().substring(0, 50) || 'nomad podcast',
  };
};


export async function getNomadsHoodPodcastVideosFromFirestore(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomadsHood-videos');
    const q = query(videosCollectionRef, orderBy('publishedAt', 'desc'), limit(4));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("getNomadsHoodPodcastVideosFromFirestore: Firestore query for 'nomadsHood-videos' collection returned an empty snapshot. Collection might be empty or 'publishedAt' field missing/incorrect, or an index is required (publishedAt DESC).");
      return [];
    }
    const videos = querySnapshot.docs.map(mapFirestoreDocToNomadVideo);
    if (videos.length === 0) {
      console.warn("getNomadsHoodPodcastVideosFromFirestore: Videos were queried from Firestore but the mapped list is empty. Check mapping logic or data quality.");
    }
    return videos;
  } catch (error) {
    console.error("Error fetching NomadsHood Podcast videos from Firestore:", error);
    if ((error as any)?.code === 'failed-precondition') {
         console.warn("Firestore query for NomadsHood Podcast Videos requires an index on 'publishedAt' (descending). Please create this index in the Firebase Console.");
    }
    return [];
  }
}

export async function getMostWatchedVideosFromJson(): Promise<NomadVideo[]> {
  try {
    const allJsonVideos: NomadVideo[] = (videosData as NomadVideoJsonItem[]).map(mapJsonVideoToNomadVideo);
    
    if (!allJsonVideos || allJsonVideos.length === 0) {
        console.warn("getMostWatchedVideosFromJson: No videos found in the local JSON data (nomad-videos.json).");
        return [];
    }
    
    const sortedVideos = [...allJsonVideos].sort((a, b) => b.viewCount - a.viewCount);
    const topVideos = sortedVideos.slice(0, 5); // Get top 5

    if (topVideos.length === 0 && allJsonVideos.length > 0) {
        console.warn("getMostWatchedVideosFromJson: Videos were available in JSON, but the list is empty after sorting/slicing. Check 'viewCount' field quality.");
    }
    return topVideos;
  } catch (error) {
    console.error("Error processing most watched videos from JSON:", error);
    return [];
  }
}
