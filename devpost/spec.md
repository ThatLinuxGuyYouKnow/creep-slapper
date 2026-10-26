---
doc: spec
status: approved
---
# The Scope-Creep Slapper 9000 — Technical Spec

## How This Works, In Plain Language
A static Vite + React page talks to three tiny Vercel server functions that hold the secrets. You type or speak your giant idea, paste a hackathon link or raw context, and hit SLAP. The page sends both to `/api/slap` on the server. The server fetches readable page text via Firecrawl (if you gave a link), builds one slap prompt, asks DeepSeek to cut it to keep / checklist / creeps, and sends that back. The page renders keep + checklist + struck-through creeps with a CSS slap. Speaking works by sending mic audio to `/api/stt`, which asks Deepgram and returns words that stream into the dump box. No accounts, no database — close the tab and the slap is gone. We chose this shape because keys must stay server-side, and two tiny functions are cheaper than a whole backend for a 2–4 hour demo.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
1. User opens `/` → static Vite React app loads; empty dump + context fields (component state only).
2. User types or holds STT → browser captures audio → POSTs to `/api/stt` (or opens live socket per build check) → Deepgram returns words → frontend appends into dump field live.
3. User pastes link and/or raw text → if link, frontend POSTs `{url}` to `/api/context` → server calls Firecrawl → returns `{text}` (truncated ~8k chars) → UI shows loader then tick beside the field.
4. User hits SLAP → frontend POSTs `{dump, contextText}` to `/api/slap` → server builds prompt → POSTs to DeepSeek → returns `{keep[], checklist[], creeps[]}` → UI shows progress then result panel with CSS slap.
5. Guards: empty dump blocks client-side; empty context / bad link / slap fail warn and proceed or retry with inputs intact.

```
┌──────────────┐     ┌──────────────────┐     ┌───────────┬───────────┬───────────┐
│ Vite React   │────→│ Vercel /api/*    │────→│ DeepSeek  │ Deepgram  │ Firecrawl │
│ single page  │←────│ slap/context/stt │←────│ slap LLM  │ STT       │ link text │
└──────────────┘     └──────────────────┘     └───────────┴───────────┴───────────┘
```

## Stack
- Vite + React + TypeScript — learner chose Vite; accepted React+TS recommendation (components for fields/result states easier than vanilla DOM; tradeoff: slightly more setup). Docs: https://vite.dev, https://react.dev, https://www.typescriptlang.org
- Vercel serverless functions (`api/*.ts`, Node) — learner agreed server functions hold keys and dodge CORS (tradeoff: 2–3 tiny functions vs fastest all-client with exposed keys). Docs: https://vercel.com/docs/functions
- DeepSeek chat completions for the slap — learner chose DeepSeek. Docs: https://api-docs.deepseek.com
- Deepgram for STT — learner chose Deepgram. Docs: https://developers.deepgram.com
- Firecrawl for link → readable text — learner chose Firecrawl, key in env (tradeoff: third service/key + latency vs zero-key basic fetch). Docs: https://docs.firecrawl.dev
- Styling: plain CSS, neo-brutalist (thick borders, flat blocks) — no UI framework, keeps PoC light.
- Anything unverified: exact Deepgram live-vs-chunk method and Firecrawl scrape endpoint version to be verified in the first build step against the docs above.

## Where It Runs and How Someone Tries It
- Local dev: `npm install`, keys in `.env` (`DEEPSEEK_API_KEY`, `DEEPGRAM_API_KEY`, `FIRECRAWL_API_KEY` — already in env per learner, never exposed to browser), then `vercel dev` (runs frontend + `/api/*` together) or `npm run dev` for frontend only. Open the printed URL.
- Demo recording: open the single page, paste a big dump + hackathon link, show loader → tick, hit SLAP, show keep/checklist/struck creeps. Record 1–3 min.
- Submission needs the video + public GitHub repo. Deployment optional but chosen: Vercel (same repo). Deploy: push to GitHub, import in Vercel, add the three env vars, deploy. Learner can change this in `6-ship`.

## Look and Feel
From `prd.md > Look and Feel` + `scope.md > Inspiration & Identity`: light background, bright flat accent blocks, thick black borders, chunky header, big SLAP button, brutal-funny copy tone. Result panel: keep list + MVP checklist + creeps with strikethrough + short CSS slap flourish (scale/rotate snap, no Three.js). Stack constraint: plain CSS can honor all of this — no 3D, no design system needed.

## Components

### SlapPage (App)
Single stacked page: header, dump field, STT button, context field + fetch status line, SLAP button, result panel. Owns component state only.
PRD ref: `prd.md > Screens and Layout, Features and Behavior`.

### DumpField + SttButton
Editable textarea + mic button. Streams returned words into the textarea as they arrive; typing and speaking mix. Includes a load-demo button that fills the field from a seeded pool (demo aid, no service).
PRD ref: `prd.md > Dump input + Deepgram STT`.

### ContextField + FetchStatus
Link input + raw textarea + status line (idle / fetching loader / tick / warn). Calls `/api/context` when a link is present.
PRD ref: `prd.md > Context input + link fetch`.

### SlapButton + Progress
Sends dump + context to `/api/slap`; shows progress states including "fetching context…" when relevant; disabled on empty dump.
PRD ref: `prd.md > Slap + result`.

### SlapResult
Renders `{keep[], checklist[], creeps[]}` with struck-through creeps + CSS slap animation. Retry keeps inputs on failure.
PRD ref: `prd.md > Slap + result, States and Boundaries`.

