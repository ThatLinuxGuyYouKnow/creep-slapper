// Vercel server function: POST {dump, contextText} -> DeepSeek -> {keep, checklist, creeps}.
// Key stays server-side in DEEPSEEK_API_KEY. Warn-and-retry contract: failures are
// 4xx/5xx JSON so the frontend can warn with inputs intact (PRD: slap failure).

// NOTE: prompt builder is inlined here (not imported from ../src/lib/prompt).
// Vercel compiles api/*.ts to /var/task/api/*.js as ESM, and an extensionless
// cross-directory import fails at runtime with ERR_MODULE_NOT_FOUND.
// Keeping api/ self-contained avoids that.
function buildSlapPrompt(dump: string, contextText: string): string {
  const context = contextText.trim()
    ? `HACKATHON CONTEXT (rules, prizes, judging — trim FOR this comp):\n${contextText.trim().slice(0, 8000)}`
    : 'HACKATHON CONTEXT: none provided. Cut blind, and say so in one line.';

  return `You are the Scope-Creep Slapper 9000: brutal, funny, demo-minded.
Someone pasted a wildly over-ambitious hackathon idea. Ruthlessly cut ~80% and return the bare-minimum MVP that can actually be demoed on time.

RULES:
- Keep what proves the core idea in a 1-minute demo. Cut everything else.
- Demo-minded: KEEP flashy UI/polish if it makes the demo land, even if it looks "unnecessary".
- Context-aware: use the hackathon context when present; ignore irrelevant ambition.
- Be blunt and funny in the wording, but keep every item short and shippable.

THE IDEA:
${dump.trim().slice(0, 4000)}

${context}

Return ONLY valid JSON, no markdown fences, exactly this shape:
{"keep": ["..."], "checklist": ["..."], "creeps": [{"item": "...", "why": "..."}]}
keep = what survives. checklist = ordered MVP steps to ship it. creeps = the slapped cuts, each with a one-line brutal funny "why" explaining why it kills the demo.`;
}

const ENDPOINT = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

interface Creep {
  item: string;
  why: string;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

/** New shape is {item, why} objects; legacy string[] still accepted. */
function normalizeCreeps(v: unknown): Creep[] | null {
  if (!Array.isArray(v)) return null;
  const out: Creep[] = [];
  for (const c of v) {
    if (typeof c === 'string') {
      if (c.trim()) out.push({ item: c, why: '' });
    } else if (c && typeof c === 'object') {
      const o = c as Record<string, unknown>;
      if (typeof o.item !== 'string' || !o.item.trim()) return null;
      out.push({ item: o.item, why: typeof o.why === 'string' ? o.why : '' });
    } else {
      return null;
    }
  }
  return out;
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
    const creeps = normalizeCreeps(parsed.creeps);
    if (!isStringArray(parsed.keep) || !isStringArray(parsed.checklist) || !creeps) {
      throw new Error('bad shape');
    }
    res.status(200).json({ keep: parsed.keep, checklist: parsed.checklist, creeps });
  } catch {
    res.status(502).json({ error: 'The slap missed — model output was unusable. Retry?' });
  }
}
