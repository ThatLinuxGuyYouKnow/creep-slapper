/** Fetches readable link text via the server function (key stays server-side).
 *  Throws with the server's message so the UI can warn and proceed. */
export async function fetchContext(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error('Link fetch unreachable. Slap proceeds with pasted context.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      body && typeof body.error === 'string'
        ? body.error + ' Slap proceeds with pasted context.'
        : 'Link fetch failed. Slap proceeds with pasted context.';
    throw new Error(msg);
  }
  const data = await res.json();
  return typeof data.text === 'string' ? data.text : '';
}
