import { useRef, useEffect, useState } from "react";

interface ApexLogoAnimationProps {
  size?: number;
  className?: string;
}

export function ApexLogoAnimation({ size = 550, className = "" }: ApexLogoAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const hasStartedRef = useRef(false);

  const setPathRef = (index: number) => (el: SVGPathElement | null) => {
    if (el) pathsRef.current[index] = el;
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setIsReducedMotion(reduceMotion);

    const paths = pathsRef.current;
    paths.forEach(path => {
      if (path) {
        const length = path.getTotalLength();
        path.style.setProperty('--path-length', String(length));
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function startOnce() {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        pathsRef.current.forEach(p => {
          if (p) {
            p.style.strokeDashoffset = '0';
            p.style.fillOpacity = '1';
          }
        });
        setIsAnimating(true);
        return;
      }

      setIsAnimating(true);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startOnce();
            io.unobserve(entry.target);
          }
        }
      }, { threshold: 0.35 });

      io.observe(container);

      return () => io.disconnect();
    } else {
      startOnce();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        maxWidth: '90vw',
        maxHeight: '90vh',
        visibility: isAnimating ? 'visible' : 'hidden',
      }}
    >
      <style>{`
        :root {
          --grey-outer: #76777B;
          --grey-dark: #636466;
          --grey-light: #8A8B8E;
          --blue-apex: #003B71;
          --anim-duration: 2.2s;
          --draw-ease: cubic-bezier(0.55, 0.00, 0.90, 1.00);
        }

        @keyframes drawLine {
          from { stroke-dashoffset: var(--path-length); }
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes fillIn {
          from { fill-opacity: 0; }
          to { fill-opacity: 1; }
        }

        .apex-path {
          stroke-width: 20px;
          stroke-dasharray: var(--path-length);
          stroke-dashoffset: var(--path-length);
          fill-opacity: 0;
        }

        .apex-path.animate-svg {
          animation:
            drawLine var(--anim-duration) var(--draw-ease) forwards,
            fillIn 0.45s cubic-bezier(0.2, 0.0, 0.2, 1) 1.55s forwards;
        }

        .apex-path.reduced-motion {
          stroke-dashoffset: 0;
          fill-opacity: 1;
          animation: none;
        }

        .part-outer-grey { stroke: var(--grey-outer); fill: var(--grey-outer); }
        .part-center-left { stroke: var(--grey-dark); fill: var(--grey-dark); clip-path: url(#clip-l); }
        .part-center-right { stroke: var(--grey-light); fill: var(--grey-light); clip-path: url(#clip-r); }
        .part-outer-blue { stroke: var(--blue-apex); fill: var(--blue-apex); }

        @media (prefers-reduced-motion: reduce) {
          .apex-path.animate-svg {
            animation: none;
            stroke-dashoffset: 0;
            fill-opacity: 1;
          }
        }
      `}</style>
      
      <svg 
        viewBox="0 0 1470 1470" 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.4))' }}
      >
        <defs>
          <clipPath id="clip-l">
            <rect x="0" y="0" width="735" height="1470" />
          </clipPath>
          <clipPath id="clip-r">
            <rect x="735" y="0" width="735" height="1470" />
          </clipPath>
          
          <filter id="glow-grey" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#8A8B8E" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor="#003B71" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feOffset dx="2" dy="4" />
            <feGaussianBlur stdDeviation="3" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.25" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        <g transform="translate(0, 1470) scale(1, -1)">
          <path 
            ref={setPathRef(0)}
            className={`apex-path part-outer-grey ${isAnimating ? (isReducedMotion ? 'reduced-motion' : 'animate-svg') : ''}`}
            filter="url(#glow-grey)"
            d="M441 1123 l-282 -287 90 -90 91 -91 198 198 197 197 142 -142 142 -142 31 29 c16 16 30 33 30 39 0 6 -78 88 -172 183 l-173 173 -197 -197 -198 -198 -22 22 -22 22 217 218 217 218 310 -310 310 -309 35 34 35 34 -342 343 c-189 189 -345 343 -349 343 -3 0 -132 -129 -288 -287z"
          />
          
          <path 
            ref={setPathRef(1)}
            className={`apex-path part-center-left ${isAnimating ? (isReducedMotion ? 'reduced-motion' : 'animate-svg') : ''}`}
            filter="url(#inner-shadow)"
            d="M735 935 L535 735 L735 535"
          />

          <path 
            ref={setPathRef(2)}
            className={`apex-path part-center-right ${isAnimating ? (isReducedMotion ? 'reduced-motion' : 'animate-svg') : ''}`}
            filter="url(#inner-shadow)"
            d="M735 935 L935 735 L735 535"
          />
          
          <path 
            ref={setPathRef(3)}
            className={`apex-path part-outer-blue ${isAnimating ? (isReducedMotion ? 'reduced-motion' : 'animate-svg') : ''}`}
            filter="url(#glow-blue)"
            d="M82 767 c-18 -18 -32 -37 -32 -43 0 -5 153 -162 340 -349 l340 -340 290 290 290 290 -87 87 c-48 49 -92 88 -98 88 -5 0 -96 -87 -202 -192 l-193 -193 -143 143 -143 142 -34 -35 -34 -35 40 -42 c21 -23 101 -105 176 -182 l137 -141 199 198 198 198 19 -21 c19 -21 18 -22 -195 -235 l-215 -215 -310 310 -311 310 -32 -33z"
          />
        </g>
      </svg>
    </div>
  );
}

export default ApexLogoAnimation;
