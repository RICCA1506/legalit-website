import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PracticeAreaCardProps {
  id: string;
  title: string;
  items: string[];
}

export default function PracticeAreaCard({ id, title, items }: PracticeAreaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="h-full border-0 bg-card overflow-hidden" data-testid={`card-practice-${id}`}>
      <CardHeader className="pb-4 pt-8">
        <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-8">
        <ul className="space-y-3">
          {(isExpanded ? items : items.slice(0, 5)).map((item, index) => (
            <motion.li
              key={index}
              initial={isExpanded && index >= 5 ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: "auto" }}
              className="text-base text-muted-foreground flex items-start gap-3 py-1"
            >
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              {item}
            </motion.li>
          ))}
        </ul>
        {items.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-expand-${id}`}
          >
            {isExpanded ? (
              <>
                Mostra meno <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Mostra tutti ({items.length}) <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
