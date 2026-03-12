import { useState } from "react";

interface AnimatedEnvelopeProps {
  className?: string;
  size?: number;
  scrolled?: boolean;
}

export default function AnimatedEnvelope({ 
  className = "", 
  size = 85,
  scrolled = false
}: AnimatedEnvelopeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const w = size;
  const h = size * 0.62;

  const colors = {
    back: scrolled ? "#e0d6c2" : "#ebe4d4",
    front: scrolled ? "#e8e0d0" : "#f5f0e1",
    flap: scrolled ? "#ddd4c0" : "#ece4d4",
    border: scrolled ? "#b0a58e" : "#cdc3ad",
    letter: scrolled ? "#faf8f3" : "#ffffff",
    lines: scrolled ? "#a09580" : "#d1c7b7",
  };

  const flapPath = "M4 20H116L60 48L4 20Z";

  return (
    <div
      className={`inline-flex items-center justify-center cursor-pointer relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: w, height: h }}
      data-testid="animated-envelope"
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="shadow-sm" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        <rect
          x="4"
          y="20"
          width="112"
          height="52"
          rx="4"
          fill={colors.back}
          stroke={colors.border}
          strokeWidth="1"
        />

        <g
          style={{
            transformOrigin: "60px 20px",
            transition: isHovered
              ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0s"
              : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.35s",
            transform: isHovered ? "rotateX(180deg)" : "rotateX(0deg)",
          }}
        >
          <path
            d={flapPath}
            fill={colors.flap}
            stroke={colors.border}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>

        <g
          filter="url(#shadow-sm)"
          style={{
            transition: isHovered 
              ? "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s"
              : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0s",
            transform: isHovered ? "translateY(-30px)" : "translateY(0px)",
          }}
        >
          <rect
            x="14"
            y="24"
            width="92"
            height="46"
            rx="2"
            fill={colors.letter}
            stroke={colors.border}
            strokeWidth="0.5"
          />
          <line x1="24" y1="34" x2="96" y2="34" stroke={colors.lines} strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="42" x2="86" y2="42" stroke={colors.lines} strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="50" x2="70" y2="50" stroke={colors.lines} strokeWidth="2" strokeLinecap="round" />
        </g>

        <path
          d="M4 72V20L60 48L116 20V72C116 74.2 114.2 76 112 76H8C5.8 76 4 74.2 4 72Z"
          fill={colors.front}
          stroke={colors.border}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M4 72L60 48L116 72" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.5" />

        <g 
            style={{
                transformOrigin: "60px 20px",
                transform: isHovered ? "rotateX(180deg)" : "rotateX(0deg)",
                transition: isHovered
                    ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0s, opacity 0s linear 0.1s"
                    : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.35s, opacity 0s linear 0.35s",
                opacity: isHovered ? 0 : 1,
                pointerEvents: 'none'
            }}
        >
          <path
            d={flapPath}
            fill={colors.flap}
            stroke={colors.border}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
           <path d={flapPath} fill="black" opacity="0.05" style={{ transform: "translateY(1px)" }} />
        </g>

      </svg>
    </div>
  );
}