import { Link } from "wouter";
import { Scale, Users, Building2, Mail, FileText } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import AnimatedElement from "./AnimatedElement";
import RevealText from "./RevealText";
import { useLanguage } from "@/lib/i18n";
import italyMapOffices from "@/assets/images/italy-map-offices.png";

const linksData = [
  { 
    href: "/attivita", 
    labelKey: "quicklinks.activities",
    icon: Scale,
    bgImageMobile: "/attached_assets/quicklink-law.jpg",
    bgImageDesktop: "/attached_assets/quicklink-law.jpg"
  },
  { 
    href: "/professionisti", 
    labelKey: "quicklinks.professionals",
    icon: Users,
    bgImageMobile: "/attached_assets/quicklink-professionals.jpg",
    bgImageDesktop: "/attached_assets/quicklink-professionals.jpg"
  },
  { 
    href: "/sedi", 
    labelKey: "quicklinks.locations",
    icon: Building2,
    bgImageMobile: italyMapOffices,
    bgImageDesktop: italyMapOffices
  },
  { 
    href: "/news", 
    labelKey: "quicklinks.news",
    icon: FileText,
    bgImageMobile: "/attached_assets/quicklink-news.jpg",
    bgImageDesktop: "/attached_assets/quicklink-news.jpg"
  },
  { 
    href: "/contatti", 
    labelKey: "quicklinks.contact",
    icon: Mail,
    bgImageMobile: "/attached_assets/quicklink-library.jpg",
    bgImageDesktop: "/attached_assets/quicklink-library.jpg"
  },
];

function QuickLinkCard({ link, label, isMobile }: { link: typeof linksData[0]; label: string; isMobile: boolean }) {
  const bgImage = isMobile ? link.bgImageMobile : link.bgImageDesktop;
  
  return (
    <Link href={link.href}>
      <div
        className="group relative h-72 md:h-96 w-64 md:w-72 cursor-pointer overflow-hidden rounded-xl flex-shrink-0"
        data-testid={`card-quicklink-${link.labelKey}`}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-primary/50 group-hover:bg-primary/65 transition-colors duration-300" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
          <div className="w-18 h-18 md:w-24 md:h-24 rounded-full border-2 border-white/80 flex items-center justify-center mb-4 group-hover:border-white group-hover:scale-110 transition-all duration-300">
            <link.icon className="h-8 w-8 md:h-11 md:w-11 text-white" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-xs md:text-base tracking-widest text-center">
            <RevealText barColor="rgba(255,255,255,0.9)" contrastTextColor="#08396B" delay={200} duration={0.5}>{label}</RevealText>
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default function QuickLinks() {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const positionRef = useRef(-150);
  const animationRef = useRef<number>();
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Carousel animation - faster on mobile
  useEffect(() => {
    const track = trackRef.current;
    const content = contentRef.current;
    if (!track || !content) return;
    
    // Mobile: 1.2 pixels per frame (faster), Desktop: 0.5 pixels per frame
    const speed = isMobile ? 1.2 : 0.5;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (!isPaused) {
        const deltaTime = currentTime - lastTime;
        const pixelsToMove = speed * (deltaTime / 16.67);
        
        positionRef.current -= pixelsToMove;
        
        const contentWidth = content.offsetWidth;
        
        if (Math.abs(positionRef.current) >= contentWidth) {
          positionRef.current = positionRef.current + contentWidth;
        }
        
        track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
      }
      
      lastTime = currentTime;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isMobile]);
  
  return (
    <section className="py-8 md:py-12 overflow-hidden">
      <div className="w-full px-5 md:px-12 lg:px-16">
        <AnimatedElement className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground">
            {t("quicklinks.title")}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto mb-1 md:mb-2">
            {t("quicklinks.desc1")}
          </p>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
            {t("quicklinks.desc2")}
          </p>
        </AnimatedElement>
      </div>

      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          ref={trackRef}
          className="flex w-max"
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          <div ref={contentRef} className="flex gap-3 md:gap-4 pr-3 md:pr-4 flex-shrink-0">
            {linksData.map((link) => (
              <QuickLinkCard key={`set1-${link.href}`} link={link} label={t(link.labelKey)} isMobile={isMobile} />
            ))}
          </div>
          <div className="flex gap-3 md:gap-4 pr-3 md:pr-4 flex-shrink-0" aria-hidden="true">
            {linksData.map((link) => (
              <QuickLinkCard key={`set2-${link.href}`} link={link} label={t(link.labelKey)} isMobile={isMobile} />
            ))}
          </div>
          <div className="flex gap-3 md:gap-4 pr-3 md:pr-4 flex-shrink-0" aria-hidden="true">
            {linksData.map((link) => (
              <QuickLinkCard key={`set3-${link.href}`} link={link} label={t(link.labelKey)} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
