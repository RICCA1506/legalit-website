import { useState, CSSProperties } from "react";
import { motion } from "framer-motion";

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  onError?: () => void;
  lazy?: boolean;
}

export default function FadeInImage({ src, alt, className = "", style, onError }: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="eager"
      decoding="async"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
    />
  );
}
