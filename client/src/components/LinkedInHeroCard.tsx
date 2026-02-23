import { SiLinkedin } from "react-icons/si";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { legalitLogo } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import AnimatedElement from "@/components/AnimatedElement";

const LINKEDIN_URL = "https://www.linkedin.com/company/legalit---avvocati-associati/";

export default function LinkedInHeroCard() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  return (
    <>
      <div className="hidden lg:flex justify-center items-end gap-3 pb-[30px]">
        <AnimatedElement delay={300} once={true} variant="default" className="w-[300px] relative">
          <div
            className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl overflow-visible hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => window.open(LINKEDIN_URL, "_blank")}
            data-testid="link-linkedin-card-main"
          >
            <div className="pt-4 px-4 pb-3">
              <div className="mb-3">
                <img src={legalitLogo} alt="Legalit" className="h-12 w-auto object-contain mix-blend-multiply" loading="lazy" decoding="async" />
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">Legalit - Società tra Avvocati</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {language === "it" ? "I tuoi diritti, il nostro impegno!" : "Your rights, our commitment!"}
              </p>
              <div className="text-gray-400 text-xs mt-2 flex flex-wrap items-center gap-1">
                <span>Law Practice</span>
                <span>·</span>
                <span>Roma, Lazio</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  className="bg-[#0A66C2] text-white border-[#0A66C2] rounded-full font-semibold text-xs px-5 shadow-md shadow-[#0A66C2]/30 btn-bounce"
                  size="sm"
                  data-testid="button-linkedin-follow"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(LINKEDIN_URL, "_blank");
                  }}
                >
                  + Follow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0A66C2]/30 text-[#0A66C2] rounded-full font-medium text-xs px-4 btn-bounce"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/contatti");
                  }}
                  data-testid="button-linkedin-message"
                >
                  Message
                </Button>
              </div>
              <div className="flex gap-4 mt-3 pt-2 border-t border-gray-100 text-xs">
                <span className="text-[#0A66C2] font-medium border-b-2 border-[#0A66C2] pb-1">Home</span>
                <span className="text-gray-500">About</span>
                <span className="text-gray-500">Posts</span>
                <span className="text-gray-500">Jobs</span>
              </div>
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={500} once={true} variant="default" className="w-[270px] relative mt-[40px]">
          <a
            href={`${LINKEDIN_URL}about/`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            data-testid="link-linkedin-card-overview"
          >
            <div className="bg-white/95 backdrop-blur-md shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 transform hover:-translate-y-1 rounded-lg">
              <div className="px-4 py-3 relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#0A66C2] rounded-md flex items-center justify-center shadow-sm">
                    <SiLinkedin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Overview</h3>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed mb-2">
                  {language === "it"
                    ? "Studio Legale con sedi in Roma, Milano, Palermo e Latina."
                    : "Law Firm with offices in Rome, Milan, Palermo and Latina."}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400">
                    {language === "it" ? "4 sedi in Italia" : "4 offices in Italy"}
                  </span>
                  <span className="text-[10px] text-[#0A66C2] font-medium flex items-center gap-1">
                    {language === "it" ? "Scopri di più" : "Learn more"}
                    <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </AnimatedElement>
      </div>

      <a
        href="linkedin://company/legalit---avvocati-associati"
        onClick={() => {
          setTimeout(() => {
            window.location.href = LINKEDIN_URL;
          }, 500);
        }}
        className="lg:hidden w-full block mt-4"
        data-testid="link-linkedin-mobile-strip"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors overflow-hidden">
          <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center flex-shrink-0">
            <SiLinkedin className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate">Legalit - Società tra Avvocati</p>
            <p className="text-white/70 text-xs truncate">Law Practice · Roma, Lazio</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-[#0A66C2] text-white px-3 py-1 rounded-full font-medium whitespace-nowrap">
              Follow
            </span>
            <ArrowRight className="h-4 w-4 text-white/70 flex-shrink-0" />
          </div>
        </div>
      </a>
    </>
  );
}
