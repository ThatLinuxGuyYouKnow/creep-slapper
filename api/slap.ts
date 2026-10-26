// Vercel server function: POST {dump, contextText} -> DeepSeek -> {keep, checklist, creeps}.
// Key stays server-side in DEEPSEEK_API_KEY. Warn-and-retry contract: failures are
// 4xx/5xx JSON so the frontend can warn with inputs intact (PRD: slap failure).

import { buildSlapPrompt } from '../src/lib/prompt';

const ENDPOINT = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse((fenced ? fenced[1] : text).trim());
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const dump = typeof req.body?.dump === 'string' ? req.body.dump : '';
  const contextText = typeof req.body?.contextText === 'string' ? req.body.contextText : '';
  if (!dump.trim()) {
    res.status(400).json({ error: 'Dump is empty — nothing to slap.' });
    return;
  }
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Slap engine not configured (missing key).' });
    return;
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildSlapPrompt(dump, contextText) }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
    if (!upstream.ok) {
      res.status(502).json({ error: `Slap engine hiccup (upstream ${upstream.status}). Retry?` });
      return;
    }
    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('no content');
    const parsed = extractJson(content) as { keep?: unknown; checklist?: unknown; creeps?: unknown };
    if (!isStringArray(parsed.keep) || !isStringArray(parsed.checklist) || !isStringArray(parsed.creeps)) {
      throw new Error('bad shape');
    }
    res.status(200).json({ keep: parsed.keep, checklist: parsed.checklist, creeps: parsed.creeps });
  } catch {
    res.status(502).json({ error: 'The slap missed — model output was unusable. Retry?' });
  }
}
