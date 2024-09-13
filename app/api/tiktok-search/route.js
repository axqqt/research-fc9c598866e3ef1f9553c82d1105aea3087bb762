import https from 'https';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  throw new Error('RAPIDAPI_KEY is missing');
}

export async function POST(request) {
  try {
    const { prompt, novids } = await request.json();
    if (!prompt || prompt.length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }
    
    // Validate `novids`
    if (!Number.isInteger(novids) || novids < 1 || novids > 10) {
      return new Response(JSON.stringify({ error: 'Number of videos should be between 1 and 10' }), { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(prompt);

    const options = {
      method: 'GET',
      hostname: 'download-videos-tiktok.p.rapidapi.com',
      path: `/searchvideo?keywords=${encodedPrompt}&count=${novids}&offset=0`,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'download-videos-tiktok.p.rapidapi.com'
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
          const data = JSON.parse(body.toString());

          if (res.statusCode !== 200) {
            console.error('API error:', data);
            resolve(new Response(JSON.stringify({ error: 'Failed to fetch data from the API' }), { status: res.statusCode }));
          } else {
            const videos = data?.videos || [];
            if (videos.length === 0) {
              resolve(new Response(JSON.stringify({ message: 'No videos found', videos: [] }), { status: 200 }));
            } else {
              resolve(new Response(JSON.stringify({ videos }), { status: 200 }));
            }
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error in /api/search:', error);
        reject(new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), { status: 500 }));
      });

      req.end();
    });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), { status: 500 });
  }
}