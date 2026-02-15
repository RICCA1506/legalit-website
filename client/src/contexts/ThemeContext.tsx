import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import cassazioneImg from "@assets/optimized/hero-cassazione.webp";
import cassazioneImgMobile from "@assets/optimized/hero-cassazione-mobile.webp";
import cassazioneImgTablet from "@assets/optimized/hero-cassazione-tablet.webp";
import cassazioneImgAvif from "@assets/optimized/hero-cassazione.avif";
import cassazioneImgMobileAvif from "@assets/optimized/hero-cassazione-mobile.avif";
import cassazioneImgTabletAvif from "@assets/optimized/hero-cassazione-tablet.avif";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  heroAccent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  cardBorder: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
  secondary: string;
  secondaryForeground: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarRing: string;
  popover: string;
  popoverForeground: string;
  popoverBorder: string;
  input: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  heroImage: string;
  heroImageMobile: string;
  heroImageTablet: string;
  heroImageAvif: string;
  heroImageMobileAvif: string;
  heroImageTabletAvif: string;
  colors: ThemeColors;
}

export const cassazioneTheme: Theme = {
  id: "cassazione",
  name: "Cassazione",
  description: "Corte di Cassazione - Tema fisso istituzionale",
  heroImage: cassazioneImg,
  heroImageMobile: cassazioneImgMobile,
  heroImageTablet: cassazioneImgTablet,
  heroImageAvif: cassazioneImgAvif,
  heroImageMobileAvif: cassazioneImgMobileAvif,
  heroImageTabletAvif: cassazioneImgTabletAvif,
  colors: {
    primary: "200 48% 35%",
    primaryForeground: "0 0% 100%",
    accent: "210 87% 23%",
    accentForeground: "0 0% 100%",
    heroAccent: "200 70% 65%",
    background: "0 0% 100%",
    foreground: "210 87% 23%",
    card: "210 20% 97%",
    cardForeground: "210 87% 23%",
    cardBorder: "210 20% 88%",
    muted: "210 15% 92%",
    mutedForeground: "210 30% 45%",
    border: "210 20% 85%",
    ring: "200 48% 35%",
    secondary: "210 20% 94%",
    secondaryForeground: "210 87% 23%",
    sidebar: "210 20% 96%",
    sidebarForeground: "210 87% 23%",
    sidebarBorder: "210 20% 85%",
    sidebarPrimary: "200 48% 35%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarAccent: "210 20% 92%",
    sidebarAccentForeground: "210 87% 23%",
    sidebarRing: "200 48% 35%",
    popover: "0 0% 98%",
    popoverForeground: "210 87% 23%",
    popoverBorder: "210 20% 85%",
    input: "210 20% 80%",
  },
};

// Keep themes array for backwards compatibility (only Cassazione)
export const themes: Theme[] = [cassazioneTheme];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  hasChosenTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Fixed Cassazione theme - no selection, no localStorage
  const [currentTheme] = useState<Theme>(cassazioneTheme);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const hasChosenTheme = true; // Always true since theme is fixed

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    const cssVarMap: Record<string, string> = {
      primary: '--primary',
      primaryForeground: '--primary-foreground',
      accent: '--accent',
      accentForeground: '--accent-foreground',
      heroAccent: '--hero-accent',
      background: '--background',
      foreground: '--foreground',
      card: '--card',
      cardForeground: '--card-foreground',
      cardBorder: '--card-border',
      muted: '--muted',
      mutedForeground: '--muted-foreground',
      border: '--border',
      ring: '--ring',
      secondary: '--secondary',
      secondaryForeground: '--secondary-foreground',
      sidebar: '--sidebar',
      sidebarForeground: '--sidebar-foreground',
      sidebarBorder: '--sidebar-border',
      sidebarPrimary: '--sidebar-primary',
      sidebarPrimaryForeground: '--sidebar-primary-foreground',
      sidebarAccent: '--sidebar-accent',
      sidebarAccentForeground: '--sidebar-accent-foreground',
      sidebarRing: '--sidebar-ring',
      popover: '--popover',
      popoverForeground: '--popover-foreground',
      popoverBorder: '--popover-border',
      input: '--input',
    };

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = cssVarMap[key];
      if (cssVar) {
        root.style.setProperty(cssVar, value);
      }
    });
  };

  useEffect(() => {
    // Always apply the fixed Cassazione theme
    applyTheme(cassazioneTheme);
    
    // Clear any old theme settings from localStorage
    localStorage.removeItem("legalit-theme");
    localStorage.removeItem("legalit-theme-chosen");
  }, []);

  // setTheme is a no-op since theme is fixed
  const setTheme = (_themeId: string) => {
    // Theme is fixed to Cassazione, ignore theme changes
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      showThemeSelector, 
      setShowThemeSelector,
      hasChosenTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
