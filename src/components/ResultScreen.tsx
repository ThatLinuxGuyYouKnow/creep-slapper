import { useEffect, useState } from 'react';
import type { SlapResult } from '../lib/api';

interface Props {
  result: SlapResult;
  onRematch: () => void;
}

function toChecklistMarkdown(checklist: string[]): string {
  return checklist.map((c) => `- [ ] ${c}`).join('\n');
}

export default function ResultScreen({ result, onRematch }: Props) {
  const [copied, setCopied] = useState(false);

  // Impact shake: thump the whole stage each time a creep lands.
  // Synced to each card's --d stagger + flight time (~275ms into its 0.5s arc).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: number[] = [];
    result.creeps.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          const stage = document.querySelector('.stage');
          if (!(stage instanceof HTMLElement)) return;
          stage.classList.remove('impact');
          void stage.offsetWidth; // reflow so the animation re-triggers
          stage.classList.add('impact');
        }, 575 + i * 220),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [result]);

  async function handleCopy() {
    const text = toChecklistMarkdown(result.checklist);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked (non-secure context / permissions): fallback.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="stage">
      <main className="page stage-page">
        <div className="stage-nav">
          <button className="btn btn-ghost" type="button" onClick={onRematch}>
            ← New slap
          </button>
          <span className="stat stat-dark">verdict is in</span>
        </div>

        <header className="verdict-hero pop" style={{ ['--d' as string]: '0s' }}>
          <div className="verdict-slap" aria-hidden="true">
            SLAPPED!
          </div>
          <h2 className="verdict-title">The creep got slapped</h2>
          <p className="verdict-sub">
            {result.keep.length} keep · {result.checklist.length} to ship · {result.creeps.length}{' '}
            slapped off the board
          </p>
        </header>

        <section className="panel result-block block-keep pop" style={{ ['--d' as string]: '0.15s' }}>
          <div className="block-head">
            <h3>✅ Keep — the core</h3>
            <span className="badge">{result.keep.length}</span>
          </div>
          <ul className="keep-list">
            {result.keep.map((k, i) => (
              <li key={k} className="pop-item" style={{ ['--d' as string]: `${0.25 + i * 0.12}s` }}>
                {k}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel result-block block-ship pop" style={{ ['--d' as string]: '0.3s' }}>
          <div className="block-head block-head-split">
            <div className="block-head-left">
              <h3>☑️ Ship checklist</h3>
              <span className="badge">{result.checklist.length}</span>
            </div>
            <button className="btn btn-copy" type="button" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '⧉ Copy checklist'}
            </button>
          </div>
          <ul className="checklist">
            {result.checklist.map((c, i) => (
              <li key={c} className="pop-item" style={{ ['--d' as string]: `${0.4 + i * 0.12}s` }}>
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel result-block block-cut">
          <div className="block-head">
            <h3>🫣 Creeps — slapped off</h3>
            <span className="badge">{result.creeps.length}</span>
          </div>
          <ul className="creeps creeps-stage">
            {result.creeps.map((c, i) => (
              <li
                key={c}
                className={`creep-card ${i % 2 === 0 ? 'from-left' : 'from-right'}`}
                style={{ ['--d' as string]: `${0.3 + i * 0.22}s` }}
              >
                <span className="creep-hand" aria-hidden="true">
                  👋
                </span>
                <s>{c}</s>
                <span className="slap-stamp" aria-hidden="true">
                  SLAPPED
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="stage-actions">
          <button className="btn btn-demo" type="button" onClick={handleCopy}>
            {copied ? '✓ Checklist copied' : '⧉ Copy checklist'}
          </button>
          <button className="btn btn-slap btn-again" type="button" onClick={onRematch}>
            Slap another idea →
          </button>
        </div>
      </main>
    </div>
  );
}
