export interface Creep {
  item: string;
  why: string;
}

export interface SlapResult {
  keep: string[];
  checklist: string[];
  creeps: Creep[];
}

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** Normalizes creeps: new shape is {item, why} objects; legacy string[] still works. */
function normalizeCreeps(v: unknown): Creep[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((c): Creep[] => {
    if (typeof c === 'string') return c.trim() ? [{ item: c, why: '' }] : [];
    if (c && typeof c === 'object') {
      const o = c as { item?: unknown; why?: unknown };
      if (typeof o.item === 'string' && o.item.trim()) {
        return [{ item: o.item, why: typeof o.why === 'string' ? o.why : '' }];
      }
    }
    return [];
  });
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
  const data = (await res.json()) as { keep?: unknown; checklist?: unknown; creeps?: unknown };
  return {
    keep: stringList(data.keep),
    checklist: stringList(data.checklist),
    creeps: normalizeCreeps(data.creeps),
  };
}
