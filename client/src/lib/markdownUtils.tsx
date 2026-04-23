import { Link } from "wouter";
import { professionalUrl, slugifyName } from "@shared/slugify";

/**
 * Shared inline markdown renderer.
 * Converts **bold** and *italic* to React elements.
 * Optionally auto-links professional names to their profile page.
 * Safe to use in any component — no dangerouslySetInnerHTML.
 */

export type ProForLinking = {
  id?: string | number;
  name: string;
  slug?: string | null;
};

const SINGULAR_TITLES = `(?:Avv\\.|Prof\\.ssa|Prof\\.|Dott\\.ssa|Dott\\.)`;
const PLURAL_TITLES = `(?:Avv\\.ti|Dott\\.ri|Dott\\.sse|Proff\\.sse|Proff\\.)`;
const ANY_TITLE = `(?:${PLURAL_TITLES}|${SINGULAR_TITLES})`;

const TITLE_PREFIX_RE = new RegExp(`^${ANY_TITLE}\\s+`, "i");

function stripTitle(name: string): string {
  return name.replace(TITLE_PREFIX_RE, "").trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Range = { start: number; end: number; pro: ProForLinking };

function buildLinkRanges(text: string, pros: ProForLinking[]): Range[] {
  if (!pros || pros.length === 0) return [];

  const surnameCounts = new Map<string, number>();
  const surnameLookup = new Map<string, ProForLinking>();
  for (const pro of pros) {
    if (!pro?.name) continue;
    const clean = stripTitle(pro.name);
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const surname = parts[parts.length - 1].toLowerCase();
      surnameCounts.set(surname, (surnameCounts.get(surname) || 0) + 1);
      if (!surnameLookup.has(surname)) surnameLookup.set(surname, pro);
    }
  }

  const ranges: Range[] = [];
  const claimed = new Array<boolean>(text.length).fill(false);
  const tryClaim = (start: number, end: number): boolean => {
    for (let i = start; i < end; i++) if (claimed[i]) return false;
    for (let i = start; i < end; i++) claimed[i] = true;
    return true;
  };

  // Pass 1: plural-title patterns linking each capitalized name after the title.
  // Matches "Avv.ti Liberati e Passalacqua", "Dott.ri Rossi, Bianchi e Verdi",
  // and lists of arbitrary length ("Avv.ti A, B, C, D e E").
  const NAME_TOKEN = `\\p{Lu}[\\p{L}'’-]+`;
  const SEP_SRC = `(?:\\s*,\\s*|\\s+e\\s+|\\s+ed\\s+)`;
  const pluralHeadPattern = new RegExp(
    `(?:^|(?<=[^\\p{L}\\p{N}_]))(${PLURAL_TITLES})\\s+(?=${NAME_TOKEN}${SEP_SRC}${NAME_TOKEN})`,
    "giu",
  );
  const nameWithSepPattern = new RegExp(`(${NAME_TOKEN})(${SEP_SRC})?`, "guy");
  let hm: RegExpExecArray | null;
  while ((hm = pluralHeadPattern.exec(text)) !== null) {
    let cursor = hm.index + hm[0].length;
    nameWithSepPattern.lastIndex = cursor;
    let nm: RegExpExecArray | null;
    while ((nm = nameWithSepPattern.exec(text)) !== null) {
      const name = nm[1];
      const sep = nm[2];
      const nameStart = nm.index;
      const nameEnd = nameStart + name.length;
      const key = name.toLowerCase();
      const pro = surnameLookup.get(key);
      if (pro && surnameCounts.get(key) === 1) {
        if (tryClaim(nameStart, nameEnd)) {
          ranges.push({ start: nameStart, end: nameEnd, pro });
        }
      }
      if (!sep) break;
      cursor = nm.index + nm[0].length;
      nameWithSepPattern.lastIndex = cursor;
    }
  }

  // Pass 2: full-name and unique-surname triggers (with optional title prefix
  // included in the linked text for singular titles like "Avv. Rossi").
  const triggers: Array<{ trigger: string; pro: ProForLinking }> = [];
  for (const pro of pros) {
    if (!pro?.name) continue;
    const clean = stripTitle(pro.name);
    if (!clean) continue;
    triggers.push({ trigger: clean, pro });
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const surname = parts[parts.length - 1];
      if (surname.length >= 3 && surnameCounts.get(surname.toLowerCase()) === 1) {
        triggers.push({ trigger: surname, pro });
      }
    }
  }

  triggers.sort((a, b) => b.trigger.length - a.trigger.length);

  for (const { trigger, pro } of triggers) {
    // Only singular titles may be absorbed into the linked text. Plural titles
    // are handled exclusively by Pass 1 to keep multi-name spans consistent.
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}_])((?:${SINGULAR_TITLES}\\s+)?${escapeRegex(trigger)})(?=[^\\p{L}\\p{N}_]|$)`,
      "giu",
    );
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const lead = m[1] ?? "";
      const matchedText = m[2];
      const matchStart = m.index + lead.length;
      const matchEnd = matchStart + matchedText.length;
      if (tryClaim(matchStart, matchEnd)) {
        ranges.push({ start: matchStart, end: matchEnd, pro });
      }
    }
  }

  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

function renderTextWithProLinks(
  text: string,
  pros: ProForLinking[] | undefined,
  baseKey: string
): React.ReactNode[] {
  if (!pros || pros.length === 0 || !text) return [text];
  const ranges = buildLinkRanges(text, pros);
  if (ranges.length === 0) return [text];
  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) out.push(text.slice(cursor, r.start));
    const display = text.slice(r.start, r.end);
    const proKey = r.pro.id ?? r.pro.slug ?? slugifyName(r.pro.name);
    out.push(
      <Link
        key={`${baseKey}-pro-${i}-${proKey}`}
        href={professionalUrl(r.pro)}
        onClick={(e) => e.stopPropagation()}
        className="text-primary hover:underline font-medium"
        data-testid={`link-inline-pro-${proKey}`}
      >
        {display}
      </Link>
    );
    cursor = r.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export function renderInlineMd(
  text: string | null | undefined,
  professionals?: ProForLinking[]
): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  if (parts.length === 1 && (!professionals || professionals.length === 0)) {
    return text;
  }
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} className="font-semibold text-foreground">
              {renderTextWithProLinks(inner, professionals, `b${i}`)}
            </strong>
          );
        }
        if (
          part.startsWith("*") &&
          part.endsWith("*") &&
          part.length > 2 &&
          !part.startsWith("**")
        ) {
          const inner = part.slice(1, -1);
          return <em key={i}>{renderTextWithProLinks(inner, professionals, `i${i}`)}</em>;
        }
        const nodes = renderTextWithProLinks(part, professionals, `t${i}`);
        return <span key={i}>{nodes}</span>;
      })}
    </>
  );
}

/**
 * Strip markdown from a string, returning plain text.
 * Useful for aria-labels, meta descriptions, etc.
 */
export function stripMd(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}
