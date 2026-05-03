import { useState, useRef, useEffect } from "react";
import { useAskCivicAssistant, useGetChatHistory } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Globe, Vote, ShieldCheck, BrainCircuit, RotateCcw, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatRequestMode } from "@workspace/api-zod";

const SUGGESTED = [
  { icon: Vote,        text: "How does the Electoral College work in the US?" },
  { icon: Globe,       text: "Explain proportional representation simply" },
  { icon: ShieldCheck, text: "What's the difference between FPTP and STV?" },
  { icon: BrainCircuit,text: "How do I register to vote in the UK?" },
  { icon: Globe,       text: "What countries have compulsory voting?" },
  { icon: Vote,        text: "How are coalition governments formed?" },
];

const MODES: { value: ChatRequestMode; label: string; desc: string; color: string }[] = [
  { value: "standard", label: "Standard",  desc: "Clear, balanced answers",               color: "#60a5fa" },
  { value: "eli5",     label: "Simple",    desc: "Explain like I'm 10",                   color: "#34d399" },
  { value: "expert",   label: "Expert",    desc: "Technical depth & precision",            color: "#a78bfa" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
      style={{ color: "rgba(255,255,255,0.4)" }}
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function Chat() {
  const sessionId = getSessionId();
  const [mode, setMode] = useState<ChatRequestMode>("standard");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: history, isLoading: historyLoading } = useGetChatHistory({ sessionId });
  const askAssistant = useAskCivicAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [localMessages, setLocalMessages] = useState<{ role: string; content: string; id: string }[]>([]);

  useEffect(() => {
    if (history && localMessages.length === 0) {
      setLocalMessages(history.map(m => ({ role: m.role, content: m.content, id: m.id })));
    }
  }, [history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, askAssistant.isPending]);

  function send(text: string) {
    const msg = text.trim();
    if (!msg || askAssistant.isPending) return;
    setInput("");
    setError(null);
    setLocalMessages(prev => [...prev, { role: "user", content: msg, id: Date.now().toString() }]);

    askAssistant.mutate(
      { data: { message: msg, sessionId, mode } },
      {
        onSuccess: (res) => {
          setLocalMessages(prev => [...prev, { role: "assistant", content: res.message, id: res.id }]);
        },
        onError: () => {
          setLocalMessages(prev => prev.filter(m => m.content !== msg || m.role !== "user"));
          setError("Something went wrong. Please try again.");
        },
      }
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function clearChat() {
    setLocalMessages([]);
    setError(null);
  }

  const currentMode = MODES.find(m => m.value === mode)!;

  return (
    <div
      className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen"
      style={{ background: "linear-gradient(135deg, #05070f 0%, #090d1a 50%, #07111f 100%)" }}
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
          >
            <Bot className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">AI Civic Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Online · Powered by GPT-4o</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className="px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: mode === m.value ? `${m.color}22` : "transparent",
                  color: mode === m.value ? m.color : "rgba(255,255,255,0.4)",
                  borderRight: m.value !== "expert" ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
                title={m.desc}
              >
                {m.label}
              </button>
            ))}
          </div>

          {localMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
              title="Clear conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Empty state */}
          {!historyLoading && localMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8 pb-4 space-y-8"
            >
              <div>
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 32px rgba(124,58,237,0.4)" }}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Ask me anything about democracy</h2>
                <p style={{ color: "rgba(255,255,255,0.45)" }} className="text-base max-w-md mx-auto">
                  From voter registration to electoral systems, I'll explain it clearly — in{" "}
                  <span style={{ color: currentMode.color }}>{currentMode.desc.toLowerCase()}</span>.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid sm:grid-cols-2 gap-2 text-left">
                {SUGGESTED.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => send(s.text)}
                      className="flex items-center gap-3 p-3.5 rounded-xl text-left group transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.18)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(96,165,250,0.15)" }}>
                        <Icon className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.7)" }}>{s.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Loading history */}
          {historyLoading && (
            <div className="flex justify-center pt-12">
              <Loader2 className="animate-spin h-6 w-6" style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {localMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" }}
                  >
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`group max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                            color: "white",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.88)",
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 pl-1">
                      <CopyButton text={msg.content} />
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <UserIcon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {askAssistant.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div
                className="rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#7c3aed" }}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 justify-center text-sm rounded-xl p-3"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#f87171" }}
            >
              {error}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div
        className="relative z-10 px-4 sm:px-6 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl p-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about voting, elections, or civics… (Enter to send)"
              rows={1}
              disabled={askAssistant.isPending}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed py-1"
              style={{
                color: "rgba(255,255,255,0.85)",
                minHeight: 24,
                maxHeight: 120,
                caretColor: "#7c3aed",
              }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || askAssistant.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{
                background: input.trim() && !askAssistant.isPending
                  ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: input.trim() ? "0 0 16px rgba(124,58,237,0.4)" : "none",
              }}
            >
              {askAssistant.isPending
                ? <Loader2 className="animate-spin h-4 w-4 text-white" />
                : <Send className="h-4 w-4 text-white" />}
            </motion.button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
            Strictly neutral · Facts only · Powered by GPT-4o Mini
          </p>
        </form>
      </div>
    </div>
  );
}
