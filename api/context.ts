// Vercel server function: POST {url} -> Firecrawl -> readable markdown (~8k truncated).
// Key stays server-side in FIRECRAWL_API_KEY. Bad links are 422 JSON so the
// frontend can warn and proceed with pasted context (PRD: bad link).

const ENDPOINT = 'https://api.firecrawl.dev/v1/scrape';
const MAX_CHARS = 8000;

function clean(text: string): string {
  return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim().slice(0, MAX_CHARS);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'That link is not a valid URL.' });
    return;
  }
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Link fetch not configured (missing key).' });
    return;
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    });
    if (!upstream.ok) {
      res.status(422).json({ error: `Could not read that link (fetch ${upstream.status}).` });
      return;
    }
    const data = await upstream.json();
    const md =
      (typeof data?.data?.markdown === 'string' && data.data.markdown) ||
      (typeof data?.markdown === 'string' && data.markdown) ||
      '';
    if (!md.trim()) {
      res.status(422).json({ error: 'That link had no readable text.' });
      return;
    }
    res.status(200).json({ text: clean(md) });
  } catch {
    res.status(422).json({ error: 'Link fetch failed. Slap proceeds with pasted context.' });
  }
}
