
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { NomadVideo } from '@/types';

const mapDocToNomadVideo = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): NomadVideo => {
  const data = doc.data();
  if (!data) {
    console.warn(`mapDocToNomadVideo: Document data is undefined for doc id: ${doc.id}. Returning default video structure.`);
    return {
      id: doc.id,
      title: 'Untitled Video',
      thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
      youtubeUrl: '#',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      duration: 0,
      publishedAt: new Date(0).toISOString(),
      destination: 'General',
      dataAiHint: 'video placeholder',
    };
  }

  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  if (data.thumbnails) {
    if (data.thumbnails.high && typeof data.thumbnails.high.url === 'string') {
      thumbnailUrl = data.thumbnails.high.url;
    } else if (data.thumbnails.medium && typeof data.thumbnails.medium.url === 'string') {
      thumbnailUrl = data.thumbnails.medium.url;
    } else if (data.thumbnails.default && typeof data.thumbnails.default.url === 'string') {
      thumbnailUrl = data.thumbnails.default.url;
    }
  } else if (typeof data.thumbnailUrl === 'string') {
    thumbnailUrl = data.thumbnailUrl;
  }
  try { new URL(thumbnailUrl); } catch (_) { thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png'; }


  let youtubeUrl = '#';
  if (typeof data.url === 'string') {
    youtubeUrl = data.url;
  } else if (typeof data.youtubeUrl === 'string') {
    youtubeUrl = data.youtubeUrl;
  }
  try { new URL(youtubeUrl); } catch (_) { youtubeUrl = '#'; }

  const stats = data.statistics || {};

  const getStat = (statName: string): number => {
    const statValue = stats[statName] ?? data[statName];
    if (typeof statValue === 'number') {
      return statValue;
    }
    if (typeof statValue === 'string') {
        const parsed = parseInt(statValue, 10);
        if (!isNaN(parsed)) return parsed;
    }
    // console.warn(`mapDocToNomadVideo: Video ID ${doc.id}, stat '${statName}' is missing or not a number. Original data:`, statValue);
    return 0;
  };

  let publishedAtValue: string = new Date(0).toISOString();
  if (data.publishedAt instanceof Timestamp) {
    publishedAtValue = data.publishedAt.toDate().toISOString();
  } else if (typeof data.publishedAt === 'string') {
    try {
        const date = new Date(data.publishedAt);
        if (!isNaN(date.getTime())) {
            publishedAtValue = date.toISOString();
        } else {
           console.warn(`mapDocToNomadVideo: Invalid date string for publishedAt: ${data.publishedAt} for video ID: ${doc.id}. Using default date.`);
        }
    } catch (e) {
        console.warn(`mapDocToNomadVideo: Error parsing publishedAt string: ${data.publishedAt} for video ID: ${doc.id}. Using default date.`, e);
    }
  } else if (data.publishedAt) {
     console.warn(`mapDocToNomadVideo: Unexpected type for publishedAt: ${typeof data.publishedAt} for video ID: ${doc.id}. Using default date.`);
  }


  const videoEntry: NomadVideo = {
    id: doc.id,
    title: typeof data.title === 'string' ? data.title : 'Untitled Video',
    thumbnailUrl: thumbnailUrl,
    youtubeUrl: youtubeUrl,
    viewCount: getStat('viewCount'),
    likeCount: getStat('likeCount'),
    commentCount: getStat('commentCount'),
    duration: getStat('duration'),
    publishedAt: publishedAtValue,
    destination: typeof data.destination === 'string' ? data.destination : 'General',
    dataAiHint: typeof data.dataAiHint === 'string' ? data.dataAiHint : 'digital nomad lifestyle',
  };

  if (videoEntry.title === 'Untitled Video' && data.title !== undefined) {
    console.warn(`mapDocToNomadVideo: Video ID ${doc.id} resulted in 'Untitled Video'. Original title data:`, data.title);
  }
  if (videoEntry.thumbnailUrl.includes('placehold.co') && (data.thumbnails || data.thumbnailUrl)) {
    console.warn(`mapDocToNomadVideo: Video ID ${doc.id} is using a placeholder thumbnail. Original thumbnails/thumbnailUrl data:`, data.thumbnails, data.thumbnailUrl);
  }
  if (videoEntry.youtubeUrl === '#' && (data.url || data.youtubeUrl)) {
    console.warn(`mapDocToNomadVideo: Video ID ${doc.id} has an invalid YouTube URL. Original url/youtubeUrl data:`, data.url, data.youtubeUrl);
  }
   if (publishedAtValue === new Date(0).toISOString() && data.publishedAt) {
    console.warn(`mapDocToNomadVideo: Video ID ${doc.id} ended up with a default publishedAt date, but original data was present:`, data.publishedAt);
  }

  return videoEntry;
};

export async function getDiscoveryVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    const q = query(videosCollectionRef, orderBy('viewCount', 'desc'), limit(4));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn("getDiscoveryVideos: Firestore query (orderBy viewCount desc) returned an empty snapshot. No documents matched. Ensure 'nomad-videos' collection has documents with a numeric 'viewCount' field and check for potential index requirements if this warning persists despite having data.");
    }

    const videos = querySnapshot.docs.map(mapDocToNomadVideo);

    if (videos.length === 0 && !querySnapshot.empty) {
        console.warn("getDiscoveryVideos: Videos were fetched from Firestore, but the list is empty after mapping. This could indicate issues with the data structure in all fetched documents (e.g., missing titles, invalid URLs, non-numeric viewCount). Check individual 'mapDocToNomadVideo' warnings in the console.");
    } else if (videos.length === 0 && querySnapshot.empty) {
        console.warn("getDiscoveryVideos: No videos found. The 'nomad-videos' collection might be empty or no documents met the query criteria (orderBy viewCount desc).");
    }
    return videos;
  } catch (error) {
    console.error("Error fetching discovery videos:", error);
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.warn("Firestore query for Discovery Videos (orderBy 'viewCount' desc) may require an index. Please check Firebase Console. The error message should contain a link to create it. The required index is likely on 'viewCount' (descending).");
    }
    return [];
  }
}

