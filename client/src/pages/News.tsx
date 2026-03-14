import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Clock, ArrowUpDown, Filter, ExternalLink, Search, ChevronLeft, ChevronRight, Newspaper, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SiLinkedin } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { professionals as staticProfessionals } from "@/lib/data";
import { practiceAreasEnhanced } from "@/lib/practiceAreasData";
import { getOutletFromUrl } from "@/lib/pressOutlets";
import { renderInlineMd } from "@/lib/markdownUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CtaSection from "@/components/CtaSection";
import NewsArticleModal from "@/components/NewsArticleModal";
import OptimizedPicture from "@/components/OptimizedPicture";
import { motion } from "framer-motion";
import AnimatedElement from "@/components/AnimatedElement";
import LandoReveal from "@/components/LandoReveal";
import StaggerContainer, { staggerItemVariants } from "@/components/StaggerContainer";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import type { NewsArticle } from "@shared/schema";
import LinkedInHeroCard from "@/components/LinkedInHeroCard";
import { useLinkedInSentinel } from "@/hooks/useLinkedInSentinel";
import legalitLogo from "@assets/Screenshot_2025-12-02_155918_1768430529643.png";

const themeOverlays: Record<string, { gradient: string; accent: string }> = {
  default: {
    gradient: 'linear-gradient(135deg, rgba(8, 57, 107, 0.88) 0%, rgba(10, 102, 194, 0.78) 50%, rgba(8, 57, 107, 0.92) 100%)',
    accent: '#7eb8e5',
  },
  cassazione: {
    gradient: 'linear-gradient(135deg, rgba(8, 57, 107, 0.88) 0%, rgba(10, 102, 194, 0.78) 50%, rgba(8, 57, 107, 0.92) 100%)',
    accent: '#7eb8e5',
  },
  colosseo: {
    gradient: 'linear-gradient(135deg, rgba(139, 69, 19, 0.88) 0%, rgba(180, 100, 50, 0.78) 50%, rgba(139, 69, 19, 0.92) 100%)',
    accent: '#e8b88a',
  },
  'villa-este': {
    gradient: 'linear-gradient(135deg, rgba(34, 85, 51, 0.88) 0%, rgba(60, 120, 70, 0.78) 50%, rgba(34, 85, 51, 0.92) 100%)',
    accent: '#90c090',
  },
  trevi: {
    gradient: 'linear-gradient(135deg, rgba(0, 100, 100, 0.88) 0%, rgba(32, 140, 140, 0.78) 50%, rgba(0, 100, 100, 0.92) 100%)',
    accent: '#80d4d4',
  },
  borghese: {
    gradient: 'linear-gradient(135deg, rgba(25, 80, 60, 0.88) 0%, rgba(50, 120, 90, 0.78) 50%, rgba(25, 80, 60, 0.92) 100%)',
    accent: '#88c8a8',
  },
};

const ARTICLES_PER_PAGE = 9;

