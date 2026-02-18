import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { X, Send, ArrowDown, Building2, User, Phone, Mail, ExternalLink, CheckCircle2, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import logoSymbol from "@assets/logo_legalit_cropped_(1)_1771133031977.png";
import corteCassazione from "@assets/image_1771449412801.png";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface GeminiHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

const quickReplies = {
  it: [
    { label: "Sono un'azienda", icon: Building2 },
    { label: "Sono un privato", icon: User },
    { label: "Contatti e sedi", icon: Phone },
    { label: "Le vostre specializzazioni", icon: Mail },
  ],
  en: [
    { label: "I'm a company", icon: Building2 },
    { label: "I'm an individual", icon: User },
    { label: "Contacts & offices", icon: Phone },
    { label: "Your specializations", icon: Mail },
  ],
};

const lawyerMap: Record<string, { name: string; id: string; area: string }> = {
  "vaccaro": { name: "Avv. Francesco Vaccaro", id: "1", area: "Penale / M&A" },
  "francesco vaccaro": { name: "Avv. Francesco Vaccaro", id: "1", area: "Penale / M&A" },
  "biasci": { name: "Avv. Renato Piero Biasci", id: "2", area: "Civile / Assicurazioni" },
  "renato piero biasci": { name: "Avv. Renato Piero Biasci", id: "2", area: "Civile / Assicurazioni" },
  "passalacqua": { name: "Prof. Avv. Pasquale Passalacqua", id: "3", area: "Diritto del Lavoro" },
  "pasquale passalacqua": { name: "Prof. Avv. Pasquale Passalacqua", id: "3", area: "Diritto del Lavoro" },
  "puntarello": { name: "Avv. Giovanni Puntarello", id: "12", area: "Amministrativo" },
  "giovanni puntarello": { name: "Avv. Giovanni Puntarello", id: "12", area: "Amministrativo" },
};

const pathMap: Record<string, string> = {
  "/team/vaccaro": "vaccaro",
  "/team/biasci": "biasci",
  "/team/passalacqua": "passalacqua",
  "/team/puntarello": "puntarello",
};

function parseLawyerKey(raw: string): { name: string; id: string; area: string } | null {
  const trimmed = raw.trim();
  const fromPath = pathMap[trimmed.toLowerCase()];
  if (fromPath && lawyerMap[fromPath]) return lawyerMap[fromPath];

  const key = trimmed.toLowerCase().replace(/^avv\.?\s*/i, "").replace(/^prof\.?\s*/i, "").trim();
  for (const [k, v] of Object.entries(lawyerMap)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

interface ParsedSegment {
  type: "text" | "show_log" | "confirm_triage" | "direct_link";
  content: string;
  lawyerData?: { name: string; id: string; area: string };
}

function parseUITags(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];

  const tagRegex = /\[SHOW_LOG\]|\[SHOW_CARD:\s*CONFIRM_TRIAGE\]|\[DIRECT_LINK:\s*([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    if (match[0] === "[SHOW_LOG]") {
      segments.push({ type: "show_log", content: "" });
    } else if (match[0].startsWith("[SHOW_CARD:")) {
      segments.push({ type: "confirm_triage", content: "" });
    } else if (match[0].startsWith("[DIRECT_LINK:")) {
      const rawName = match[1] || "";
      const lawyer = parseLawyerKey(rawName);
      segments.push({ type: "direct_link", content: rawName.trim(), lawyerData: lawyer || undefined });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: text }];
}

function formatRichText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ShowLogCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 my-2 rounded-xl text-[11px] leading-relaxed"
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "rgba(255, 255, 255, 0.6)",
      }}
      data-testid="chat-show-log"
    >
      <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "rgba(126, 184, 229, 0.6)" }} />
      <div className="italic">{children}</div>
    </div>
  );
}

function ConfirmTriageCard({ onConfirm }: { onConfirm: (answer: string) => void }) {
  return (
    <div
      className="my-2 px-3.5 py-3 rounded-xl"
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      data-testid="chat-confirm-triage"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <CheckCircle2 className="w-4 h-4" style={{ color: "#7eb8e5" }} />
        <span className="text-[12px] font-semibold" style={{ color: "#fff" }}>Conferma Triage</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm("Confermo, è corretto")}
          className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all duration-200"
          style={{
            background: "rgba(126, 184, 229, 0.25)",
            color: "#fff",
            border: "1px solid rgba(126, 184, 229, 0.3)",
          }}
          data-testid="button-triage-confirm"
        >
          Confermo
        </button>
        <button
          onClick={() => onConfirm("No, vorrei correggere")}
          className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all duration-200"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          data-testid="button-triage-correct"
        >
          Correggi
        </button>
      </div>
    </div>
  );
}

