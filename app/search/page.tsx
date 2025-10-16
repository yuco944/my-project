'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

interface VideoResult {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    medium: { url: string };
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const max = searchParams.get('max') || '10';
  const period = searchParams.get('period') || 'all';
  const durationType = searchParams.get('durationType') || 'all';

  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&max=${max}&period=${period}&durationType=${durationType}`);

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        setVideos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchVideos();
    }
  }, [query, max, period, durationType]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">動画を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">エラー</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">検索結果</h1>
      <p className="text-gray-600 mb-8">
        「{query}」の検索結果: {videos.length}件
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={video.thumbnails.medium.url}
              alt={video.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(video.publishedAt).toLocaleDateString()}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                YouTubeで見る →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
