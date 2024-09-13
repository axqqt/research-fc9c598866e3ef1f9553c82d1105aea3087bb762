"use server"

import { NextResponse } from 'next/server';
import TikTokScraper from 'tiktok-scraper';

const allowedOrigin = 'https://products-three-xi.vercel.app';

function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  return response;
}

export async function POST(request) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  try {
    const body = await request.text();
    let videoUrl;
    try {
      const jsonBody = JSON.parse(body);
      videoUrl = jsonBody.videoUrl;
    } catch (parseError) {
      console.error('Failed to parse request body:', body);
      return setCorsHeaders(NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }));
    }

    if (!videoUrl) {
      return setCorsHeaders(NextResponse.json({ error: 'TikTok video URL is required' }, { status: 400 }));
    }

    const options = {}; // You can add any necessary options here

    const videoMeta = await TikTokScraper.getVideoMeta(videoUrl, options);

    if (!videoMeta) {
      console.error('Unexpected scraper output:', videoMeta);
      return setCorsHeaders(NextResponse.json({ error: 'Failed to fetch video metadata' }, { status: 500 }));
    }

    const response = NextResponse.json(videoMeta, { status: 200 });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('TikTok metadata fetch failed:', error);
    return setCorsHeaders(NextResponse.json({ error: 'Failed to fetch TikTok video metadata', details: error.message }, { status: 500 }));
  }
}

// Handle preflight requests (OPTIONS)
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}