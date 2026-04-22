import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedPicture from "./OptimizedPicture";
import AnimatedElement from "./AnimatedElement";
import RevealText from "./RevealText";
import { useLanguage } from "@/lib/i18n";
import { professionalUrl } from "@shared/slugify";
import { professionals as staticProfessionals } from "@/lib/data";
import type { Professional as DbProfessional } from "@shared/schema";

const FALLBACK = {
  name: "Avv. Francesco Vaccaro",
  title: "Managing Partner",
  slug: "avv-francesco-vaccaro",
  imageUrl: "/attached_assets/avv-francesco-vaccaro.jpg",
};

export default function ManagingPartnerSection() {
  const { language } = useLanguage();

  const { data: dbProfessionals = [] } = useQuery<DbProfessional[]>({
    queryKey: ["/api/professionals"],
  });

  const found =
    dbProfessionals.find((p) => p.title === "Managing Partner") ||
    dbProfessionals.find((p) => p.name?.toLowerCase().includes("vaccaro"));

  const staticVaccaro = staticProfessionals.find((p) => p.name.includes("Vaccaro"));

  const partner = {
    name: found?.name ?? staticVaccaro?.name ?? FALLBACK.name,
    title: found?.title ?? FALLBACK.title,
    imageUrl: found?.imageUrl ?? staticVaccaro?.imageUrl ?? FALLBACK.imageUrl,
    imagePosition: found?.imagePosition ?? null,
    imageZoom: found?.imageZoom ?? null,
    slug: found?.slug ?? FALLBACK.slug,
  };

  const href = professionalUrl(partner);

  const cropStyle = (() => {
    const z = partner.imageZoom || 100;
    let ox = 50,
      oy = 30;
    if (partner.imagePosition && partner.imagePosition.includes(",")) {
      const [x, y] = partner.imagePosition.split(",").map(Number);
      if (!isNaN(x)) ox = x;
      if (!isNaN(y)) oy = y;
    }
    return {
      objectPosition: `${ox}% ${oy}%`,
      transform: z !== 100 ? `scale(${z / 100})` : undefined,
      transformOrigin: `${ox}% ${oy}%`,
    } as React.CSSProperties;
  })();

  const eyebrow = language === "it" ? "Managing Partner" : "Managing Partner";
  const heading =
    language === "it"
      ? "Una guida con visione, esperienza e impegno."
      : "Leadership rooted in vision, experience and commitment.";
  const description =
    language === "it"
      ? "Avvocato Cassazionista e fondatore dello Studio, guida il team con un approccio orientato alla prevenzione del rischio e alla tutela del cliente. Esperto di diritto penale dell'impresa, compliance 231 e governance."
      : "Cassation lawyer and founder of the firm, he leads the team with a focus on risk prevention and client protection. Expert in business criminal law, 231 compliance and governance.";
  const ctaLabel = language === "it" ? "Scopri il profilo completo" : "Discover the full profile";

  return (
    <section
      className="overflow-hidden py-12 md:py-20 px-5 md:px-12 lg:px-16"
      data-testid="section-managing-partner"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <AnimatedElement className="lg:col-span-5">
            <Link href={href} data-testid="link-managing-partner-image">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 cursor-pointer group">
                <OptimizedPicture
                  src={partner.imageUrl!}
                  alt={partner.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={cropStyle}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-primary-foreground">
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    {eyebrow}
                  </p>
                  <p className="text-lg md:text-xl font-semibold leading-tight">
                    {partner.name}
                  </p>
                </div>
              </div>
            </Link>
          </AnimatedElement>

          <AnimatedElement delay={150} className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-3">
              {eyebrow}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-primary mb-4 md:mb-6 text-brutalist leading-tight">
              <RevealText delay={100} duration={0.6}>
                {heading}
              </RevealText>
            </h2>
            <div className="relative pl-4 md:pl-5 border-l-2 border-primary/30 mb-6">
              <Quote className="h-4 w-4 text-primary/40 absolute -left-2 -top-1 bg-background" />
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <Link href={href} data-testid="link-managing-partner-cta">
              <Button variant="default" className="rounded-full">
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}
