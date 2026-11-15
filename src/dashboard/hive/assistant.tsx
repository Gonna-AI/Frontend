import { ArrowLeft, Plus, Send, Sparkles } from 'lucide-react-dash';
import { useEffect, useRef, useState } from 'react';

import { CitationChip, Note, PageCard, usePhone } from './common';
import { useHive } from './store';

const MAX = 8000;
const SUGGESTIONS = ['Why did CNC-07 raise an alarm at 3:45 PM?', 'Which parts do we have for the CNC-07 bearing?', 'What does the manual say about bearing service?'];

export function AssistantView() {
  const { data, newThread, sendMessage, runningThread, draftFromAnswer, notify } = useHive();
  const phone = usePhone();
  const [active, setActive] = useState<string | null>(phone ? null : data.threads[0]?.id ?? null);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const thread = data.threads.find((t) => t.id === active) ?? null;
  const running = runningThread === active;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages.length, running]);

  const send = (value: string) => {
    const v = value.trim().slice(0, MAX);
    if (!v || running) return;
    let id = active;
    if (!id) {
      id = newThread('CNC-07');
      setActive(id);
    }
    sendMessage(id, v);
    setText('');
  };

  const list = (
    <div className="hd-threads">
      <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => { const id = newThread('CNC-07'); setActive(id); }}>
        <Plus size={14} /> New conversation
      </button>
      {data.threads.map((t) => (
        <button key={t.id} type="button" className={`hd-thread${t.id === active ? ' is-on' : ''}`} onClick={() => setActive(t.id)}>
          <b>{t.title}</b>
          <small>
            {t.context} · {t.at}
          </small>
        </button>
      ))}
    </div>
  );

  const conversation = (
    <div className="hd-conv">
      {phone && (
        <button type="button" className="hd-back" onClick={() => setActive(null)}>
          <ArrowLeft size={14} /> Conversations
        </button>
      )}
      <div className="hd-msgs" aria-live="polite">
        <p className="hd-disclosure">
          <Sparkles size={13} /> You are talking to an AI assistant. Answers cite their sources; check them before acting. (Placeholder: answers are scripted until the assistant API is connected.)
        </p>
        {thread?.messages.length === 0 && (
          <div className="hd-suggest">
            <small className="hd-muted">Try asking</small>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="hd-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        {thread?.messages.map((m) => (
          <div key={m.id} className={`hd-msg is-${m.from}`}>
            {m.from === 'assistant' && <span className="hd-ai-label">AI-generated</span>}
            <p>{m.text}</p>
            {m.abstained && <small className="hd-muted">No supporting sources found.</small>}
            {m.citations && (
              <div className="hd-cites">
                {m.citations.map((c) => (
                  <CitationChip key={c.label} label={c.label} locator={c.locator} applicability={c.applicability} reason={c.reason} />
                ))}
              </div>
            )}
            {m.from === 'assistant' && !m.abstained && thread && (
              <div className="hd-link-actions">
                <button type="button" className="hd-ghost" onClick={() => draftFromAnswer(thread.id)}>Draft a work order</button>
                <button type="button" className="hd-ghost" onClick={() => notify('Saving notes needs the notes API (placeholder)')}>Save as note</button>
              </div>
            )}
          </div>
        ))}
        {running && (
          <div className="hd-msg is-assistant is-working" role="status">
            <span className="hd-ai-label">AI-generated</span>
            <p>Reading signals and searching documents…</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="hd-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          value={text}
          maxLength={MAX}
          rows={2}
          placeholder="Ask about a machine, alarm, part or document"
          aria-label="Message"
          disabled={running}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
        />
        <div className="hd-composer-foot">
          <small className="hd-muted">{text.length} / {MAX.toLocaleString('en-US')}</small>
          <button type="submit" className="hd-btn is-dark hd-btn-sm" disabled={!text.trim() || running}>
            <Send size={14} /> Send
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      <Note icon={Sparkles}>The assistant can read your plant’s signals and documents and suggest work. It cannot approve or run anything: actions go to the Inbox for a person to decide.</Note>
      <PageCard flush>
        {phone ? (active ? conversation : list) : (
          <div className="hd-assist">
            {list}
            {conversation}
          </div>
        )}
      </PageCard>
    </>
  );
}
