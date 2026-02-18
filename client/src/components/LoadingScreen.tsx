import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import logoImage from "@assets/logo_legalit_cropped_1771120703206.png";
import TopographicBackground from "./TopographicBackground";

function dismissPreloader() {
  const el = document.getElementById('app-preloader');
  if (!el) return;
  el.classList.add('dissolve');
  setTimeout(() => el.remove(), 600);
}

interface LoadingScreenProps {
  heroImageSrc: string;
  onComplete: () => void;
}

export default function LoadingScreen({ heroImageSrc, onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomGroupRef = useRef<HTMLDivElement>(null);
  const brandImageRef = useRef<HTMLImageElement>(null);
  const completedRef = useRef(false);
  const imageLoadedRef = useRef(false);
  const logoDrawnRef = useRef(false);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
  const pad = 80;

  const logoPixelSize = vw >= 768 ? 380 : 280;
  const cx = vw / 2;
  const cy = vh / 2 - 20;

  const dr = 200 * logoPixelSize / 1470;
  const logoX = cx - logoPixelSize / 2;
  const logoY = cy - logoPixelSize / 2;

  const mw = vw + pad * 2;
  const mh = vh + pad * 2;
  const mcx = cx + pad;
  const mcy = cy + pad;

  const maskSvg = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${mw}' height='${mh}'>` +
    `<path fill-rule='evenodd' fill='white' d='` +
    `M0,0 L${mw},0 L${mw},${mh} L0,${mh} Z ` +
    `M${mcx},${mcy - dr} L${mcx + dr},${mcy} L${mcx},${mcy + dr} L${mcx - dr},${mcy} Z` +
    `'/></svg>`
  )}")`;

  const tryReveal = useCallback(() => {
    if (!imageLoadedRef.current || !logoDrawnRef.current) return;
    if (completedRef.current) return;
    completedRef.current = true;

    const tl = gsap.timeline({ onComplete });

    tl.to({}, { duration: 0.15 });

    tl.to(zoomGroupRef.current, {
      scale: 40,
      duration: 0.75,
      ease: "expo.in",
    }, "zoom");

    tl.to(zoomGroupRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.in",
    }, "zoom+=0.4");

    tl.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });
  }, [onComplete]);

  useEffect(() => {
    const img = new Image();
    const done = () => {
      imageLoadedRef.current = true;
      tryReveal();
    };
    img.onload = done;
    img.onerror = done;
    img.src = heroImageSrc;
    if (img.complete) imageLoadedRef.current = true;
  }, [heroImageSrc, tryReveal]);

  useEffect(() => {
    const paths = containerRef.current?.querySelectorAll<SVGPathElement>(".stencil-draw-path");
    if (!paths?.length) return;

    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
    });

    const tl = gsap.timeline({
      onComplete: () => {
        logoDrawnRef.current = true;
        tryReveal();
      },
    });

    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: "power2.inOut",
      stagger: 0.1,
    });

    tl.to(paths, {
      fillOpacity: 1,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.05,
    }, "-=0.6");

    const brandContainer = brandImageRef.current?.parentElement;
    if (brandContainer) {
      tl.set(brandContainer, { visibility: 'visible' }, "-=0.6");
    }
    tl.fromTo(brandImageRef.current, {
      y: '100%',
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power3.out",
    }, "-=0.55");
  }, [tryReveal]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: 9999 }}
      data-testid="loading-screen"
    >
      <div
        ref={zoomGroupRef}
        className="absolute inset-0"
        style={{ transformOrigin: 'center center', willChange: 'transform, opacity', zIndex: 1 }}
      >
        <div
          className="absolute"
          style={{
            inset: `${-pad}px`,
            zIndex: 0,
            maskImage: maskSvg,
            WebkitMaskImage: maskSvg,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%' as string,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat' as string,
          } as React.CSSProperties}
        >
          <TopographicBackground
            interactive={false}
            bgColor="#FFFFFF"
            position="absolute"
            sizeExtra={pad}
            onFirstFrame={dismissPreloader}
          />
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${vw} ${vh}`}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        >
          <svg x={logoX} y={logoY} width={logoPixelSize} height={logoPixelSize} viewBox="0 0 1470 1470">
            <g transform="translate(0, 1470) scale(1, -1)">
              <path
                className="stencil-draw-path"
                style={{ stroke: "#76777B", fill: "#76777B" }}
                strokeWidth="20"
                d="M441 1123 l-282 -287 90 -90 91 -91 198 198 197 197 142 -142 142 -142 31 29 c16 16 30 33 30 39 0 6 -78 88 -172 183 l-173 173 -197 -197 -198 -198 -22 22 -22 22 217 218 217 218 310 -310 310 -309 35 34 35 34 -342 343 c-189 189 -345 343 -349 343 -3 0 -132 -129 -288 -287z"
              />
              <path
                className="stencil-draw-path"
                style={{ stroke: "#003B71", fill: "#003B71" }}
                strokeWidth="20"
                d="M82 767 c-18 -18 -32 -37 -32 -43 0 -5 153 -162 340 -349 l340 -340 290 290 290 290 -87 87 c-48 49 -92 88 -98 88 -5 0 -96 -87 -202 -192 l-193 -193 -143 143 -143 142 -34 -35 -34 -35 40 -42 c21 -23 101 -105 176 -182 l137 -141 199 198 198 198 19 -21 c19 -21 18 -22 -195 -235 l-215 -215 -310 310 -311 310 -32 -33z"
              />
              <path
                className="stencil-draw-path"
                d="M735 535 L935 735 L735 935"
                style={{ stroke: "#76777B", fill: "none" }}
                strokeWidth="6"
                strokeLinejoin="miter"
              />
              <path
                className="stencil-draw-path"
                d="M735 935 L535 735 L735 535"
                style={{ stroke: "#8E8F93", fill: "none" }}
                strokeWidth="6"
                strokeLinejoin="miter"
              />
            </g>
          </svg>
        </svg>

        <div
          className="absolute overflow-hidden"
          style={{
            top: `${cy + logoPixelSize / 2 + 8}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            visibility: 'hidden',
          }}
        >
          <img
            ref={brandImageRef}
            src={logoImage}
            alt="LEGALIT Società tra Avvocati"
            className="w-[232px] md:w-[312px] lg:w-[392px] h-auto"
            style={{ opacity: 0, transform: 'translateY(100%)' }}
          />
        </div>
      </div>
    </div>
  );
}
