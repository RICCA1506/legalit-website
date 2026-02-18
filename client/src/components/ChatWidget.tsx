import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
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
    }
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 80);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
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
  const titleText = language === "it" ? "Assistente Virtuale" : "Virtual Assistant";
  const subtitleText = "LEGALIT";
  const welcomeText = language === "it"
    ? "Benvenuto! Sono l'assistente virtuale di LEGALIT. Come posso aiutarla?"
    : "Welcome! I'm LEGALIT's virtual assistant. How can I help you?";

  return (
    <>
      {/* Floating toggle button with firm logo */}
      <button
        data-testid="button-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[9999] group"
        style={{ outline: "none" }}
      >
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
          style={{
            background: "linear-gradient(145deg, #08396B 0%, #0c4d8a 50%, #2e6884 100%)",
            boxShadow: "0 4px 24px rgba(8, 57, 107, 0.4), 0 0 0 3px rgba(126, 184, 229, 0.15)",
          }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <img
                src={logoSymbol}
                alt="LEGALIT"
                className="w-9 h-9 object-contain brightness-0 invert"
              />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                style={{ background: "#7eb8e5" }}
              />
            </>
          )}
        </div>
      </button>

      {/* Chat window */}
      <div
        data-testid="chat-window"
        className="fixed bottom-[6.5rem] right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-md overflow-hidden transition-all duration-300 origin-bottom-right"
        style={{
          height: isOpen ? "520px" : "0px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.92) translateY(12px)",
          pointerEvents: isOpen ? "auto" : "none",
          boxShadow: isOpen ? "0 12px 48px rgba(8, 57, 107, 0.25), 0 0 0 1px rgba(8, 57, 107, 0.08)" : "none",
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
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
            >
              <img
                src={logoSymbol}
                alt="LEGALIT"
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight tracking-wide">{subtitleText}</p>
              <p className="text-xs text-white/60">{titleText}</p>
            </div>
          </div>
          <Button
            data-testid="button-chat-close"
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white no-default-hover-elevate no-default-active-elevate"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
          style={{ background: "#f5f7fa" }}
        >
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(8, 57, 107, 0.08)" }}
              >
                <img
                  src={logoSymbol}
                  alt=""
                  className="w-8 h-8 object-contain"
                  style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.4)" }}
                />
              </div>
              <p className="text-sm text-center leading-relaxed" style={{ color: "#5a6b7d" }}>
                {welcomeText}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                  style={{ background: "rgba(8, 57, 107, 0.08)" }}
                >
                  <img
                    src={logoSymbol}
                    alt=""
                    className="w-4 h-4 object-contain"
                    style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.4)" }}
                  />
                </div>
              )}
              <div
                data-testid={`chat-message-${msg.role}-${i}`}
                className="max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #08396B, #0c4d8a)",
                        color: "#fff",
                        borderRadius: "14px 14px 4px 14px",
                      }
                    : {
                        background: "#ffffff",
                        color: "#1e2a3a",
                        borderRadius: "14px 14px 14px 4px",
                        border: "1px solid rgba(8, 57, 107, 0.08)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                style={{ background: "rgba(8, 57, 107, 0.08)" }}
              >
                <img
                  src={logoSymbol}
                  alt=""
                  className="w-4 h-4 object-contain"
                  style={{ filter: "sepia(1) saturate(3) hue-rotate(190deg) brightness(0.4)" }}
                />
              </div>
              <div
                className="px-4 py-3 rounded-md"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(8, 57, 107, 0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  borderRadius: "14px 14px 14px 4px",
                }}
              >
                <div className="flex items-center gap-1.5" data-testid="chat-typing-indicator">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#08396B", opacity: 0.5, animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#08396B", opacity: 0.5, animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#08396B", opacity: 0.5, animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-opacity"
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
            borderTop: "1px solid rgba(8, 57, 107, 0.08)",
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
            className="flex-1 px-3.5 py-2 text-[13px] rounded-full outline-none transition-colors"
            style={{
              background: "#f0f3f7",
              border: "1px solid transparent",
              color: "#1e2a3a",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(8, 57, 107, 0.2)"; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f0f3f7"; }}
            autoComplete="off"
          />
          <button
            data-testid="button-chat-send"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #08396B, #0c4d8a)",
              color: "#fff",
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
