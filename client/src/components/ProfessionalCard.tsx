import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Scale, Gavel, HardHat, Building2, Briefcase } from "lucide-react";
import OptimizedPicture from "./OptimizedPicture";
import { practiceAreas } from "@/lib/data";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

function LegalitLogoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 1470 1470" 
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <defs>
        <clipPath id="placeholder-clip-l">
          <rect x="0" y="0" width="735" height="1470" />
        </clipPath>
        <clipPath id="placeholder-clip-r">
          <rect x="735" y="0" width="735" height="1470" />
        </clipPath>
      </defs>
      <g transform="translate(0, 1470) scale(1, -1)">
        <path 
          fill="#76777B"
          d="M441 1123 l-282 -287 90 -90 91 -91 198 198 197 197 142 -142 142 -142 31 29 c16 16 30 33 30 39 0 6 -78 88 -172 183 l-173 173 -197 -197 -198 -198 -22 22 -22 22 217 218 217 218 310 -310 310 -309 35 34 35 34 -342 343 c-189 189 -345 343 -349 343 -3 0 -132 -129 -288 -287z"
        />
        <path 
          fill="#636466"
          clipPath="url(#placeholder-clip-l)"
          d="M735 935 L535 735 L735 535"
        />
        <path 
          fill="#8A8B8E"
          clipPath="url(#placeholder-clip-r)"
          d="M735 935 L935 735 L735 535"
        />
        <path 
          fill="#003B71"
          d="M82 767 c-18 -18 -32 -37 -32 -43 0 -5 153 -162 340 -349 l340 -340 290 290 290 290 -87 87 c-48 49 -92 88 -98 88 -5 0 -96 -87 -202 -192 l-193 -193 -143 143 -143 142 -34 -35 -34 -35 40 -42 c21 -23 101 -105 176 -182 l137 -141 199 198 198 198 19 -21 c19 -21 18 -22 -195 -235 l-215 -215 -310 310 -311 310 -32 -33z"
        />
      </g>
    </svg>
  );
}

const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/')) return imageUrl;
  if (imageUrl.includes('_176')) {
    return `/attached_assets/${imageUrl}`;
  }
  return imageUrl;
};

const parseCropPosition = (imagePosition?: string | null): { objectPosition: string; transformOrigin: string } | null => {
  if (!imagePosition || !imagePosition.includes(",")) return null;
  const [x, y] = imagePosition.split(",").map(Number);
  if (isNaN(x) || isNaN(y)) return null;
  return { objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%` };
};

const getImagePosition = (imageUrl: string | null | undefined, imagePosition?: string | null): string => {
  const crop = parseCropPosition(imagePosition);
  if (crop) return crop.objectPosition;
  if (imagePosition && imagePosition !== "center") return `center ${imagePosition}`;
  if (!imageUrl) return "center top";
  if (imageUrl.includes('b1de960e-f2c8-4506')) {
    return "center top";
  }
  return "center top";
};

const getTransformOrigin = (imagePosition?: string | null): string | undefined => {
  const crop = parseCropPosition(imagePosition);
  return crop ? crop.transformOrigin : undefined;
};

const isLogoPlaceholder = (imageUrl: string | null | undefined): boolean => {
  if (!imageUrl) return false;
  return imageUrl.includes('000_LOGO_LEGALIT') || imageUrl.includes('logo_legalit_cropped');
};

function AutoFitText({ children, className = "", minScale = 0.5 }: {
  children: string;
  className?: string;
  minScale?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scaleX, setScaleX] = useState(1);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    text.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => {
      const containerW = container.clientWidth;
      const textW = text.scrollWidth;
      if (textW > containerW && containerW > 0) {
        setScaleX(Math.max(minScale, containerW / textW));
      } else {
        setScaleX(1);
      }
    });
  }, [minScale]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [children, measure]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap origin-left"
        style={{ transform: `scale(${scaleX})` }}
      >
        {children}
      </span>
    </div>
  );
}

const getAreaIcon = (areaId: string) => {
  switch (areaId) {
    case "labor":
      return <HardHat className="h-3 w-3" />;
    case "criminal":
      return <Gavel className="h-3 w-3" />;
    case "civil-commercial":
      return <Scale className="h-3 w-3" />;
    case "administrative":
      return <Building2 className="h-3 w-3" />;
    default:
      return <Briefcase className="h-3 w-3" />;
  }
};

interface ProfessionalCardProps {
  name: string;
  title: string;
  specializations?: string[] | null;
  office: string;
  email?: string | null;
  fullBio?: string | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageZoom?: number | null;
}

export default function ProfessionalCard({
  name,
  title,
  specializations,
  office,
  email,
  fullBio,
  imageUrl,
  imagePosition,
  imageZoom,
}: ProfessionalCardProps) {
  const [, navigate] = useLocation();
  const { autoT } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = getImageUrl(imageUrl);
  const showImage = resolvedUrl && !imageError;

  return (
    <Card
      className="group overflow-visible hover-elevate active-elevate-2 cursor-pointer border-0 relative min-w-0 w-full"
      data-testid={`card-professional-${name.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className={`relative aspect-[3/4] overflow-hidden rounded-t-lg ${showImage && isLogoPlaceholder(imageUrl) ? 'bg-white' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`}>
        {showImage ? (
          <OptimizedPicture
            src={resolvedUrl}
            alt={name}
            className={`w-full h-full relative z-10 ${isLogoPlaceholder(imageUrl) ? 'object-contain p-8' : 'object-cover'}`}
            style={{ 
              objectPosition: isLogoPlaceholder(imageUrl) ? 'center' : getImagePosition(imageUrl, imagePosition),
              transform: !isLogoPlaceholder(imageUrl) && imageZoom && imageZoom !== 100 ? `scale(${imageZoom / 100})` : undefined,
              transformOrigin: !isLogoPlaceholder(imageUrl) ? getTransformOrigin(imagePosition) : undefined
            }}
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10 bg-white">
            <LegalitLogoPlaceholder className="w-24 h-24 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-primary-foreground">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1 text-[7px] md:text-sm text-white hover:text-white/80 transition-colors font-medium truncate max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-b-lg">
        <CardContent className="!px-1.5 !py-1.5 md:!p-4 !text-left">
          {title === "Managing Partner" && (
            <span className="text-[5px] md:text-[9px] font-medium tracking-wide text-primary/70 uppercase block mb-0.5">Managing Partner</span>
          )}
          <AutoFitText className="font-semibold text-[8px] md:text-sm leading-tight" minScale={0.55}>{name}</AutoFitText>
          <p className="text-[6px] md:text-xs text-muted-foreground whitespace-nowrap">{title === "Managing Partner" ? autoT("Partner") : autoT(title)}</p>
          <div className="flex items-center mt-1.5 md:mt-2 pt-1 md:pt-0 border-t border-transparent md:border-transparent">
            <span className="text-[6px] md:text-xs text-muted-foreground flex items-center gap-0.5 md:gap-1">
              <MapPin className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
              <span>{office}</span>
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
