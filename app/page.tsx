'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const POPULAR_GENRES = {
  'エンターテイメント': ['お笑い', 'ゲーム実況', '音楽', 'アニメ'],
  '教育・学習': ['プログラミング', '英語学習', 'ビジネス', '資格試験'],
  'ライフスタイル': ['料理', 'DIY', 'ファッション', '美容'],
  '健康': ['筋トレ', 'ヨガ', 'ダイエット', '健康'],
  'ホビー': ['ガジェット', '旅行', 'ペット', 'スポーツ'],
  'ビジネス': ['株式投資', '仮想通貨', '不動産', '副業'],
};

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [period, setPeriod] = useState('all');
  const router = useRouter();

  const buildSearchQuery = () => {
    const parts = [];
    if (query.trim()) {
      parts.push(query.trim());
    }
    if (selectedGenre) {
      parts.push(selectedGenre);
    }
    return parts.join(' ');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = buildSearchQuery();
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&max=${maxResults}&period=${period}`);
    }
  };

  const handleResearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = buildSearchQuery();
    if (searchQuery) {
      router.push(`/research?q=${encodeURIComponent(searchQuery)}&max=${maxResults}&period=${period}`);
    }
  };

  const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
          YouTubeリサーチ
        </h1>
        <p className="text-center text-gray-600 mb-12">
          YouTube動画を分析してトレンドを発見
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                検索キーワード
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例: TypeScriptチュートリアル、AIプログラミング"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
                取得件数
              </label>
              <select
                id="maxResults"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5件</option>
                <option value={10}>10件</option>
                <option value={20}>20件</option>
                <option value={50}>50件</option>
              </select>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                投稿期間
              </label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="day">過去24時間</option>
                <option value="week">過去1週間</option>
                <option value="month">過去1ヶ月</option>
                <option value="year">過去1年</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
              >
                動画を検索
              </button>
              <button
                type="button"
                onClick={handleResearch}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition font-medium"
              >
                詳細分析
              </button>
            </div>
          </form>
        </div>

        {/* Popular Genres Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            🔥 人気ジャンルから選ぶ
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <label htmlFor="genre-select" className="block text-sm font-medium text-gray-700 mb-3">
              カテゴリとジャンルを選択
            </label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={handleGenreSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            >
              <option value="">ジャンルを選択してください</option>
              {Object.entries(POPULAR_GENRES).map(([category, genres]) => (
                <optgroup key={category} label={category}>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedGenre && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>選択中のジャンル:</strong> {selectedGenre}
                </p>
                {query.trim() && (
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>組み合わせ検索:</strong> {query.trim()} + {selectedGenre}
                  </p>
                )}
              </div>
            )}
            <p className="mt-3 text-sm text-gray-500">
              検索ワードとジャンルを組み合わせて検索できます
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>YouTube Data API v3 を使用</p>
        </div>
      </div>
    </div>
  );
}
