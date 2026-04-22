import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Users, X, ArrowLeft, FileText, ExternalLink, Layers, HardHat, Gavel, Scale, Building2, Newspaper } from "lucide-react";
import ProfessionalsReel from "@/components/ProfessionalsReel";
import { SiLinkedin } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import type { NewsArticle } from "@shared/schema";
import { professionalUrl, slugifyName } from "@shared/slugify";
import { practiceAreasEnhanced } from "@/lib/practiceAreasData";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLanguage } from "@/lib/i18n";
import OptimizedPicture from "@/components/OptimizedPicture";
import { getOutletFromUrl } from "@/lib/pressOutlets";
import { renderInlineMd } from "@/lib/markdownUtils";

interface NewsArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsArticleModal({ article, isOpen, onClose }: NewsArticleModalProps) {
  const { autoT, language } = useLanguage();
  const [, navigate] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: dbProfessionals = [] } = useQuery<any[]>({
    queryKey: ["/api/professionals"],
  });

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, article]);

  const findProfessionalByName = (name: string | null | undefined) => {
    if (!name) return null;
    const cleanName = (n: string) => n.replace(/^(Avv\.\s*|Prof\.\s*|Dott\.\s*|Dott\.ssa\s*)/i, '').toLowerCase().trim();
    const cleaned = cleanName(name);
    // Look up only in the DB list. Falling back to staticProfessionals would
    // return an entry whose id does NOT match the DB id (e.g. Vaccaro is "1"
    // in static but 3 in DB), causing /professionisti?id=<wrong> → wrong modal.
    return dbProfessionals.find((p: any) => {
      const pClean = cleanName(p.name);
      return pClean === cleaned || pClean.includes(cleaned) || cleaned.includes(pClean);
    }) ?? null;
  };

  const isLegalitAuthor = (name: string | null | undefined) => {
    if (!name) return false;
    return name.toLowerCase().trim() === 'legalit';
  };

  const handleAuthorClick = (authorName: string | null | undefined) => {
    if (isLegalitAuthor(authorName)) {
      window.open('https://www.linkedin.com/company/legalit---avvocati-associati/', '_blank');
      return;
    }
    const professional = findProfessionalByName(authorName);
    if (professional) {
      onClose();
      navigate(professionalUrl(professional));
    }
  };
  if (!article) return null;

  const isPressArticle = article.newsType === "rassegna-stampa";
  const outlet = isPressArticle ? getOutletFromUrl(article.linkedinUrl) : null;
  const imageUrl = article.imageUrl || "/attached_assets/unsplash-law-default.jpg";
  const heroH = 260;

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let currentParagraph: string[] = [];
    let elementIndex = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) {
          const stripped = text.replace(/\*\*/g, '').replace(/\*/g, '');
          if (text.startsWith('**') && text.endsWith('**') && !text.slice(2, -2).includes('**')) {
            elements.push(
              <h3 key={elementIndex++} className="text-xl font-bold mt-8 mb-4 text-foreground">
                {stripped}
              </h3>
            );
          } else if (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) {
            elements.push(
              <h4 key={elementIndex++} className="text-lg font-semibold mt-6 mb-3 text-foreground/90">
                {stripped}
              </h4>
            );
          } else {
            elements.push(
              <p key={elementIndex++} className="text-muted-foreground leading-relaxed my-4">
                {renderInlineMd(text, dbProfessionals)}
              </p>
            );
          }
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={elementIndex++} className="list-disc pl-6 space-y-2 my-4">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-muted-foreground">{renderInlineMd(item, dbProfessionals)}</li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={elementIndex++} className="list-decimal pl-6 space-y-2 my-4">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-muted-foreground">{renderInlineMd(item, dbProfessionals)}</li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        flushParagraph();
        continue;
      }

      if (trimmedLine.startsWith('- ')) {
        flushParagraph();
        if (currentList?.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(trimmedLine.substring(2));
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        flushParagraph();
        if (currentList?.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(trimmedLine.replace(/^\d+\.\s/, ''));
      } else {
        flushList();
        currentParagraph.push(trimmedLine);
      }
    }

    flushParagraph();
    flushList();

    return elements;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent hideDefaultClose aria-describedby={undefined} className="max-w-4xl h-[90vh] overflow-hidden rounded-xl" style={{ padding: 0, gap: 0, border: "none", background: "transparent" }} onOpenAutoFocus={(e) => e.preventDefault()} data-testid="modal-news-article">
        <VisuallyHidden>
          <DialogTitle>{article.title}</DialogTitle>
        </VisuallyHidden>
        <div className="relative h-full overflow-hidden rounded-xl">
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative h-full overflow-y-auto bg-background"
            data-lenis-prevent
            data-testid="modal-scroll-container"
          >
          <div className="sticky top-0 z-[60] h-0 flex justify-end pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className="mt-3 mr-3 bg-black/60 text-white backdrop-blur-md rounded-full pointer-events-auto"
              onClick={onClose}
              data-testid="button-close-news-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Hero - branded masthead for press articles, photo for studio articles */}
          {isPressArticle && outlet ? (
            <div
              className="sticky top-0 z-0 overflow-hidden relative flex flex-col items-center justify-center gap-4 px-8"
              style={{
                height: `${heroH}px`,
                background: outlet.headerBg ?? "#ffffff",
                ...(outlet.headerBg ? {} : { borderTop: `5px solid ${outlet.accentColor}` }),
              }}
              data-testid="modal-hero-container"
            >
              {/* Logo immagine oppure fallback tipografico */}
              {outlet.logoPath ? (
                <img
                  src={outlet.logoPath}
                  alt={outlet.displayName}
                  className="object-contain"
                  style={outlet.headerBg
                    ? { maxHeight: `${heroH - 56}px`, maxWidth: "240px", padding: "0 8px" }
                    : { height: "56px", maxWidth: "200px" }
                  }
                  draggable={false}
                />
              ) : (
                <p
                  className="font-bold text-center leading-tight"
                  style={{ fontSize: "28px", color: outlet.headerBg ? "#ffffff" : outlet.accentColor, letterSpacing: "-0.01em" }}
                >
                  {outlet.displayName}
                </p>
              )}
              {/* Badge */}
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: outlet.headerBg ? "rgba(255,255,255,0.15)" : outlet.accentColor }}
              >
                <Newspaper className="h-3.5 w-3.5 text-white" />
                <span className="text-white text-[10px] font-semibold uppercase tracking-widest">
                  {language === "it" ? "Rassegna Stampa" : "Press Coverage"}
                </span>
              </div>
              {/* Read original CTA */}
              <a
                href={article.linkedinUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold rounded-full px-5 py-2 transition-opacity hover:opacity-85"
                style={outlet.headerBg
                  ? { background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff" }
                  : { background: outlet.accentColor, color: "#ffffff" }
                }
                data-testid={`link-modal-press-source-${article.id}`}
              >
                <ExternalLink className="h-4 w-4" />
                {language === "it" ? `Leggi l'articolo su ${outlet.displayName}` : `Read on ${outlet.displayName}`}
              </a>
            </div>
          ) : (
            <div
              className="sticky top-0 z-0 overflow-hidden"
              style={{ height: `${heroH}px` }}
              data-testid="modal-hero-container"
            >
              <OptimizedPicture
                src={imageUrl}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={(() => {
                  const pos = article.imagePosition;
                  const zoom = article.imageZoom || 100;
                  let ox = 50, oy = 50;
                  if (pos && pos.includes(",")) {
                    const [x, y] = pos.split(",").map(Number);
                    if (!isNaN(x)) ox = x;
                    if (!isNaN(y)) oy = y;
                  }
                  if (zoom === 100 && ox === 50 && oy === 50) return { objectPosition: "center" };
                  return {
                    objectPosition: `${ox}% ${oy}%`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: `${ox}% ${oy}%`,
                  };
                })()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
          )}

          {/* Content slides up over the hero */}
          <div
            className="relative z-10 bg-background rounded-t-2xl -mt-10 min-h-[60vh]"
            style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.12)' }}
          >
            <div className="px-6 md:px-8 pt-6 pb-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                {autoT(article.title)}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                {article.authorName && (
                  <button
                    type="button"
                    onClick={() => handleAuthorClick(article.authorName)}
                    className="flex items-center gap-1 hover:underline transition-colors cursor-pointer text-foreground hover:text-primary"
                    data-testid={`button-modal-author-${article.id}`}
                  >
                    {isLegalitAuthor(article.authorName) ? <SiLinkedin className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {article.authorName}
                  </button>
                )}
                {article.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.createdAt).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                )}
                {article.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.readTime} {language === "it" ? "di lettura" : "read"}
                  </span>
                )}
              </div>
              {(article.linkedPracticeArea || (article.tags && article.tags.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.linkedPracticeArea && (() => {
                    const area = practiceAreasEnhanced.find(a => a.id === article.linkedPracticeArea);
                    if (!area) return null;
                    const label = language === "en" ? area.titleEN : area.titleIT;
                    return (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          onClose();
                          navigate(`/attivita/${article.linkedPracticeArea}`);
                        }}
                        data-testid={`button-modal-practice-area-${article.linkedPracticeArea}`}
                      >
                        {label}
                      </Badge>
                    );
                  })()}
                  {article.tags && article.tags
                    .filter(tag => tag !== article.linkedPracticeArea)
                    .map(tag => {
                      const area = practiceAreasEnhanced.find(a => a.id === tag);
                      if (!area) return null;
                      const label = language === "en" ? area.titleEN : area.titleIT;
                      return (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer text-[10px]"
                          onClick={() => {
                            onClose();
                            navigate(`/attivita/${tag}`);
                          }}
                          data-testid={`button-modal-tag-${tag}`}
                        >
                          {label}
                        </Badge>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <article className="prose prose-slate dark:prose-invert max-w-none">
                {article.excerpt && (
                  <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                    {renderInlineMd(autoT(article.excerpt), dbProfessionals)}
                  </p>
                )}
                {formatContent(article.content)}
              </article>

              {(() => {
                const allAreaIds = new Set<string>();
                if (article.linkedPracticeArea) allAreaIds.add(article.linkedPracticeArea);
                if (article.tags) article.tags.forEach(t => allAreaIds.add(t));
                const areas = Array.from(allAreaIds)
                  .map(id => practiceAreasEnhanced.find(a => a.id === id))
                  .filter(Boolean) as typeof practiceAreasEnhanced;
                if (areas.length === 0) return null;

                const getIcon = (id: string) => {
                  if (id === "diritto-lavoro") return HardHat;
                  if (id === "diritto-penale" || id === "corporate-compliance") return Gavel;
                  if (id === "diritto-civile-commerciale" || id === "diritto-societario-ma") return Scale;
                  return Building2;
                };

                return (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      {language === "it" ? "Aree di Attività Correlate" : "Related Practice Areas"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areas.map((area) => {
                        const areaTitle = language === "it" ? area.titleIT : area.titleEN;
                        const AreaIcon = getIcon(area.id);
                        return (
                          <Link key={area.id} href={`/attivita/${area.id}`} onClick={onClose}>
                            <div
                              className="group relative h-28 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-primary"
                              data-testid={`card-related-area-${area.id}`}
                            >
                              {area.image && (
                                <img
                                  src={area.image}
                                  alt={areaTitle}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                              <div className="absolute top-2 left-2">
                                <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <AreaIcon className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <h4 className="text-sm font-semibold text-white drop-shadow-lg line-clamp-2">
                                  {areaTitle}
                                </h4>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const linkedIds: string[] = article.linkedProfessionalIds || (article.linkedProfessionalId ? [article.linkedProfessionalId] : []);
                const allAreaIds: string[] = [];
                if (article.linkedPracticeArea) allAreaIds.push(article.linkedPracticeArea);
                if (article.tags) article.tags.forEach(t => { if (!allAreaIds.includes(t)) allAreaIds.push(t); });
                if (linkedIds.length === 0 && allAreaIds.length === 0) return null;

                const linkedPros = linkedIds.length > 0
                  ? linkedIds.map(id => dbProfessionals.find((p: any) => String(p.id) === String(id))).filter(Boolean) as any[]
                  : [];

                return (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {language === "it" ? "I Nostri Professionisti" : "Our Professionals"}
                    </h3>

                    {linkedPros.length > 0 ? (
                      /* Griglia statica: mostra TUTTI i professionisti collegati */
                      <div className={`grid gap-3 ${linkedPros.length === 1 ? 'grid-cols-1 max-w-xs' : linkedPros.length === 2 ? 'grid-cols-2' : linkedPros.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'}`}>
                        {linkedPros.map((pro: any) => {
                          const isAuthor = article.authorName && pro.name?.toLowerCase().includes(article.authorName.toLowerCase().replace(/^(avv\.|prof\.|dott\.|dott\.ssa)\s*/i, ''));
                          const imgUrl = pro.imageUrl?.startsWith('/') || pro.imageUrl?.startsWith('http') ? pro.imageUrl : pro.imageUrl ? `/attached_assets/${pro.imageUrl}` : null;
                          return (
                            <div
                              key={pro.id}
                              className={`relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] bg-muted ${isAuthor ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                              onClick={() => { onClose(); navigate(professionalUrl(pro)); }}
                              data-testid={`card-linked-pro-${pro.id}`}
                            >
                              {imgUrl && (
                                <img
                                  src={imgUrl}
                                  alt={pro.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={(() => {
                                    const zoom = pro.imageZoom || 100;
                                    let ox = 50, oy = 50;
                                    if (pro.imagePosition?.includes(',')) {
                                      const [x, y] = pro.imagePosition.split(',').map(Number);
                                      if (!isNaN(x)) ox = x;
                                      if (!isNaN(y)) oy = y;
                                    }
                                    return { objectFit: 'cover' as const, objectPosition: `${ox}% ${oy}%`, transform: `scale(${zoom / 100})`, transformOrigin: `${ox}% ${oy}%` };
                                  })()}
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 drop-shadow">{pro.name}</p>
                                <p className="text-white/70 text-[10px] leading-tight mt-0.5 line-clamp-1">{pro.title}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Reel rotante per aree (nessun ID specifico) */
                      <ProfessionalsReel
                        columns={3}
                        filterByAreas={allAreaIds}
                        highlightAuthor={article.authorName}
                        onProfessionalClick={(_id, pro) => {
                          onClose();
                          if (pro) navigate(professionalUrl(pro));
                          else navigate("/professionisti");
                        }}
                      />
                    )}
                  </div>
                );
              })()}

              <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full"
                  data-testid="button-back-to-news"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {language === "it" ? "Torna alle News" : "Back to News"}
                </Button>
                <div className="flex flex-wrap items-center gap-3">
                  {article.documentUrl && (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      data-testid="button-open-document"
                      asChild
                    >
                      <a
                        href={article.documentUrl.startsWith('http') ? article.documentUrl : `/objects/${article.documentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {article.documentName || "Apri Documento"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {article.linkedinUrl && (
                    <Button
                      variant="default"
                      className="rounded-full"
                      data-testid="button-open-linkedin"
                      asChild
                    >
                      <a
                        href={article.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiLinkedin className="mr-2 h-4 w-4" />
                        {language === "it" ? "Vedi su LinkedIn" : "View on LinkedIn"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