function DirectLinkCard({ lawyerData, onNavigate }: {
  lawyerData: { name: string; id: string; area: string };
  onNavigate: (path: string) => void;
}) {
  return (
    <button
      onClick={() => onNavigate(`/professionisti?id=${lawyerData.id}`)}
      className="flex items-center gap-3 w-full my-2 px-3.5 py-3 rounded-xl text-left transition-all duration-200"
      style={{
        background: "rgba(126, 184, 229, 0.15)",
        border: "1px solid rgba(126, 184, 229, 0.25)",
      }}
      data-testid={`button-direct-link-${lawyerData.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{lawyerData.name}</p>
        <p className="text-[11px]" style={{ color: "rgba(126, 184, 229, 0.8)" }}>{lawyerData.area}</p>
      </div>
      <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "rgba(126, 184, 229, 0.7)" }} />
    </button>
  );
}

function ChatTopoBg({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    let imgData: ImageData | null = null;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
      imgData = ctx.createImageData(w, h);
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function noise(x: number, y: number): number {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = perm[X] + Y;
      const b = perm[X + 1] + Y;
      const g = (h: number, x: number, y: number) => {
        const r = perm[h & 255] & 3;
        return r === 0 ? x + y : r === 1 ? -x + y : r === 2 ? x - y : -x - y;
      };
      return (
        (1 - v) * ((1 - u) * g(perm[a], xf, yf) + u * g(perm[b], xf - 1, yf)) +
        v * ((1 - u) * g(perm[a + 1], xf, yf - 1) + u * g(perm[b + 1], xf - 1, yf - 1))
      );
    }

    function fbm(x: number, y: number): number {
      let val = 0, amp = 0.5, freq = 1;
      for (let i = 0; i < 4; i++) {
        val += amp * noise(x * freq, y * freq);
        amp *= 0.45;
        freq *= 2;
      }
      return val;
    }

    const startTime = performance.now();
    let stopped = false;
    let lastDrawTime = 0;
    const FRAME_INTERVAL = 80;

    const draw = (now: number) => {
      if (stopped || !ctx || !imgData) return;
      rafRef.current = requestAnimationFrame(draw);

      if (now - lastDrawTime < FRAME_INTERVAL) return;
      lastDrawTime = now;

      const t = (now - startTime) * 0.00002;
      const step = 6;
      const data = imgData.data;

      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const ux = px / w;
          const uy = py / h;
          const sx = ux * 2.5 + t * 15;
          const sy = uy * 2.5 + t * 10;

          const height = fbm(sx, sy) + 0.2 * noise(sx * 0.4 + t * 5, sy * 0.4 - t * 4);
          const spacing = 0.15;
          const line = Math.abs((height / spacing + 0.5) % 1 - 0.5) * spacing;
          const contour = 1 - Math.min(Math.max(line / 0.01, 0), 1);

          const minorLine = Math.abs((height / 0.05 + 0.5) % 1 - 0.5) * 0.05;
          const minorContour = 1 - Math.min(Math.max(minorLine / 0.005, 0), 1);

          const combined = Math.min(contour * 0.85 + minorContour * 0.3, 1);
          const alpha = combined * 0.45;

          const edgeFadeX = Math.min(ux / 0.15, 1) * Math.min((1 - ux) / 0.15, 1);
          const edgeFadeY = Math.min(uy / 0.1, 1) * Math.min((1 - uy) / 0.1, 1);
          const finalAlpha = alpha * edgeFadeX * edgeFadeY;

          const tonal = (noise(sx * 0.25 + t * 3, sy * 0.25 + t * 4.5) * 0.5 + 0.5);
          const brightness = 140 + tonal * 100;
          const a8 = (finalAlpha * 255) | 0;
          const r = brightness | 0;
          const g = (brightness * 0.92) | 0;
          const b = (brightness * 0.85) | 0;

          for (let dy = 0; dy < step && py + dy < h; dy++) {
            for (let dx = 0; dx < step && px + dx < w; dx++) {
              const idx = ((py + dy) * w + (px + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a8;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [pulseToggle, setPulseToggle] = useState(true);
  const [mobileHeight, setMobileHeight] = useState("100dvh");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  const [showLogContent, setShowLogContent] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setPulseToggle(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length === 0) {
      const interval = setInterval(() => {
        setPulseToggle(prev => !prev);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const updateHeight = () => {
      setMobileHeight(`${vv.height}px`);
      setTimeout(() => scrollToBottom(), 100);
    };

    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
    };
  }, [scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 80);
  }, []);

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    const history: GeminiHistoryEntry[] = allMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const parsed = parseUITags(data.reply);
        const logSegment = parsed.find(s => s.type === "show_log");
        if (logSegment) {
          const textAfterLog = parsed.filter(s => s.type === "text").map(s => s.content).join("").trim();
          const firstLine = textAfterLog.split("\n")[0] || "";
          setShowLogContent(firstLine.slice(0, 120));
        }
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.message || "Errore. Riprova." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Connessione persa. Riprova." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const renderMessageContent = (text: string, msgIndex: number) => {
    const segments = parseUITags(text);
    const hasSpecialTags = segments.some(s => s.type !== "text");

    if (!hasSpecialTags) {
      return <>{formatRichText(text)}</>;
    }

    return (
      <>
        {segments.map((seg, i) => {
          if (seg.type === "show_log") {
            const nextTextSeg = segments.find((s, j) => j > i && s.type === "text");
            if (!nextTextSeg) return null;
            const lines = nextTextSeg.content.trim().split("\n");
            const logLine = lines[0] || "";
            if (!logLine) return null;
            return <ShowLogCard key={`${msgIndex}-log-${i}`}>{formatRichText(logLine)}</ShowLogCard>;
          }
          if (seg.type === "confirm_triage") {
            return <ConfirmTriageCard key={`${msgIndex}-triage-${i}`} onConfirm={(answer) => sendMessage(answer)} />;
          }
          if (seg.type === "direct_link" && seg.lawyerData) {
            return <DirectLinkCard key={`${msgIndex}-link-${i}`} lawyerData={seg.lawyerData} onNavigate={handleNavigate} />;
          }
          if (seg.type === "direct_link" && !seg.lawyerData) {
            return null;
          }
          if (seg.type === "text") {
            const trimmedContent = seg.content.trim();
            if (!trimmedContent) return null;
            return <span key={`${msgIndex}-text-${i}`}>{formatRichText(trimmedContent)}</span>;
          }
          return null;
        })}
      </>
    );
  };

  const placeholderText = language === "it" ? "Scrivi un messaggio..." : "Type a message...";
  const titleText = language === "it" ? "Assistente Legale" : "Legal Assistant";
  const subtitleText = "LEGALIT";
  const welcomeTitle = language === "it" ? "Come possiamo aiutarla?" : "How can we help you?";
  const welcomeSubtitle = language === "it"
    ? "Noi di LegalIT siamo a sua disposizione per ogni esigenza legale."
    : "We at LegalIT are at your service for every legal need.";
  const currentQuickReplies = language === "it" ? quickReplies.it : quickReplies.en;

  return (
    <>
      <style>{`
        @keyframes chat-pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes chat-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chat-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-msg-enter {
          animation: chat-fade-in 0.25s ease-out both;
        }
        .chat-typing-dot:nth-child(1) { animation: chat-typing-dot 1.2s ease-in-out infinite; }
        .chat-typing-dot:nth-child(2) { animation: chat-typing-dot 1.2s ease-in-out 0.2s infinite; }
        .chat-typing-dot:nth-child(3) { animation: chat-typing-dot 1.2s ease-in-out 0.4s infinite; }
      `}</style>

      {/* Floating toggle button */}
      <button
        data-testid="button-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-[9999] group sm:bottom-6 sm:right-6"
        style={{
          outline: "none",
          display: isOpen && isMobile ? "none" : undefined,
        }}
      >
        <div className="relative">
          {pulseToggle && !isOpen && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(8, 57, 107, 0.3)",
                animation: "chat-pulse-ring 2s ease-out infinite",
              }}
            />
          )}
          <div
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: "linear-gradient(145deg, #08396B 0%, #0c4d8a 50%, #2e6884 100%)",
              boxShadow: isOpen
                ? "0 2px 12px rgba(8, 57, 107, 0.3)"
                : "0 4px 24px rgba(8, 57, 107, 0.45), 0 0 0 3px rgba(126, 184, 229, 0.12)",
            }}
          >
            <div
              className="transition-all duration-300"
              style={{
                transform: isOpen ? "rotate(90deg) scale(0.9)" : "rotate(0deg) scale(1)",
              }}
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <img
                  src={logoSymbol}
                  alt="LEGALIT"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain brightness-0 invert"
                />
              )}
            </div>
            {!isOpen && (
              <span
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                style={{ background: "#4ade80" }}
              />
            )}
          </div>
        </div>
      </button>

      {/* Chat window */}
      <div
        ref={chatWindowRef}
        data-testid="chat-window"
        className="fixed z-[9998] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
          bottom-0 right-0 w-full
          sm:bottom-[5.5rem] sm:right-5 sm:w-[400px] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl"
        style={{
          height: isMobile ? mobileHeight : (isOpen ? "560px" : "0px"),
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          pointerEvents: isOpen ? "auto" : "none",
          boxShadow: isOpen ? "0 16px 64px rgba(8, 57, 107, 0.2), 0 0 0 1px rgba(8, 57, 107, 0.06)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 shrink-0"
          style={{
            background: "linear-gradient(135deg, #08396B 0%, #0c4d8a 60%, #2e6884 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              <img
                src={logoSymbol}
                alt="LEGALIT"
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight tracking-wider">{subtitleText}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
                <p className="text-[11px] text-white/70">{titleText}</p>
              </div>
            </div>
          </div>
          <button
            data-testid="button-chat-close"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Corte di Cassazione strip */}
        <div className="shrink-0 relative" style={{ height: "48px" }}>
          <img
            src={corteCassazione}
            alt="Corte di Cassazione"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(8, 57, 107, 0.25) 0%, rgba(8, 57, 107, 0.5) 100%)",
            }}
          />
        </div>

        {/* "Filo del Discorso" log strip */}
        {showLogContent && messages.length > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-1.5 shrink-0 text-[10px]"
            style={{
              background: "rgba(8, 57, 107, 0.95)",
              borderBottom: "1px solid rgba(126, 184, 229, 0.1)",
              color: "rgba(126, 184, 229, 0.6)",
            }}
            data-testid="chat-log-strip"
          >
            <FileText className="w-3 h-3 shrink-0" style={{ opacity: 0.5 }} />
            <span className="truncate italic">{showLogContent}</span>
          </div>
        )}

        {/* Messages area - dark with inverted topographic background */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
          style={{ background: "#061e35" }}
        >
          <ChatTopoBg active={isOpen} />

          <div className="relative z-[1]">
            {/* Welcome state */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center pt-6 pb-2 gap-5 px-2 chat-msg-enter">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(126, 184, 229, 0.1)", border: "1px solid rgba(126, 184, 229, 0.15)" }}
                >
                  <img
                    src={logoSymbol}
                    alt="LEGALIT"
                    className="w-9 h-9 object-contain brightness-0 invert"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold mb-1 text-white">{welcomeTitle}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(126, 184, 229, 0.7)" }}>{welcomeSubtitle}</p>
                </div>

                {/* Quick-reply buttons */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                  {currentQuickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      data-testid={`button-quick-reply-${idx}`}
                      onClick={() => sendMessage(qr.label)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 text-left"
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(126, 184, 229, 0.15)",
                        color: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(4px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.35)";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.15)";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <qr.icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#7eb8e5" }} />
                      <span>{qr.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex chat-msg-enter ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {msg.role === "model" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                    style={{ background: "rgba(126, 184, 229, 0.12)" }}
                  >
                    <img
                      src={logoSymbol}
                      alt=""
                      className="w-4 h-4 object-contain brightness-0 invert"
                    />
                  </div>
                )}
                <div
                  data-testid={`chat-message-${msg.role}-${i}`}
                  className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-[1.6] whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? {
                          background: "rgba(126, 184, 229, 0.2)",
                          border: "1px solid rgba(126, 184, 229, 0.25)",
                          color: "#fff",
                          borderRadius: "16px 16px 4px 16px",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.07)",
                          color: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "16px 16px 16px 4px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          backdropFilter: "blur(4px)",
                        }
                  }
                >
                  {msg.role === "model" ? renderMessageContent(msg.text, i) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start chat-msg-enter">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                  style={{ background: "rgba(126, 184, 229, 0.12)" }}
                >
                  <img
                    src={logoSymbol}
                    alt=""
                    className="w-4 h-4 object-contain brightness-0 invert"
                  />
                </div>
                <div
                  className="px-4 py-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.07)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px 16px 16px 4px",
                  }}
                >
                  <div className="flex items-center gap-1.5" data-testid="chat-typing-indicator">
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#7eb8e5" }} />
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#7eb8e5" }} />
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#7eb8e5" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
              style={{ background: "rgba(126, 184, 229, 0.3)", color: "#fff", border: "1px solid rgba(126, 184, 229, 0.3)" }}
              data-testid="button-chat-scroll-bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input area */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 shrink-0"
          style={{
            borderTop: "1px solid rgba(126, 184, 229, 0.1)",
            background: "#071f36",
            paddingBottom: isMobile ? "calc(0.625rem + env(safe-area-inset-bottom, 0px))" : undefined,
          }}
        >
          <input
            ref={inputRef}
            data-testid="input-chat-message"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-[13px] rounded-full outline-none transition-all duration-200"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(126, 184, 229, 0.12)",
              color: "#fff",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.3)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(126, 184, 229, 0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.12)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"; e.currentTarget.style.boxShadow = "none"; }}
            autoComplete="off"
          />
          <button
            data-testid="button-chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30"
            style={{
              background: input.trim() ? "rgba(126, 184, 229, 0.3)" : "rgba(255, 255, 255, 0.08)",
              color: "#fff",
              border: input.trim() ? "1px solid rgba(126, 184, 229, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              transform: input.trim() ? "scale(1)" : "scale(0.95)",
            }}
          >
            <Send className="w-4 h-4" style={{ transform: "translateX(0.5px)" }} />
          </button>
        </div>
      </div>
    </>
  );
}
