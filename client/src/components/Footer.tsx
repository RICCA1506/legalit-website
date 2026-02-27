import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Mail, Phone, MapPin, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { legalitLogo, offices as officesData } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const offices = officesData.map(o => o.city);

function BritishFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

function ItalianFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="40" fill="#009246"/>
      <rect x="20" width="20" height="40" fill="#fff"/>
      <rect x="40" width="20" height="40" fill="#CE2B37"/>
    </svg>
  );
}

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: language === "it" ? "Iscrizione confermata" : "Subscription confirmed",
        description: language === "it" ? "Grazie per esserti iscritto alla nostra newsletter!" : "Thank you for subscribing to our newsletter!",
      });
    },
    onError: (error: any) => {
      const message = error?.message || (language === "it" ? "Si è verificato un errore" : "An error occurred");
      toast({
        title: language === "it" ? "Errore" : "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      subscribeMutation.mutate(email);
    }
  };
  
  const toggleLanguage = () => {
    setLanguage(language === "it" ? "en" : "it");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="w-full px-5 md:px-12 lg:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div>
            <Link href="/" className="flex items-center mb-6" data-testid="link-footer-logo">
              <img src={legalitLogo} alt="Legalit - Società tra Avvocati" className="h-14 w-auto brightness-0 invert" loading="lazy" decoding="async" />
            </Link>
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-14 w-14 text-white/70 hover:text-white hover:bg-white/10" 
                data-testid="button-social-linkedin"
                asChild
              >
                <a 
                  href="https://www.linkedin.com/company/legalit---avvocati-associati/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiLinkedin className="h-8 w-8" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">{t("footer.locations")}</h4>
            <ul className="space-y-3">
              {offices.map((office) => (
                <li key={office}>
                  <Link
                    href="/sedi"
                    className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                    data-testid={`link-footer-office-${office.toLowerCase()}`}
                  >
                    <MapPin className="h-3 w-3" />
                    {office}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">{t("footer.contact")}</h4>
            <div className="space-y-4 text-white/70">
              <a
                href="mailto:info@legalit.it"
                className="flex items-center gap-3 hover:text-white transition-colors"
                data-testid="link-footer-email"
              >
                <Mail className="h-4 w-4" />
                info@legalit.it
              </a>
              <a
                href="tel:063213911"
                className="flex items-center gap-3 hover:text-white transition-colors"
                data-testid="link-footer-phone"
              >
                <Phone className="h-4 w-4" />
                06 3213911
              </a>
            </div>
            <div className="mt-6">
              <Link href="/contatti">
                <Button className="w-full rounded-full bg-[#437791] text-accent-foreground hover:bg-accent/80" data-testid="button-footer-contact">
                  {t("footer.contactUs")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 rounded-full px-6"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
          >
            {language === "it" ? (
              <>
                <BritishFlag className="h-4 w-6 mr-2 rounded-sm" />
                EN
              </>
            ) : (
              <>
                <ItalianFlag className="h-4 w-6 mr-2 rounded-sm" />
                IT
              </>
            )}
          </Button>
        </div>

        <div className="border-t border-white/10 mt-3 pt-3 pb-1">
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-white/40 text-[11px] leading-tight">
                {language === "it" ? "Rimani aggiornato sulle ultime novità legali." : "Stay updated on the latest legal news."}
              </span>
              <div className="flex items-center gap-0">
                {isSubscribed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">{t("footer.newsletterSuccess")}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-0">
                    <Input
                      type="email"
                      placeholder={t("footer.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-0 text-white placeholder:text-white/50 h-7 text-xs w-44 rounded-r-none"
                      data-testid="input-newsletter-email"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={subscribeMutation.isPending || !email}
                      className="bg-[#083b6e99] text-white h-7 w-7 rounded-l-none"
                      data-testid="button-newsletter-subscribe"
                    >
                      {subscribeMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </Button>
                  </form>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[11px] text-white/50">
              <p className="text-white/50 text-[11px]">
                &copy; {new Date().getFullYear()} Legalit. {t("footer.rights")}
              </p>
              <Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">{t("footer.cookies")}</Link>
              <Link href="/termini" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
              <Link 
                href="/login" 
                className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-white/30 hover:text-white"
                data-testid="link-footer-login"
              >
                {t("footer.login")}
              </Link>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <p className="text-white/35 text-[10px] leading-relaxed" data-testid="text-company-info">
              LEGALIT SOCIETA' TRA AVVOCATI S.R.L. — Via Filippo Corridoni, 19 — 00195 Roma — C.F. / P. IVA: 18365621004
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
