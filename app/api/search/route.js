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
    const { searchTerm } = await request.json();
    if (!searchTerm) {
      return setCorsHeaders(NextResponse.json({ error: 'Search term is required' }, { status: 400 }));
    }

    const scrapedProducts = await scrapeAliExpress(searchTerm);
    // const analyzedProducts = await analyzeProducts(scrapedProducts);
    // const topProducts = analyzedProducts.slice(0, 15); // Get top 15 products

    const response = NextResponse.json(scrapedProducts, { status: 200 });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Search failed:', error);
    return setCorsHeaders(NextResponse.json({ error: 'Failed to search products' }, { status: 500 }));
  }
}

// Handle preflight requests (OPTIONS)
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}