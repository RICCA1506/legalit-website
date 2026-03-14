export interface PressOutlet {
  displayName: string;
  domain: string;
  accentColor: string;
  accentColorLight: string;
  textColor: string;
  abbr: string;
  logoPath: string | null;
  headerBg: string | null;
}

const OUTLETS: Record<string, PressOutlet> = {
  "toplegal.it": {
    displayName: "TopLegal",
    abbr: "TL",
    domain: "toplegal.it",
    accentColor: "#c0392b",
    accentColorLight: "#e74c3c",
    textColor: "#ffffff",
    logoPath: "/images/press-logos/toplegal.png",
    headerBg: null,
  },
  "legalcommunity.it": {
    displayName: "Legal Community",
    abbr: "LC",
    domain: "legalcommunity.it",
    accentColor: "#1a2e4a",
    accentColorLight: "#2c4a72",
    textColor: "#ffffff",
    logoPath: "/images/press-logos/legalcommunity.png",
    headerBg: "#1a2e4a",
  },
  "lamiafinanza.it": {
    displayName: "La Mia Finanza",
    abbr: "LF",
    domain: "lamiafinanza.it",
    accentColor: "#1a3a6b",
    accentColorLight: "#244f91",
    textColor: "#ffffff",
    logoPath: "/images/press-logos/lamiafinanza.png",
    headerBg: null,
  },
  "imille.com": {
    displayName: "iMille",
    abbr: "iM",
    domain: "imille.com",
    accentColor: "#1a3a8f",
    accentColorLight: "#2952c4",
    textColor: "#ffffff",
    logoPath: "/images/press-logos/imille.png",
    headerBg: null,
  },
};

const FALLBACK: PressOutlet = {
  displayName: "Rassegna Stampa",
  abbr: "RS",
  domain: "",
  accentColor: "#2c3e50",
  accentColorLight: "#34495e",
  textColor: "#ffffff",
  logoPath: null,
  headerBg: null,
};

export function getOutletFromUrl(url: string | null | undefined): PressOutlet {
  if (!url) return FALLBACK;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return OUTLETS[hostname] ?? { ...FALLBACK, domain: hostname, displayName: hostname };
  } catch {
    return FALLBACK;
  }
}

export { OUTLETS };
