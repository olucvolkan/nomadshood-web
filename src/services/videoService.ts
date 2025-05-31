
import type { NomadVideo } from '@/types';
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
      // Check if the string is already a valid ISO date string
      if (!isNaN(new Date(timestampField).getTime())) {
          return new Date(timestampField).toISOString();
      }
    } catch (e) {
      // Fall through if parsing fails
    }
    console.warn(`formatDateFromTimestamp: Could not parse date string '${timestampField}'. Using current date as fallback.`);
    return new Date().toISOString(); // Fallback
  }
  console.warn(`formatDateFromTimestamp: Unexpected date format for timestampField: ${JSON.stringify(timestampField)}. Using current date as fallback.`);
  return new Date().toISOString(); // Fallback
};

// Helper to map Firestore document to NomadVideo type
const mapFirestoreDocToNomadVideo = (doc: QueryDocumentSnapshot<DocumentData>): NomadVideo => {
  const data = doc.data();

  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png'; // Default placeholder
  if (data.thumbnails?.high?.url && typeof data.thumbnails.high.url === 'string') {
    try {
      new URL(data.thumbnails.high.url); // Validate URL
      thumbnailUrl = data.thumbnails.high.url;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid high thumbnail URL '${data.thumbnails.high.url}'. Using placeholder.`);
    }
  } else if (data.thumbnails?.medium?.url && typeof data.thumbnails.medium.url === 'string') {
     try {
      new URL(data.thumbnails.medium.url); // Validate URL
      thumbnailUrl = data.thumbnails.medium.url;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid medium thumbnail URL '${data.thumbnails.medium.url}'. Using placeholder.`);
    }
  } else if (data.thumbnails?.default?.url && typeof data.thumbnails.default.url === 'string') {
     try {
      new URL(data.thumbnails.default.url); // Validate URL
      thumbnailUrl = data.thumbnails.default.url;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid default thumbnail URL '${data.thumbnails.default.url}'. Using placeholder.`);
    }
  } else if (data.thumbnailUrl && typeof data.thumbnailUrl === 'string') {
     try {
      new URL(data.thumbnailUrl); // Validate URL
      thumbnailUrl = data.thumbnailUrl;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid thumbnailUrl field '${data.thumbnailUrl}'. Using placeholder.`);
    }
  }


  let youtubeUrl = '#'; // Default placeholder URL
  if (data.url && typeof data.url === 'string') {
    try {
      new URL(data.url); // Validate URL
      youtubeUrl = data.url;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid URL field '${data.url}'. Using '#'.`);
    }
  } else if (data.youtubeUrl && typeof data.youtubeUrl === 'string') {
     try {
      new URL(data.youtubeUrl); // Validate URL
      youtubeUrl = data.youtubeUrl;
    } catch (_) {
      console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id} has an invalid youtubeUrl field '${data.youtubeUrl}'. Using '#'.`);
    }
  }
  
  const getStatAsNumber = (statValue: any, statName: string): number => {
    if (typeof statValue === 'number') return statValue;
    if (typeof statValue === 'string') {
      const parsed = parseInt(statValue, 10);
      if (isNaN(parsed)) {
        console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id}, stat '${statName}' ('${statValue}') is not a parseable number. Using 0.`);
        return 0;
      }
      return parsed;
    }
    if (statValue !== undefined) {
        console.warn(`mapFirestoreDocToNomadVideo: Video ID ${doc.id}, stat '${statName}' has unexpected type: ${typeof statValue}. Using 0.`);
    }
    return 0;
  };

  const stats = data.statistics || {};
  const publishedAtDate = data.publishedAt ? formatDateFromTimestamp(data.publishedAt) : new Date(0).toISOString();
  if (publishedAtDate === new Date(0).toISOString() && data.publishedAt) {
     console.warn(`mapFirestoreDocToNomadVideo: Invalid date string for publishedAt: ${JSON.stringify(data.publishedAt)} for video ID: ${doc.id}. Using epoch as fallback.`);
  }


  const video: NomadVideo = {
    id: data.videoId || doc.id,
    title: data.title || 'Untitled Video from Firestore',
    thumbnailUrl,
    youtubeUrl,
    viewCount: getStatAsNumber(stats.viewCount ?? data.viewCount, 'viewCount'),
    likeCount: getStatAsNumber(stats.likeCount ?? data.likeCount, 'likeCount'),
    commentCount: getStatAsNumber(stats.commentCount ?? data.commentCount, 'commentCount'),
    duration: getStatAsNumber(stats.duration ?? data.duration, 'duration'), // Assuming duration is in seconds
    publishedAt: publishedAtDate,
    destination: data.destination || 'General',
    dataAiHint: data.dataAiHint || data.title?.toLowerCase().substring(0, 50) || 'nomad podcast',
  };
  if (video.title === 'Untitled Video from Firestore' && data.title !== undefined) {
    console.warn(`mapFirestoreDocToNomadVideo: Video ID ${video.id} resulted in 'Untitled Video from Firestore'. Original title data:`, data.title);
  }
  return video;
};


export async function getNomadsHoodPodcastVideosFromFirestore(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomadsHood-videos');
    // Query for the 4 most recent videos based on 'publishedAt'
    const q = query(videosCollectionRef, orderBy('publishedAt', 'desc'), limit(4));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("getNomadsHoodPodcastVideosFromFirestore: Firestore query for 'nomadsHood-videos' collection returned an empty snapshot. Collection might be empty, 'publishedAt' field missing/incorrect (must be a Timestamp), or an index is required (publishedAt DESC).");
      return [];
    }
    
    const videos = querySnapshot.docs.map(mapFirestoreDocToNomadVideo);
    if (videos.length === 0 && !querySnapshot.empty) {
       console.warn("getNomadsHoodPodcastVideosFromFirestore: Videos were queried from Firestore but the mapped list is empty. Check mapping logic or data quality in 'nomadsHood-videos'. Ensure 'publishedAt' is a Firestore Timestamp.");
    }
    return videos;
  } catch (error) {
    console.error("Error fetching NomadsHood Podcast videos from Firestore:", error);
    if ((error as any)?.code === 'failed-precondition') {
         console.warn("Firestore query for NomadsHood Podcast Videos requires an index on 'publishedAt' (descending) for the 'nomadsHood-videos' collection. Please create this index in the Firebase Console. The error details: ", (error as any).message);
    }
    return [];
  }
}