### api/context.ts (server)
POST `{url}` → calls Firecrawl → returns `{text}` truncated ~8k chars. Never exposes the key.
PRD ref: `prd.md > Context input + link fetch`.

### api/slap.ts (server)
POST `{dump, contextText}` → builds slap prompt → calls DeepSeek → returns `{keep[], checklist[], creeps[]}`. Holds `DEEPSEEK_API_KEY`.
PRD ref: `prd.md > Slap + result`.

### api/stt.ts (server)
Audio in → Deepgram out → `{text}`. Exact live-vs-chunk shape verified in first build step; holds `DEEPGRAM_API_KEY`.
PRD ref: `prd.md > Dump input + Deepgram STT`.

## Data Model
No database, no persistence (per `prd.md > States and Boundaries`). All data lives in React component state: `dump: string`, `contextLink: string`, `contextText: string`, `fetchStatus: idle|fetching|done|warn`, `slapStatus: idle|working|done|error`, `result: {keep[], checklist[], creeps[]} | null`. Updated by typing, STT appends, fetch/slap responses. Leaving or closing the tab loses everything — by design for the PoC.

## File Structure
```
project/
├── api/
│   ├── slap.ts          # POST dump+context → DeepSeek → keep/checklist/creeps
│   ├── context.ts       # POST url → Firecrawl → readable text (~8k truncated)
│   └── stt.ts           # audio → Deepgram → text (live-vs-chunk verified in build)
├── src/
│   ├── App.tsx          # SlapPage: stacked layout + state
│   ├── components/
│   │   ├── DumpField.tsx    # textarea + STT button wiring
│   │   ├── ContextField.tsx # link/raw + loader→tick status
│   │   └── SlapResult.tsx   # keep/checklist/struck creeps + CSS slap
│   ├── lib/
│   │   ├── api.ts       # fetch wrappers for /api/*
│   │   ├── prompt.ts    # slap prompt builder (dump + context → prompt)
│   │   └── demo-seeds.ts # seeded over-scoped ideas for the load-demo button
│   ├── index.css        # neo-brutalist: light bg, thick borders, flat accents
│   └── main.tsx         # Vite entry
├── devpost/        # Devpost learning workspace
├── .env.example         # DEEPSEEK_API_KEY= / DEEPGRAM_API_KEY= / FIRECRAWL_API_KEY=
├── package.json
├── vite.config.ts
└── README.md            # how to run + record demo
```

## External Services and Dependencies
- **DeepSeek** — expected `POST https://api.deepseek.com/chat/completions`, Bearer `DEEPSEEK_API_KEY`, body `{model, messages:[{role, content}]}` with slap prompt, returns choices with keep/checklist/creeps JSON. Verify exact model name (e.g. `deepseek-chat`) + JSON mode in build. Docs: https://api-docs.deepseek.com
- **Deepgram** — STT for mic audio; key `DEEPGRAM_API_KEY` server-only. Exact path (live WebSocket via short-lived handshake vs MediaRecorder chunk → prerecorded endpoint) to verify against https://developers.deepgram.com in first build step; fallback is chunk-transcribe appending text on stop. Cost/rate: per account plan; PoC usage tiny.
- **Firecrawl** — link → markdown/text; key `FIRECRAWL_API_KEY` server-only in `api/context.ts`. Verify exact scrape endpoint version in build against https://docs.firecrawl.dev; truncate to ~8k chars. Fallback: warn and proceed with raw pasted context.
- **Vercel** — hosts static frontend + `api/*`; env vars set in dashboard + local `.env`. Docs: https://vercel.com/docs/functions

## Important Failure Modes
- **Bad/dead link or Firecrawl fail** → warn beside context field, slap proceeds with dump + raw context.
- **Slap fail (DeepSeek down/slow, bad key)** → warn in result panel, keep inputs, allow retry.
- **Mic denied / STT fail** → warn on the dump field, typing still works; never blocks SLAP if dump has text.

## What Was Simplified and Why
- **CSS slap flourish** instead of Three.js slapped vines — holds the joke at PoC cost; 3D would need a scene, assets, and perf work.
- **Truncated Firecrawl text (~8k)** instead of full-page extraction — keeps prompt small/fast; fuller parsing would need chunking/ranking.
- **No history, accounts, or share links** instead of saved slaps — storage/auth proves nothing about the cut.
- **Server functions** instead of direct browser API calls — keeps keys secret and dodges CORS; costs two tiny endpoints.

## Decisions and Open Issues
- Vite + React + TS (learner chose Vite; accepted React+TS for component states; tradeoff: small setup cost).
- Vercel `/api/*` for slap/context/stt (learner agreed; tradeoff: functions vs exposed keys).
- DeepSeek for slap + Deepgram for STT + Firecrawl for links (learner choices; keys already in env).
- Warn-not-block everywhere except empty dump (learner choice from PRD).
- Light-accent neo-brutalist, CSS slap (learner choices).
- Learner uncertainty clarified — **Vercel functions wiring**: browser never holds keys. Concrete shape: `fetch('/api/slap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dump,contextText})})` → `api/slap.ts` reads `process.env.DEEPSEEK_API_KEY`, calls DeepSeek, returns `res.status(200).json({keep,checklist,creeps})`. Locally `vercel dev` serves both frontend and `/api/*` on one origin; plain `npm run dev` serves frontend only. Clarified via this example; build step 1 will prove it with a hello check before any LLM call.
- Still to verify early in build (not blocking spec approval): exact DeepSeek model + JSON response shape; Deepgram live-vs-chunk method + SDK version; Firecrawl scrape endpoint version. Small investigation in build step 1 against the doc links above.
