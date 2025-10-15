'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VideoInfo {
  id: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface AnalysisResult {
  totalVideos: number;
  averageViews: number;
  topVideos: VideoInfo[];
  trends: string[];
}

interface ResearchData {
  query: string;
  maxResults: number;
  analysis: AnalysisResult;
  report: string;
  videos: VideoInfo[];
}

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const max = searchParams.get('max') || '20';

  const [data, setData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/youtube/research?q=${encodeURIComponent(query)}&max=${max}`);

        if (!response.ok) {
          throw new Error('Failed to fetch research data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResearch();
    }
  }, [query, max]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">動画を分析中...</p>
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

  if (!data) {
    return null;
  }

  const chartData = data.analysis.topVideos.map((video, index) => ({
    name: `#${index + 1}`,
    views: video.viewCount,
    likes: video.likeCount,
    comments: video.commentCount,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">分析レポート</h1>
      <p className="text-gray-600 mb-8">「{data.query}」の分析結果</p>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">分析した動画数</h3>
          <p className="text-4xl font-bold text-gray-900">{data.analysis.totalVideos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">平均視聴回数</h3>
          <p className="text-4xl font-bold text-gray-900">
            {data.analysis.averageViews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Videos Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">トップ動画のパフォーマンス</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#3b82f6" name="視聴回数" />
            <Bar dataKey="likes" fill="#10b981" name="高評価" />
            <Bar dataKey="comments" fill="#f59e0b" name="コメント" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Videos List */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">トップ5動画</h2>
        <div className="space-y-4">
          {data.analysis.topVideos.map((video, index) => (
            <div key={video.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>👁️ {video.viewCount.toLocaleString()} 回</span>
                    <span>👍 {video.likeCount.toLocaleString()}</span>
                    <span>💬 {video.commentCount.toLocaleString()}</span>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                  >
                    YouTubeで見る →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Keywords */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">トレンドキーワード</h2>
        <div className="flex flex-wrap gap-2">
          {data.analysis.trends.map((keyword, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              #{keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Markdown Report */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">完全レポート (Markdown)</h2>
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
          {data.report}
        </pre>
      </div>
    </div>
  );
}
