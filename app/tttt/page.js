import React, { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [tiktokInfo, setTiktokInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tiktok-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TikTok info');
      }

      const data = await response.json();
      setTiktokInfo(data.collector[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TikTok Info Fetcher</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter TikTok URL"
          className="w-full p-2 border rounded text-black"
          required
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Info'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {tiktokInfo && (
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold">{tiktokInfo.authorMeta.nickName}</h2>
          <p>Username: {tiktokInfo.authorMeta.name}</p>
          <p>Description: {tiktokInfo.text}</p>
          <p>Likes: {tiktokInfo.diggCount}</p>
          <p>Comments: {tiktokInfo.commentCount}</p>
          <p>Shares: {tiktokInfo.shareCount}</p>
          <p>Plays: {tiktokInfo.playCount}</p>
          <p>Music: {tiktokInfo.musicMeta.musicName} by {tiktokInfo.musicMeta.musicAuthor}</p>
          {tiktokInfo.videoUrl && (
            <div className="mt-4">
              <h3 className="font-semibold">Video:</h3>
              <video src={tiktokInfo.videoUrl} controls className="mt-2 max-w-full" />
            </div>
          )}
          {tiktokInfo.musicMeta.musicUrl && (
            <div className="mt-4">
              <h3 className="font-semibold">Audio:</h3>
              <audio src={tiktokInfo.musicMeta.musicUrl} controls className="mt-2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}