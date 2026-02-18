import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { X, Send, ArrowDown, Building2, User, Phone, Mail, ExternalLink, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import logoSymbol from "@assets/logo_legalit_cropped_(1)_1771133031977.png";
import corteCassazione from "@assets/image_1771449412801.png";
import * as THREE from "three";

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

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec2 u_resolution;
uniform vec3 u_color;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  uv.x *= u_resolution.x / u_resolution.y;
  float scale = 3.0;
  float n = snoise(uv * scale);
  n += 0.5 * snoise(uv * scale * 2.0 + 10.0);
  float lines = sin(n * 20.0);
  lines = smoothstep(0.96, 0.98, lines);
  gl_FragColor = vec4(u_color, lines * 0.3);
}
`;

function ChatTopoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_color: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      },
      transparent: true,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const render = () => {
      renderer.render(scene, camera);
    };

    const updateSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      material.uniforms.u_resolution.value.set(w, h);
      render();
    };

    updateSize();

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);

    return () => {
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      rendererRef.current = null;
      materialRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.12 }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
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
            return null;
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
          30% { transform: translateY(-6px); opacity: 1; }
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
        {/* Header with Corte di Cassazione photo */}
        <div className="relative shrink-0" style={{ minHeight: "72px" }}>
          <img
            src={corteCassazione}
            alt="Corte di Cassazione"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(8, 57, 107, 0.55) 0%, rgba(12, 77, 138, 0.5) 50%, rgba(46, 104, 132, 0.45) 100%)",
            }}
          />
          <div className="relative flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              >
                <img
                  src={logoSymbol}
                  alt="LEGALIT"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight tracking-wider" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{subtitleText}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
                  <p className="text-[11px] text-white/80" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{titleText}</p>
                </div>
              </div>
            </div>
            <button
              data-testid="button-chat-close"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
            >
              <X className="w-4 h-4 text-white/90" />
            </button>
          </div>
        </div>

        {/* Messages area with Three.js topographic pattern */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
          style={{ background: "linear-gradient(180deg, #071f36 0%, #0a2a4a 50%, #061e35 100%)" }}
        >
          <ChatTopoBackground />
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

                <div className="grid grid-cols-2 gap-2.5 w-full max-w-[320px]">
                  {currentQuickReplies.map((qr, idx) => {
                    const Icon = qr.icon;
                    return (
                      <button
                        key={idx}
                        data-testid={`button-quick-reply-${idx}`}
                        onClick={() => sendMessage(qr.label)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-200 text-left"
                        style={{
                          background: "rgba(126, 184, 229, 0.08)",
                          border: "1px solid rgba(126, 184, 229, 0.18)",
                          color: "rgba(200, 225, 245, 0.9)",
                          cursor: isLoading ? "default" : "pointer",
                          opacity: isLoading ? 0.5 : 1,
                          boxShadow: "0 0 12px rgba(255, 255, 255, 0.08), 0 0 4px rgba(126, 184, 229, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(126, 184, 229, 0.16)";
                          e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.35)";
                          e.currentTarget.style.boxShadow = "0 0 18px rgba(255, 255, 255, 0.15), 0 0 6px rgba(126, 184, 229, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(126, 184, 229, 0.08)";
                          e.currentTarget.style.borderColor = "rgba(126, 184, 229, 0.18)";
                          e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.08), 0 0 4px rgba(126, 184, 229, 0.15)";
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(126, 184, 229, 0.7)" }} />
                        <span>{qr.label}</span>
                      </button>
                    );
                  })}
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
                    <span className="chat-typing-dot w-[7px] h-[7px] rounded-full" style={{ background: "#7eb8e5" }} />
                    <span className="chat-typing-dot w-[7px] h-[7px] rounded-full" style={{ background: "#7eb8e5" }} />
                    <span className="chat-typing-dot w-[7px] h-[7px] rounded-full" style={{ background: "#7eb8e5" }} />
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
