// Vercel server function: POST {audio (base64), mimeType} -> Deepgram listen -> {text}.
// Key stays server-side in DEEPGRAM_API_KEY. Failures are 4xx/5xx JSON so the
// frontend can warn with typing unaffected (PRD: mic denied / STT fail).

const ENDPOINT = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true';
const MAX_BYTES = 5 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const audio = typeof req.body?.audio === 'string' ? req.body.audio : '';
  const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'audio/webm';
  let buf: Buffer;
  try {
    buf = Buffer.from(audio, 'base64');
  } catch {
    buf = Buffer.alloc(0);
  }
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    res.status(400).json({ error: 'No usable audio received.' });
    return;
  }
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Voice fill not configured (missing key).' });
    return;
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        Authorization: `Token ${key}`,
      },
      body: new Uint8Array(buf),
    });
    if (!upstream.ok) {
      res.status(502).json({ error: `Voice engine hiccup (upstream ${upstream.status}). Typing still works.` });
      return;
    }
    const data = await upstream.json();
    const text: unknown = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    res.status(200).json({ text: typeof text === 'string' ? text : '' });
  } catch {
    res.status(502).json({ error: 'Voice fill failed. Typing still works.' });
  }
}
