import { useState } from 'react';
import DumpField from './components/DumpField';
import ContextField, { type FetchStatus } from './components/ContextField';
import SlapResult from './components/SlapResult';
import { slap, type SlapResult as SlapData } from './lib/api';
import { DEMO_SEEDS } from './lib/demo-seeds';

export default function App() {
  const [dump, setDump] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);
  const [link, setLink] = useState('');
  const [contextText, setContextText] = useState('');
  const [fetchStatus] = useState<FetchStatus>('idle');
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

  async function handleSlap() {
    if (!canSlap) return;
    setWorking(true);
    setError(null);
    try {
      setResult(await slap(dump, contextText));
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

      <DumpField value={dump} onChange={setDump} onLoadDemo={handleLoadDemo} />

      <ContextField
        link={link}
        text={contextText}
        status={fetchStatus}
        onLink={setLink}
        onText={setContextText}
      />

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
