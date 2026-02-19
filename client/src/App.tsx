import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState, lazy, Suspense } from "react";
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
import CookieConsent from "@/components/CookieConsent";
import ChatWidget from "@/components/ChatWidget";
import SmoothScroll from "@/components/SmoothScroll";
import LoadingScreen from "@/components/LoadingScreen";
import { LoadingContext } from "@/contexts/LoadingContext";

const Attivita = lazy(() => import("@/pages/Attivita"));
const AttivitaDetail = lazy(() => import("@/pages/AttivitaDetail"));
const Professionisti = lazy(() => import("@/pages/Professionisti"));
const Sedi = lazy(() => import("@/pages/Sedi"));
const News = lazy(() => import("@/pages/News"));
const Contatti = lazy(() => import("@/pages/Contatti"));
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Registrazione = lazy(() => import("@/pages/Registrazione"));
const Newsletter = lazy(() => import("@/pages/Newsletter"));
const LavoraConNoi = lazy(() => import("@/pages/LavoraConNoi"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Cookies = lazy(() => import("@/pages/Cookies"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/not-found"));

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

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-[#2e6884] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LazyFallback />}>
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
    </Suspense>
  );
}

function AppContentInner() {
  const [location] = useLocation();
  const { currentTheme } = useTheme();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const isHomePage = location === "/";

  const shouldShowLoading = isHomePage && showLoading && !loadingComplete;

  useEffect(() => {
    if (!shouldShowLoading) {
      const el = document.getElementById('app-preloader');
      if (el) { el.classList.add('fade-out'); setTimeout(() => el.remove(), 450); }
    }
  }, [shouldShowLoading]);

  return (
    <LoadingContext.Provider value={{ loadingComplete }}>
      <SmoothScroll />
      <AnalyticsTracker />
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
      <ChatWidget />
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
