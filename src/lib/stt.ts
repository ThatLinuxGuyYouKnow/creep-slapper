/** Sends a recorded audio chunk to the server function (key stays server-side).
 *  Throws with the server's message so the UI can warn with typing unaffected. */
export async function transcribe(blob: Blob): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read mic audio.'));
    reader.readAsDataURL(blob);
  });
  const audio = dataUrl.slice(dataUrl.indexOf(',') + 1);
  let res: Response;
  try {
    res = await fetch('/api/stt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio, mimeType: blob.type || 'audio/webm' }),
    });
  } catch {
    throw new Error('Voice server unreachable. Typing still works.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      body && typeof body.error === 'string' ? body.error : 'Voice fill failed. Typing still works.';
    throw new Error(msg);
  }
  const data = await res.json();
  return typeof data.text === 'string' ? data.text : '';
}
