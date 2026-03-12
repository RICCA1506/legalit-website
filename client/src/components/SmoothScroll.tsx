import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useLocation } from "wouter";
import { useScrollState } from "@/contexts/ScrollContext";

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);
  const dialogOpenRef = useRef(false);
  const [location] = useLocation();
  const { hasScrolled } = useScrollState();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      prevent: (node: Element) => {
        if (node.closest?.("[role='dialog']") || node.closest?.("[data-lenis-prevent]")) {
          return true;
        }
        return false;
      },
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    const syncLenisWithDialogs = () => {
      const hasDialog = !!document.querySelector("[role='dialog']");
      if (hasDialog !== dialogOpenRef.current) {
        dialogOpenRef.current = hasDialog;
        if (hasDialog) {
          lenis.stop();
        } else {
          lenis.start();
        }
      }
    };

    const observer = new MutationObserver(syncLenisWithDialogs);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["role"],
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (dialogOpenRef.current) {
      lenis.stop();
      return;
    }

    if (location === "/" && !hasScrolled) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [hasScrolled, location]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location]);

  return null;
}
