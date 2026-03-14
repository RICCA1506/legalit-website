import { renderInlineMd } from "@/lib/markdownUtils";

interface RichTextProps {
  text: string;
  className?: string;
}

export default function RichText({ text, className = "" }: RichTextProps) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="text-[15px] md:text-lg text-muted-foreground leading-relaxed mb-4 last:mb-0 text-center"
        >
          {renderInlineMd(para.trim())}
        </p>
      ))}
    </div>
  );
}
