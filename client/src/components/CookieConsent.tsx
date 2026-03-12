import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export default function CookieConsent() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    closeBanner();
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    closeBanner();
  };

  const closeBanner = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  const content = language === "it" ? {
    title: "Informativa Cookie",
    description: "Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici per migliorare la tua esperienza. Puoi accettare tutti i cookie o solo quelli necessari.",
    acceptAll: "Accetta tutti",
    acceptNecessary: "Solo necessari",
    learnMore: "Maggiori informazioni"
  } : {
    title: "Cookie Notice",
    description: "We use necessary technical cookies for the site to function and analytical cookies to improve your experience. You can accept all cookies or only the necessary ones.",
    acceptAll: "Accept all",
    acceptNecessary: "Necessary only",
    learnMore: "Learn more"
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300 ${
        isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{content.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.description}{" "}
                  <Link 
                    href="/cookies" 
                    className="text-primary hover:underline"
                    data-testid="link-cookie-policy"
                  >
                    {content.learnMore}
                  </Link>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -mt-2 -mr-2"
                onClick={handleAcceptNecessary}
                data-testid="button-cookie-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
                data-testid="button-cookie-accept-all"
              >
                {content.acceptAll}
              </Button>
              <Button
                variant="outline"
                onClick={handleAcceptNecessary}
                className="w-full sm:w-auto"
                data-testid="button-cookie-accept-necessary"
              >
                {content.acceptNecessary}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
