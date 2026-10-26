export type FetchStatus = 'idle' | 'fetching' | 'done' | 'warn';

interface Props {
  link: string;
  text: string;
  status: FetchStatus;
  onLink: (v: string) => void;
  onText: (v: string) => void;
  onLinkBlur: () => void;
}

const STATUS_COPY: Record<FetchStatus, string> = {
  idle: 'Paste rules / prizes / judging — or drop a link.',
  fetching: '⏳ Fetching context from link…',
  done: '✓ Context fetched — slap will use it.',
  warn: '⚠ Link failed — slap proceeds with what you pasted.',
};

export default function ContextField({ link, text, status, onLink, onText, onLinkBlur }: Props) {
  return (
    <section className="panel">
      <span className="step-tab tab-2">Step 02 · the rules</span>
      <div className="panel-head">
        <label className="label" htmlFor="context-link">
          Add the context
        </label>
        <span className={`pill pill-${status}`}>
          <span className={`status status-${status}`}>{STATUS_COPY[status]}</span>
        </span>
      </div>
      <input
        id="context-link"
        className="field"
        type="url"
        placeholder="Hackathon / pitchathon link (optional)"
        value={link}
        onChange={(e) => onLink(e.target.value)}
        onBlur={onLinkBlur}
      />
      <textarea
        id="context-text"
        className="field"
        rows={4}
        placeholder="…or paste rules, prizes, judging criteria as raw text"
        value={text}
        onChange={(e) => onText(e.target.value)}
      />
    </section>
  );
}
