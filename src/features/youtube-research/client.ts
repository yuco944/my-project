/**
 * YouTube Data API v3 Client
 */

import axios, { AxiosInstance } from 'axios';
import type { VideoSearchResult, VideoInfo, ChannelSearchResult } from './types.js';
import { config, validateConfig } from './config.js';

export class YouTubeAPIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.apiKey;

    if (!this.apiKey) {
      throw new Error('YouTube API key is required');
    }

    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      timeout: 10000,
    });
  }

  /**
   * Search for YouTube videos
   * @param query - Search query string
   * @param maxResults - Maximum number of results (default: 10, max: 50)
   * @returns Promise with search results
   */
  async searchVideos(query: string, maxResults = 10): Promise<VideoSearchResult[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: Math.min(maxResults, 50),
          key: this.apiKey,
        },
      });

      return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get detailed video information
   * @param videoId - YouTube video ID
   * @returns Promise with video details
   */
  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    try {
      const response = await this.client.get('/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Video not found: ${videoId}`);
      }

      const item = response.data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        viewCount: parseInt(item.statistics.viewCount || '0', 10),
        likeCount: parseInt(item.statistics.likeCount || '0', 10),
        commentCount: parseInt(item.statistics.commentCount || '0', 10),
        duration: item.contentDetails.duration,
        publishedAt: item.snippet.publishedAt,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for YouTube channels
   * @param query - Search query string
   * @param maxResults - Maximum number of results (default: 10, max: 50)
   * @returns Promise with channel results
   */
  async searchChannels(query: string, maxResults = 10): Promise<ChannelSearchResult[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: Math.min(maxResults, 50),
          key: this.apiKey,
        },
      });

      // Get detailed channel information
      const channelIds = response.data.items.map((item: any) => item.id.channelId).join(',');

      if (!channelIds) {
        return [];
      }

      const channelsResponse = await this.client.get('/channels', {
        params: {
          part: 'snippet,statistics',
          id: channelIds,
          key: this.apiKey,
        },
      });

      return channelsResponse.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        subscriberCount: parseInt(item.statistics.subscriberCount || '0', 10),
        videoCount: parseInt(item.statistics.videoCount || '0', 10),
        thumbnails: item.snippet.thumbnails,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}
