
import type { NomadVideo, NomadVideoJsonItem } from '@/types';
import videosData from '@/data/nomad-videos.json'; // Import the local JSON

// Helper function to map the JSON video structure to our NomadVideo type
const mapJsonVideoToNomadVideo = (videoJson: NomadVideoJsonItem): NomadVideo => {
  let thumbnailUrl = 'https://placehold.co/400x225/E0E0E0/757575.png';
  if (videoJson.thumbnails) {
    if (videoJson.thumbnails.high?.url) {
      thumbnailUrl = videoJson.thumbnails.high.url;
    } else if (videoJson.thumbnails.medium?.url) {
      thumbnailUrl = videoJson.thumbnails.medium.url;
    } else if (videoJson.thumbnails.default?.url) {
      thumbnailUrl = videoJson.thumbnails.default.url;
    }
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
      if (!isNaN(parsed)) return parsed;
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
    duration: getStatAsNumber(stats.duration), // Assuming duration is in seconds
    publishedAt: videoJson.publishedAt, // Already an ISO string
    destination: videoJson.destination || 'General',
    dataAiHint: videoJson.dataAiHint || videoJson.title.toLowerCase().substring(0, 50) || 'digital nomad lifestyle',
  };

  if (video.title === 'Untitled Video' && videoJson.title !== undefined) {
    console.warn(`mapJsonVideoToNomadVideo: Video ID ${video.id} resulted in 'Untitled Video'. Original title data:`, videoJson.title);
  }

  return video;
};

const allVideos: NomadVideo[] = (videosData as NomadVideoJsonItem[]).map(mapJsonVideoToNomadVideo);

export async function getDiscoveryVideos(): Promise<NomadVideo[]> {
  try {
    const sortedVideos = [...allVideos].sort((a, b) => b.viewCount - a.viewCount);
    const topVideos = sortedVideos.slice(0, 4);

    if (topVideos.length === 0 && allVideos.length > 0) {
        console.warn("getDiscoveryVideos: Videos were available in JSON, but the list is empty after sorting/slicing. Check sorting logic or data quality (e.g., viewCount).");
    } else if (allVideos.length === 0) {
        console.warn("getDiscoveryVideos: No videos found in the local JSON data.");
    }
    return topVideos;
  } catch (error) {
    console.error("Error processing discovery videos from JSON:", error);
    return [];
  }
}

export async function getCommunityFavoritesVideos(): Promise<NomadVideo[]> {
  try {
    const videosWithScores = allVideos.map(video => {
      const engagementScore = video.duration > 0
        ? (video.likeCount + video.commentCount) / video.duration
        : 0;
      return { ...video, engagementScore };
    });

    videosWithScores.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
    
    const topVideos = videosWithScores.slice(0, 4);

    if (topVideos.length === 0 && allVideos.length > 0) {
        console.warn("getCommunityFavoritesVideos: Videos were available, but the final list after scoring and slicing is empty. Check scoring logic or data quality.");
    } else if (allVideos.length === 0) {
        console.warn("getCommunityFavoritesVideos: No videos found in local JSON data.");
    }
    return topVideos;
  } catch (error) {
    console.error("Error processing community favorites videos from JSON:", error);
    return [];
  }
}

export async function getFreshAndTrendingVideos(): Promise<NomadVideo[]> {
  try {
    const date90DaysAgo = new Date();
    date90DaysAgo.setDate(date90DaysAgo.getDate() - 90);

    const recentVideos = allVideos.filter(video => {
      try {
        const publishedDate = new Date(video.publishedAt);
        return publishedDate >= date90DaysAgo;
      } catch (e) {
        console.warn(`getFreshAndTrendingVideos: Could not parse publishedAt date '${video.publishedAt}' for video ID ${video.id}. Excluding from list.`);
        return false;
      }
    });
    
    recentVideos.sort((a, b) => b.viewCount - a.viewCount); // Secondary sort by viewCount
    // Note: The primary sort by publishedAt (desc) is implicitly handled if you want most recent *of the trending by views*
    // If you need strict primary sort by date then secondary by views:
    // recentVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() || b.viewCount - a.viewCount);
    
    const topVideos = recentVideos.slice(0, 4);

    if (topVideos.length === 0 && allVideos.length > 0) {
        console.warn("getFreshAndTrendingVideos: Videos were available, but the list is empty after filtering/sorting. Check date formats or view counts in recent videos.");
    } else if (allVideos.length === 0) {
         console.warn("getFreshAndTrendingVideos: No videos found in local JSON data.");
    }
    return topVideos;
  } catch (error) {
    console.error("Error processing fresh and trending videos from JSON:", error);
    return [];
  }
}

export async function getNomadsHoodPodcastVideos(): Promise<NomadVideo[]> {
  try {
    const sortedVideos = [...allVideos].sort((a, b) => {
        try {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        } catch (e) {
            console.warn(`getNomadsHoodPodcastVideos: Could not parse publishedAt date for video ID ${a.id} or ${b.id}.`);
            return 0;
        }
    });
    const topVideos = sortedVideos.slice(0, 4);
    
    if (topVideos.length === 0 && allVideos.length > 0) {
        console.warn("getNomadsHoodPodcastVideos: Videos were available, but the list is empty after sorting. Check publishedAt dates.");
    } else if (allVideos.length === 0) {
        console.warn("getNomadsHoodPodcastVideos: No videos found in local JSON data.");
    }
    return topVideos;
  } catch (error) {
    console.error("Error fetching NomadsHood Podcast videos from JSON:", error);
    return [];
  }
}