export default function News() {
  const { t, language, autoT } = useLanguage();
  const { currentTheme } = useTheme();
  const overlay = themeOverlays[currentTheme.id] || themeOverlays.default;
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [studioPage, setStudioPage] = useState(1);
  const [newsTypeFilter, setNewsTypeFilter] = useState<"all" | "studio" | "rassegna-stampa">("all");
  const { isAuthenticated } = useAuth();

  const { data: newsArticles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const { data: dbProfessionals = [] } = useQuery<any[]>({
    queryKey: ["/api/professionals"],
  });

  const linkedInSentinelRef = useLinkedInSentinel();

  useEffect(() => {
    if (newsArticles.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article");
    if (articleId) {
      const article = newsArticles.find(a => a.id === Number(articleId));
      if (article) {
        setSelectedArticle(article);
      }
    }
  }, [newsArticles]);

  const studioNews = newsArticles.filter(a => {
    const type = a.newsType || "studio";
    if (newsTypeFilter === "all") return type === "studio" || type === "rassegna-stampa";
    return type === newsTypeFilter;
  });

  const sortedPracticeAreas = [...practiceAreasEnhanced].sort((a, b) => {
    const nameA = language === "en" ? a.titleEN : a.titleIT;
    const nameB = language === "en" ? b.titleEN : b.titleIT;
    return nameA.localeCompare(nameB, language);
  });

  const getPracticeAreaLabel = (areaId: string) => {
    const area = practiceAreasEnhanced.find(a => a.id === areaId);
    if (!area) return areaId;
    return language === "en" ? area.titleEN : area.titleIT;
  };

  const filterAndSortNews = (articles: NewsArticle[]) => {
    let filtered = [...articles];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        (a.excerpt && a.excerpt.toLowerCase().includes(query)) ||
        (a.category && a.category.toLowerCase().includes(query))
      );
    }
    
    if (selectedPracticeArea !== "all") {
      filtered = filtered.filter(a => a.linkedPracticeArea === selectedPracticeArea);
    }
    
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const filteredStudioNews = filterAndSortNews(studioNews);

  const studioTotalPages = Math.ceil(filteredStudioNews.length / ARTICLES_PER_PAGE);

  const paginatedStudioNews = filteredStudioNews.slice(
    (studioPage - 1) * ARTICLES_PER_PAGE,
    studioPage * ARTICLES_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setStudioPage(1);
  };

  const [, navigate] = useLocation();

  const findProfessionalByName = (name: string | null | undefined) => {
    if (!name) return null;
    const cleanName = (n: string) => n.replace(/^(Avv\.\s*|Prof\.\s*|Dott\.\s*|Dott\.ssa\s*)/i, '').toLowerCase().trim();
    const cleaned = cleanName(name);
    const dbMatch = dbProfessionals.find(p => {
      const pClean = cleanName(p.name);
      return pClean === cleaned || pClean.includes(cleaned) || cleaned.includes(pClean);
    });
    if (dbMatch) return dbMatch;
    return staticProfessionals.find(p => {
      const pClean = cleanName(p.name);
      return pClean === cleaned || pClean.includes(cleaned) || cleaned.includes(pClean);
    });
  };

  const isLegalitAuthor = (name: string | null | undefined) => {
    if (!name) return false;
    return name.toLowerCase().trim() === 'legalit';
  };

  const handlePracticeAreaClick = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/attivita/${areaId}`);
  };

  const handleAuthorClick = (authorName: string | null | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLegalitAuthor(authorName)) {
      window.open('https://www.linkedin.com/company/legalit---avvocati-associati/', '_blank');
      return;
    }
    const professional = findProfessionalByName(authorName);
    if (professional) {
      navigate(`/professionisti?id=${professional.id}`);
    }
  };

  const NewsCard = ({ article }: { article: NewsArticle }) => {
    return (
      <Card
        className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer border-0 bg-card h-full flex flex-col"
        onClick={() => setSelectedArticle(article)}
        data-testid={`card-news-${article.id}`}
      >
        <div
          className="overflow-hidden relative bg-muted flex items-center justify-center aspect-[16/7]"
        >
          <Newspaper className="h-12 w-12 text-muted-foreground/40 absolute" />
          <OptimizedPicture
            src={article.imageUrl || "/attached_assets/unsplash-law-default.jpg"}
            alt={article.title}
            className="w-full h-full object-cover relative z-10"
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
          {article.readTime && (
            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </div>
          )}
          {article.newsType === "rassegna-stampa" && (
            <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" />
              {language === "it" ? "Rassegna Stampa" : "Press"}
            </div>
          )}
        </div>
        <CardContent className="p-4 md:p-6 flex flex-col flex-1">
          <h3 className="font-semibold text-base md:text-lg mb-2 group-hover:text-primary transition-colors">
            {autoT(article.title)}
          </h3>
          {article.linkedPracticeArea && (
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge
                variant="outline"
                className="cursor-pointer max-w-full w-fit truncate text-xs"
                onClick={(e) => handlePracticeAreaClick(article.linkedPracticeArea!, e as any)}
                data-testid={`button-practice-area-${article.linkedPracticeArea}`}
                aria-label={`${language === "it" ? "Filtra per" : "Filter by"} ${getPracticeAreaLabel(article.linkedPracticeArea)}`}
              >
                <span className="truncate">{getPracticeAreaLabel(article.linkedPracticeArea)}</span>
              </Badge>
            </div>
          )}
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {renderInlineMd(autoT(article.excerpt))}
            </p>
          )}
          <div className="flex flex-col gap-2 mt-auto">
            {article.authorName && (
              <button
                type="button"
                onClick={(e) => handleAuthorClick(article.authorName, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAuthorClick(article.authorName, e as any);
                  }
                }}
                className="hover:underline transition-colors text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-0 flex items-center gap-1 w-fit"
                data-testid={`button-author-${article.id}`}
                aria-label={`${language === "it" ? "Visualizza profilo di" : "View profile of"} ${article.authorName}`}
              >
                <span className="truncate">{article.authorName}</span>
              </button>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3" />
                {article.createdAt && new Date(article.createdAt).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              {article.newsType === "rassegna-stampa" && article.linkedinUrl ? (
                <a
                  href={article.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary flex items-center gap-1 hover:underline transition-colors btn-bounce shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-source-${article.id}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {language === "it" ? "Leggi l'articolo" : "Read article"}
                </a>
              ) : (
                <a
                  href={article.linkedinUrl || "https://www.linkedin.com/company/legalit---avvocati-associati/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#0A66C2] flex items-center gap-1 hover:underline transition-colors btn-bounce shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-linkedin-${article.id}`}
                >
                  <SiLinkedin className="h-3.5 w-3.5" />
                  {t("news.viewOnLinkedIn")}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PressCard = ({ article }: { article: NewsArticle }) => {
    const outlet = getOutletFromUrl(article.linkedinUrl);
    const sourceUrl = article.linkedinUrl || "#";

    return (
      <Card
        className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer border-0 bg-card h-full flex flex-col"
        onClick={() => setSelectedArticle(article)}
        data-testid={`card-press-${article.id}`}
      >
        {/* Outlet masthead */}
        {outlet.headerBg ? (
          /* Sfondo colorato (es. LC): logo grande centrato, badge/data in bianco in basso */
          <div
            className="relative flex flex-col items-center justify-center"
            style={{ background: outlet.headerBg, minHeight: "130px" }}
          >
            {outlet.logoPath && (
              <img
                src={outlet.logoPath}
                alt={outlet.displayName}
                className="w-full h-full object-contain"
                style={{ maxHeight: "130px", padding: "18px 32px 10px" }}
                draggable={false}
              />
            )}
            {/* Badge + data sovrapposti in basso */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-center gap-1">
                <Newspaper className="h-3 w-3 text-white/90" />
                <span className="text-white/90 text-[9px] font-semibold uppercase tracking-widest">
                  {language === "it" ? "Rassegna Stampa" : "Press"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-white/70" />
                <span className="text-white/70 text-[11px]">
                  {article.createdAt && new Date(article.createdAt).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Sfondo bianco: logo medio centrato, bordo accent in cima */
          <div
            className="relative flex flex-col items-center justify-center gap-3 px-5 py-5"
            style={{
              background: "#ffffff",
              borderTop: `4px solid ${outlet.accentColor}`,
              minHeight: "130px",
            }}
          >
            {outlet.logoPath ? (
              <img
                src={outlet.logoPath}
                alt={outlet.displayName}
                className="h-11 max-w-[150px] object-contain"
                draggable={false}
              />
            ) : (
              <p
                className="font-bold text-center leading-tight"
                style={{ fontSize: "20px", color: outlet.accentColor, letterSpacing: "-0.01em" }}
              >
                {outlet.displayName}
              </p>
            )}
            {/* Riga meta: badge + data */}
            <div className="flex items-center justify-between w-full px-1">
              <div
                className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: outlet.accentColor }}
              >
                <Newspaper className="h-3 w-3 text-white" />
                <span className="text-white text-[9px] font-semibold uppercase tracking-widest">
                  {language === "it" ? "Rassegna Stampa" : "Press"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground text-[11px]">
                  {article.createdAt && new Date(article.createdAt).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card body */}
        <CardContent className="p-4 md:p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-[14px] md:text-[15px] leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3">
            {autoT(article.title)}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {renderInlineMd(autoT(article.excerpt))}
            </p>
          )}
          {article.linkedPracticeArea && (
            <div className="flex flex-wrap gap-1 mb-3">
              <Badge
                variant="outline"
                className="cursor-pointer max-w-full w-fit truncate text-xs"
                onClick={(e) => { e.stopPropagation(); handlePracticeAreaClick(article.linkedPracticeArea!, e as any); }}
                data-testid={`button-press-practice-area-${article.linkedPracticeArea}`}
              >
                <span className="truncate">{getPracticeAreaLabel(article.linkedPracticeArea)}</span>
              </Badge>
            </div>
          )}
          {/* CTA branded button */}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-2 w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: outlet.accentColor, color: outlet.textColor }}
            onClick={(e) => e.stopPropagation()}
            data-testid={`link-press-source-${article.id}`}
            aria-label={`${language === "it" ? "Leggi l'articolo su" : "Read article on"} ${outlet.displayName}`}
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-80" />
            <span>{language === "it" ? `Leggi su ${outlet.displayName}` : `Read on ${outlet.displayName}`}</span>
          </a>
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => (
    <div className="space-y-4 mb-6 md:mb-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={newsTypeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => { setNewsTypeFilter("all"); setStudioPage(1); }}
          data-testid="button-filter-all"
        >
          {language === "it" ? "Tutte" : "All"}
        </Button>
        <Button
          variant={newsTypeFilter === "studio" ? "default" : "outline"}
          size="sm"
          onClick={() => { setNewsTypeFilter("studio"); setStudioPage(1); }}
          data-testid="button-filter-studio"
        >
          {language === "it" ? "News dello Studio" : "Firm News"}
        </Button>
        <Button
          variant={newsTypeFilter === "rassegna-stampa" ? "default" : "outline"}
          size="sm"
          onClick={() => { setNewsTypeFilter("rassegna-stampa"); setStudioPage(1); }}
          data-testid="button-filter-rassegna"
        >
          {language === "it" ? "Rassegna Stampa" : "Press Coverage"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap gap-3 md:gap-4">
        <div className="relative flex items-center sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("news.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-full lg:w-[250px]"
            data-testid="input-search-news"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden md:block" />
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
            <SelectTrigger className="w-full lg:w-[180px]" data-testid="select-sort-order">
              <SelectValue placeholder={t("news.filterByDate")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("news.newestFirst")}</SelectItem>
              <SelectItem value="oldest">{t("news.oldestFirst")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden md:block" />
          <Select value={selectedPracticeArea} onValueChange={(v) => { setSelectedPracticeArea(v); setStudioPage(1); }}>
            <SelectTrigger className="w-full lg:w-[320px]" data-testid="select-practice-area">
              <SelectValue placeholder={t("news.filterByPracticeArea")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("news.allPracticeAreas")}</SelectItem>
              {sortedPracticeAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {language === "en" ? area.titleEN : area.titleIT}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || sortOrder !== "newest" || selectedPracticeArea !== "all" || newsTypeFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearchQuery(""); setSortOrder("newest"); setSelectedPracticeArea("all"); setNewsTypeFilter("all"); setStudioPage(1); }}
            className="flex items-center gap-1 text-muted-foreground"
            data-testid="button-reset-filters"
          >
            <X className="h-4 w-4" />
            {language === "it" ? "Rimuovi filtri" : "Clear filters"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="relative pt-28 pb-8 text-white overflow-hidden z-0" style={{ minHeight: 'min(55vh, 480px)' }}>
        {/* Background image from theme */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentTheme.heroImage})` }}
        />
        {/* Theme-specific overlay */}
        <div 
          className="absolute inset-0"
          style={{ background: '#2e6884e6' }}
        />
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
            <div className="flex-1">
              <AnimatedElement once={true}>
                <span className="text-xs md:text-sm uppercase tracking-[0.2em] mb-2 block" style={{ color: overlay.accent }}>
                  Legalit
                </span>
              </AnimatedElement>
              <AnimatedElement delay={100} once={true}>
                <LandoReveal
                  text={t("news.title")}
                  as="h1"
                  className="text-2xl md:text-4xl mb-2 md:mb-3 text-brutalist text-white"
                  delay={100}
                />
              </AnimatedElement>
              <AnimatedElement delay={200} once={true}>
                <p className="text-white/80 mb-3 md:mb-4 text-left max-w-[500px] text-[15px] md:text-lg">
                  {t("news.description")}
                </p>
              </AnimatedElement>
              <AnimatedElement delay={300} once={true}>
                <a 
                  href="https://www.linkedin.com/company/legalit-societ%C3%A0-tra-avvocati/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#ffffff4d] backdrop-blur-sm border border-white/30 rounded-full px-5 py-2.5 hover:bg-[#ffffff66] transition-colors"
                  data-testid="link-linkedin-news"
                >
                  <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{language === "it" ? "Seguici su LinkedIn" : "Follow us on LinkedIn"}</p>
                    <p className="text-white/70 text-xs">{language === "it" ? "Aggiornamenti e approfondimenti in tempo reale" : "Real-time updates and insights"}</p>
                  </div>
                </a>
              </AnimatedElement>
            </div>
            
            <div className="lg:flex-1">
              <LinkedInHeroCard />
            </div>
          </div>
        </div>
      </div>
      <div ref={linkedInSentinelRef} className="relative z-10 h-px" aria-hidden="true" />
      <section className="py-10 md:py-16 relative z-10">
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          {renderFilters()}

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-[16/7] bg-muted" />
                  <CardContent className="p-6 h-[220px]">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-20 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStudioNews.length > 0 ? (
            <>
              <StaggerContainer staggerDelay={0.1} className="flex flex-wrap justify-center gap-3 md:gap-6 lg:gap-8">
                {paginatedStudioNews.map((article) => (
                  <motion.div key={article.id} variants={staggerItemVariants(30, 0.5)} className="w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-1.375rem)]">
                    {article.newsType === "rassegna-stampa"
                      ? <PressCard article={article} />
                      : <NewsCard article={article} />
                    }
                  </motion.div>
                ))}
              </StaggerContainer>
              {studioTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStudioPage((p) => Math.max(1, p - 1))}
                    disabled={studioPage === 1}
                    data-testid="button-studio-prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: studioTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={studioPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setStudioPage(page)}
                        data-testid={`button-studio-page-${page}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStudioPage((p) => Math.min(studioTotalPages, p + 1))}
                    disabled={studioPage === studioTotalPages}
                    data-testid="button-studio-next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <AnimatedElement variant="fade" className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">{t("news.noArticles")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("news.noArticlesDescription")}
              </p>
              {isAuthenticated && (
                <Link href="/area-riservata">
                  <Button data-testid="link-create-first-article">
                    {t("news.createFirst")}
                  </Button>
                </Link>
              )}
            </AnimatedElement>
          )}
        </div>
      </section>
      <div className="relative z-10">
        <CtaSection />
      </div>
      <NewsArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
