import { NextRequest, NextResponse } from 'next/server';
import { YouTubeResearchService } from '@/src/features/youtube-research';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('max') || '10', 10);
    const period = searchParams.get('period') || 'all';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const service = new YouTubeResearchService(process.env.YOUTUBE_API_KEY);
    const results = await service.searchVideos(query, maxResults, period);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
