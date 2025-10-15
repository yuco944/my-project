import { NextRequest, NextResponse } from 'next/server';
import { YouTubeResearchService } from '../../../../../src/features/youtube-research/index.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const service = new YouTubeResearchService(process.env.YOUTUBE_API_KEY);
    const videoInfo = await service.getVideoInfo(id);

    return NextResponse.json(videoInfo);
  } catch (error) {
    console.error('Video info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
