/**
 * Type definitions for YouTube Research
 */

export interface VideoSearchResult {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
}

export interface ChannelSearchResult {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface AnalysisResult {
  totalVideos: number;
  averageViews: number;
  topVideos: VideoInfo[];
  trends: string[];
}

export interface Report {
  generatedAt: string;
  summary: string;
  statistics: AnalysisResult;
  recommendations: string[];
}
