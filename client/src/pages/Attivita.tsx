import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import CtaSection from "@/components/CtaSection";
import StaggerContainer, { staggerItemVariants } from "@/components/StaggerContainer";
import { practiceAreasEnhanced, type PracticeArea } from "@/lib/practiceAreasData";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Scale, 
  Users, 
  Landmark,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Scale,
  Users,
  Landmark,
};

interface PracticeAreaCardProps {
  area: PracticeArea;
  language: string;
}

function PracticeAreaCard({ area, language }: PracticeAreaCardProps) {
  return (
    <motion.div variants={staggerItemVariants(40, 0.5)}>
      <Link href={`/attivita/${area.id}`} data-testid={`link-practice-area-${area.id}`}>
        <Card 
          id={`practice-area-${area.id}`}
          className="group cursor-pointer h-full overflow-hidden hover-elevate transition-all duration-300 border-primary/20 hover:border-primary/40 bg-card/80 hover:bg-card"
          data-testid={`card-practice-area-${area.id}`}
        >
          <div className="relative h-28 md:h-40 overflow-hidden">
            <picture>
              <source srcSet={area.imageAvif} type="image/avif" />
              <source srcSet={area.image} type="image/webp" />
              <img 
                src={area.image} 
                alt={language === "it" ? area.titleIT : area.titleEN}
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
                data-testid={`img-practice-area-${area.id}`}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
            
            <div className="absolute bottom-3 right-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <CardContent className="p-3 md:p-5">
            <h3 className="text-[11px] md:text-sm font-bold text-primary mb-1 md:mb-2" data-testid={`text-title-${area.id}`}>
              {language === "it" ? area.titleIT : area.titleEN}
            </h3>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Attivita() {
  const { t, language } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get("area");
    if (areaId) {
      const tryScroll = (attempts: number) => {
        const el = document.getElementById(`practice-area-${areaId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"), 3000);
        } else if (attempts > 0) {
          requestAnimationFrame(() => tryScroll(attempts - 1));
        }
      };
      requestAnimationFrame(() => tryScroll(10));
    }
  }, []);
  
  const allAreas = practiceAreasEnhanced;
  const remainderMobile = allAreas.length % 2;
  const remainderDesktop = allAreas.length % 3;
  const mainAreas = allAreas.slice(0, allAreas.length - Math.max(remainderMobile, remainderDesktop));
  const extraAreas = allAreas.slice(allAreas.length - Math.max(remainderMobile, remainderDesktop));

  return (
    <div className="relative">
      <PageHeader 
        title={language === "it" ? "Aree di attività" : "Practice Areas"}
      />
      
      <section className="py-10 md:py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-5 md:px-12 relative z-10">
          
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {mainAreas.map((area) => (
              <PracticeAreaCard 
                key={area.id} 
                area={area} 
                language={language} 
              />
            ))}
          </StaggerContainer>
          {extraAreas.length > 0 && (
            <StaggerContainer staggerDelay={0.08} className="flex justify-center gap-3 md:gap-5 mt-3 md:mt-5">
              {extraAreas.map((area) => (
                <motion.div key={area.id} variants={staggerItemVariants(40, 0.5)} className="w-[calc(50%-0.375rem)] lg:w-[calc((100%-2*1.25rem)/3)]">
                  <PracticeAreaCard 
                    area={area} 
                    language={language} 
                  />
                </motion.div>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <div className="relative z-10">
        <CtaSection />
      </div>
    </div>
  );
}
