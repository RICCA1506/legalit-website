import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, User, Mail } from "lucide-react";
import type { Professional as DbProfessional } from "@shared/schema";
import OptimizedPicture from "./OptimizedPicture";
import ProfessionalModal from "./ProfessionalModal";
import AnimatedElement from "./AnimatedElement";
import RevealText from "./RevealText";
import LandoReveal from "./LandoReveal";
import StaggerContainer, { staggerItemVariants } from "./StaggerContainer";
import { useLanguage } from "@/lib/i18n";

interface ProfessionalData {
  id: number | string;
  name: string;
  title: string;
  specializations?: string[] | null;
  office: string;
  email?: string | null;
  phone?: string | null;
  fullBio?: string | null;
  education?: string[] | null;
  languages?: string[] | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageZoom?: number | null;
}

const getCropStyle = (position?: string | null, zoom?: number | null): React.CSSProperties => {
  const z = zoom || 100;
  let ox = 50, oy = 50;
  if (position && position.includes(",")) {
    const [x, y] = position.split(",").map(Number);
    if (!isNaN(x)) ox = x;
    if (!isNaN(y)) oy = y;
  } else if (position === "top") { oy = 15; }
  else if (position === "bottom") { oy = 85; }
  if (z === 100 && ox === 50 && oy === 50) return { objectPosition: "center top" };
  return { objectPosition: `${ox}% ${oy}%`, transform: `scale(${z / 100})`, transformOrigin: `${ox}% ${oy}%` };
};

function LawyerCard({ lawyer, onClick }: { lawyer: ProfessionalData; onClick: () => void }) {
  const [imageError, setImageError] = useState(false);
  const isLogo = lawyer.imageUrl?.includes('000_LOGO_LEGALIT') || lawyer.imageUrl?.includes('logo_legalit_cropped');
  const showImage = lawyer.imageUrl && !imageError;

  return (
    <motion.div
      variants={staggerItemVariants(40, 0.5)}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden rounded-lg mb-2 md:mb-4 aspect-[3/4] ${isLogo ? 'bg-white' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`}>
        {showImage ? (
          <OptimizedPicture
            src={lawyer.imageUrl!}
            alt={lawyer.name}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${isLogo ? 'object-contain p-8' : 'object-cover'}`}
            style={isLogo ? {} : getCropStyle(lawyer.imagePosition, lawyer.imageZoom)}
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 22vw, 20vw"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
            <p className="text-sm opacity-90 line-clamp-2">{lawyer.title}</p>
            {lawyer.email && (
              <span className="inline-flex items-center gap-1 text-xs mt-2 text-white">
                <Mail className="h-3 w-3" />
                {lawyer.email}
              </span>
            )}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors truncate">{lawyer.name}</h3>
      <p className="text-xs md:text-sm text-muted-foreground truncate">{lawyer.title}</p>
    </motion.div>
  );
}

export default function ProfessionalsPreview() {
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalData | null>(null);
  const { t, language } = useLanguage();

  const { data: dbProfessionals = [], isLoading: professionalsLoading } = useQuery<DbProfessional[]>({
    queryKey: ["/api/professionals"],
  });

  // Use only DB data — never fall back to staticProfessionals because the static
  // list has different IDs than the DB (Vaccaro static id="1" → DB id=3, etc.),
  // which would cause "click Vaccaro → modal opens Fabiana" bugs on the listing page.
  const rawProfessionals: ProfessionalData[] = dbProfessionals;

  const roleOrder = ["Managing Partner", "Partner", "Of Counsel", "Senior Associate", "Associate", "Trainee"];
  const professionals: ProfessionalData[] = [...rawProfessionals].sort((a, b) => {
    const aRole = (a as any).role || (a as any).title || "";
    const bRole = (b as any).role || (b as any).title || "";
    const aRoleIndex = roleOrder.findIndex(r => aRole.toLowerCase().includes(r.toLowerCase()));
    const bRoleIndex = roleOrder.findIndex(r => bRole.toLowerCase().includes(r.toLowerCase()));
    const aRoleOrder = aRoleIndex === -1 ? 999 : aRoleIndex;
    const bRoleOrder = bRoleIndex === -1 ? 999 : bRoleIndex;
    if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
    const aOrder = (a as any).orderIndex ?? (a as any).order_index ?? 999;
    const bOrder = (b as any).orderIndex ?? (b as any).order_index ?? 999;
    return aOrder - bOrder;
  });

  const featuredLawyers = professionals.slice(0, 4);

  return (
    <section className="overflow-hidden pt-[40px] md:pt-[50px] pb-[40px] md:pb-[50px]">
      <div className="w-full px-5 md:px-12 lg:px-16">
        <AnimatedElement className="mb-8 md:mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl lg:text-7xl text-primary mb-4 md:mb-6 text-brutalist">
              <RevealText delay={100} duration={0.6}>{t("professionals.ourTeam")}</RevealText>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-foreground font-medium mb-3 md:mb-4 text-editorial">
              <LandoReveal
                text={t("professionals.specializedLawyers")}
                as="span"
                delay={200}
              />
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("professionals.teamDescription")}
            </p>
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100} className="flex justify-center mb-8">
          <Link href="/professionisti">
            <Button variant="outline" className="rounded-full" data-testid="button-all-lawyers">
              {t("professionals.allProfessionals")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </AnimatedElement>

        {professionalsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3 rounded" />
                <Skeleton className="h-3 w-1/2 mt-1.5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {featuredLawyers.map((lawyer) => (
              <LawyerCard 
                key={lawyer.id} 
                lawyer={lawyer} 
                onClick={() => setSelectedProfessional(lawyer)}
              />
            ))}
          </StaggerContainer>
        )}
      </div>
      <ProfessionalModal
        professional={selectedProfessional}
        isOpen={!!selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
      />
    </section>
  );
}
