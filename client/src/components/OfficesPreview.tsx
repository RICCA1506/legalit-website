import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import AnimatedElement from "./AnimatedElement";
import RevealText from "./RevealText";
import LandoReveal from "./LandoReveal";
import StaggerContainer, { staggerItemVariants } from "./StaggerContainer";
import { offices } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import romaImage from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.10_1769431461365.webp";
import milanoImage from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.07_1769431461365.webp";
import napoliImage from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.08_1769431461366.webp";
import palermoImage from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.09_1769431461366.webp";
import latinaImage from "@assets/optimized/piazza-del-popolo_1769377725579.webp";
import romaImageAvif from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.10_1769431461365.avif";
import milanoImageAvif from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.07_1769431461365.avif";
import napoliImageAvif from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.08_1769431461366.avif";
import palermoImageAvif from "@assets/optimized/WhatsApp_Image_2026-01-26_at_11.49.09_1769431461366.avif";
import latinaImageAvif from "@assets/optimized/piazza-del-popolo_1769377725579.avif";

const cityImages: Record<string, { webp: string; avif: string }> = {
  roma: { webp: romaImage, avif: romaImageAvif },
  milano: { webp: milanoImage, avif: milanoImageAvif },
  palermo: { webp: palermoImage, avif: palermoImageAvif },
  napoli: { webp: napoliImage, avif: napoliImageAvif },
  latina: { webp: latinaImage, avif: latinaImageAvif },
};

export default function OfficesPreview() {
  const { language } = useLanguage();
  
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="w-full px-5 md:px-12 lg:px-16">
        <AnimatedElement className="mb-8 md:mb-16">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-5xl lg:text-7xl text-primary mb-4 md:mb-6 text-brutalist">
              <RevealText delay={100} duration={0.6}>{language === "it" ? "Le Nostre Sedi" : "Our Offices"}</RevealText>
            </h2>
            <p className="text-lg md:text-xl text-foreground font-medium mb-2 md:mb-3 text-editorial">
              <LandoReveal
                text={language === "it" 
                  ? "Una presenza capillare sul territorio nazionale"
                  : "A widespread presence across the national territory"}
                as="span"
                delay={200}
              />
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {language === "it" 
                ? "Presenti nelle principali città italiane per essere sempre vicini ai nostri clienti"
                : "Located in major Italian cities to always be close to our clients"}
            </p>
          </div>
        </AnimatedElement>
        
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          {offices.map((office) => {
            const isLatina = office.id === "latina";
            return (
            <motion.div key={office.id} variants={staggerItemVariants(40, 0.5)}>
              <Card className="overflow-hidden group hover-elevate border-0 bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <picture>
                    <source srcSet={(cityImages[office.id] || cityImages.roma).avif} type="image/avif" />
                    <source srcSet={(cityImages[office.id] || cityImages.roma).webp} type="image/webp" />
                    <img
                      src={(cityImages[office.id] || cityImages.roma).webp}
                      alt={office.city}
                      loading="eager"
                      decoding="async"
                      className={`w-full h-full object-cover transition-all duration-500 ${isLatina ? 'grayscale' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`}
                    />
                  </picture>
                </div>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="hidden md:inline">Legalit</span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">{office.city.toUpperCase()}</h3>
                  <Link href={`/sedi#${office.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full rounded-full text-xs md:text-sm"
                      data-testid={`button-office-${office.id}`}
                    >
                      {language === "it" ? "Scopri di più" : "Learn more"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
