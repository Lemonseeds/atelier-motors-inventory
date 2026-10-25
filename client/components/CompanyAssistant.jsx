import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, MessageCircle, X } from 'lucide-react';
import { api } from '../api.js';

const welcome = 'Hi, I’m the Atelier Assistant. Ask me about Atelier Motors, our cars, prices, or customization.';
const suggestions = ['Which cars do you have?', 'Which car is best for me?', 'How do I customize a car?'];

function renderInlineMarkdown(text) {
  if (typeof text !== 'string') return text;
  if (!text.includes('**') && !text.includes('*') && !text.includes('`')) {
    return text;
  }
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={key++} className="assistant-bold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={key++} className="assistant-code">{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length ? parts : text;
}

export function FormattedMessage({ text }) {
  if (typeof text !== 'string') return text;
  if (!text.includes('\n') && !text.includes('**') && !text.includes('*') && !text.includes('`') && !/^\s*[-*•\d]/.test(text)) {
    return text;
  }

  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', content: currentParagraph.join(' ') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^\s*#{1,4}\s+(.+)$/.exec(line);
    const bulletMatch = /^\s*[-*•]\s+(.+)$/.exec(line);
    const numberedMatch = /^\s*(\d+)\.\s+(.+)$/.exec(line);

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', content: headingMatch[1] });
    } else if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'unordered') {
        flushList();
        currentList = { type: 'unordered', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numberedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ordered') {
        flushList();
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
    } else {
      flushList();
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  if (blocks.length === 1 && blocks[0].type === 'paragraph' && !blocks[0].content.includes('**')) {
    return renderInlineMarkdown(blocks[0].content);
  }

  return (
    <div className="assistant-content">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          return <div key={idx} className="assistant-heading">{renderInlineMarkdown(block.content)}</div>;
        }
        if (block.type === 'unordered') {
          return (
            <ul key={idx} className="assistant-list">
              {block.items.map((item, i) => (
                <li key={i}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ordered') {
          return (
            <ol key={idx} className="assistant-ordered-list">
              {block.items.map((item, i) => (
                <li key={i}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="assistant-paragraph">
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
}

export function CompanyAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: welcome }]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleAskEvent = (e) => {
      setOpen(true);
      if (e.detail?.prompt) {
        ask(e.detail.prompt);
      }
    };
    window.addEventListener('atelier:ask-concierge', handleAskEvent);
    return () => window.removeEventListener('atelier:ask-concierge', handleAskEvent);
  }, []);

  async function ask(raw) {
    const message = raw.trim();
    if (!message || busy) return;
    setDraft('');
    const history = messages
      .slice(1)
      .map((m) => ({ role: m.role, content: m.text }));
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setBusy(true);
    try {
      const payload = history.length > 0 ? { message, history } : { message };
      const result = await api('/assistant', { method: 'POST', body: JSON.stringify(payload) });
      setMessages((current) => [...current, { role: 'assistant', text: result.answer }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not check the showroom knowledge just now. Please try again.' }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="company-assistant">
      {open && (
        <section className="company-assistant-panel" role="dialog" aria-label="Atelier Assistant">
          <div className="company-assistant-header">
            <div>
              <span>ATELIER MOTORS</span>
              <strong>Ask our assistant</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={19} />
            </button>
          </div>
          <p className="company-assistant-scope">Answers are limited to Atelier Motors and our vehicles.</p>
          <div className="company-assistant-messages" role="log" aria-live="polite">
            {messages.map((item, i) => (
              <div key={i} className={`company-assistant-message is-${item.role}`}>
                <FormattedMessage text={item.text} />
              </div>
            ))}
            {busy && <div className="company-assistant-message is-assistant">Checking the showroom…</div>}
          </div>
          {messages.length === 1 && (
            <div className="company-assistant-suggestions">
              {suggestions.map((question) => (
                <button type="button" key={question} onClick={() => ask(question)}>
                  {question}
                </button>
              ))}
            </div>
          )}
          <form
            className="company-assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
            }}
          >
            <label htmlFor="assistant-question" className="sr-only">
              Ask about Atelier Motors
            </label>
            <input
              ref={inputRef}
              id="assistant-question"
              value={draft}
              maxLength={300}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about our cars…"
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send question">
              <ArrowUp size={18} />
            </button>
          </form>
        </section>
      )}
      {!open && (
        <button
          type="button"
          className="company-assistant-launcher"
          aria-label="Open Atelier Assistant"
          aria-expanded={false}
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <MessageCircle size={24} />
          <span>Ask Atelier</span>
        </button>
      )}
    </div>
  );
}

