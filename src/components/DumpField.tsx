import { useRef, useState } from 'react';
import { transcribe } from '../lib/stt';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onLoadDemo: () => void;
  onDictated: (text: string) => void;
}

export default function DumpField({ value, onChange, onLoadDemo, onDictated }: Props) {
  const [talking, setTalking] = useState(false);
  const [sttWarn, setSttWarn] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  async function startTalking() {
    if (talking || !supported) return;
    setSttWarn(null);
    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSttWarn('Mic blocked — typing still works.');
      return;
    }
    stream.current = mic;
    const rec = new MediaRecorder(mic);
    recorder.current = rec;
    rec.ondataavailable = async (e) => {
      if (e.data.size === 0) return;
      try {
        const text = await transcribe(e.data);
        if (text.trim()) onDictated(text.trim());
      } catch (err) {
        setSttWarn(err instanceof Error ? err.message : 'Voice fill failed.');
      }
    };
    rec.start(3000); // interim chunks every 3s: words stream in while talking
    setTalking(true);
  }

  function stopTalking() {
    recorder.current?.stop();
    recorder.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setTalking(false);
  }

  const len = value.trim().length;

  return (
    <section className="panel">
      <span className="step-tab">Step 01 · the dump</span>
      <div className="panel-head">
        <label className="label" htmlFor="dump">
          Dump the giant idea
        </label>
        <span className={`count${len === 0 ? '' : ''}`}>{len} chars</span>
      </div>
      <textarea
        id="dump"
        className="field"
        rows={7}
        placeholder="Brain-dump the whole over-ambitious startup here… features, platforms, AI, blockchain, world domination plans, all of it."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="row">
        <button className="btn btn-demo" type="button" onClick={onLoadDemo}>
          🎲 Load demo creep
        </button>
        <button
          className={`btn btn-talk${talking ? ' recording' : ''}`}
          type="button"
          disabled={!supported}
          title={supported ? 'Hold to talk, release to stop' : 'Mic not supported in this browser'}
          onPointerDown={startTalking}
          onPointerUp={stopTalking}
          onPointerLeave={() => {
            if (talking) stopTalking();
          }}
        >
          {talking ? '● Recording…' : '🎙 Hold to talk'}
        </button>
      </div>
      {sttWarn && <p className="status status-warn">{sttWarn}</p>}
    </section>
  );
}
