import { NextRequest, NextResponse } from 'next/server';
import { YouTubeResearchService } from '@/src/features/youtube-research';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('max') || '10', 10);
    const period = searchParams.get('period') || 'all';
    const durationType = searchParams.get('durationType') || 'all';

    console.log(`[API /search] durationType parameter: ${durationType}`);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const service = new YouTubeResearchService(process.env.YOUTUBE_API_KEY);
    const searchResults = await service.searchVideos(query, maxResults, period);

    // If durationType filter is specified, get full video info and filter
    if (durationType !== 'all') {
      // Get detailed info for each video to access duration
      const videoInfoPromises = searchResults.map(result =>
        service.getVideoInfo(result.id)
      );
      const videos = await Promise.all(videoInfoPromises);

      // Filter by duration
      const filteredVideos = service.filterByDuration(videos, durationType);

      // Convert back to search result format
      const filteredResults = filteredVideos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        channelId: video.channelId || '',
        channelTitle: video.channelTitle || '',
        publishedAt: video.publishedAt,
        thumbnails: {
          medium: { url: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` }
        }
      }));

      return NextResponse.json(filteredResults);
    }

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
