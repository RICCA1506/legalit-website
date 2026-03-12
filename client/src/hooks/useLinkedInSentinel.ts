import { useRef, useEffect, useCallback } from "react";
import { useLinkedInCard } from "@/contexts/LinkedInCardContext";

export function useLinkedInSentinel() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setCardVisible } = useLinkedInCard();

  const checkVisibility = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    const headerHeight = 64;
    setCardVisible(rect.top > headerHeight);
  }, [setCardVisible]);

  useEffect(() => {
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      setCardVisible(true);
    };
  }, [checkVisibility, setCardVisible]);

  return sentinelRef;
}
