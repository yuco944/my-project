'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
          YouTube Research
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Analyze YouTube videos and discover trends
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., TypeScript tutorial, AI programming"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Results
              </label>
              <select
                id="maxResults"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 results</option>
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
                <option value={50}>50 results</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
              >
                Search Videos
              </button>
              <button
                type="button"
                onClick={handleResearch}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition font-medium"
              >
                Full Research
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by YouTube Data API v3</p>
        </div>
      </div>
    </div>
  );
}
