/**
 * Configuration for YouTube Research
 */

export const config = {
  apiKey: process.env.YOUTUBE_API_KEY || '',
  maxResults: 50,
  defaultRegion: 'JP',
  cacheEnabled: true,
  cacheDuration: 3600000, // 1 hour in milliseconds
};

export function validateConfig(): void {
  if (!config.apiKey) {
    throw new Error('YOUTUBE_API_KEY is required in environment variables');
  }
}
