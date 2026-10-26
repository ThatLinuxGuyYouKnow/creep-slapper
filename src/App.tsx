import { useState } from 'react';
import DumpField from './components/DumpField';
import ContextField, { type FetchStatus } from './components/ContextField';
import SlapResult from './components/SlapResult';
import { slap, type SlapResult as SlapData } from './lib/api';
import { fetchContext } from './lib/context';
import { DEMO_SEEDS } from './lib/demo-seeds';

export default function App() {
  const [dump, setDump] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);
  const [link, setLink] = useState('');
  const [contextText, setContextText] = useState('');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetched, setFetched] = useState<{ url: string; text: string } | null>(null);
  const [contextWarn, setContextWarn] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SlapData | null>(null);

  const canSlap = dump.trim().length > 0 && !working;

  function handleLoadDemo() {
    setDump(DEMO_SEEDS[demoIndex % DEMO_SEEDS.length]);
    setDemoIndex((i) => i + 1);
    setResult(null);
    setError(null);
  }

  function handleDictated(text: string) {
    setDump((d) => (d.endsWith(' ') || d === '' ? d : d + ' ') + text + ' ');
  }

  /** Eager link fetch on blur: loader -> tick, cached for the slap. */
  async function handleLinkBlur() {
    const url = link.trim();
    if (!url || fetched?.url === url) return;
    setFetchStatus('fetching');
    setContextWarn(null);
    try {
      const text = await fetchContext(url);
      setFetched({ url, text });
      setFetchStatus('done');
    } catch (e) {
      setFetched(null);
      setFetchStatus('warn');
      setContextWarn(e instanceof Error ? e.message : 'Link fetch failed.');
    }
  }

  async function handleSlap() {
    if (!canSlap) return;
    setWorking(true);
    setError(null);
    try {
      let linkText = fetched?.url === link.trim() ? (fetched?.text ?? '') : '';
      if (link.trim() && linkText === '') {
        // Link added/changed since last fetch: refresh now, warn-and-proceed on failure.
        setFetchStatus('fetching');
        try {
          linkText = await fetchContext(link.trim());
          setFetched({ url: link.trim(), text: linkText });
          setFetchStatus('done');
        } catch (e) {
          setFetched(null);
          setFetchStatus('warn');
          setContextWarn(e instanceof Error ? e.message : 'Link fetch failed.');
        }
      }
      const combined = [contextText.trim(), linkText.trim()]
        .filter(Boolean)
        .join('\n\n--- LINK CONTEXT ---\n');
      if (!combined) {
        setContextWarn('No context — cuts will be done without it. Better results with context.');
      }
      setResult(await slap(dump, combined));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The slap missed. Retry?');
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>
          Scope-Creep <span className="slap-word">Slapper</span> 9000
        </h1>
        <p>Paste the over-ambitious startup. Get slapped back to a shippable MVP.</p>
      </header>

      <DumpField value={dump} onChange={setDump} onLoadDemo={handleLoadDemo} onDictated={handleDictated} />

      <ContextField
        link={link}
        text={contextText}
        status={fetchStatus}
        onLink={(v) => {
          setLink(v);
          if (!v.trim()) {
            setFetchStatus('idle');
            setFetched(null);
          }
        }}
        onText={setContextText}
        onLinkBlur={handleLinkBlur}
      />
      {contextWarn && <p className="status status-warn">{contextWarn}</p>}

      <button className="btn btn-slap" type="button" disabled={!canSlap} onClick={handleSlap}>
        {working ? 'Slapping…' : '👋 SLAP!'}
      </button>
      {!dump.trim() && <p className="hint">Dump can’t be empty — give me the giant idea first.</p>}

      {error && (
        <p className="panel error" role="alert">
          ⚠ {error}
        </p>
      )}

      {result && <SlapResult result={result} />}
    </main>
  );
}
