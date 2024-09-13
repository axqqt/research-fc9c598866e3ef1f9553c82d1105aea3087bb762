import https from 'https';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  throw new Error('RAPIDAPI_KEY is missing');
}

export async function POST(request) {
  try {
    const { video_url } = await request.json();
    if (!video_url || video_url.length === 0) {
      return new Response(JSON.stringify({ error: 'TikTok video URL is required' }), { status: 400 });
    }

    const encodedUrl = encodeURIComponent(video_url);

    const options = {
      method: 'GET',
      hostname: 'tiktok-scraper2.p.rapidapi.com',
      path: `/video/no_watermark?video_url=${encodedUrl}`,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'tiktok-scraper2.p.rapidapi.com'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          const rawResponse = body.toString();
          console.log('Raw API response:', rawResponse); // Log the raw response

          let data;
          try {
            data = JSON.parse(rawResponse);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Raw response causing the error:', rawResponse);
            resolve(new Response(JSON.stringify({ 
              error: 'Failed to parse API response',
              details: error.message,
              rawResponse: rawResponse
            }), { status: 500 }));
            return;
          }

          if (res.statusCode !== 200) {
            console.error('API error:', data);
            resolve(new Response(JSON.stringify({ 
              error: 'Failed to fetch data from the API',
              statusCode: res.statusCode,
              data: data
            }), { status: res.statusCode }));
          } else {
            resolve(new Response(JSON.stringify(data), { status: 200 }));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error in API request:', error);
        reject(new Response(JSON.stringify({ 
          error: 'An error occurred during the API request',
          details: error.message
        }), { status: 500 }));
      });

      req.end();
    });
  } catch (error) {
    console.error('Error in /api/tiktok-scraper:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred in the request handler',
      details: error.message
    }), { status: 500 });
  }
}