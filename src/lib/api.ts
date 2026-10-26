export interface SlapResult {
  keep: string[];
  checklist: string[];
  creeps: string[];
}

/** Real path: POSTs to the server function, which holds the key.
 *  Throws on failure so the UI can warn with inputs intact + retry. */
export async function slap(
  dump: string,
  contextText: string,
): Promise<SlapResult> {
  let res: Response;
  try {
    res = await fetch('/api/slap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dump, contextText }),
    });
  } catch {
    throw new Error('Slap server unreachable. Is the API running? Retry?');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      body && typeof body.error === 'string' ? body.error : `Slap failed (${res.status}). Retry?`;
    throw new Error(msg);
  }
  return (await res.json()) as SlapResult;
}
