import { Link } from "wouter";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import LandoReveal from "./LandoReveal";
import StaggerContainer, { staggerItemVariants } from "./StaggerContainer";
import { useLanguage } from "@/lib/i18n";

export default function CtaSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-6 md:py-10 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
        <StaggerContainer staggerDelay={0.12} className="text-center max-w-3xl mx-auto">
          <motion.div variants={staggerItemVariants(20, 0.5)}>
            <LandoReveal
              text={`${t("cta.title")} ${t("cta.title2")}`}
              as="h2"
              className="text-xl md:text-4xl lg:text-5xl text-brutalist text-white mb-3 md:mb-6"
              delay={100}
            />
          </motion.div>
          <motion.p variants={staggerItemVariants(20, 0.5)} className="text-[15px] md:text-lg opacity-80 mb-5 md:mb-10">
            {t("cta.description")}
          </motion.p>
          <motion.div variants={staggerItemVariants(20, 0.5)} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/contatti">
              <span
                className="liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-white font-medium tracking-wide cursor-pointer"
                data-testid="button-cta-consultation"
              >
                {t("cta.button")}
              </span>
            </Link>
            <a href="tel:063213911">
              <span
                className="liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-white font-medium tracking-wide cursor-pointer"
                data-testid="button-cta-phone"
              >
                <Phone className="h-4 w-4" />
                06 3213911
              </span>
            </a>
            <a href="https://www.linkedin.com/company/legalit---avvocati-associati" target="_blank" rel="noopener noreferrer">
              <span
                className="liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-white font-medium tracking-wide cursor-pointer"
                data-testid="button-cta-linkedin"
              >
                <SiLinkedin className="h-4 w-4" />
                {t("cta.linkedin")}
              </span>
            </a>
          </motion.div>
        </StaggerContainer>
      </div>
    </section>
  );
}
