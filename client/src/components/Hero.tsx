import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useScrollState } from "@/contexts/ScrollContext";
import { motion } from "framer-motion";
import gsap from "gsap";

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < 768 || 'ontouchstart' in window) return 'mobile';
  if (window.innerWidth >= 768 && window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

interface HeroProps {
  loadingComplete?: boolean;
}

export default function Hero({ loadingComplete = false }: HeroProps) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { hasScrolled, setHasScrolled } = useScrollState();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  
  const accentWord1Ref = useRef<HTMLSpanElement>(null);
  const accentWord2Ref = useRef<HTMLSpanElement>(null);
  const accentWord3Ref = useRef<HTMLSpanElement>(null);
  const animationTriggeredRef = useRef(false);
  const animationCompleteRef = useRef(false);
  const alreadyScrolledRef = useRef(hasScrolled);
  const loadingRevealDoneRef = useRef(false);
  const loadingCompleteRef = useRef(loadingComplete);
  loadingCompleteRef.current = loadingComplete;

  useLayoutEffect(() => {
    if (alreadyScrolledRef.current) {
      gsap.set(contentWrapperRef.current, { opacity: 1 });
      gsap.set(headingRef.current, { opacity: 1, y: 0 });
      gsap.set(ctaButtonsRef.current, { opacity: 1, y: 0 });
      gsap.set(bgRef.current, { scale: 1.05 });
      [accentWord1Ref, accentWord2Ref, accentWord3Ref].forEach(ref => {
        if (ref.current) {
          gsap.set(ref.current.querySelectorAll('.accent-letter'), { opacity: 1, y: 0 });
        }
      });
      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.pointerEvents = 'auto';
      }
      animationTriggeredRef.current = true;
      animationCompleteRef.current = true;
    } else {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';

      gsap.set([headingRef.current, ctaButtonsRef.current], { opacity: 0, y: 30 });
      gsap.set(contentWrapperRef.current, { opacity: 0 });
      gsap.set(bgRef.current, { scale: 1.05 });
    }
  }, []);

  const triggerHeroReveal = useCallback(() => {
    if (animationTriggeredRef.current) return;
    animationTriggeredRef.current = true;
    setHasScrolled(true);

    const device = getDeviceType();
    const mobileFactor = device === 'mobile' ? 0.6 : 1;

    const tl = gsap.timeline({
      onComplete: () => {
        animationCompleteRef.current = true;
        document.body.style.overflow = '';
      }
    });

    tl.to(contentWrapperRef.current, {
      opacity: 1,
      duration: 0.25 * mobileFactor,
      ease: "power2.out"
    }, 0.1)
    .to(headingRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4 * mobileFactor,
      ease: "power2.out"
    }, "-=0.15");

    [accentWord1Ref, accentWord2Ref, accentWord3Ref].forEach((ref, wordIdx) => {
      if (ref.current) {
        const letters = ref.current.querySelectorAll('.accent-letter');
        tl.fromTo(letters, {
          opacity: 0,
          y: 14,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.25 * mobileFactor,
          stagger: 0.03,
          ease: "power3.out",
        }, `-=${0.2 + wordIdx * 0.06}`);
      }
    });

    tl.to(ctaButtonsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.35 * mobileFactor,
      ease: "power2.out",
      onComplete: () => {
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.pointerEvents = 'auto';
        }
      }
    }, "-=0.2");

  }, [setHasScrolled]);

  useEffect(() => {
    if (alreadyScrolledRef.current) return;

    const handleScroll = (e: Event) => {
      if (!loadingCompleteRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!animationTriggeredRef.current) {
        e.preventDefault();
        e.stopPropagation();
        triggerHeroReveal();
        return;
      }
      
      if (!animationCompleteRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    const handleTouchStart = () => {
      if (!loadingCompleteRef.current) return;
      if (!animationTriggeredRef.current) {
        triggerHeroReveal();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!loadingCompleteRef.current) return;
      if (!animationTriggeredRef.current && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown')) {
        e.preventDefault();
        triggerHeroReveal();
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', handleScroll, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchmove', handleScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown, { capture: true } as EventListenerOptions);
      document.body.style.overflow = '';
    };
  }, [triggerHeroReveal]);

  useEffect(() => {
    if (heroImgRef.current) {
      heroImgRef.current.setAttribute("fetchpriority", "high");
    }
  }, []);

  useEffect(() => {
    if (alreadyScrolledRef.current) return;
    const onZoomStart = () => {
      if (bgRef.current) {
        const bowTl = gsap.timeline();
        bowTl.fromTo(bgRef.current, {
          scale: 1.0,
        }, {
          scale: 1.25,
          duration: 0.55,
          ease: "power2.in",
        });
        bowTl.to(bgRef.current, {
          scale: 1.05,
          duration: 1.1,
          ease: "power3.out",
        });
      }
    };
    window.addEventListener('loadingZoomStart', onZoomStart);
    return () => window.removeEventListener('loadingZoomStart', onZoomStart);
  }, []);

  useEffect(() => {
    if (loadingComplete && !loadingRevealDoneRef.current && !alreadyScrolledRef.current) {
      loadingRevealDoneRef.current = true;
      triggerHeroReveal();
    }
  }, [loadingComplete, triggerHeroReveal]);

  return (
    <div className="relative" style={{ height: "100vh" }}>
      <div 
        ref={heroRef}
        className="relative h-screen w-full flex flex-col justify-center overflow-hidden"
      >
        <div 
          ref={bgRef}
          className="absolute inset-0 will-change-transform"
          style={{ 
            transformOrigin: 'center center',
          }}
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={currentTheme.heroImageMobileAvif}
              type="image/avif"
            />
            <source
              media="(max-width: 767px)"
              srcSet={currentTheme.heroImageMobile}
              type="image/webp"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              srcSet={currentTheme.heroImageTabletAvif}
              type="image/avif"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              srcSet={currentTheme.heroImageTablet}
              type="image/webp"
            />
            <source
              srcSet={currentTheme.heroImageAvif}
              type="image/avif"
            />
            <source
              srcSet={currentTheme.heroImage}
              type="image/webp"
            />
            <img
              ref={heroImgRef}
              src={currentTheme.heroImage}
              alt="LEGALIT Studio Legale"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="sync"
              data-testid="hero-image"
            />
          </picture>
        </div>
        
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.35) 50%, rgba(0, 0, 0, 0.65) 100%)',
          }}
          animate={{
            opacity: hasScrolled ? 1 : 0.4,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        <div 
          ref={contentWrapperRef}
          className="relative z-10 w-full max-w-6xl mx-auto px-5 md:px-12 text-center flex-1 flex flex-col justify-center pt-20 md:pt-28"
          style={{
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <h1 
            ref={headingRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight leading-tight mt-[20px] md:mt-12"
            style={{
              opacity: 0,
              transform: 'translateY(30px)',
            }}
          >
            <span className="text-white">Il tuo </span><span ref={accentWord1Ref} className="italic" style={{ color: '#003767' }}>{Array.from("partner").map((ch, i) => <span key={i} className="accent-letter" style={{ display: 'inline-block', position: 'relative', zIndex: 1, opacity: 0 }}>{ch}</span>)}</span><br />
            <span className="text-white">per difendere i </span><span ref={accentWord2Ref} className="italic" style={{ color: '#003767' }}>{Array.from("diritti").map((ch, i) => <span key={i} className="accent-letter" style={{ display: 'inline-block', position: 'relative', zIndex: 1, opacity: 0 }}>{ch}</span>)}</span><br />
            <span className="text-white">e creare </span><span ref={accentWord3Ref} className="italic" style={{ color: '#003767' }}>{Array.from("valore").map((ch, i) => <span key={i} className="accent-letter" style={{ display: 'inline-block', position: 'relative', zIndex: 1, opacity: 0 }}>{ch}</span>)}</span>
          </h1>
          
          <div 
            ref={ctaButtonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            <Link href="/contatti">
              <Button 
                size="lg" 
                className="hero-cta-btn bg-white/20 text-white hover:bg-white/30 rounded-full px-6 font-medium shadow-lg border border-white/30"
                data-testid="button-hero-consultation"
              >
                {t("hero.cta1")}
              </Button>
            </Link>
            <Link href="/attivita">
              <Button 
                size="lg" 
                className="hero-cta-btn bg-white/10 text-white hover:bg-white/20 rounded-full px-6 font-medium border border-white/30"
                data-testid="button-hero-activities"
              >
                {t("hero.cta2")}
              </Button>
            </Link>
          </div>
        </div>

        <motion.div 
          className="absolute bottom-12 left-0 right-0 mx-auto w-fit z-20 flex flex-col items-center gap-2"
          animate={{
            opacity: hasScrolled ? 0 : 1,
            y: hasScrolled ? 20 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
