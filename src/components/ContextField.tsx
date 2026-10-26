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
  idle: 'Link fetch lands in slice 3 — raw paste works today.',
  fetching: 'Fetching context from link…',
  done: '✓ Context fetched.',
  warn: '⚠ Link failed — slap proceeds with what you pasted.',
};

export default function ContextField({ link, text, status, onLink, onText, onLinkBlur }: Props) {
  return (
    <section className="panel">
      <label className="label" htmlFor="context-link">
        2 · Add the context
      </label>
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
      <p className={`status status-${status}`}>{STATUS_COPY[status]}</p>
    </section>
  );
}
