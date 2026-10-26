import { useState } from 'react';
import DumpField from './components/DumpField';
import ContextField, { type FetchStatus } from './components/ContextField';
import ResultScreen from './components/ResultScreen';
import { slap, type SlapResult as SlapData } from './lib/api';
import { fetchContext } from './lib/context';
import { DEMO_SEEDS } from './lib/demo-seeds';

const TICKER = 'cut the creep ✕ ship the mvp ✕ demo in 48 hours ✕ '.repeat(4);

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
  const [screen, setScreen] = useState<'form' | 'verdict'>('form');

  const canSlap = dump.trim().length > 0 && !working;

  function handleLoadDemo() {
    setDump(DEMO_SEEDS[demoIndex % DEMO_SEEDS.length]);
    setDemoIndex((i) => i + 1);
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
      const data = await slap(dump, combined);
      setResult(data);
      setScreen('verdict');
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The slap missed. Retry?');
    } finally {
      setWorking(false);
    }
  }

  function handleRematch() {
    // Fresh screen back to the form — inputs stay intact so retry/edit is cheap.
    setScreen('form');
    setError(null);
    window.scrollTo({ top: 0 });
  }

  if (screen === 'verdict' && result) {
    return (
      <>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            <span>{TICKER}</span>
            <span>{TICKER}</span>
          </div>
        </div>
        <ResultScreen result={result} onRematch={handleRematch} />
      </>
    );
  }

  return (
    <>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>{TICKER}</span>
          <span>{TICKER}</span>
        </div>
      </div>
      <main className="page">
        <header className="hero">
          <div className="hero-badge">★ 9000 ★ brutal mvp cuts</div>
          <div className="hero-top">
            <div className="hero-hand" aria-hidden="true">
              👋
            </div>
            <h1>
              Scope-Creep <span className="slap-word">Slapper</span> 9000
            </h1>
          </div>
          <p className="lede">
            Paste the over-ambitious idea. Get slapped back to something you can actually demo.
          </p>
          <div className="hero-stats">
            <span className="stat">✂ cuts ~80%</span>
            <span className="stat">☑ shippable checklist</span>
            <span className="stat">⏱ 1-min demo</span>
          </div>
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

        <div className="slap-wrap">
          <button className="btn btn-slap" type="button" disabled={!canSlap} onClick={handleSlap}>
            <span className="slap-hand" aria-hidden="true">
              👋
            </span>
            {working ? <span className="working-dots">Slapping</span> : 'SLAP IT!'}
          </button>
          {!dump.trim() && <p className="hint">↓ dump the giant idea above first — then slap</p>}
        </div>

        {error && (
          <p className="panel error" role="alert">
            ⚠ {error}
          </p>
        )}

        {result && (
          <button className="btn btn-ghost" type="button" onClick={() => setScreen('verdict')}>
            → Back to last verdict
          </button>
        )}

        <footer className="footer">
          <span>scope-creep slapper 9000</span>
          <span>keep the demo · cut the rest</span>
        </footer>
      </main>
    </>
  );
}
