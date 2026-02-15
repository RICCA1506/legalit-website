import { motion } from "framer-motion";

interface MarbleColumnIconProps {
  variant: "civil-commercial" | "criminal" | "labor" | "administrative";
  className?: string;
}

export default function MarbleColumnIcon({ variant, className = "" }: MarbleColumnIconProps) {
  const variants = {
    "civil-commercial": {
      columns: 1,
      baseColor: "#f5f0e8",
      accentColor: "#e8e0d4",
      veinColor: "#d4c4b0",
    },
    criminal: {
      columns: 2,
      baseColor: "#f0ebe3",
      accentColor: "#e5ddd1",
      veinColor: "#cfc2b3",
    },
    labor: {
      columns: 3,
      baseColor: "#f2ede5",
      accentColor: "#e6ded2",
      veinColor: "#d8ccbc",
    },
    administrative: {
      columns: 1,
      baseColor: "#ede8e0",
      accentColor: "#e0d8cc",
      veinColor: "#d0c4b4",
    },
  };

  const config = variants[variant];

  if (config.columns === 1) {
    return (
      <motion.svg
        viewBox="0 0 60 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id={`marble-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.baseColor} />
            <stop offset="50%" stopColor={config.accentColor} />
            <stop offset="100%" stopColor={config.baseColor} />
          </linearGradient>
          <filter id={`shadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>
        
        <g filter={`url(#shadow-${variant})`}>
          <rect x="18" y="70" width="24" height="6" rx="1" fill={config.accentColor} />
          <rect x="20" y="68" width="20" height="4" rx="0.5" fill={config.baseColor} />
          
          <rect x="22" y="22" width="16" height="46" rx="1" fill={`url(#marble-${variant})`} />
          
          <ellipse cx="30" cy="22" rx="10" ry="3" fill={config.accentColor} />
          <ellipse cx="30" cy="21" rx="9" ry="2.5" fill={config.baseColor} />
          
          <path
            d="M18 18 L22 20 L22 22 L38 22 L38 20 L42 18 L42 14 L38 12 L22 12 L18 14 Z"
            fill={config.accentColor}
          />
          <path
            d="M20 16 L22 18 L38 18 L40 16 L40 14 L38 13 L22 13 L20 14 Z"
            fill={config.baseColor}
          />
          
          <rect x="16" y="6" width="28" height="5" rx="1" fill={config.accentColor} />
          <rect x="18" y="4" width="24" height="4" rx="0.5" fill={config.baseColor} />
          
          <path d="M26 25 Q27 40 25 50 Q26 55 27 60" stroke={config.veinColor} strokeWidth="0.5" fill="none" opacity="0.6" />
          <path d="M34 30 Q33 45 35 55" stroke={config.veinColor} strokeWidth="0.3" fill="none" opacity="0.4" />
        </g>
      </motion.svg>
    );
  }

  if (config.columns === 2) {
    return (
      <motion.svg
        viewBox="0 0 60 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id={`marble-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.baseColor} />
            <stop offset="50%" stopColor={config.accentColor} />
            <stop offset="100%" stopColor={config.baseColor} />
          </linearGradient>
          <filter id={`shadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>
        
        <g filter={`url(#shadow-${variant})`}>
          <rect x="10" y="70" width="40" height="6" rx="1" fill={config.accentColor} />
          <rect x="12" y="68" width="36" height="4" rx="0.5" fill={config.baseColor} />
          
          <rect x="14" y="20" width="10" height="48" rx="0.5" fill={`url(#marble-${variant})`} />
          <rect x="36" y="20" width="10" height="48" rx="0.5" fill={`url(#marble-${variant})`} />
          
          <ellipse cx="19" cy="20" rx="6" ry="2" fill={config.accentColor} />
          <ellipse cx="41" cy="20" rx="6" ry="2" fill={config.accentColor} />
          
          <rect x="8" y="12" width="44" height="6" rx="1" fill={config.accentColor} />
          <rect x="10" y="10" width="40" height="4" rx="0.5" fill={config.baseColor} />
          
          <rect x="8" y="4" width="44" height="5" rx="1" fill={config.accentColor} />
          <rect x="10" y="2" width="40" height="4" rx="0.5" fill={config.baseColor} />
          
          <path d="M17 25 Q18 40 16 55" stroke={config.veinColor} strokeWidth="0.4" fill="none" opacity="0.5" />
          <path d="M40 28 Q39 45 41 58" stroke={config.veinColor} strokeWidth="0.4" fill="none" opacity="0.5" />
        </g>
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 60 80"
      className={`w-full h-full ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id={`marble-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.baseColor} />
          <stop offset="50%" stopColor={config.accentColor} />
          <stop offset="100%" stopColor={config.baseColor} />
        </linearGradient>
        <filter id={`shadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>
      
      <g filter={`url(#shadow-${variant})`}>
        <rect x="6" y="70" width="48" height="6" rx="1" fill={config.accentColor} />
        <rect x="8" y="68" width="44" height="4" rx="0.5" fill={config.baseColor} />
        
        <rect x="10" y="20" width="8" height="48" rx="0.5" fill={`url(#marble-${variant})`} />
        <rect x="26" y="20" width="8" height="48" rx="0.5" fill={`url(#marble-${variant})`} />
        <rect x="42" y="20" width="8" height="48" rx="0.5" fill={`url(#marble-${variant})`} />
        
        <ellipse cx="14" cy="20" rx="5" ry="2" fill={config.accentColor} />
        <ellipse cx="30" cy="20" rx="5" ry="2" fill={config.accentColor} />
        <ellipse cx="46" cy="20" rx="5" ry="2" fill={config.accentColor} />
        
        <rect x="4" y="12" width="52" height="6" rx="1" fill={config.accentColor} />
        <rect x="6" y="10" width="48" height="4" rx="0.5" fill={config.baseColor} />
        
        <rect x="4" y="4" width="52" height="5" rx="1" fill={config.accentColor} />
        <rect x="6" y="2" width="48" height="4" rx="0.5" fill={config.baseColor} />
        
        <path d="M13 25 Q14 40 12 55" stroke={config.veinColor} strokeWidth="0.3" fill="none" opacity="0.5" />
        <path d="M29 28 Q28 45 30 58" stroke={config.veinColor} strokeWidth="0.3" fill="none" opacity="0.5" />
        <path d="M45 30 Q46 48 44 60" stroke={config.veinColor} strokeWidth="0.3" fill="none" opacity="0.5" />
      </g>
    </motion.svg>
  );
}
