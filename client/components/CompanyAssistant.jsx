import React, { useRef, useState } from 'react';
import { ArrowUp, MessageCircle, X } from 'lucide-react';
import { api } from '../api.js';

const welcome = 'Hi, I’m the Atelier Assistant. Ask me about Atelier Motors, our cars, prices, or customization.';
const suggestions = ['Which cars do you have?', 'Which car is best for me?', 'How do I customize a car?'];

export function CompanyAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: welcome }]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function ask(raw) {
    const message = raw.trim();
    if (!message || busy) return;
    setDraft('');
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setBusy(true);
    try {
      const result = await api('/assistant', { method: 'POST', body: JSON.stringify({ message }) });
      setMessages((current) => [...current, { role: 'assistant', text: result.answer }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not check the showroom knowledge just now. Please try again.' }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return <div className="company-assistant">
    {open && <section className="company-assistant-panel" role="dialog" aria-label="Atelier Assistant">
      <div className="company-assistant-header"><div><span>ATELIER MOTORS</span><strong>Ask our assistant</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={19}/></button></div>
      <p className="company-assistant-scope">Answers are limited to Atelier Motors and our vehicles.</p>
      <div className="company-assistant-messages" role="log" aria-live="polite">{messages.map((item, i) => <p key={i} className={`company-assistant-message is-${item.role}`}>{item.text}</p>)}{busy && <p className="company-assistant-message is-assistant">Checking the showroom…</p>}</div>
      {messages.length === 1 && <div className="company-assistant-suggestions">{suggestions.map((question) => <button type="button" key={question} onClick={() => ask(question)}>{question}</button>)}</div>}
      <form className="company-assistant-form" onSubmit={(event) => { event.preventDefault(); ask(draft); }}><label htmlFor="assistant-question" className="sr-only">Ask about Atelier Motors</label><input ref={inputRef} id="assistant-question" value={draft} maxLength={300} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about our cars…"/><button type="submit" disabled={busy || !draft.trim()} aria-label="Send question"><ArrowUp size={18}/></button></form>
    </section>}
    <button type="button" className="company-assistant-launcher" aria-label={open ? 'Close Atelier Assistant' : 'Open Atelier Assistant'} aria-expanded={open} onClick={() => { setOpen(!open); window.setTimeout(() => inputRef.current?.focus(), 0); }}>{open ? <X size={24}/> : <MessageCircle size={24}/>}<span>{open ? 'Close' : 'Ask Atelier'}</span></button>
  </div>;
}
