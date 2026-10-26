import type { SlapResult } from '../lib/api';

export default function SlapResult({ result }: { result: SlapResult }) {
  return (
    <section className="panel result slap-in">
      <h2 className="result-title">The slap has landed 👋</h2>

      <h3>✅ Keep</h3>
      <ul>
        {result.keep.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>

      <h3>☑️ MVP checklist</h3>
      <ul className="checklist">
        {result.checklist.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <h3>🫣 Creeps — slapped</h3>
      <ul className="creeps">
        {result.creeps.map((c) => (
          <li key={c}>
            <s>{c}</s>
          </li>
        ))}
      </ul>
    </section>
  );
}
