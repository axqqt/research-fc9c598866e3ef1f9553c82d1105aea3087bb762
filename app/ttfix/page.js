"use client"
import React, { useState } from 'react';


const TikTokSearch = () => {
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!keywords.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ttsearch?keywords=${encodeURIComponent(keywords)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setResults(data.data || []);
    } catch (err) {
      setError('An error occurred while fetching results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex">
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Enter keywords"
          className="mr-2"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <div key={result.id}>
            <div>
              <h3 className="text-lg font-semibold">{result.author?.nickname || 'Unknown Author'}</h3>
            </div>
            <div>
              <p>{result.desc}</p>
              <p className="mt-2">Views: {result.stats?.playCount || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TikTokSearch;