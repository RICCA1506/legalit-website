import { useEffect, useRef } from "react";

interface LogoAnimationProps {
  progress: number;
  className?: string;
}

export default function LogoAnimation({ progress, className = "" }: LogoAnimationProps) {
  const pathsRef = useRef<SVGPathElement[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pathsRef.current.forEach((path) => {
      if (path) {
        const length = path.getTotalLength();
        path.style.setProperty('--path-length', String(length));
      }
    });
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.setProperty('--progress', String(progress));
    }
  }, [progress]);

  const isFilled = progress > 0.95;

  return (
    <div 
      ref={wrapperRef}
      className={`logo-animation-wrapper ${isFilled ? 'filled' : ''} ${className}`}
      style={{
        width: '400px',
        height: '400px',
        maxWidth: '70vw',
        maxHeight: '70vh',
      }}
    >
      <svg viewBox="0 0 1470 1470" preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id="clip-left-half">
            <rect x="0" y="0" width="735" height="1470" />
          </clipPath>
          <clipPath id="clip-right-half">
            <rect x="735" y="0" width="735" height="1470" />
          </clipPath>
        </defs>

        <g transform="translate(0, 1470) scale(1, -1)">
          <path 
            ref={(el) => { if (el) pathsRef.current[0] = el; }}
            className="logo-path part-outer-grey" 
            d="M441 1123 l-282 -287 90 -90 91 -91 198 198 197 197 142 -142 142 -142 31 29 c16 16 30 33 30 39 0 6 -78 88 -172 183 l-173 173 -197 -197 -198 -198 -22 22 -22 22 217 218 217 218 310 -310 310 -309 35 34 35 34 -342 343 c-189 189 -345 343 -349 343 -3 0 -132 -129 -288 -287z"
          />
          
          <path 
            ref={(el) => { if (el) pathsRef.current[1] = el; }}
            className="logo-path part-center-left" 
            style={{ clipPath: 'url(#clip-left-half)' }}
            d="M735 935 L535 735 L735 535"
          />

          <path 
            ref={(el) => { if (el) pathsRef.current[2] = el; }}
            className="logo-path part-center-right" 
            style={{ clipPath: 'url(#clip-right-half)' }}
            d="M735 935 L935 735 L735 535"
          />
          
          <path 
            ref={(el) => { if (el) pathsRef.current[3] = el; }}
            className="logo-path part-outer-blue" 
            d="M82 767 c-18 -18 -32 -37 -32 -43 0 -5 153 -162 340 -349 l340 -340 290 290 290 290 -87 87 c-48 49 -92 88 -98 88 -5 0 -96 -87 -202 -192 l-193 -193 -143 143 -143 142 -34 -35 -34 -35 40 -42 c21 -23 101 -105 176 -182 l137 -141 199 198 198 198 19 -21 c19 -21 18 -22 -195 -235 l-215 -215 -310 310 -311 310 -32 -33z"
          />
        </g>
      </svg>
    </div>
  );
}