export async function getCommunityFavoritesVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    const q = query(videosCollectionRef, orderBy('likeCount', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn("getCommunityFavoritesVideos: Firestore query (orderBy likeCount desc) returned an empty snapshot. No documents matched. Ensure 'nomad-videos' has documents with numeric 'likeCount', 'commentCount', and 'duration' fields. Check for index requirements if this persists.");
    }

    const videosWithScores = querySnapshot.docs.map(doc => {
      const video = mapDocToNomadVideo(doc);
      const engagementScore = video.duration > 0
        ? (video.likeCount + video.commentCount) / video.duration
        : 0;
      return { ...video, engagementScore };
    });

    videosWithScores.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
    
    const finalVideos = videosWithScores.slice(0, 4);

    if (finalVideos.length === 0 && !querySnapshot.empty) {
        console.warn("getCommunityFavoritesVideos: Videos were fetched, but the final list after scoring and slicing is empty. This could be due to issues in data mapping or all videos having a zero engagement score. Check 'mapDocToNomadVideo' warnings.");
    } else if (finalVideos.length === 0 && querySnapshot.empty) {
        console.warn("getCommunityFavoritesVideos: No videos found. Collection might be empty or no documents met query criteria (orderBy likeCount desc).");
    }
    return finalVideos;
  } catch (error) {
    console.error("Error fetching community favorites videos:", error);
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.warn("Firestore query for Community Favorites (orderBy 'likeCount' desc) may require an index. Please check Firebase Console. The error message should provide a link. The required index is likely on 'likeCount' (descending).");
    }
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

    if (querySnapshot.empty) {
        console.warn("getFreshAndTrendingVideos: Firestore query (publishedAt >= 90 days ago, orderBy publishedAt desc, viewCount desc) returned an empty snapshot. No documents matched. Ensure 'nomad-videos' has recent documents with Firestore Timestamp 'publishedAt' and numeric 'viewCount'. THIS QUERY REQUIRES A COMPOSITE INDEX.");
    }

    const videos = querySnapshot.docs.map(mapDocToNomadVideo);

    if (videos.length === 0 && !querySnapshot.empty) {
        console.warn("getFreshAndTrendingVideos: Videos were fetched, but the list is empty after mapping. Check 'mapDocToNomadVideo' warnings for data structure issues in the fetched recent videos.");
    } else if (videos.length === 0 && querySnapshot.empty) {
        console.warn("getFreshAndTrendingVideos: No videos found. Collection might be empty, no videos in the last 90 days, or the required composite index is missing/misconfigured.");
    }
    return videos;
  } catch (error) {
    console.error("Error fetching fresh and trending videos:", error);
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.warn("Firestore query for Fresh & Trending Videos REQUIRES A COMPOSITE INDEX (on 'publishedAt' (descending) then 'viewCount' (descending), with 'publishedAt' used in the 'where' clause). Please ensure this index is created and enabled in the Firebase Console. The error message should contain a link to create it.");
    }
    return [];
  }
}

export async function getNomadsHoodPodcastVideos(): Promise<NomadVideo[]> {
  try {
    const videosCollectionRef = collection(db, 'nomad-videos');
    const q = query(videosCollectionRef, orderBy('publishedAt', 'desc'), limit(4));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn("getNomadsHoodPodcastVideos: Firestore query (orderBy publishedAt desc) returned an empty snapshot. No documents matched. Ensure 'nomad-videos' has documents with Firestore Timestamp 'publishedAt'. Check for index requirements if this persists.");
    }

    const videos = querySnapshot.docs.map(mapDocToNomadVideo);
    
    if (videos.length === 0 && !querySnapshot.empty) {
        console.warn("getNomadsHoodPodcastVideos: Videos were fetched from Firestore, but the list is empty after mapping. Check 'mapDocToNomadVideo' warnings for data structure issues in the fetched recent videos.");
    } else if (videos.length === 0 && querySnapshot.empty) {
        console.warn("getNomadsHoodPodcastVideos: No videos found. The 'nomad-videos' collection might be empty or no documents met the query criteria (orderBy publishedAt desc).");
    }
    return videos;
  } catch (error) {
    console.error("Error fetching NomadsHood Podcast videos:", error);
    if (error instanceof Error && error.message.includes("query requires an index")) {
        console.warn("Firestore query for NomadsHood Podcast (orderBy 'publishedAt' desc) may require an index. Please check Firebase Console. The error message should provide a link. The required index is likely on 'publishedAt' (descending).");
    }
    return [];
  }
}
