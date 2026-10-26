---
doc: prd
status: approved
---
# The Scope-Creep Slapper 9000 — Product Requirements

One line: Paste your over-ambitious hackathon brain dump, get slapped back to a demo-ready MVP — for hackers who over-scope.
Source: `scope.md > The Unique Kernel, The Core Loop, What "Working" Looks Like, The POC Boundary`.

## The Core Journey
1. Hacker opens the single neo-brutalist page — stacked dump field on top, context field below, STT + SLAP buttons.
2. They brain-dump the giant idea into the dump field (type or hold STT and speak — text streams into the field).
3. They add context: paste a hackathon link and/or raw text (rules, prizes, judging).
4. They hit SLAP! — sees progress ("fetching context from link…" if link involved, then slapping…).
5. They get back the slap: keep list, MVP checklist, and creeps struck out with a CSS slap flourish.
6. Success = 20-feature startup visibly crossed out to 3 shippable things in seconds — demoable in 1 minute.

## Screens and Layout
Single page, stacked top-to-bottom (learner chose stacked). No navigation, no accounts.
Order: header/title → dump field → STT button → context field (link + raw) with fetch status line (loader → tick) → big SLAP button → result panel below.

## Look and Feel
Neo-brutalist, light background with bright flat accent blocks, thick black borders, big SLAP button. Brutal-funny slapper tone in copy. Creeps displayed struck-through with a CSS slap flourish — explicitly not Three.js (cut as scope creep). No full design system; spec turns this into implementable styling.

## Features and Behavior

### Dump input + Deepgram STT
Type freely into the dump field. STT button streams speech-to-text into the same field as it arrives, so speaking and typing mix. A load-demo button fills the field with a seeded over-scoped idea for demos.
- [ ] Typed text stays editable in the dump field
- [ ] While speaking, streamed words appear in the dump field live
- [ ] Load-demo fills the dump field with a seeded over-scoped idea
- [ ] Empty dump + SLAP is blocked with a guard message

### Context input + link fetch
Context field accepts a hackathon/pitchathon link and/or raw pasted text. If a link is present, fetch its content and show status beside the field: loader while fetching, tick when done.
- [ ] Raw pasted context works with no link
- [ ] Link present shows "fetching context…" loader, then tick when done
- [ ] Bad/dead link warns but does not block — slap proceeds with what exists
- [ ] Empty context shows warning: cuts will be done w/o context, better results with context — still allows slap

### Slap + result
SLAP sends dump + context to the LLM and renders: keep list, MVP checklist, creeps struck out with CSS slap display.
- [ ] While slapping, progress state is visible (including link-fetch note when relevant)
- [ ] Result shows keep list + MVP checklist + struck-through creeps
- [ ] Slap failure warns (not a dead end) — user can retry with same inputs intact

## States and Boundaries
- **First use / empty** — both fields empty with prompts to dump + add context.
- **Empty dump** — SLAP blocked, guard message shown.
- **Empty context** — warning shown (better with context), slap still allowed.
- **Bad link** — warn and proceed with dump + any raw context.
- **Slap failure** — warn, keep inputs, allow retry.
- **Success** — keep/checklist/creeps rendered with CSS slap.
- **Persistence** — none; closing loses the slap (no history in PoC).

## Product Decisions
- Stacked layout — learner chose stacked for first-timer clarity.
- CSS slap flourish, not Three.js vines — learner cut 3D as ironic scope creep; flat animation holds the joke for PoC cost.
- Warn-not-block for bad link / slap fail / empty context — keeps demo moving; only empty dump blocks.
- Both link fetch and raw paste in — needed to prove context-aware kernel.
- Light accent neo-brutalist — learner: "light accent for sure."

## What We're Building
Single stacked page; dump field with typing + streaming STT fill; context field with link fetch (loader → tick) + raw paste; empty-dump guard + empty-context warning; SLAP with progress states; LLM cut to keep/checklist/struck creeps with CSS slap; warn-and-proceed errors.

## Deferred From the POC
- Slap history / saved slaps — implies storage/accounts; not needed to prove the cut.
- Shareable slap links — implies links/storage; out for demo simplicity.
- Deeper hackathon parsing (auto-extract rules/prizes/criteria) — implies scraper tuning; manual paste + basic fetch proves context-awareness.

## Possible Later Enhancements
- Export slap as markdown / copy checklist.
- Score cuts against judging criteria weights.

## Non-Goals
- Accounts / login — adds auth time, proves nothing about slapping.
- Multi-page app — single page proves kernel.
- Three.js animated vines — fun but PoC-costly; CSS holds the joke.
- Perfect link scraping — best-effort fetch + raw paste is enough.

## Open Questions
- LLM provider + key handling (OpenAI vs Anthropic, client vs server call) — for `4-spec`, blocks spec not PRD.
- Deepgram STT wiring (browser key vs server proxy, streaming method) — for `4-spec`.
- Link fetch path (client fetch vs server proxy to dodge CORS) — for `4-spec`.
