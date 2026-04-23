import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import CtaSection from "@/components/CtaSection";
import AnimatedElement from "@/components/AnimatedElement";
import { practiceAreasEnhanced, professionalMatchesArea } from "@/lib/practiceAreasData";
import { professionals as localProfessionals } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProfessionalCard from "@/components/ProfessionalCard";
import RichText from "@/components/RichText";
import { renderInlineMd } from "@/lib/markdownUtils";
import type { NewsArticle, Professional as DbProfessional } from "@shared/schema";
import { professionalUrl } from "@shared/slugify";
import { 
  Building2, 
  Scale, 
  Users, 
  Landmark,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Calendar,
  ArrowRight,
  User
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Scale,
  Users,
  Landmark,
};

export default function AttivitaDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const [showAllProfessionals, setShowAllProfessionals] = useState(true);
  
  const practiceArea = practiceAreasEnhanced.find(area => area.id === id);
  const Icon = practiceArea ? iconMap[practiceArea.icon] || Building2 : Building2;
  
  const { data: dbProfessionals = [], isLoading: professionalsLoading } = useQuery<DbProfessional[]>({
    queryKey: ["/api/professionals"],
  });

  const professionals = professionalsLoading
    ? []
    : dbProfessionals.length > 0
      ? dbProfessionals
      : localProfessionals;
  
  // Use the mapping function to find professionals that match this practice area
  // This handles cases where specialization IDs differ from area page IDs
  const specializedProfessionals = professionals
    .filter(p => professionalMatchesArea(p.specializations, id || ""))
    .sort((a, b) => {
      const aHasImage = a.imageUrl ? 1 : 0;
      const bHasImage = b.imageUrl ? 1 : 0;
      return bHasImage - aHasImage;
    });

  const { data: news = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const relatedNews = practiceArea 
    ? news
        .filter(article => {
          // Check if linkedPracticeArea matches current practice area id
          if (article.linkedPracticeArea === practiceArea.id) return true;
          
          // Check if any tag matches practice area title or id
          if (article.tags && Array.isArray(article.tags)) {
            const searchTerms = [
              practiceArea.id.toLowerCase(),
              practiceArea.titleIT.toLowerCase(),
              practiceArea.titleEN.toLowerCase(),
              ...practiceArea.titleIT.toLowerCase().split(" ").filter(w => w.length > 3),
              ...practiceArea.titleEN.toLowerCase().split(" ").filter(w => w.length > 3)
            ];
            
            for (const tag of article.tags) {
              const tagLower = tag.toLowerCase();
              if (searchTerms.some(term => tagLower.includes(term) || term.includes(tagLower))) {
                return true;
              }
            }
          }
          
          // Check if category matches
          const categoryLower = article.category?.toLowerCase() || "";
          const titleWords = practiceArea.titleIT.toLowerCase().split(" ").filter(w => w.length > 3);
          if (titleWords.some(word => categoryLower.includes(word))) return true;
          
          return false;
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!practiceArea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === "it" ? "Area non trovata" : "Area not found"}
          </h1>
          <Link href="/attivita">
            <Button data-testid="button-back-not-found">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {language === "it" ? "Torna alle Attività" : "Back to Practice Areas"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="relative h-[60vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${practiceArea.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-5 md:px-12 lg:px-20 max-w-6xl mx-auto">
          <AnimatedElement>
            <Link href="/attivita">
              <Button 
                variant="ghost" 
                className="text-white/70 hover:text-white hover:bg-white/10 mb-8 -ml-4" 
                data-testid="button-back-attivita"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {language === "it" ? "Aree di Attività" : "Practice Areas"}
              </Button>
            </Link>
          </AnimatedElement>
          
          <AnimatedElement delay={100}>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {language === "it" ? practiceArea.titleIT : practiceArea.titleEN}
            </h1>
          </AnimatedElement>
          
        </div>
      </div>
      
      <section className="py-10 md:py-20 px-5 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <AnimatedElement>
            <div data-testid="text-detail-description">
              <RichText
                text={language === "it" ? practiceArea.fullDescriptionIT : practiceArea.fullDescriptionEN}
                professionals={dbProfessionals}
              />
            </div>
          </AnimatedElement>
        </div>
      </section>
      
      {(professionalsLoading || specializedProfessionals.length > 0) && (
        <section className="py-10 md:py-20 px-5 md:px-12 lg:px-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <AnimatedElement>
              <p className="text-[15px] md:text-lg text-primary font-medium mb-3">
                {language === "it" 
                  ? "Hai bisogno di assistenza in questo ambito?" 
                  : "Need assistance in this area?"}
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-8">
                {language === "it" 
                  ? "Affidati ai nostri professionisti." 
                  : "Trust our professionals."}
              </h2>
            </AnimatedElement>
            
            {professionalsLoading ? (
              <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[calc(50%-6px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                    <Skeleton className="aspect-[3/4] w-full rounded-t-lg" />
                    <Skeleton className="h-4 w-3/4 mt-2 rounded" />
                    <Skeleton className="h-3 w-1/2 mt-1.5 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                <AnimatePresence>
                  {(showAllProfessionals ? specializedProfessionals : specializedProfessionals.slice(0, 4)).map((professional, index) => (
                    <motion.div
                      key={professional.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="cursor-pointer min-w-0 w-[calc(50%-6px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                    >
                      <Link
                        href={professionalUrl(professional)}
                        className="w-full min-w-0 text-left block"
                        data-testid={`link-professional-${professional.id}`}
                      >
                        <ProfessionalCard
                          name={professional.name}
                          title={professional.title}
                          imageUrl={professional.imageUrl}
                          imagePosition={"imagePosition" in professional ? professional.imagePosition : undefined}
                          imageZoom={"imageZoom" in professional ? professional.imageZoom : undefined}
                          email={professional.email}
                          office={professional.office}
                          specializations={professional.specializations}
                          fullBio={professional.fullBio}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {specializedProfessionals.length > 4 && (
              <AnimatedElement delay={300} className="text-center mt-8">
                <Button 
                  variant="ghost" 
                  className="rounded-full px-8 gap-2"
                  onClick={() => setShowAllProfessionals(!showAllProfessionals)}
                  data-testid="button-toggle-professionals"
                >
                  {showAllProfessionals 
                    ? (language === "it" ? "Mostra meno" : "Show less")
                    : (language === "it" ? `Mostra tutti (${specializedProfessionals.length})` : `Show all (${specializedProfessionals.length})`)}
                  <motion.div
                    animate={{ rotate: showAllProfessionals ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </AnimatedElement>
            )}
            
            <AnimatedElement delay={400} className="text-center mt-8">
              <Link href="/professionisti">
                <Button variant="outline" className="rounded-full px-8" data-testid="button-all-professionals">
                  {language === "it" ? "Vedi tutti i professionisti" : "See all professionals"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </AnimatedElement>
          </div>
        </section>
      )}
      {relatedNews.length > 0 && (
        <section className="py-20 px-5 md:px-12 lg:px-20 pt-[8px] pb-[8px]">
          <div className="max-w-6xl mx-auto">
            <AnimatedElement>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-12">
                {language === "it" ? "Ultime Notizie" : "Latest News"}
              </h2>
            </AnimatedElement>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {relatedNews.map((article, index) => (
                <AnimatedElement key={article.id} delay={index * 50}>
                  <Card 
                    className="group overflow-hidden border-0 shadow-md hover-elevate h-full"
                    data-testid={`card-news-${article.id}`}
                  >
                    {article.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.imageUrl}
                          alt={article.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          data-testid={`img-news-${article.id}`}
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {article.createdAt 
                            ? new Date(article.createdAt).toLocaleDateString('it-IT', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })
                            : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {renderInlineMd(article.excerpt || "", dbProfessionals)}
                      </p>
                      <div className="flex items-center gap-1 text-primary text-sm group-hover:gap-2 transition-all">
                        <span>{language === "it" ? "Approfondisci" : "Read more"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaSection />
    </div>
  );
}
