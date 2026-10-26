interface Props {
  value: string;
  onChange: (v: string) => void;
  onLoadDemo: () => void;
}

export default function DumpField({ value, onChange, onLoadDemo }: Props) {
  return (
    <section className="panel">
      <label className="label" htmlFor="dump">
        1 · Dump the giant idea
      </label>
      <textarea
        id="dump"
        className="field"
        rows={7}
        placeholder="Brain-dump the whole over-ambitious startup here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="row">
        <button className="btn btn-ghost" type="button" onClick={onLoadDemo}>
          🎲 Load demo creep
        </button>
        <button className="btn btn-ghost" type="button" disabled title="Voice fill lands in slice 4">
          🎙 STT (slice 5)
        </button>
      </div>
    </section>
  );
}
