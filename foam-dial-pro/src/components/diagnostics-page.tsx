"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LiveConditions {
  ambient?: number;
  substrate?: number;
  humidity?: number;
  foamSystem?: string;
  substrateType?: string;
  shift?: string;
  recHoseTemp?: number;
  recDrumTemp?: number;
  recPressure?: number;
  timestamp?: number;
}

interface Diagnostic {
  id: string;
  problem: string;
  category: string;
  severity: string;
  causes: string[];
  fixes: string[];
}

interface Props {
  onNavigate?: (page: string) => void;
}

const CATEGORIES = [
  "all", "surface", "adhesion", "ratio", "yield", "application", "equipment", "weather",
];

const QUICK_PROMPTS = [
  { label: "Won't Stick", prompt: "My foam won't stick to the substrate. What should I check?" },
  { label: "Rising Too Fast", prompt: "Foam is rising way too fast and getting out of control. Help me dial it in." },
  { label: "Bad Yield", prompt: "I'm not getting the yield I should be. What's going wrong?" },
  { label: "Off-Ratio", prompt: "I think I'm off-ratio — foam feels sticky/soft. How do I fix this?" },
  { label: "Stringy Foam", prompt: "Getting stringy cobwebby foam coming out of the gun. What's the fix?" },
  { label: "Check My Settings", prompt: "Can you check if my current dial-in settings look right for these conditions?" },
];

// ── Markdown-lite renderer ──

