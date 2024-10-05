"use server";

import https from 'https';

export async function GET(req) {
  // Destructure the keywords and cursor from the query string
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get('keywords');
  const cursor = searchParams.get('cursor') || 0;

  // Handle the case where keywords are missing
  if (!keywords) {
    return new Response(JSON.stringify({ error: 'Keywords are required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Define the options for the https request
  const options = {
    method: 'GET',
    hostname: 'tiktok-scraper-full.p.rapidapi.com',
    port: null,
    path: `/api/feed/search?sort_type=0&cursor=${cursor}&count=10&publish_time=0&keywords=${encodeURIComponent(keywords)}&region=us`,
    headers: {
      'x-rapidapi-key': process.env.RAPIDKEYTIKTOKTWO,
      'x-rapidapi-host': 'tiktok-scraper-full.p.rapidapi.com',
    },
  };

  try {
    // Create a promise to handle the https request
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          resolve(body.toString());
        });
      });

      req.on('error', reject);
      req.end();
    });

    // Return the response as JSON
    return new Response(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Return an error response in case of failure
    return new Response(JSON.stringify({ error: 'An error occurred while fetching data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
