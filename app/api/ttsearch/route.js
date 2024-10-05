// "use server"


// import https from 'https';

// export async function GET(req, res) {
//   const { keywords, cursor = 0 } = req.query;

//   if (!keywords) {
//     return res.status(400).json({ error: 'Keywords are required' });
//   }

//   const options = {
//     method: 'GET',
//     hostname: 'tiktok-scraper-full.p.rapidapi.com',
//     port: null,
//     path: `/api/feed/search?sort_type=0&cursor=${cursor}&count=10&publish_time=0&keywords=${encodeURIComponent(keywords)}&region=us`,
//     headers: {
//       'x-rapidapi-key': process.env.RAPIDKEYTIKTOKTWO,
//       'x-rapidapi-host': 'tiktok-scraper-full.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = await new Promise((resolve, reject) => {
//       const req = https.request(options, function (res) {
//         const chunks = [];

//         res.on('data', function (chunk) {
//           chunks.push(chunk);
//         });

//         res.on('end', function () {
//           const body = Buffer.concat(chunks);
//           resolve(body.toString());
//         });
//       });

//       req.on('error', reject);
//       req.end();
//     });

//     res.status(200).json(JSON.parse(response));
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while fetching data' });
//   }
// }