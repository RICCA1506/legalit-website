/**
 * Shared inline markdown renderer.
 * Converts **bold** and *italic* to React elements.
 * Safe to use in any component — no dangerouslySetInnerHTML.
 */

export function renderInlineMd(text: string | null | undefined): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}

/**
 * Strip markdown from a string, returning plain text.
 * Useful for aria-labels, meta descriptions, etc.
 */
export function stripMd(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}
