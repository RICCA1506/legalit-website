import { useState, useRef, useEffect, CSSProperties } from "react";

const loadedImages = new Set<string>();

interface OptimizedPictureProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  onError?: () => void;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  srcSetAvif?: string;
  srcSetWebp?: string;
}

function isProfessionalPhoto(src: string): boolean {
  const filename = src.split("/").pop() || "";
  return /^(avv-|prof-avv-)/.test(filename);
}

function normalizeProSrc(src: string): string {
  if (!isProfessionalPhoto(src)) return src;
  if (src.includes("/optimized/")) {
    const filename = src.split("/").pop() || "";
    const baseName = filename.replace(/\.(avif|webp|png)$/i, ".jpg");
    return `/attached_assets/${baseName}`;
  }
  return src;
}

function getOptimizedPath(originalSrc: string, format: "avif" | "webp"): string | null {
  if (!originalSrc.includes("/attached_assets/")) return null;
  if (originalSrc.includes("/optimized/")) return null;
  const filename = originalSrc.split("/").pop();
  if (!filename) return null;
  const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const optimizedPath = `/attached_assets/optimized/${baseName}.${format}`;
  return optimizedPath;
}

function hasKnownOptimized(src: string): boolean {
  if (src.includes("/optimized/")) return true;
  const filename = src.split("/").pop() || "";
  if (filename.startsWith("avv-") || filename.startsWith("prof-avv-")) return false;
  if (filename.startsWith("WhatsApp_")) {
    const knownOptimized = [
      "WhatsApp_Image_2026-01-26_at_11.49.07_1769431461365",
      "WhatsApp_Image_2026-01-26_at_11.49.08_1769431461366",
      "WhatsApp_Image_2026-01-26_at_11.49.09_1769431461366",
      "WhatsApp_Image_2026-01-26_at_11.49.10_1769431461365",
    ];
    const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    return knownOptimized.includes(baseName);
  }
  const knownOptimizedFiles = [
    "000_LOGO_LEGALIT_STA.JPG_(3)_1769379554317",
    "d7d8d555-b7c2-41e6-af15-eedf97291ed8_1769385370447",
    "Camice-medico_1769425867517",
    "solidarieta-1_1769426085688",
    "parlamento_1769425734883",
  ];
  const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return knownOptimizedFiles.includes(baseName);
}

export default function OptimizedPicture({
  src,
  alt,
  className = "",
  style,
  onError,
  priority = false,
  sizes,
  srcSetAvif,
  srcSetWebp,
}: OptimizedPictureProps) {
  const normalizedSrc = normalizeProSrc(src);
  const alreadyCached = loadedImages.has(normalizedSrc);
  const [isLoaded, setIsLoaded] = useState(alreadyCached);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && !isLoaded) {
      loadedImages.add(normalizedSrc);
      setIsLoaded(true);
    }
    if (priority && imgRef.current) {
      imgRef.current.setAttribute("fetchpriority", "high");
    }
  }, [priority, normalizedSrc, isLoaded]);

  if (hasError) {
    return null;
  }

  const isProPhoto = isProfessionalPhoto(normalizedSrc);
  const isWebp = normalizedSrc.endsWith(".webp");

  const useOptimized = !isProPhoto && hasKnownOptimized(normalizedSrc);
  const avifPath = srcSetAvif || (useOptimized ? getOptimizedPath(normalizedSrc, "avif") : null);
  const webpPath = srcSetWebp || (useOptimized ? (isWebp ? normalizedSrc : getOptimizedPath(normalizedSrc, "webp")) : null);

  const imgStyle: CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: "opacity 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)",
  };

  return (
    <picture>
      {avifPath && (
        <source
          srcSet={avifPath}
          type="image/avif"
          sizes={sizes}
        />
      )}
      {webpPath && (
        <source
          srcSet={webpPath}
          type="image/webp"
          sizes={sizes}
        />
      )}
      <img
        ref={imgRef}
        src={normalizedSrc}
        alt={alt}
        className={`${className} hq-photo`.trim()}
        style={imgStyle}
        loading="eager"
        decoding={priority ? "sync" : "async"}
        onLoad={() => { loadedImages.add(normalizedSrc); setIsLoaded(true); }}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
      />
    </picture>
  );
}
