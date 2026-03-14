export interface PressOutlet {
  displayName: string;
  domain: string;
  accentColor: string;
  accentColorLight: string;
  textColor: string;
  abbr: string;
}

const OUTLETS: Record<string, PressOutlet> = {
  "toplegal.it": {
    displayName: "TopLegal",
    abbr: "TL",
    domain: "toplegal.it",
    accentColor: "#0d2e52",
    accentColorLight: "#1a4a82",
    textColor: "#ffffff",
  },
  "legalcommunity.it": {
    displayName: "Legal Community",
    abbr: "LC",
    domain: "legalcommunity.it",
    accentColor: "#004f8b",
    accentColorLight: "#0066b3",
    textColor: "#ffffff",
  },
  "lamiafinanza.it": {
    displayName: "La Mia Finanza",
    abbr: "LF",
    domain: "lamiafinanza.it",
    accentColor: "#1a4070",
    accentColorLight: "#255294",
    textColor: "#ffffff",
  },
  "imille.com": {
    displayName: "iMille",
    abbr: "iM",
    domain: "imille.com",
    accentColor: "#1c1c2e",
    accentColorLight: "#2d2d4e",
    textColor: "#ffffff",
  },
};

const FALLBACK: PressOutlet = {
  displayName: "Rassegna Stampa",
  abbr: "RS",
  domain: "",
  accentColor: "#2c3e50",
  accentColorLight: "#34495e",
  textColor: "#ffffff",
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
