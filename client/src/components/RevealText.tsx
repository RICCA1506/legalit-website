import { useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface RevealTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  barColor?: string;
  contrastTextColor?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const MotionComponents = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
};

export default function RevealText({
  children,
  as = "span",
  className = "",
  barColor,
  contrastTextColor,
  delay = 0,
  duration = 0.6,
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const barControls = useAnimation();

  const sweepColor = barColor || "#2e6884";
  const innerTextColor = contrastTextColor || "#ffffff";
  const delaySeconds = delay / 1000;
  const totalDuration = duration * 2.5;

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    const runSequence = async () => {
      try {
        await barControls.start({
          width: "100%",
          left: "0%",
          transition: {
            duration: totalDuration * 0.4,
            ease: [0.77, 0, 0.175, 1],
            delay: delaySeconds,
          },
        });

        if (cancelled) return;

        await new Promise((r) => setTimeout(r, totalDuration * 80));

        if (cancelled) return;

        await barControls.start({
          width: "0%",
          left: "100%",
          transition: {
            duration: totalDuration * 0.35,
            ease: [0.77, 0, 0.175, 1],
          },
        });
      } catch {}
    };

    runSequence();

    return () => { cancelled = true; barControls.stop(); };
  }, [isInView, barControls, totalDuration, delaySeconds]);

  const Tag = MotionComponents[as];

  return (
    <Tag
      ref={ref as any}
      className={`${className}`}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <span style={{ position: "relative", zIndex: 1, display: "inline-block" }}>
        {children}
      </span>

      <motion.span
        aria-hidden="true"
        initial={{ width: "0%", left: "0%" }}
        animate={barControls}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "0%",
          height: "100%",
          backgroundColor: sweepColor,
          zIndex: 2,
          pointerEvents: "none",
          willChange: "width, left",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            color: innerTextColor,
            position: "absolute",
            top: 0,
            left: 0,
            display: "inline-block",
            width: "max-content",
          }}
        >
          {children}
        </span>
      </motion.span>
    </Tag>
  );
}
