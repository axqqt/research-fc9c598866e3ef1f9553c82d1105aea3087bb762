"use server"

// app/api/tiktok-info/route.js
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

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
  if (request.method === 'OPTIONS') {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return setCorsHeaders(NextResponse.json({ error: 'TikTok video URL is required' }, { status: 400 }));
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return setCorsHeaders(NextResponse.json({ error: 'Invalid TikTok URL' }, { status: 400 }));
    }

    const apiUrl = `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${videoId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.aweme_detail) {
      return setCorsHeaders(NextResponse.json({ error: 'Failed to fetch video metadata' }, { status: 500 }));
    }

    const videoMetadata = {
      id: data.aweme_detail.aweme_id,
      description: data.aweme_detail.desc,
      createTime: data.aweme_detail.create_time,
      author: {
        id: data.aweme_detail.author.uid,
        nickname: data.aweme_detail.author.nickname,
        avatarThumb: data.aweme_detail.author.avatar_thumb.url_list[0],
      },
      music: {
        id: data.aweme_detail.music.id,
        title: data.aweme_detail.music.title,
        author: data.aweme_detail.music.author,
        coverThumb: data.aweme_detail.music.cover_thumb.url_list[0],
        playUrl: data.aweme_detail.music.play_url.url_list[0],
      },
      statistics: {
        commentCount: data.aweme_detail.statistics.comment_count,
        diggCount: data.aweme_detail.statistics.digg_count,
        downloadCount: data.aweme_detail.statistics.download_count,
        playCount: data.aweme_detail.statistics.play_count,
        shareCount: data.aweme_detail.statistics.share_count,
      },
      video: {
        cover: data.aweme_detail.video.cover.url_list[0],
        dynamicCover: data.aweme_detail.video.dynamic_cover.url_list[0],
        playAddr: data.aweme_detail.video.play_addr.url_list[0],
        downloadAddr: data.aweme_detail.video.download_addr.url_list[0],
      },
    };

    const finalResponse = NextResponse.json(videoMetadata, { status: 200 });
    return setCorsHeaders(finalResponse);
  } catch (error) {
    console.error('TikTok metadata fetch failed:', error);
    return setCorsHeaders(NextResponse.json({ error: 'Failed to fetch TikTok video metadata', details: error.message }, { status: 500 }));
  }
}

function extractVideoId(url) {
  const regex = /\/video\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}