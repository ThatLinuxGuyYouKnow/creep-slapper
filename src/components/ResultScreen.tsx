import { useEffect, useRef, useState } from 'react';
import type { Creep, SlapResult } from '../lib/api';

interface Props {
  result: SlapResult;
  onRematch: () => void;
}

function toChecklistMarkdown(checklist: string[]): string {
  return checklist.map((c) => `- [ ] ${c}`).join('\n');
}

function CreepCard({ creep, index }: { creep: Creep; index: number }) {
  const [showWhy, setShowWhy] = useState(false);
  return (
    <li
      className={`creep-card ${index % 2 === 0 ? 'from-left' : 'from-right'}`}
      style={{ ['--d' as string]: `${0.3 + index * 0.22}s` }}
    >
      <span className="creep-hand" aria-hidden="true">
        👋
      </span>
      <div className="creep-body">
        <s>{creep.item}</s>
        {creep.why.trim() ? (
          <>
            <button
              className="btn-why"
              type="button"
              aria-expanded={showWhy}
              onClick={() => setShowWhy((v) => !v)}
            >
              {showWhy ? '▼ hide why' : 'ⓘ why?'}
            </button>
            {showWhy && (
              <p className="creep-why">
                <span className="why-tag">WHY SLAPPED · </span>
                {creep.why}
              </p>
            )}
          </>
        ) : null}
      </div>
      <span className="slap-stamp" aria-hidden="true">
        SLAPPED
      </span>
    </li>
  );
}

export default function ResultScreen({ result, onRematch }: Props) {
  const [copied, setCopied] = useState(false);
  const cutRef = useRef<HTMLElement>(null);

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

  // Auto-scroll down to the slapping so the animation is actually visible.
  // Cancelled the moment the user takes over the scroll.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const cancelOnKey = (e: KeyboardEvent) => {
      if ([' ', 'ArrowDown', 'PageDown', 'End'].includes(e.key)) cancelled = true;
    };
    window.addEventListener('wheel', cancel, { once: true, passive: true });
    window.addEventListener('touchmove', cancel, { once: true, passive: true });
    window.addEventListener('keydown', cancelOnKey);
    const t = window.setTimeout(() => {
      if (!cancelled) cutRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 650);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('keydown', cancelOnKey);
    };
  }, []);

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

        <section ref={cutRef} className="panel result-block block-cut cut-anchor">
          <div className="block-head">
            <h3>🫣 Creeps — slapped off</h3>
            <span className="badge">{result.creeps.length}</span>
          </div>
          <ul className="creeps creeps-stage">
            {result.creeps.map((c, i) => (
              <CreepCard key={`${c.item}-${i}`} creep={c} index={i} />
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
