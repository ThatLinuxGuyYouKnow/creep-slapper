export interface SlapResult {
  keep: string[];
  checklist: string[];
  creeps: string[];
}

/** Seeded mock so slice 1 proves the whole path before any LLM is wired. */
export const MOCK_SLAP: SlapResult = {
  keep: [
    'One paste box for the brain dump',
    'SLAP button that returns keep / checklist / creeps',
    'Result panel with struck-through cuts',
  ],
  checklist: [
    'Paste a dump and hit SLAP',
    'See keep, checklist, and creeps render',
    'Record the 1-minute demo',
  ],
  creeps: [
    'User accounts and login',
    'Realtime multi-user sync',
    'Full hackathon-site scraper with judging weights',
    'Native mobile apps for iOS and Android',
    'Blockchain-based slap ledger',
  ],
};

export async function slap(
  dump: string,
  contextText: string,
): Promise<SlapResult> {
  try {
    const res = await fetch('/api/slap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dump, contextText }),
    });
    if (!res.ok) throw new Error(`slap failed: ${res.status}`);
    return (await res.json()) as SlapResult;
  } catch {
    // No server function reachable (e.g. plain `npm run dev` in slice 1):
    // fall back to the seeded mock so the path stays demonstrable.
    // Slice 2 replaces this with the real DeepSeek call.
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_SLAP;
  }
}
