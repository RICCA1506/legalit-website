import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ScrollProvider } from "@/contexts/ScrollContext";
import { LinkedInCardProvider } from "@/contexts/LinkedInCardContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Attivita from "@/pages/Attivita";
import AttivitaDetail from "@/pages/AttivitaDetail";
import Professionisti from "@/pages/Professionisti";
import Sedi from "@/pages/Sedi";
import News from "@/pages/News";
import Contatti from "@/pages/Contatti";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Registrazione from "@/pages/Registrazione";
import Newsletter from "@/pages/Newsletter";
import LavoraConNoi from "@/pages/LavoraConNoi";
import Privacy from "@/pages/Privacy";
import Cookies from "@/pages/Cookies";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";
import CookieConsent from "@/components/CookieConsent";
import SmoothScroll from "@/components/SmoothScroll";
import TopographicBackground from "@/components/TopographicBackground";
import LoadingScreen from "@/components/LoadingScreen";
import { LoadingContext } from "@/contexts/LoadingContext";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function AnalyticsTracker() {
  const [location] = useLocation();
  
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-SYHZF2CVPF', {
        page_path: location,
        page_title: document.title,
      });
    }
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/attivita" component={Attivita} />
      <Route path="/attivita/:id" component={AttivitaDetail} />
      <Route path="/professionisti" component={Professionisti} />
      <Route path="/sedi" component={Sedi} />
      <Route path="/news" component={News} />
      <Route path="/contatti" component={Contatti} />
      <Route path="/area-riservata" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/password-dimenticata" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/registrazione" component={Registrazione} />
      <Route path="/newsletter" component={Newsletter} />
      <Route path="/lavora-con-noi" component={LavoraConNoi} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/termini" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContentInner() {
  const [location] = useLocation();
  const { currentTheme } = useTheme();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const isHomePage = location === "/";

  const shouldShowLoading = isHomePage && showLoading && !loadingComplete;

  return (
    <LoadingContext.Provider value={{ loadingComplete }}>
      <SmoothScroll />
      <AnalyticsTracker />
      {!shouldShowLoading && <TopographicBackground interactive={true} />}
      {shouldShowLoading && (
        <LoadingScreen
          heroImageSrc={currentTheme.heroImage}
          onComplete={() => {
            setLoadingComplete(true);
            setShowLoading(false);
          }}
        />
      )}
      <div className="min-h-screen flex flex-col" style={{ position: "relative", zIndex: 10 }}>
        <Header />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
      <CookieConsent />
      <Toaster />
    </LoadingContext.Provider>
  );
}

function AppContent() {
  return (
    <ThemeProvider>
      <ScrollProvider>
        <LinkedInCardProvider>
          <TooltipProvider>
            <AppContentInner />
          </TooltipProvider>
        </LinkedInCardProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
