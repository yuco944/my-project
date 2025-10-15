'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const POPULAR_GENRES = [
  { category: 'エンターテイメント', items: ['お笑い', 'ゲーム実況', '音楽', 'アニメ'] },
  { category: '教育・学習', items: ['プログラミング', '英語学習', 'ビジネス', '資格試験'] },
  { category: 'ライフスタイル', items: ['料理', 'DIY', 'ファッション', '美容'] },
  { category: '健康', items: ['筋トレ', 'ヨガ', 'ダイエット', '健康'] },
  { category: 'ホビー', items: ['ガジェット', '旅行', 'ペット', 'スポーツ'] },
  { category: 'ビジネス', items: ['株式投資', '仮想通貨', '不動産', '副業'] },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&max=${maxResults}`);
    }
  };

  const handleResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/research?q=${encodeURIComponent(query)}&max=${maxResults}`);
    }
  };

  const handleGenreClick = (genre: string) => {
    setQuery(genre);
    router.push(`/search?q=${encodeURIComponent(genre)}&max=${maxResults}`);
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
            🔥 人気ジャンル
          </h2>
          <div className="space-y-6">
            {POPULAR_GENRES.map((category) => (
              <div key={category.category} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 text-sm font-medium shadow-sm"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>YouTube Data API v3 を使用</p>
        </div>
      </div>
    </div>
  );
}
