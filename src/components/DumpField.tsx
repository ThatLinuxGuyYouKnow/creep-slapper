import { useRef, useState } from 'react';
import { transcribe } from '../lib/stt';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onLoadDemo: () => void;
  onDictated: (text: string) => void;
}

// Blobs smaller than this are header-only / accidental taps — not worth a server round-trip.
const MIN_BLOB_BYTES = 2000;

export default function DumpField({ value, onChange, onLoadDemo, onDictated }: Props) {
  const [talking, setTalking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sttWarn, setSttWarn] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const held = useRef(false);
  const busy = useRef(false);

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  // Single continuous blob per hold, transcribed once on release. The old
  // start(3000) interim chunks were headerless webm fragments that Deepgram
  // rejected with upstream 400 — and releasing mid-flight lost everything.
  async function startTalking() {
    if (busy.current || !supported) return;
    busy.current = true;
    setSttWarn(null);
    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      busy.current = false;
      setSttWarn('Mic blocked — typing still works.');
      return;
    }
    if (!held.current) {
      // Released before the mic warmed up: don't leave a zombie recording.
      mic.getTracks().forEach((t) => t.stop());
      busy.current = false;
      return;
    }
    stream.current = mic;
    chunks.current = [];
    const rec = new MediaRecorder(mic);
    recorder.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
      chunks.current = [];
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      if (blob.size < MIN_BLOB_BYTES) {
        setSttWarn("Didn't catch that — hold a beat longer, then release.");
        return;
      }
      setTranscribing(true);
      try {
        const text = await transcribe(blob);
        if (text.trim()) {
          setSttWarn(null);
          onDictated(text.trim());
        } else {
          setSttWarn("Didn't catch any words — try again, or just type.");
        }
      } catch (err) {
        setSttWarn(err instanceof Error ? err.message : 'Voice fill failed.');
      } finally {
        setTranscribing(false);
      }
    };
    rec.start();
    setTalking(true);
  }

  function stopTalking() {
    held.current = false;
    if (!busy.current) return;
    busy.current = false;
    setTalking(false);
    const rec = recorder.current;
    recorder.current = null;
    if (rec && rec.state !== 'inactive') {
      rec.stop(); // fires onstop -> transcribe, even though we've let go
    } else {
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    }
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
          onPointerDown={() => {
            held.current = true;
            startTalking();
          }}
          onPointerUp={stopTalking}
          onPointerLeave={stopTalking}
        >
          {talking ? '● Recording…' : transcribing ? '⏳ Transcribing…' : '🎙 Hold to talk'}
        </button>
      </div>
      {transcribing && <p className="status">⏳ Turning your words into text…</p>}
      {sttWarn && <p className="status status-warn">{sttWarn}</p>}
    </section>
  );
}
