import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { professionals as staticProfessionals } from "@/lib/data";
import type { Professional as DbProfessional } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
interface ProfessionalsReelProps {
  columns: number;
  filterByAreas?: string[];
  filterByIds?: string[];
  highlightAuthor?: string | null;
  onProfessionalClick?: (id: string | number) => void;
  interval?: number;
  decorative?: boolean;
}

const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) return imageUrl;
  if (imageUrl.includes("_176")) return `/attached_assets/${imageUrl}`;
  return imageUrl;
};

const isLogoPlaceholder = (imageUrl: string | null | undefined): boolean => {
  if (!imageUrl) return false;
  return imageUrl.includes("000_LOGO_LEGALIT");
};

function CardContent({
  pro,
  isAuthorCard,
  autoT,
}: {
  pro: any;
  isAuthorCard: boolean;
  autoT: (text: string) => string;
}) {
  const imgUrl = getImageUrl(pro.imageUrl);
  const isLogo = isLogoPlaceholder(pro.imageUrl);

  return (
    <div
      className={`group relative rounded-lg overflow-hidden shadow-md h-full ${isAuthorCard ? "ring-2 ring-primary ring-offset-2" : ""}`}
      data-testid={`reel-pro-${pro.id}`}
    >
      <div
        className={`relative w-full h-full ${isLogo ? "bg-white" : "bg-gradient-to-br from-primary/20 to-primary/5"}`}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            loading="lazy"
            className={`w-full h-full ${isLogo ? "object-contain p-4" : "object-cover"}`}
            style={{
              objectPosition: isLogo
                ? "center"
                : pro.imagePosition?.includes(",")
                  ? `${pro.imagePosition.split(",")[0]}% ${pro.imagePosition.split(",")[1]}%`
                  : "center top",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {isAuthorCard && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="text-[10px] gap-1">
              {autoT("Autore")}
            </Badge>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="font-semibold text-xs leading-tight truncate text-white drop-shadow-sm">
          {pro.name}
        </p>
        <p className="text-[10px] text-white/80 truncate mt-0.5 drop-shadow-sm">
          {autoT(pro.title)}
        </p>
        <p className="text-[10px] text-white/70 flex items-center gap-0.5 mt-1 drop-shadow-sm">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
          {pro.office}
        </p>
      </div>
    </div>
  );
}

function ReelSlot({
  pro,
  tick,
  index,
  isAuthorCard,
  onProfessionalClick,
  autoT,
  decorative,
}: {
  pro: any;
  tick: number;
  index: number;
  isAuthorCard: boolean;
  onProfessionalClick?: (id: string | number) => void;
  autoT: (text: string) => string;
  decorative?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(300);
  const [settled, setSettled] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (containerRef.current) {
      setHeight(containerRef.current.offsetHeight);
    }
  }, []);

  const enterY = height * 0.4;
  const exitY = -height * 1.2;

  const totalAnimTime = (index * 200) + 900;
  useEffect(() => {
    setSettled(false);
    const timer = setTimeout(() => setSettled(true), totalAnimTime);
    return () => clearTimeout(timer);
  }, [tick, totalAnimTime]);

  const handleClick = useCallback(() => {
    if (!settled) return;
    if (onProfessionalClick) {
      onProfessionalClick(pro.id);
    } else {
      navigate(`/professionisti?id=${pro.id}`);
    }
  }, [onProfessionalClick, pro.id, navigate, settled]);

  return (
    <div ref={containerRef} className="relative aspect-[3/4] overflow-hidden rounded-lg">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${pro.id}-${tick}`}
          initial={{ y: enterY, scale: 0.85, opacity: 0, filter: "blur(8px)", zIndex: 1 }}
          animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 10 }}
          exit={{ y: exitY, scale: 1, opacity: 1, zIndex: 20 }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 14,
            mass: 1.2,
            delay: index * 0.2,
          }}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {decorative ? (
            <CardContent pro={pro} isAuthorCard={false} autoT={autoT} />
          ) : (
            <div
              className="h-full cursor-pointer"
              onClick={handleClick}
              data-testid={`link-reel-pro-${pro.id}`}
            >
              <CardContent pro={pro} isAuthorCard={isAuthorCard} autoT={autoT} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ProfessionalsReel({
  columns,
  filterByAreas,
  filterByIds,
  highlightAuthor,
  onProfessionalClick,
  interval = 3500,
  decorative = false,
}: ProfessionalsReelProps) {
  const { autoT } = useLanguage();

  const { data: dbProfessionals = [] } = useQuery<DbProfessional[]>({
    queryKey: ["/api/professionals"],
  });

  const allProfessionals: any[] =
    dbProfessionals.length > 0 ? dbProfessionals : staticProfessionals;

  const pool = useMemo(() => {
    if (filterByIds && filterByIds.length > 0) {
      return allProfessionals.filter((p) => filterByIds.includes(String(p.id)));
    }
    if (filterByAreas && filterByAreas.length > 0) {
      return allProfessionals.filter((p) => {
        const specs = p.specializations || [];
        return specs.some((s: string) => filterByAreas!.includes(s));
      });
    }
    return allProfessionals;
  }, [allProfessionals, filterByAreas, filterByIds]);

  const cleanName = (n: string) =>
    n
      .replace(/^(Avv\.\s*|Prof\.\s*|Dott\.\s*|Dott\.ssa\s*)+/gi, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();

  const isAuthor = useCallback(
    (name: string) => {
      if (!highlightAuthor) return false;
      const a = cleanName(highlightAuthor);
      const p = cleanName(name);
      if (!a || !p) return false;
      if (a === p) return true;
      const aWords = a.split(" ").filter(Boolean);
      const pWords = p.split(" ").filter(Boolean);
      if (aWords.length >= 2 && pWords.length >= 2) {
        const aFirst = aWords[0], aLast = aWords[aWords.length - 1];
        const pFirst = pWords[0], pLast = pWords[pWords.length - 1];
        if (aFirst === pFirst && aLast === pLast) return true;
        if (aLast === pLast && (pWords.includes(aFirst) || aWords.includes(pFirst))) return true;
      }
      return false;
    },
    [highlightAuthor],
  );

  const pickRandom = useCallback(
    (count: number, exclude: Set<string | number>) => {
      const available = pool.filter((p) => !exclude.has(p.id));
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
    [pool],
  );

  const [visiblePros, setVisiblePros] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const prevIds = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (pool.length === 0) return;
    const authorPro = highlightAuthor
      ? pool.find((p) => isAuthor(p.name))
      : null;

    const nonAuthorPool = authorPro
      ? pool.filter((p) => p.id !== authorPro.id)
      : pool;

    const count = Math.min(columns, pool.length);

    let selected: any[];
    if (authorPro && count > 0) {
      const others = [...nonAuthorPool]
        .filter((p) => !prevIds.current.has(p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, count - 1);
      if (others.length < count - 1) {
        const more = [...nonAuthorPool]
          .sort(() => Math.random() - 0.5)
          .slice(0, count - 1);
        selected = [authorPro, ...more];
      } else {
        selected = [authorPro, ...others];
      }
      selected.sort(() => Math.random() - 0.5);
    } else {
      const fresh = pickRandom(count, prevIds.current);
      if (fresh.length < count) {
        selected = pickRandom(count, new Set());
      } else {
        selected = fresh;
      }
    }

    prevIds.current = new Set(selected.map((p) => p.id));
    setVisiblePros(selected);
  }, [tick, pool, columns, highlightAuthor, isAuthor, pickRandom]);

  useEffect(() => {
    if (pool.length <= columns) return;
    const timer = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(timer);
  }, [pool.length, columns, interval]);

  if (pool.length === 0) return null;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      data-testid="professionals-reel"
    >
      {visiblePros.map((pro, index) => (
        <ReelSlot
          key={`slot-${index}`}
          pro={pro}
          tick={tick}
          index={index}
          isAuthorCard={isAuthor(pro.name)}
          onProfessionalClick={onProfessionalClick}
          autoT={autoT}
          decorative={decorative}
        />
      ))}
    </div>
  );
}
