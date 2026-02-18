import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

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
  const titleText = language === "it" ? "Assistente LEGALIT" : "LEGALIT Assistant";

  return (
    <>
      <Button
        data-testid="button-chat-toggle"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg"
        style={{
          background: "linear-gradient(135deg, #08396B 0%, #2e6884 100%)",
          color: "#fff",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      <div
        data-testid="chat-window"
        className="fixed bottom-24 right-6 z-[9998] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-md shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right"
        style={{
          height: isOpen ? "480px" : "0px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.9)",
          pointerEvents: isOpen ? "auto" : "none",
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 shrink-0"
          style={{
            background: "linear-gradient(135deg, #08396B 0%, #2e6884 100%)",
            color: "#fff",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              L
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{titleText}</p>
              <p className="text-[11px] opacity-70">AI-powered</p>
            </div>
          </div>
          <Button
            data-testid="button-chat-close"
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-white no-default-hover-elevate no-default-active-elevate"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ background: "#f7f8fa" }}
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400 text-center px-4">
                {language === "it"
                  ? "Ciao! Come posso aiutarti?"
                  : "Hi! How can I help you?"}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                data-testid={`chat-message-${msg.role}-${i}`}
                className="max-w-[80%] px-3 py-2 rounded-md text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? {
                        background: "#08396B",
                        color: "#fff",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "#ffffff",
                        color: "#1a1a1a",
                        border: "1px solid #e5e7eb",
                        borderBottomLeftRadius: "4px",
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
                className="px-3 py-2 rounded-md text-sm"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="flex items-center gap-1" data-testid="chat-typing-indicator">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{
            borderTop: "1px solid #e5e7eb",
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
            className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 outline-none focus:border-[#2e6884] transition-colors bg-transparent text-gray-900"
            autoComplete="off"
          />
          <Button
            data-testid="button-chat-send"
            size="icon"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              background: "#08396B",
              color: "#fff",
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
