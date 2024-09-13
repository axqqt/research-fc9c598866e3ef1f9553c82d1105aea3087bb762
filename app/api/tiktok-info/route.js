"use server"

import { tiktokdl } from '@bochilteam/scraper-tiktok';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      const data = await tiktokdl(url);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching TikTok info' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}