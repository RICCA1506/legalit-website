import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ProfessionalCard from "@/components/ProfessionalCard";
import ProfessionalModal from "@/components/ProfessionalModal";
import CtaSection from "@/components/CtaSection";
import AnimatedElement from "@/components/AnimatedElement";
import LandoReveal from "@/components/LandoReveal";
import StaggerContainer, { staggerItemVariants } from "@/components/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { offices, professionals as staticProfessionals } from "@/lib/data";
import { practiceAreasEnhanced, professionalMatchesArea } from "@/lib/practiceAreasData";
import { useLanguage } from "@/lib/i18n";
import { Search, X, Filter } from "lucide-react";
import type { Professional as DbProfessional, NewsArticle } from "@shared/schema";

interface ProfessionalData {
  id: number | string;
  name: string;
  title: string;
  role?: string | null;
  specializations?: string[] | null;
  office: string;
  email?: string | null;
  pec?: string | null;
  phone?: string | null;
  fullBio?: string | null;
  education?: string[] | null;
  languages?: string[] | null;
  imageUrl?: string | null;
  linkedin?: string | null;
  orderIndex?: number | null;
}

const allRoles = [
  { value: "Managing Partner", label: "Managing Partner" },
  { value: "Partner", label: "Partner" },
  { value: "Of Counsel", label: "Of Counsel" },
  { value: "Senior Associate", label: "Senior Associate" },
  { value: "Associate", label: "Associate" },
  { value: "Trainee", label: "Trainee" },
];

const allLanguages = [
  { value: "italiano", label: "Italiano" },
  { value: "inglese", label: "Inglese" },
  { value: "francese", label: "Francese" },
  { value: "tedesco", label: "Tedesco" },
  { value: "spagnolo", label: "Spagnolo" },
  { value: "portoghese", label: "Portoghese" },
  { value: "russo", label: "Russo" },
  { value: "cinese", label: "Cinese" },
  { value: "arabo", label: "Arabo" },
];

