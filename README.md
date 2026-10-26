# Scope-Creep Slapper 9000

Paste your wildly over-ambitious hackathon idea. Get slapped back to a shippable MVP.

Built for the [Build With AI: Basics](https://learn-ai-basics.devpost.com) hackathon. One page: dump the giant idea, add context (hackathon link and/or raw text, or dictate via mic), hit **SLAP** — back comes a keep list, an MVP checklist, and your creeps struck through.

## Quickstart

```bash
npm install
cp .env.example .env   # then fill in real keys (never commit .env)
```

| Var | Used by | Get it at |
| --- | ------- | --------- |
| `DEEPSEEK_API_KEY` | `api/slap.ts` — the cut | DeepSeek platform |
| `DEEPGRAM_API_KEY` | `api/stt.ts` — voice fill (slice 5) | Deepgram console |
| `FIRECRAWL_API_KEY` | `api/context.ts` — link fetch | Firecrawl dashboard |

```bash
npm run dev        # frontend only (slap shows the warn path: no /api here)
npx vercel dev     # full local path: frontend + /api/* together (recommended)
```

## 1-minute demo script

1. Hit **🎲 Load demo creep** — a gloriously over-scoped idea fills the box.
2. Paste a hackathon link, watch loader → tick as context lands.
3. Hit **👋 SLAP!** — keep list, MVP checklist, and struck-through creeps.
4. (Optional) dictate half a dump via mic; type the rest.

## Deploy (Vercel)

```bash
git push origin main   # then: Vercel dashboard → import repo
```

Add the three env vars above in the Vercel project settings and deploy. Submission still needs the demo video + public repo — deployment is a bonus, not a substitute.

## What it is / isn't (PoC boundary)

- Single page, no accounts, no saved history — close the tab and the slap is gone.
- Bad links, empty context, and slap failures warn and let you retry with inputs intact. Only an empty dump blocks.
- CSS slap flourish, not 3D — the joke holds at PoC cost.
