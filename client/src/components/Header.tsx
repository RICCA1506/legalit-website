import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, Settings, Home, Scale, Users, MapPin, Mail, Newspaper, Briefcase } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import AnimatedEnvelope from "@/components/AnimatedEnvelope";
import { legalitLogo, legalitLogoIcon, legalitLogoWordmark } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useScrollState } from "@/contexts/ScrollContext";
import { useLinkedInCard } from "@/contexts/LinkedInCardContext";

function NavLink({
  item,
  index,
  isHomePage,
  shouldAnimate,
  heroHasScrolled,
  scrolled,
  isActive,
}: {
  item: { href: string; label: string; icon: any };
  index: number;
  isHomePage: boolean;
  shouldAnimate: boolean;
  heroHasScrolled: boolean;
  scrolled: boolean;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const chars = item.label.split("");
  const show = heroHasScrolled || !isHomePage;

  return (
    <motion.div
      initial={isHomePage ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{
        duration: 0.6,
        delay: shouldAnimate ? 0.1 + index * 0.05 : 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link href={item.href}>
        <Button
          variant="ghost"
          size="sm"
          className={`relative text-[10px] lg:text-[11px] xl:text-[12px] mx-0.5 lg:mx-0.5 px-1.5 lg:px-2 min-h-7 h-7 overflow-hidden ${
            scrolled
              ? isActive
                ? "text-primary bg-primary/10"
                : "text-primary/80 hover:text-primary hover:bg-primary/10"
              : "text-white nav-glass-dark"
          }`}
          data-testid={`link-nav-${item.label.toLowerCase()}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span className="relative inline-flex overflow-hidden">
            <span className="flex">
              {chars.map((char, i) => (
                <motion.span
                  key={`out-${i}`}
                  animate={{ y: hovered ? -20 : 0, opacity: hovered ? 0 : 1 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.02,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <span className="absolute inset-0 flex">
              {chars.map((char, i) => (
                <motion.span
                  key={`in-${i}`}
                  animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.02,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </span>
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className={`absolute bottom-0 left-2 right-2 h-0.5 ${
                scrolled ? "bg-primary" : "bg-white"
              }`}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
      </Link>
    </motion.div>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasScrolled: heroHasScrolled } = useScrollState();
  const { showInHeader: showLinkedInFollow } = useLinkedInCard();

  const isLinkedInPage = location === "/news" || location === "/lavora-con-noi";

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/attivita", label: t("nav.activities"), icon: Scale },
    { href: "/professionisti", label: t("nav.professionals"), icon: Users },
    { href: "/sedi", label: t("nav.locations"), icon: MapPin },
    { href: "/contatti", label: t("nav.contact"), icon: Mail },
    { href: "/news", label: t("nav.news"), icon: Newspaper },
    { href: "/lavora-con-noi", label: t("nav.careers"), icon: Briefcase },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const isHomePage = location === "/";
  const shouldAnimate = isHomePage && heroHasScrolled;

  useEffect(() => {
    if (!isHomePage) {
      setHeaderReady(true);
      return;
    }
    if (heroHasScrolled && !headerReady) {
      const timer = setTimeout(() => setHeaderReady(true), 900);
      return () => clearTimeout(timer);
    }
  }, [isHomePage, heroHasScrolled, headerReady]);

  return (
    <motion.header
      initial={isHomePage ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ 
        y: isHomePage ? (heroHasScrolled ? 0 : -100) : 0, 
        opacity: isHomePage ? (heroHasScrolled ? 1 : 0) : 1 
      }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        headerReady ? 'transition-all duration-300' : ''
      } ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-0 z-50 flex items-center gap-2">
        <Link 
          href="/" 
          data-testid="link-home-logo-corner"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHomePage ? (heroHasScrolled ? 1 : 0) : (scrolled ? 1 : 0) }}
            transition={{ duration: 0.5, delay: shouldAnimate ? 0.2 : 0 }}
            className="px-3 md:px-4 lg:px-6"
          >
            <div className="flex items-center gap-2.5">
              <img 
                src={legalitLogoIcon} 
                alt="Legalit" 
                className="w-auto h-11 md:h-12 lg:h-14 object-contain"
              />
              <img 
                src={legalitLogoWordmark} 
                alt="LEGALIT Società tra Avvocati" 
                className="w-auto h-9 md:h-10 lg:h-12 object-contain"
              />
            </div>
          </motion.div>
        </Link>
        {isLinkedInPage && (
          <motion.a
            href="https://www.linkedin.com/company/legalit---avvocati-associati/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{
              opacity: showLinkedInFollow ? 1 : 0,
              x: showLinkedInFollow ? 0 : -20,
              scale: showLinkedInFollow ? 1 : 0.8,
              visibility: showLinkedInFollow ? "visible" as const : "hidden" as const,
            }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:flex items-center gap-1 xl:gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full pl-1.5 pr-2.5 xl:pl-2.5 xl:pr-4 py-1 xl:py-1.5 text-[11px] xl:text-sm font-semibold shadow-lg transition-colors"
            data-testid="button-header-linkedin-follow"
          >
            <SiLinkedin className="w-3.5 h-3.5 xl:w-5 xl:h-5" />
            <span>Legalit</span>
          </motion.a>
        )}
      </div>
      <div className="w-full flex items-center justify-between px-4 md:px-12 lg:px-16 transition-all duration-300 h-14 md:h-16 relative">
        <div className="w-20 md:w-32 lg:w-40 xl:w-48 flex-shrink-0" />

        <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item, index) => (
            <NavLink
              key={item.href}
              item={item}
              index={index}
              isHomePage={isHomePage}
              shouldAnimate={shouldAnimate}
              heroHasScrolled={heroHasScrolled}
              scrolled={scrolled}
              isActive={location === item.href}
            />
          ))}
        </nav>

        <motion.div 
          className="hidden lg:flex items-center gap-2 absolute right-4 md:right-12 lg:right-16"
          initial={isHomePage ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: heroHasScrolled || !isHomePage ? 1 : 0 }}
          transition={{ 
            duration: 0.6, 
            delay: shouldAnimate ? 0.4 : 0,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {!isLoading && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-white/10 h-7 w-7"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-6 w-6 bg-muted">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-[9px] bg-muted text-primary">{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/area-riservata" className="flex items-center cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    window.location.href = "/";
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Link href="/newsletter" className="group block" data-testid="link-header-newsletter">
            <div className="flex flex-col items-center">
              <div className="h-[38px] flex items-end justify-center">
                <AnimatedEnvelope
                  size={55}
                  scrolled={scrolled}
                  className="transition-all duration-300"
                />
              </div>
              <span 
                className={`text-[10px] font-bold tracking-wide transition-all duration-300 mt-[5px] ${
                  scrolled 
                    ? "text-primary group-hover:text-primary/70 opacity-100" 
                    : "opacity-0 pointer-events-none"
                }`}
              >
                Newsletter
              </span>
            </div>
          </Link>
          <div className="w-4" />
          <Link href="/contatti" className="group block">
            <div
              className="flex flex-col items-center cursor-pointer"
              data-testid="button-header-contact"
              title={t("nav.contactUs")}
            >
              <div className="h-[38px] flex items-end justify-center">
                <img
                  src="/attached_assets/unnamed_1770813762628.png"
                  alt={t("nav.contactUs")}
                  className="w-[60px] h-auto object-contain transition-all duration-500 group-hover:-translate-y-[6px] group-hover:rotate-[12deg]"
                  style={{
                    transformOrigin: 'center right',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: scrolled
                      ? 'brightness(0) saturate(100%) invert(33%) sepia(30%) saturate(600%) hue-rotate(163deg) brightness(90%) contrast(90%)'
                      : 'brightness(0) invert(1)'
                  }}
                />
              </div>
              <span 
                className={`text-[10px] font-bold tracking-wide transition-all duration-300 mt-[5px] ${
                  scrolled 
                    ? "text-primary group-hover:text-primary/70 opacity-100" 
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {t("nav.contactUs")}
              </span>
            </div>
          </Link>
        </motion.div>

        <div className="lg:hidden ml-auto flex items-center gap-2">
          {isLinkedInPage && (
            <motion.a
              href="https://www.linkedin.com/company/legalit---avvocati-associati/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{
                opacity: showLinkedInFollow ? 1 : 0,
                x: showLinkedInFollow ? 0 : 20,
                scale: showLinkedInFollow ? 1 : 0.8,
                visibility: showLinkedInFollow ? "visible" as const : "hidden" as const,
              }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full pl-2 pr-3 py-1.5 text-xs font-semibold shadow-lg transition-colors"
              data-testid="button-mobile-linkedin-follow"
            >
              <SiLinkedin className="w-4 h-4" />
              <span>Legalit</span>
            </motion.a>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${scrolled ? "text-primary" : "text-white bg-white/20 backdrop-blur-sm border border-white/30"}`}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-[280px] px-4">
            <div className="flex items-center gap-2 mb-4 mt-3">
              <img src={legalitLogoIcon} alt="Legalit" className="h-10 w-auto object-contain" />
              <img src={legalitLogoWordmark} alt="LEGALIT Società tra Avvocati" className="h-6 w-auto object-contain" />
            </div>
            
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      data-testid={`link-mobile-${item.label.toLowerCase()}`}
                    >
                      <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
                className="flex gap-3 mt-3"
              >
                <Link href="/newsletter" onClick={() => setIsOpen(false)} className="flex-1">
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-primary backdrop-blur-xl bg-primary/10 border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(46,104,132,0.15)]">
                    <AnimatedEnvelope size={20} scrolled={true} />
                    Newsletter
                  </div>
                </Link>
                <Link href="/contatti" onClick={() => setIsOpen(false)} className="flex-1">
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-primary backdrop-blur-xl bg-primary/10 border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(46,104,132,0.15)]">
                    <img
                      src="/attached_assets/unnamed_1770813762628.png"
                      alt={t("nav.contactUs")}
                      className="w-[18px] h-auto object-contain"
                      style={{
                        filter: 'brightness(0) saturate(100%) invert(33%) sepia(30%) saturate(600%) hue-rotate(163deg) brightness(90%) contrast(90%)'
                      }}
                    />
                    {t("nav.contactUs")}
                  </div>
                </Link>
              </motion.div>

              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + 1) * 0.05 }}
                >
                  <Link href="/area-riservata" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("nav.settings")}
                    </Button>
                  </Link>
                </motion.div>
              )}

              {isAuthenticated && (
                <div className="pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                      setIsOpen(false);
                      window.location.href = "/";
                    }}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
