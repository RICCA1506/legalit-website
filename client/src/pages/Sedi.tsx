import { motion } from "framer-motion";
import OfficeCard from "@/components/OfficeCard";
import CtaSection from "@/components/CtaSection";
import AnimatedElement from "@/components/AnimatedElement";
import LandoReveal from "@/components/LandoReveal";
import StaggerContainer, { staggerItemVariants } from "@/components/StaggerContainer";
import { offices } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/contexts/ThemeContext";

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

export default function Sedi() {
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const overlay = themeOverlays[currentTheme.id] || themeOverlays.default;
  
  return (
    <div className="relative">
      <div className="relative z-0 pt-24 pb-10 md:pb-16 text-white overflow-hidden min-h-[min(40vh,400px)]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentTheme.heroImage})` }}
        />
        <div 
          className="absolute inset-0"
          style={{ background: '#2e6884e6' }}
        />
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 md:gap-8">
            <div className="flex-1 max-w-xl">
              <AnimatedElement once={true}>
                <LandoReveal
                  text={t("sedi.title")}
                  as="h1"
                  className="text-2xl md:text-4xl lg:text-5xl mb-3 md:mb-4 text-left text-brutalist text-white"
                  delay={100}
                />
              </AnimatedElement>
              <AnimatedElement delay={200} once={true}>
                <p className="text-white/80 mb-3 md:mb-4 text-left text-[15px] md:text-lg">
                  {t("sedi.description")}
                </p>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </div>
      
      <section className="py-10 md:py-16 relative z-10 overflow-hidden">
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
            {offices.map((office) => (
              <motion.div
                key={office.id}
                variants={staggerItemVariants(40, 0.5)}
              >
                <OfficeCard {...office} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="relative z-10">
        <CtaSection />
      </div>
    </div>
  );
}
