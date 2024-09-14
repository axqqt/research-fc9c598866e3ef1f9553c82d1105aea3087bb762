// pages/api/search.js (or appropriate file path)
"use server"
import { scrapeAliExpress } from '@/lib/scraper';
import { NextResponse } from 'next/server';

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
    let searchTerm;
    try {
      const jsonBody = JSON.parse(body);
      searchTerm = jsonBody.searchTerm;
    } catch (parseError) {
      console.error('Failed to parse request body:', body);
      return setCorsHeaders(NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }));
    }

    if (!searchTerm) {
      return setCorsHeaders(NextResponse.json({ error: 'Search term is required' }, { status: 400 }));
    }

    const scrapedProducts = await scrapeAliExpress(searchTerm);

    if (!Array.isArray(scrapedProducts)) {
      console.error('Unexpected scraper output:', scrapedProducts);
      return setCorsHeaders(NextResponse.json({ error: 'Unexpected scraper output' }, { status: 500 }));
    }

    const response = NextResponse.json(scrapedProducts, { status: 200 });
    console.log("Backend is running");
    
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Search failed:', error);
    return setCorsHeaders(NextResponse.json({ error: 'Failed to search products', details: error.message }, { status: 500 }));
  }
}

// Handle preflight requests (OPTIONS)
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}