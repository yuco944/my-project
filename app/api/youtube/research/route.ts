import { NextRequest, NextResponse } from 'next/server';
import { YouTubeResearchService } from '@/src/features/youtube-research';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('max') || '20', 10);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const service = new YouTubeResearchService(process.env.YOUTUBE_API_KEY);

    // Get search results
    const searchResults = await service.searchVideos(query, maxResults);

    // Get detailed info for each video
    const videoInfoPromises = searchResults.map(result =>
      service.getVideoInfo(result.id)
    );
    const videos = await Promise.all(videoInfoPromises);

    // Analyze data
    const analysis = service.analyzeData(videos);

    // Generate report
    const report = service.generateReport(analysis);

    return NextResponse.json({
      query,
      maxResults,
      analysis,
      report,
      videos,
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
