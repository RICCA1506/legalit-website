export interface PressOutlet {
  displayName: string;
  domain: string;
  accentColor: string;
  logoUrl: string;
  textColor: string;
}

const OUTLETS: Record<string, PressOutlet> = {
  "toplegal.it": {
    displayName: "TopLegal",
    domain: "toplegal.it",
    accentColor: "#1a3a5c",
    textColor: "#ffffff",
    logoUrl: "https://logo.clearbit.com/toplegal.it",
  },
  "legalcommunity.it": {
    displayName: "LegalCommunity",
    domain: "legalcommunity.it",
    accentColor: "#0056a0",
    textColor: "#ffffff",
    logoUrl: "https://logo.clearbit.com/legalcommunity.it",
  },
  "lamiafinanza.it": {
    displayName: "LaMiaFinanza",
    domain: "lamiafinanza.it",
    accentColor: "#1b4f8a",
    textColor: "#ffffff",
    logoUrl: "https://logo.clearbit.com/lamiafinanza.it",
  },
  "imille.com": {
    displayName: "iMille",
    domain: "imille.com",
    accentColor: "#1a1a2e",
    textColor: "#ffffff",
    logoUrl: "https://logo.clearbit.com/imille.com",
  },
};

const FALLBACK: Omit<PressOutlet, "domain"> = {
  displayName: "Articolo di stampa",
  accentColor: "#2d4a6e",
  textColor: "#ffffff",
  logoUrl: "",
};

export function getOutletFromUrl(url: string | null | undefined): PressOutlet & { domain: string } {
  if (!url) return { ...FALLBACK, domain: "" };
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const found = OUTLETS[hostname];
    if (found) return found;
    return { ...FALLBACK, domain: hostname, displayName: hostname };
  } catch {
    return { ...FALLBACK, domain: "" };
  }
}

export { OUTLETS };
