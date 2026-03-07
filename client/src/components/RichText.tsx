interface RichTextProps {
  text: string;
  className?: string;
}

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function RichText({ text, className = "" }: RichTextProps) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="text-[15px] md:text-lg text-muted-foreground leading-relaxed mb-4 last:mb-0"
        >
          {renderInline(para.trim())}
        </p>
      ))}
    </div>
  );
}