function renderMessage(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

// ── Main Component ──

export default function DiagnosticsPage({ onNavigate }: Props) {
  const [tab, setTab] = useState<"chat" | "browse">("chat");

  // ── Chat state ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [liveConditions, setLiveConditions] = useState<LiveConditions | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Browse state ──
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Load chat history
  useEffect(() => {
    fetch("/api/foam-tech")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length) {
          setMessages(
            d.data.map((m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  // Load diagnostics for browse tab
  useEffect(() => {
    fetch("/api/diagnostics")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDiagnostics(d.data); })
      .finally(() => setLoading(false));
  }, []);

  // Read live conditions from dial-in calculator (localStorage)
  useEffect(() => {
    const readConditions = () => {
      try {
        const raw = localStorage.getItem("fd-live-conditions");
        if (raw) {
          const parsed = JSON.parse(raw) as LiveConditions;
          if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
            setLiveConditions(parsed);
          }
        }
      } catch {}
    };
    readConditions();
    const interval = setInterval(readConditions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/foam-tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          conditions: liveConditions,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const data = JSON.parse(payload);
            if (data.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + data.text } : m
                )
              );
            }
            if (data.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: "Sorry, I hit an error. Try again." }
                    : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Connection lost. Check your internet and try again." }
            : m
        )
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, liveConditions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // ── Browse tab filtering ──
  const filtered = diagnostics.filter((d) => {
    const matchesSearch = `${d.problem} ${(d.causes || []).join(" ")} ${(d.fixes || []).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };
  const severityColor: Record<string, string> = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    med: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg text-white font-medium">FoamTech AI</h2>
          <p className="text-sm text-white/40 mt-0.5">
            Your spray foam technician — ask anything
          </p>
        </div>
        {liveConditions && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-green-400 font-medium">Live from Dial-In</span>
          </div>
        )}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("chat")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "chat"
              ? "bg-orange/20 text-orange border border-orange/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          Ask FoamTech
        </button>
        <button
          onClick={() => setTab("browse")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "browse"
              ? "bg-orange/20 text-orange border border-orange/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          Field Fixes
        </button>
      </div>

      {/* ── Chat Tab ── */}
      {tab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Live conditions banner */}
          {liveConditions && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                {liveConditions.ambient != null && (
                  <span className="text-white/50">
                    Ambient <span className="text-white/80 font-medium">{liveConditions.ambient}&deg;F</span>
                  </span>
                )}
                {liveConditions.substrate != null && (
                  <span className="text-white/50">
                    Substrate <span className="text-white/80 font-medium">{liveConditions.substrate}&deg;F</span>
                  </span>
                )}
                {liveConditions.humidity != null && (
                  <span className="text-white/50">
                    Humidity <span className="text-white/80 font-medium">{liveConditions.humidity}%</span>
                  </span>
                )}
                {liveConditions.foamSystem && (
                  <span className="text-white/50">
                    Foam{" "}
                    <span className="text-white/80 font-medium">
                      {liveConditions.foamSystem === "enverge_easyseal" ? "EasySeal" : liveConditions.foamSystem === "accufoam_af1" ? "AF1" : liveConditions.foamSystem}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Chat window */}
          <div className="glass-card flex flex-col" style={{ height: "min(60vh, 520px)" }}>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* Welcome message if no history */}
              {historyLoaded && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 space-y-5"
                >
                  <div
                    className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                      boxShadow: "0 0 24px rgba(249,115,22,0.3)",
                    }}
                  >
                    <span className="text-xl font-bold text-white">FT</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-base">Hey, what&apos;s going on?</div>
                    <div className="text-white/40 text-sm mt-1">
                      I&apos;m your foam tech. Tell me what&apos;s happening on the job.
                    </div>
                  </div>

                  {/* Quick prompts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg mx-auto">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => sendMessage(qp.prompt)}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-orange/10 hover:text-orange hover:border-orange/25 transition-all text-left"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-orange/20 text-white/90 border border-orange/20 rounded-br-md"
                          : "bg-white/[0.05] text-white/80 border border-white/[0.06] rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-md flex items-center justify-center bg-orange/30">
                            <span className="text-[8px] font-bold text-orange">FT</span>
                          </div>
                          <span className="text-[10px] text-orange/60 font-medium uppercase tracking-wider">FoamTech</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{renderMessage(msg.content)}</div>
                      {msg.role === "assistant" && streaming && msg.content === "" && (
                        <div className="flex gap-1 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your foam tech..."
                  rows={1}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 resize-none focus:outline-none focus:border-orange/30 transition-colors"
                  style={{ minHeight: 42, maxHeight: 120 }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={streaming || !input.trim()}
                  className="shrink-0 w-10 h-10 rounded-xl bg-orange text-black flex items-center justify-center hover:bg-orange/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                {messages.length > 0 ? (
                  <button onClick={clearChat} className="text-[10px] text-white/20 hover:text-white/40 transition-colors">
                    Clear chat
                  </button>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-white/15">
                  {liveConditions ? "Conditions synced from Dial-In" : "Set conditions in Dial-In for smarter answers"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick prompts below chat when there are messages */}
          {messages.length > 0 && !streaming && (
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.slice(0, 4).map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.03] text-white/35 border border-white/[0.06] hover:bg-orange/10 hover:text-orange hover:border-orange/20 transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate?.("calculator")}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/50 text-sm font-medium border border-white/10 hover:bg-white/10 hover:text-white/70 transition-all"
            >
              Open Dial-In
            </button>
            <button
              onClick={() => onNavigate?.("foam-db")}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/50 text-sm font-medium border border-white/10 hover:bg-white/10 hover:text-white/70 transition-all"
            >
              Foam Guides
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Field Fixes Tab ── */}
      {tab === "browse" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="space-y-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search field problems, causes, fixes..."
              className="input-field w-full"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                    categoryFilter === c
                      ? "bg-orange/20 text-orange border border-orange/30"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-white/30 text-sm py-12 text-center">Loading diagnostics...</div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {filtered.map((d) => (
                <motion.div key={d.id} variants={item} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium">{d.problem}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 capitalize">{d.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${severityColor[d.severity] || "bg-white/10 text-white/50"}`}>
                          {d.severity}
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-white/30 transition-transform ${expanded === d.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {expanded === d.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 space-y-4 border-t border-white/5"
                    >
                      <div className="pt-4">
                        <h4 className="text-xs text-white/50 uppercase tracking-wider mb-2">Causes</h4>
                        <ul className="space-y-1.5">
                          {(Array.isArray(d.causes) ? d.causes : [d.causes]).map((cause, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-orange mt-1 text-xs">&#9679;</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs text-white/50 uppercase tracking-wider mb-2">Fixes</h4>
                        <ul className="space-y-1.5">
                          {(Array.isArray(d.fixes) ? d.fixes : [d.fixes]).map((fix, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-green-400 mt-1 text-xs">&#9679;</span>
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Ask FoamTech about this problem */}
                      <button
                        onClick={() => {
                          setTab("chat");
                          sendMessage(`I'm seeing this issue: ${d.problem}. What should I do?`);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-orange/10 text-orange text-xs font-medium border border-orange/20 hover:bg-orange/20 transition-all"
                      >
                        Ask FoamTech about this
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
