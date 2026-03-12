import gavelImg from "@assets/optimized/l-0x50wh-1200x700z-0.655_1764695926909.webp";
import gavelImgAvif from "@assets/optimized/l-0x50wh-1200x700z-0.655_1764695926909.avif";
import ladyJusticeImg from "@assets/optimized/giurisprudenza_1764696049740.webp";
import ladyJusticeImgAvif from "@assets/optimized/giurisprudenza_1764696049740.avif";
import officeImg from "@assets/optimized/arredamento-studio-legale-1800x1295_1764696078485.webp";
import officeImgAvif from "@assets/optimized/arredamento-studio-legale-1800x1295_1764696078485.avif";
import handshakeImg from "@assets/optimized/vecteezy_handshake-after-good-cooperation-businesswoman-shakin_1764696288738.webp";
import handshakeImgAvif from "@assets/optimized/vecteezy_handshake-after-good-cooperation-businesswoman-shakin_1764696288738.avif";
import signingImg from "@assets/optimized/vecteezy_ai-generated-two-people-sign-a-document-lawyers-lawye_1764696306412.webp";
import signingImgAvif from "@assets/optimized/vecteezy_ai-generated-two-people-sign-a-document-lawyers-lawye_1764696306412.avif";
import AnimatedElement from "./AnimatedElement";
import RevealText from "./RevealText";
import LandoReveal from "./LandoReveal";
import StaggerContainer, { StaggerItem } from "./StaggerContainer";
import { useLanguage } from "@/lib/i18n";

interface ValueItem {
  titleKey: string;
  descKey: string;
  image: string;
  imageAvif: string;
  imagePosition: "left" | "right";
}

const valuesData: ValueItem[] = [
  {
    titleKey: "values.quality",
    descKey: "values.qualityDesc",
    image: gavelImg,
    imageAvif: gavelImgAvif,
    imagePosition: "right",
  },
  {
    titleKey: "values.transparency",
    descKey: "values.transparencyDesc",
    image: ladyJusticeImg,
    imageAvif: ladyJusticeImgAvif,
    imagePosition: "left",
  },
  {
    titleKey: "values.experience",
    descKey: "values.experienceDesc",
    image: officeImg,
    imageAvif: officeImgAvif,
    imagePosition: "right",
  },
  {
    titleKey: "values.availability",
    descKey: "values.availabilityDesc",
    image: handshakeImg,
    imageAvif: handshakeImgAvif,
    imagePosition: "left",
  },
  {
    titleKey: "values.corporateKit",
    descKey: "values.corporateKitDesc",
    image: signingImg,
    imageAvif: signingImgAvif,
    imagePosition: "right",
  },
];

export default function ValuesSection() {
  const { t, language } = useLanguage();

  return (
    <section className="overflow-hidden">
      <AnimatedElement className="text-center py-10 md:py-16 px-5 md:px-6">
        <h2 className="text-3xl md:text-4xl lg:text-6xl text-primary mb-3 md:mb-4 text-brutalist">
          <RevealText delay={100} duration={0.6}>{language === "it" ? "I Nostri Punti di Forza" : "Our Strengths"}</RevealText>
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-editorial">
          <LandoReveal 
            text={language === "it" 
              ? "Eccellenza, integrità e dedizione al servizio del cliente" 
              : "Excellence, integrity and dedication to client service"}
            as="span"
            delay={300}
          />
        </p>
      </AnimatedElement>
      
      {valuesData.map((value) => (
        <StaggerContainer 
          key={value.titleKey}
          staggerDelay={0.15}
          className={`flex flex-col overflow-hidden ${value.imagePosition === 'right' ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
        >
          <StaggerItem 
            className={`flex-1 flex items-center py-8 md:py-10 lg:py-16 px-5 md:px-6 lg:px-16 ${value.imagePosition === 'left' ? 'lg:justify-end' : ''}`}
            y={30}
          >
            <div className={`max-w-xl ${value.imagePosition === 'left' ? 'lg:text-right' : 'text-left'}`}>
              <LandoReveal 
                text={t(value.titleKey)}
                as="h2"
                className="text-xl md:text-2xl lg:text-3xl text-primary mb-4 md:mb-6 text-brutalist"
                delay={100}
              />
              <div className="text-muted-foreground leading-relaxed text-[15px] md:text-base lg:text-lg space-y-3">
                {t(value.descKey).split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </StaggerItem>
          
          <StaggerItem 
            className="flex-1 min-h-[220px] md:min-h-[280px] lg:min-h-[320px] relative overflow-hidden rounded-lg m-3 lg:m-4"
            y={50}
          >
            <picture className="absolute inset-0">
              <source srcSet={value.imageAvif} type="image/avif" />
              <source srcSet={value.image} type="image/webp" />
              <img
                src={value.image}
                alt={t(value.titleKey)}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>
          </StaggerItem>
        </StaggerContainer>
      ))}
    </section>
  );
}
