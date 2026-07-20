import { useEffect, useRef, useState } from 'react';
import { BookOpenText, Bot, Clock, ExternalLink, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';

const suggestedQuestions = [
  'What is the maximum course load in 2024-2025?',
  'What defines full-time enrollment in 2024-2025?',
  'Compare the attendance policy across years.',
];

const ChatModal = () => {
  const { messages, sendMessage, clearMessages, isOpen, isResponding, knowledgeStatus, toggleChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toggleChatRef = useRef(toggleChat);

  useEffect(() => {
    toggleChatRef.current = toggleChat;
  }, [toggleChat]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, isResponding]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleChatRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    void sendMessage(inputValue);
    setInputValue('');
  };

  const formatTime = (date: Date) => new Date(date).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={event => {
            if (event.target === event.currentTarget) toggleChat();
          }}
          className="fixed inset-0 z-50 flex justify-end bg-[#050912]/75 p-2 backdrop-blur-md sm:p-5"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            initial={{ opacity: 0, x: 45, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 45, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="paper-shadow flex h-[calc(100dvh-1rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#f8f4ec] dark:bg-[#0f1928] sm:h-[calc(100dvh-2.5rem)]"
          >
            <header className="flex items-center justify-between border-b border-black/10 bg-primary-800 px-4 py-4 text-white dark:border-white/10 dark:bg-[#07101c] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary-300 font-display text-sm font-bold text-[#111827]">A&amp;M</span>
                <div>
                  <p className="font-utility text-[0.58rem] font-bold uppercase tracking-[0.2em] text-secondary-200">Evidence desk · Local search</p>
                  <h2 id="chat-title" className="mt-1 font-display text-xl leading-none sm:text-2xl">Ask the bulletin</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearMessages} className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Clear chat">
                  <Trash2 size={17} />
                </button>
                <button onClick={toggleChat} className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary-800 transition hover:rotate-6 dark:bg-secondary-300 dark:text-[#111827]" aria-label="Close chat">
                  <X size={19} />
                </button>
              </div>
            </header>

            <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#eee7dc] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-slate-500 dark:border-white/10 dark:bg-[#0b1421] dark:text-slate-400 sm:px-7">
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-primary-700 dark:text-secondary-300" /> Questions stay on this device</span>
              <span className="hidden sm:inline">2022–2025 bulletins</span>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-7 sm:py-8" aria-live="polite" aria-busy={isResponding}>
              {messages.map(msg => (
                <motion.article
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] sm:max-w-[80%] ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <p className={`mb-2 font-utility text-[0.58rem] font-bold uppercase tracking-[0.18em] ${msg.type === 'user' ? 'text-primary-700 dark:text-secondary-300' : 'text-slate-400'}`}>
                      {msg.type === 'user' ? 'Your question' : 'Advising desk'}
                    </p>
                    <div className={`rounded-2xl p-4 text-left sm:p-5 ${
                      msg.type === 'user'
                        ? 'rounded-tr-sm bg-primary-800 text-white dark:bg-secondary-300 dark:text-[#111827]'
                        : 'rounded-tl-sm border border-black/10 bg-white text-slate-700 dark:border-white/10 dark:bg-[#152235] dark:text-slate-200'
                    }`}>
                      <p className="leading-7">{msg.text}</p>

                      {msg.type === 'bot' && msg.confidence && msg.confidence !== 'none' && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] dark:border-white/10">
                          <span className={msg.confidence === 'high' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>{msg.confidence} confidence</span>
                          {!!msg.bulletinYears?.length && <><span aria-hidden="true">·</span><span>{msg.bulletinYears.join(', ')}</span></>}
                          {typeof msg.latencyMs === 'number' && <><span aria-hidden="true">·</span><span>{msg.latencyMs.toFixed(1)} ms</span></>}
                        </div>
                      )}

                      {!!msg.citations?.length && (
                        <div className="mt-4 space-y-2" aria-label="Answer sources">
                          {msg.citations.map(citation => (
                            <a
                              key={citation.id}
                              href={citation.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-xl border border-black/10 bg-[#f3eee6] p-3 text-left text-xs text-slate-700 transition hover:border-primary-700 hover:bg-primary-50 dark:border-white/10 dark:bg-[#0b1421] dark:text-slate-300 dark:hover:border-secondary-300"
                            >
                              <span className="flex items-center justify-between gap-3 font-bold text-primary-700 dark:text-secondary-300">
                                <span className="flex items-center gap-2"><BookOpenText size={14} /> Bulletin {citation.year} · page {citation.page}</span>
                                <ExternalLink size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                              </span>
                              <span className="mt-2 block leading-5">{citation.excerpt}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`mt-1.5 flex items-center gap-1 text-[0.62rem] text-slate-400 ${msg.type === 'user' ? 'justify-end' : ''}`}><Clock size={11} /> {formatTime(msg.timestamp)}</p>
                  </div>
                </motion.article>
              ))}

              {messages.length === 1 && (
                <div className="pt-1">
                  <p className="mb-3 font-utility text-[0.6rem] font-bold uppercase tracking-[0.17em] text-slate-400">Start with a precise question</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map(question => (
                      <button
                        key={question}
                        onClick={() => { setInputValue(question); inputRef.current?.focus(); }}
                        className="rounded-full border ink-border bg-transparent px-3.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-primary-700 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-300 dark:hover:border-secondary-300 dark:hover:bg-white/5 dark:hover:text-secondary-300"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {isResponding && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-800 text-white dark:bg-secondary-300 dark:text-[#111827]"><Bot size={16} /></span>
                    <span>{knowledgeStatus === 'loading' ? 'Opening the bulletin index…' : 'Tracing the strongest source…'}</span>
                    <span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" /></span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#0b1421] sm:p-5">
              <div className="flex items-center gap-2 rounded-2xl border ink-border bg-[#f8f4ec] p-2 transition focus-within:border-primary-700 dark:bg-[#101b2b] dark:focus-within:border-secondary-300">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={event => setInputValue(event.target.value)}
                  placeholder="Ask about a course, rule, or bulletin year…"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-primary-800 text-white transition hover:-rotate-6 hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-secondary-300 dark:text-[#111827]"
                  disabled={!inputValue.trim() || isResponding}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-center text-[0.62rem] text-slate-400">Use a specific year or audience for the most reliable result.</p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
