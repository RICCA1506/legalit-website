import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, ArrowDown, Building2, User, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import logoSymbol from "@assets/logo_legalit_cropped_(1)_1771133031977.png";

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

function formatBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [pulseToggle, setPulseToggle] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

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
        style={{ outline: "none" }}
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
              transform: isOpen ? "rotate(0deg)" : "rotate(0deg)",
            }}
          >
            <div
              className="transition-all duration-300"
              style={{
                transform: isOpen ? "rotate(90deg) scale(0.9)" : "rotate(0deg) scale(1)",
                opacity: 1,
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
        data-testid="chat-window"
        className="fixed z-[9998] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
          bottom-0 right-0 w-full h-[100dvh]
          sm:bottom-[5.5rem] sm:right-5 sm:w-[400px] sm:max-w-[calc(100vw-2rem)] sm:h-[560px] sm:rounded-2xl"
        style={{
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

        {/* Messages area with watermark */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
          style={{ background: "#f5f7fa" }}
        >
          {/* Logo watermark background */}
          <div
            className="pointer-events-none fixed"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              opacity: 0.035,
              zIndex: 0,
            }}
          >
            <img
              src={logoSymbol}
              alt=""
              className="w-full h-full object-contain"
              style={{ filter: "grayscale(1)" }}
            />
          </div>

          <div className="relative z-[1]">
            {/* Welcome state */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center pt-6 pb-2 gap-5 px-2 chat-msg-enter">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(8, 57, 107, 0.06)" }}
                >
                  <img
                    src={logoSymbol}
                    alt=""
                    className="w-9 h-9 object-contain"
                    style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.35)" }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold mb-1" style={{ color: "#08396B" }}>{welcomeTitle}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7d8e" }}>{welcomeSubtitle}</p>
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
                        background: "#fff",
                        border: "1px solid rgba(8, 57, 107, 0.1)",
                        color: "#08396B",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(8, 57, 107, 0.25)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(8, 57, 107, 0.1)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(8, 57, 107, 0.1)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <qr.icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#2e6884" }} />
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
                    style={{ background: "rgba(8, 57, 107, 0.07)" }}
                  >
                    <img
                      src={logoSymbol}
                      alt=""
                      className="w-4 h-4 object-contain"
                      style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.35)" }}
                    />
                  </div>
                )}
                <div
                  data-testid={`chat-message-${msg.role}-${i}`}
                  className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-[1.6] whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, #08396B, #0c4d8a)",
                          color: "#fff",
                          borderRadius: "16px 16px 4px 16px",
                        }
                      : {
                          background: "#ffffff",
                          color: "#1e2a3a",
                          borderRadius: "16px 16px 16px 4px",
                          border: "1px solid rgba(8, 57, 107, 0.07)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        }
                  }
                >
                  {msg.role === "model" ? formatBoldText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start chat-msg-enter">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                  style={{ background: "rgba(8, 57, 107, 0.07)" }}
                >
                  <img
                    src={logoSymbol}
                    alt=""
                    className="w-4 h-4 object-contain"
                    style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.35)" }}
                  />
                </div>
                <div
                  className="px-4 py-3"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(8, 57, 107, 0.07)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                    borderRadius: "16px 16px 16px 4px",
                  }}
                >
                  <div className="flex items-center gap-1.5" data-testid="chat-typing-indicator">
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#08396B" }} />
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#08396B" }} />
                    <span className="chat-typing-dot w-[6px] h-[6px] rounded-full" style={{ background: "#08396B" }} />
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
              style={{ background: "#08396B", color: "#fff" }}
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
            borderTop: "1px solid rgba(8, 57, 107, 0.06)",
            background: "#ffffff",
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
              background: "#f0f3f7",
              border: "1px solid transparent",
              color: "#1e2a3a",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(8, 57, 107, 0.15)"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(8, 57, 107, 0.06)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f0f3f7"; e.currentTarget.style.boxShadow = "none"; }}
            autoComplete="off"
          />
          <button
            data-testid="button-chat-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #08396B, #0c4d8a)" : "#c8cfd8",
              color: "#fff",
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
