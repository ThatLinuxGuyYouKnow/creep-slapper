// Builds the slap prompt from the learner's dump + context.
// Pure function so the build harness and the server share it.

export function buildSlapPrompt(dump: string, contextText: string): string {
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
{"keep": ["..."], "checklist": ["..."], "creeps": ["..."]}
keep = what survives. checklist = ordered MVP steps to ship it. creeps = the slapped cuts.`;
}
