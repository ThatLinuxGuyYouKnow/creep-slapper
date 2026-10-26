<p align="center">
  <img src="public/slap.svg" width="96" alt="Scope-Creep Slapper 9000 logo" />
</p>

<h1 align="center">Scope-Creep Slapper 9000</h1>

<p align="center"><strong>Paste the over-ambitious hackathon idea. Get slapped back to a shippable MVP.</strong></p>

<p align="center">Neo-brutalist AI judge that cuts ~80% of your scope — then slaps each cut off the board, one by one.</p>

Built for the [Build With AI: Basics](https://learn-ai-basics.devpost.com) hackathon.

## How it works

1. **Dump the giant idea** — brain-dump the whole over-scoped startup, hit **🎲 Load demo creep** for a seeded one, or **🎙 hold to talk** and dictate (single-blob recording, transcribed on release).
2. **Add the context** — paste a hackathon link (auto-fetched on blur, loader → tick) and/or raw rules, prizes, judging criteria.
3. **Hit 👋 SLAP IT!** — the verdict lands on its own stage: a **keep list**, an ordered **ship checklist** (one-click Markdown copy), and the **creeps flying in left-right, slapped with a hand swing, screen shake, and strikethrough**. Each cut carries a **ⓘ why** button explaining the execution.

Failures never eat your inputs: bad links, empty context, and slap misses all warn and let you retry with everything intact. Only an empty dump blocks the slap.

## Quickstart

```bash
npm install
cp .env.example .env   # then fill in real keys (never commit .env)
```

| Var | Used by | Get it at |
| --- | ------- | --------- |
| `DEEPSEEK_API_KEY` | `api/slap.ts` — the cut + why rationales | DeepSeek platform |
| `DEEPGRAM_API_KEY` | `api/stt.ts` — voice fill | Deepgram console |
| `FIRECRAWL_API_KEY` | `api/context.ts` — link fetch | Firecrawl dashboard |

```bash
npm run dev        # frontend only (slap shows the warn path: no /api here)
npx vercel dev     # full local path: frontend + /api/* together (recommended)
```

## 1-minute demo script

1. Hit **🎲 Load demo creep** — a gloriously over-scoped idea fills the box.
2. Paste a hackathon link, watch loader → tick as context lands.
3. Hit **👋 SLAP IT!** — the verdict stage pops, creeps get slapped off alternating left-right.
4. Hit **⧉ Copy checklist**, then expand a **ⓘ why** to show the judge's reasoning.
5. (Optional) hold-to-talk half a dump, type the rest.

## Deploy (Vercel)

```bash
git push origin main   # then: Vercel dashboard → import repo
```

Add the three env vars above in the Vercel project settings and deploy. Submission still needs the demo video + public repo — deployment is a bonus, not a substitute.

> Note: `api/` is kept self-contained (no cross-directory imports) — Vercel compiles `api/*.ts` to ESM at runtime, where extensionless `../src/...` imports fail with `ERR_MODULE_NOT_FOUND`.

## Project map

| Path | What lives there |
| ---- | ---------------- |
| `api/slap.ts` | DeepSeek verdict: keep / checklist / creeps + why |
| `api/stt.ts` | Deepgram transcription, key server-side |
| `api/context.ts` | Firecrawl link → readable markdown |
| `src/components/ResultScreen.tsx` | Verdict stage: choreography, copy, why toggles |
| `src/components/DumpField.tsx` | Idea box + demo seeds + hold-to-talk |
| `src/components/ContextField.tsx` | Link + pasted context + fetch status |

## What it is / isn't (PoC boundary)

- No accounts, no saved history — close the tab and the slap is gone. The verdict is a view state, not a route.
- Warn-and-retry everywhere: only an empty dump blocks.
- CSS choreography, not 3D — the joke holds at PoC cost.
- Reduced-motion users get the full verdict with none of the shaking.
