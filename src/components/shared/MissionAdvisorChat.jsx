import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

/**
 * MissionAdvisorChat — reusable chat drawer for the Mission Advisor
 * (docs/MISSION_ADVISOR_CLAUDE_PLAN.md §5.3).
 *
 * Posts { context, messages } to /api/ai/mission-advisor. The context is a
 * plain-text digest built client-side (src/utils/advisorContext.js); the
 * guardrail system prompt lives server-side. No API keys, no localStorage.
 *
 * Props:
 *   contextText        {string}   the mission/loadout/swap digest
 *   title              {string}   drawer header, e.g. 'Mission Advisor'
 *   accentColor        {string}   'orange' | 'cyan' | 'emerald' | 'blue' | 'amber' | 'purple' | 'lime'
 *   suggestedQuestions {string[]} up to 3 canned questions rendered as chips
 *   prefill            {string?}  question auto-sent on mount (swap explainer)
 *   onClose            {() => void}
 *   embedded           {boolean}  render as an inline panel instead of a
 *                                 fixed drawer (LoadoutBuilder / SwapVesselModal)
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// Tailwind cannot build dynamic class names — accents are static literals.
const ACCENTS = {
  orange:  { text: 'text-orange-400',  border: 'border-orange-500/30',  chip: 'border-orange-500/30 hover:border-orange-400/60 hover:text-orange-300', send: 'bg-orange-700 hover:bg-orange-600', user: 'bg-orange-900/40 border-orange-500/30' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-500/30',    chip: 'border-cyan-500/30 hover:border-cyan-400/60 hover:text-cyan-300',       send: 'bg-cyan-700 hover:bg-cyan-600',       user: 'bg-cyan-900/40 border-cyan-500/30' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', chip: 'border-emerald-500/30 hover:border-emerald-400/60 hover:text-emerald-300', send: 'bg-emerald-700 hover:bg-emerald-600', user: 'bg-emerald-900/40 border-emerald-500/30' },
  blue:    { text: 'text-blue-400',    border: 'border-blue-500/30',    chip: 'border-blue-500/30 hover:border-blue-400/60 hover:text-blue-300',       send: 'bg-blue-700 hover:bg-blue-600',       user: 'bg-blue-900/40 border-blue-500/30' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-500/30',   chip: 'border-amber-500/30 hover:border-amber-400/60 hover:text-amber-300',     send: 'bg-amber-700 hover:bg-amber-600',     user: 'bg-amber-900/40 border-amber-500/30' },
  purple:  { text: 'text-purple-400',  border: 'border-purple-500/30',  chip: 'border-purple-500/30 hover:border-purple-400/60 hover:text-purple-300',   send: 'bg-purple-700 hover:bg-purple-600',   user: 'bg-purple-900/40 border-purple-500/30' },
  lime:    { text: 'text-lime-400',    border: 'border-lime-500/30',    chip: 'border-lime-500/30 hover:border-lime-400/60 hover:text-lime-300',       send: 'bg-lime-700 hover:bg-lime-600',       user: 'bg-lime-900/40 border-lime-500/30' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-500/30',    chip: 'border-rose-500/30 hover:border-rose-400/60 hover:text-rose-300',       send: 'bg-rose-700 hover:bg-rose-600',       user: 'bg-rose-900/40 border-rose-500/30' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-500/30',  chip: 'border-violet-500/30 hover:border-violet-400/60 hover:text-violet-300',   send: 'bg-violet-700 hover:bg-violet-600',   user: 'bg-violet-900/40 border-violet-500/30' },
  sky:     { text: 'text-sky-400',     border: 'border-sky-500/30',     chip: 'border-sky-500/30 hover:border-sky-400/60 hover:text-sky-300',           send: 'bg-sky-700 hover:bg-sky-600',         user: 'bg-sky-900/40 border-sky-500/30' },
};

const ERROR_MESSAGES = {
  429: 'The Advisor is rate-limited — try again in a minute.',
  503: 'The Advisor is not configured.',
};

const MAX_QUESTION_CHARS = 2_000;

const MissionAdvisorChat = ({
  contextText,
  title = 'Mission Advisor',
  accentColor = 'orange',
  suggestedQuestions = [],
  prefill = null,
  onClose,
  embedded = false,
}) => {
  const accent = ACCENTS[accentColor] ?? ACCENTS.orange;
  const [messages, setMessages] = useState([]); // [{ role, content }]
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const prefillSent = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (question) => {
    const content = question.trim().slice(0, MAX_QUESTION_CHARS);
    if (!content || loading) return;
    setError(null);
    setInput('');

    const history = [...messages, { role: 'user', content }];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/mission-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Server caps the body at 12 messages; history is always
        // [user, assistant, ..., user] so slice(-11) stays user-first.
        body: JSON.stringify({ context: contextText, messages: history.slice(-11) }),
      });

      if (!res.ok) {
        const friendly = ERROR_MESSAGES[res.status];
        if (friendly) throw new Error(friendly);
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'The Advisor could not answer — please try again.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? '' }]);
    } catch (err) {
      setError(err.message);
      // Roll the unanswered question back so a retry re-sends it cleanly.
      setMessages((prev) => prev.slice(0, -1));
      setInput(content);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, contextText]);

  // Swap explainer: auto-ask the prefilled question once, on mount.
  useEffect(() => {
    if (prefill && !prefillSent.current) {
      prefillSent.current = true;
      send(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount by design
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const body = (
    <div className="flex flex-col h-full min-h-0 bg-gray-900">

      {/* ── Header ── */}
      <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${accent.border} flex-shrink-0`}>
        <Sparkles size={13} className={accent.text} />
        <span className={`text-[0.75rem] font-semibold tracking-wide ${accent.text}`}>{title}</span>
        <span className="text-gray-600 text-[0.62rem] ml-1 hidden sm:inline">answers only from this mission&apos;s data</span>
        <div className="flex-1" />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
            aria-label="Close advisor"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="space-y-2.5">
            <p className="text-gray-500 text-[0.7rem] leading-relaxed">
              Ask about this mission&apos;s roles, payloads, and vessels. The Advisor answers only
              from the mission data on screen.
            </p>
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className={`text-left px-2.5 py-1.5 rounded-lg border bg-gray-800/40 text-gray-400 text-[0.7rem] transition-colors ${accent.chip}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-2.5 py-2 rounded-lg border text-[0.72rem] leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? `${accent.user} text-gray-200 ml-6`
                : 'bg-gray-800/50 border-gray-700/40 text-gray-300 mr-6'
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 px-2.5 py-2 text-gray-500 text-[0.7rem]">
            <Loader2 size={12} className="animate-spin" />
            Consulting the mission data…
          </div>
        )}

        {error && (
          <div className="px-2.5 py-2 rounded-lg border border-amber-500/30 bg-amber-900/20 text-amber-300 text-[0.7rem]">
            {error}
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 border-t border-gray-700/50 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Advisor…"
          maxLength={MAX_QUESTION_CHARS}
          className="flex-1 bg-gray-800/60 border border-gray-700/60 rounded-md px-2.5 py-1.5 text-white text-[0.72rem] placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors min-w-0"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`p-2 rounded-md text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${accent.send}`}
          aria-label="Send"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );

  if (embedded) {
    return (
      <div className={`flex flex-col rounded-lg border ${accent.border} overflow-hidden h-full min-h-0`}>
        {body}
      </div>
    );
  }

  // Drawer: full-screen overlay on mobile (mirrors the mission views' log
  // overlay pattern), fixed right panel on desktop.
  return (
    <div className={`
      fixed z-[700] bg-gray-900 border-gray-700/60 shadow-2xl flex flex-col
      inset-0
      md:inset-y-0 md:left-auto md:right-0 md:w-[380px] md:border-l
    `}
    >
      {body}
    </div>
  );
};

export default MissionAdvisorChat;
