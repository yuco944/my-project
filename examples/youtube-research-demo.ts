/**
 * YouTube Research Demo
 *
 * Demonstrates how to use the YouTubeResearchService
 */

import { YouTubeResearchService } from '../src/features/youtube-research/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('🎬 YouTube Research Service Demo\n');

  const service = new YouTubeResearchService(apiKey);

  try {
    // Example 1: Search for videos
    console.log('📹 Searching for TypeScript tutorial videos...\n');
    const videos = await service.searchVideos('TypeScript tutorial', 5);

    console.log(`Found ${videos.length} videos:\n`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channelTitle}`);
      console.log(`   Video ID: ${video.id}`);
      console.log('');
    });

    // Example 2: Get detailed video info
    if (videos.length > 0) {
      console.log('📊 Getting detailed info for first video...\n');
      const videoInfo = await service.getVideoInfo(videos[0].id);

      console.log(`Title: ${videoInfo.title}`);
      console.log(`Views: ${videoInfo.viewCount.toLocaleString()}`);
      console.log(`Likes: ${videoInfo.likeCount.toLocaleString()}`);
      console.log(`Comments: ${videoInfo.commentCount.toLocaleString()}`);
      console.log('');
    }

    // Example 3: Complete research workflow
    console.log('📈 Performing complete research...\n');
    const report = await service.performResearch('AI programming', 10);

    console.log('Generated Report:');
    console.log('='.repeat(80));
    console.log(report);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
