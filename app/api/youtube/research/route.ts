import { NextRequest, NextResponse } from 'next/server';
import { YouTubeResearchService } from '@/src/features/youtube-research';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('max') || '20', 10);
    const period = searchParams.get('period') || 'all';
    const sortBy = searchParams.get('sortBy') || 'viral';
    const durationType = searchParams.get('durationType') || 'all';

    console.log(`[API] durationType parameter: ${durationType}`);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const service = new YouTubeResearchService(process.env.YOUTUBE_API_KEY);

    // Get search results
    const searchResults = await service.searchVideos(query, maxResults, period);

    // Get detailed info for each video
    const videoInfoPromises = searchResults.map(result =>
      service.getVideoInfo(result.id)
    );
    const videos = await Promise.all(videoInfoPromises);

    // Enrich with channel info and sort
    const enrichedVideos = await service.enrichAndSortVideos(videos, sortBy);

    // Filter by duration type (all, shorts, regular)
    const filteredVideos = service.filterByDuration(enrichedVideos, durationType);

    // Analyze data
    const analysis = service.analyzeData(filteredVideos);

    // Generate report
    const report = service.generateReport(analysis);

    return NextResponse.json({
      query,
      maxResults,
      analysis,
      report,
      videos: filteredVideos,
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
