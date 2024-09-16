// pages/api/search.js (or appropriate file path)
"use server"
import { scrapeAliExpress } from '@/lib/scraper';
import { NextResponse } from 'next/server';

const allowedOrigins = ['https://products-three-xi.vercel.app', 'http://localhost:3000'];

function setCorsHeaders(response, origin) {
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  return response;
}

export async function POST(request) {
  const origin = request.headers.get('origin');

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return setCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  try {
    const body = await request.json();
    const searchTerm = body.searchTerm;

    if (!searchTerm) {
      return setCorsHeaders(NextResponse.json({ error: 'Search term is required' }, { status: 400 }), origin);
    }

    const scrapedProducts = await scrapeAliExpress(searchTerm);

    if (!Array.isArray(scrapedProducts)) {
      console.error('Unexpected scraper output:', scrapedProducts);
      return setCorsHeaders(NextResponse.json({ error: 'Unexpected scraper output' }, { status: 500 }), origin);
    }

    const response = NextResponse.json(scrapedProducts, { status: 200 });
    console.log("Backend is running");
    
    return setCorsHeaders(response, origin);
  } catch (error) {
    console.error('Search failed:', error);
    return setCorsHeaders(NextResponse.json({ error: 'Failed to search products', details: error.message }, { status: 500 }), origin);
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return setCorsHeaders(new NextResponse(null, { status: 204 }), origin);
}