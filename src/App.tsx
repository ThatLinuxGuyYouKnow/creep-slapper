import { useState } from 'react';
import DumpField from './components/DumpField';
import ContextField, { type FetchStatus } from './components/ContextField';
import SlapResult from './components/SlapResult';
import { slap, type SlapResult as SlapData } from './lib/api';

export default function App() {
  const [dump, setDump] = useState('');
  const [link, setLink] = useState('');
  const [contextText, setContextText] = useState('');
  const [fetchStatus] = useState<FetchStatus>('idle');
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<SlapData | null>(null);

  const canSlap = dump.trim().length > 0 && !working;

  async function handleSlap() {
    if (!canSlap) return;
    setWorking(true);
    try {
      setResult(await slap(dump, contextText));
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

      <DumpField value={dump} onChange={setDump} />

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

      {result && <SlapResult result={result} />}
    </main>
  );
}
