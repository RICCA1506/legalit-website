import { useRef, useState, useEffect } from "react";

interface LandoRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export default function LandoReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.03,
  once = true,
}: LandoRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          hasAnimated.current = true;
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const words = text.split(" ");

  let charOffset = 0;

  return (
    <Tag
      ref={ref as any}
      className={`leading-tight ${className}`}
      aria-label={text}
    >
      {words.map((word, wordIndex) => {
        const wordStart = charOffset;
        charOffset += word.length + 1;
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
            {word.split("").map((char, charIndex) => {
              const globalIndex = wordStart + charIndex;
              return (
                <span
                  key={charIndex}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <span
                    className={`inline-block ${isVisible ? "lando-char-visible" : "lando-char-hidden"} ml-[1px] mr-[1px]`}
                    style={{
                      transitionDelay: isVisible ? `${delay / 1000 + globalIndex * stagger}s` : "0s",
                      willChange: "transform, opacity",
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