export default function Professionisti() {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedOffice, setSelectedOffice] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalData | null>(null);
  const search = useSearch();

  const { data: dbProfessionals = [], isLoading: professionalsLoading } = useQuery<DbProfessional[]>({
    queryKey: ["/api/professionals"],
  });

  const { data: newsArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const professionals: ProfessionalData[] = professionalsLoading
    ? []
    : dbProfessionals.length > 0
      ? dbProfessionals
      : staticProfessionals;

  useEffect(() => {
    const params = new URLSearchParams(search);
    const professionalId = params.get('id');
    if (professionalId) {
      const prof = professionals.find(p => String(p.id) === professionalId);
      if (prof) {
        setSelectedProfessional(prof);
      }
    }
  }, [search, professionals]);

  const getRelatedNews = (professionalId: number | string, professionalName: string) => {
    return newsArticles
      .filter(article => {
        if (article.linkedProfessionalIds && article.linkedProfessionalIds.includes(String(professionalId))) {
          return true;
        }
        if (article.linkedProfessionalId && String(article.linkedProfessionalId) === String(professionalId)) {
          return true;
        }
        // Match by authorName
        if (article.authorName) {
          const cleanName = professionalName.replace('Avv. ', '').replace('Prof. ', '').toLowerCase();
          if (article.authorName.toLowerCase().includes(cleanName) ||
              professionalName.toLowerCase().includes(article.authorName.toLowerCase())) {
            return true;
          }
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(article => ({
        id: article.id,
        title: article.title,
        createdAt: article.createdAt ? String(article.createdAt) : null,
      }));
  };

  const filteredProfessionals = useMemo(() => {
    const roleOrder = ["Managing Partner", "Partner", "Of Counsel", "Senior Associate", "Associate", "Trainee"];
    
    return professionals
      .filter((p) => {
        if (selectedRole !== "all") {
          if (selectedRole === "Managing Partner") {
            if (p.title !== "Managing Partner") return false;
          } else {
            const pRole = p.role || p.title;
            if (!pRole?.toLowerCase().includes(selectedRole.toLowerCase())) return false;
          }
        }
        if (selectedOffice !== "all" && p.office !== selectedOffice) return false;
        // Use mapping function to match area IDs with professional specializations
        if (selectedArea !== "all" && !professionalMatchesArea(p.specializations, selectedArea)) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const aRole = a.role || a.title || "";
        const bRole = b.role || b.title || "";
        const aRoleIndex = roleOrder.findIndex(r => aRole.toLowerCase().includes(r.toLowerCase()));
        const bRoleIndex = roleOrder.findIndex(r => bRole.toLowerCase().includes(r.toLowerCase()));
        const aRoleOrder = aRoleIndex === -1 ? 999 : aRoleIndex;
        const bRoleOrder = bRoleIndex === -1 ? 999 : bRoleIndex;
        
        if (aRoleOrder !== bRoleOrder) {
          return aRoleOrder - bRoleOrder;
        }
        
        const aOrder = (a as any).orderIndex ?? (a as any).order_index ?? 999;
        const bOrder = (b as any).orderIndex ?? (b as any).order_index ?? 999;
        return aOrder - bOrder;
      });
  }, [professionals, selectedRole, selectedOffice, selectedArea, searchQuery]);

  const hasActiveFilters = selectedRole !== "all" || selectedOffice !== "all" || selectedArea !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedOffice("all");
    setSelectedArea("all");
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <PageHeader
        title={t("professionisti.title")}
        description={t("professionisti.description")}
      />
      
      <section className="py-10 md:py-16 relative z-10">
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          <AnimatedElement delay={100} className="mb-6 md:mb-10">
            <div className="bg-muted/30 rounded-xl p-4 md:p-6 border border-border">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
                <Filter className="h-4 w-4" />
                {language === "it" ? "Filtri di ricerca" : "Search filters"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {language === "it" ? "Ruolo" : "Role"}
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder={language === "it" ? "Seleziona ruolo" : "Select role"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "it" ? "Tutti i ruoli" : "All roles"}
                      </SelectItem>
                      {allRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {language === "it" ? "Sede" : "Office"}
                  </label>
                  <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                    <SelectTrigger data-testid="select-office">
                      <SelectValue placeholder={language === "it" ? "Seleziona sede" : "Select office"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "it" ? "Tutte le sedi" : "All offices"}
                      </SelectItem>
                      {offices.map((office) => (
                        <SelectItem key={office.id} value={office.city}>
                          {office.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {language === "it" ? "Area di attività" : "Practice area"}
                  </label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger data-testid="select-area">
                      <SelectValue placeholder={language === "it" ? "Seleziona area" : "Select area"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "it" ? "Tutte le aree" : "All areas"}
                      </SelectItem>
                      {practiceAreasEnhanced.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {language === "it" ? area.titleIT : area.titleEN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {language === "it" ? "Ricerca per nominativo" : "Search by name"}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === "it" ? "Nome o cognome..." : "Name..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-name"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {filteredProfessionals.length} {language === "it" ? "risultati" : "results"}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-primary"
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {language === "it" ? "Cancella filtri" : "Clear filters"}
                  </Button>
                </div>
              )}
            </div>
          </AnimatedElement>

          {professionalsLoading ? (
            <div className="flex flex-wrap justify-center gap-2 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="min-w-0 w-[calc(33.333%-0.375rem)] md:w-[calc(33.333%-1.25rem)] lg:w-[calc(25%-1.125rem)]">
                  <Skeleton className="aspect-[3/4] w-full rounded-t-lg" />
                  <Skeleton className="h-4 w-3/4 mt-2 mx-auto rounded" />
                  <Skeleton className="h-3 w-1/2 mt-1.5 mx-auto rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <StaggerContainer staggerDelay={0.08} className="flex flex-wrap justify-center gap-2 md:gap-6">
                {filteredProfessionals.map((professional) => (
                  <motion.div
                    key={professional.id}
                    variants={staggerItemVariants(40, 0.5)}
                    className="cursor-pointer min-w-0 w-[calc(33.333%-0.375rem)] md:w-[calc(33.333%-1.25rem)] lg:w-[calc(25%-1.125rem)]"
                  >
                    <button
                      onClick={() => setSelectedProfessional(professional)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedProfessional(professional);
                        }
                      }}
                      className="w-full min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                      data-testid={`button-professional-${professional.id}`}
                      aria-label={`${t("professionisti.viewProfile")} ${professional.name}`}
                    >
                      <ProfessionalCard {...professional} />
                    </button>
                  </motion.div>
                ))}
              </StaggerContainer>

              {filteredProfessionals.length === 0 && (
                <AnimatedElement variant="fade" className="text-center text-muted-foreground py-16">
                  {t("professionisti.noResults")}
                </AnimatedElement>
              )}
            </>
          )}
        </div>
      </section>
      <div className="relative z-10">
        <CtaSection />
      </div>
      
      <ProfessionalModal
        professional={selectedProfessional}
        isOpen={!!selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
        relatedNews={selectedProfessional ? getRelatedNews(selectedProfessional.id, selectedProfessional.name) : []}
      />
    </div>
  );
}
