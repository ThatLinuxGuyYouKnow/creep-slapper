---
doc: checklist
status: approved
---
# Build Checklist

Build mode: fast

## Slices

- [x] **1. Stacked page runs and a mock slap proves the whole path**
  Becomes usable: A running Vite React app with the stacked dump + context fields, STT/SLAP buttons, and a mock SLAP that renders keep / checklist / struck-through creeps with the CSS slap flourish.
  Why now: Bootstrapping lives inside slice one, and the unique kernel shows up immediately (even mocked) so every later slice has somewhere to land; the `/api/slap` stub also proves the Vercel functions wiring you flagged as least-sure.
  PRD ref: `prd.md > The Core Journey` (steps 1-6), `prd.md > Screens and Layout`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > File Structure`, `spec.md > Components` (SlapPage, SlapResult, api/slap.ts), `spec.md > Look and Feel`
  Build: Scaffold Vite + React + TS per spec file structure; build stacked SlapPage with DumpField, ContextField + status line, SlapButton, SlapResult with mock data; add `api/slap.ts` stub returning seeded keep/checklist/creeps; wire `lib/api.ts` to call it; apply light neo-brutalist CSS.
  Verify (mechanical): Run via `vercel dev` (fallback `npm run dev` + stub note); confirm no errors, paste dump + context, hit SLAP, confirm mock keep/checklist/struck creeps render.
  Learner check: Open the page, run a mock slap with your own words, and say whether the stacked layout and slap moment feel like you pictured.
  Commit: `Slice 1: stacked page with mock slap path`

- [x] **2. Real slap via DeepSeek with pasted context**
  Becomes usable: SLAP calls the real LLM through `/api/slap` and returns a genuine keep / checklist / creeps cut using the pasted dump + raw context.
  Why now: The kernel becomes real at the earliest point; the DeepSeek model + JSON shape is the biggest prompt risk and finding that out now is cheap, before adding more services.
  PRD ref: `prd.md > Slap + result`, `prd.md > States and Boundaries` (success, slap failure)
  Spec ref: `spec.md > Components` (api/slap.ts), `spec.md > External Services and Dependencies` (DeepSeek), `spec.md > Important Failure Modes` (slap fail)
  Build: Add `lib/prompt.ts` slap-prompt builder; implement `api/slap.ts` with server-only `DEEPSEEK_API_KEY`; parse/validate keep/checklist/creeps JSON; keep mock as fallback note; slap-fail warns with inputs intact and retry.
  Verify (mechanical): With keys in `.env`, slap a real over-scoped dump + raw context; confirm response has keep + checklist + creeps and renders; force a failure (bad key) and confirm warn + retry keeps inputs.
  Learner check: Slap one of your real hackathon brain dumps and say whether the cut feels ruthless in the right way.
  Commit: `Slice 2: real DeepSeek slap with pasted context`

- [ ] **3. Link context via Firecrawl with loader to tick**
  Becomes usable: Pasting a hackathon link fetches readable text through `/api/context`, showing loader then tick, and the slap uses it; bad links warn and proceed.
  Why now: Second external service after the kernel is real; the Firecrawl endpoint shape is the next risk, isolated in one slice.
  PRD ref: `prd.md > Context input + link fetch`, `prd.md > States and Boundaries` (empty context, bad link)
  Spec ref: `spec.md > Components` (ContextField + FetchStatus, api/context.ts), `spec.md > External Services and Dependencies` (Firecrawl)
  Build: Implement `api/context.ts` with server-only `FIRECRAWL_API_KEY`, HTML-to-text + ~8k truncation; wire loader → tick → warn states; feed fetched text into the slap call; empty-context warning stays.
  Verify (mechanical): Paste a real hackathon URL, confirm loader → tick and fetched text feeds the slap; paste a dead link and confirm warn + slap still proceeds.
  Learner check: Try your hackathon link plus raw text and say whether the context status is clear while waiting.
  Commit: `Slice 3: Firecrawl link context with status states`

- [ ] **4. Voice fill via Deepgram into the dump field**
  Becomes usable: Hold STT, speak, and words stream into the dump field; mic denial warns and typing still works.
  Why now: Last external service, independent of the kernel; the live-vs-chunk method gets verified here without disturbing the proven slap path.
  PRD ref: `prd.md > Dump input + Deepgram STT`
  Spec ref: `spec.md > Components` (DumpField + SttButton, api/stt.ts), `spec.md > External Services and Dependencies` (Deepgram), `spec.md > Decisions and Open Issues` (STT method verification)
  Build: Implement mic capture + `api/stt.ts` with server-only `DEEPGRAM_API_KEY` (verify live-vs-chunk against docs in this slice, fallback chunk-transcribe); stream/append words into dump field; handle mic-denied warn.
  Verify (mechanical): Dictate a short dump, confirm words appear in the field and survive editing; deny mic and confirm warn with typing unaffected.
  Learner check: Dictate part of a dump and type the rest, then say whether the mix feels smooth.
  Commit: `Slice 4: Deepgram voice fill for dump field`

- [ ] **5. Guards, polish, and deploy readiness**
  Becomes usable: Demo-ready PoC — all guards in place, light neo-brutalist finish, `.env.example` + README run/record instructions, deployed to Vercel.
  Why now: Needs every behavior in place to verify states end to end; nothing new is invented here.
  PRD ref: `prd.md > States and Boundaries`, `prd.md > What We're Building`, `prd.md > Non-Goals`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > What Was Simplified and Why`
  Build: Empty-dump block, empty-context warning, bad-link/slap-fail warns verified together; final CSS pass (thick borders, flat accents, big SLAP, CSS slap flourish); README with run + 1-min demo script; Vercel env vars + deploy.
  Verify (mechanical): Run the full PRD acceptance set (typed dump, STT mix, link + raw context, guards, slap success/fail); confirm Vercel build passes and env vars set.
  Learner check: Run the 1-minute demo end to end and note anything broken, confusing, or worth changing before final review.
  Commit: `Slice 5: guards, polish, and deploy readiness`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2 (real slap; feedback can shape context/voice slices)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

