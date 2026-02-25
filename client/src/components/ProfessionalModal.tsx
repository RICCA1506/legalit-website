import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, Phone, MapPin, User, GraduationCap, Globe, Briefcase, Linkedin, 
  ChevronDown, Newspaper, Layers, ExternalLink, Calendar, Scale, Gavel, HardHat, Building2, Download
} from "lucide-react";
import { Link } from "wouter";
import OptimizedPicture from "./OptimizedPicture";
import { practiceAreasEnhanced, getAreaIdForLink, getPracticeAreaBySpecId } from "@/lib/practiceAreasData";
import { useLanguage } from "@/lib/i18n";

const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/')) return imageUrl;
  if (imageUrl.includes('_176')) {
    return `/attached_assets/${imageUrl}`;
  }
  return imageUrl;
};

function ProfessionalImage({ imageUrl, name, imagePosition, imageZoom }: { imageUrl: string | null | undefined; name: string; imagePosition?: string | null; imageZoom?: number | null }) {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = getImageUrl(imageUrl);
  const showImage = resolvedUrl && !imageError;

  if (!showImage) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <User className="h-16 w-16 text-white/30" />
      </div>
    );
  }

  return (
    <OptimizedPicture
      src={resolvedUrl}
      alt={name}
      className={`w-full h-full ${isLogoPlaceholder(imageUrl) ? 'object-contain p-4' : 'object-cover'}`}
      style={{ 
        objectPosition: isLogoPlaceholder(imageUrl) ? 'center' : getImagePosition(imageUrl, imagePosition),
        transform: !isLogoPlaceholder(imageUrl) && imageZoom && imageZoom !== 100 ? `scale(${imageZoom / 100})` : undefined,
        transformOrigin: !isLogoPlaceholder(imageUrl) ? getTransformOrigin(imagePosition) : undefined
      }}
      sizes="(max-width: 768px) 90vw, 400px"
      onError={() => setImageError(true)}
    />
  );
}

const parseCropPosition = (imagePosition?: string | null): { objectPosition: string; transformOrigin: string } | null => {
  if (!imagePosition || !imagePosition.includes(",")) return null;
  const [x, y] = imagePosition.split(",").map(Number);
  if (isNaN(x) || isNaN(y)) return null;
  return { objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%` };
};

const getImagePosition = (imageUrl: string | null | undefined, imagePosition?: string | null): string => {
  const crop = parseCropPosition(imagePosition);
  if (crop) return crop.objectPosition;
  if (imagePosition && imagePosition !== "center") return `center ${imagePosition}`;
  if (!imageUrl) return "center top";
  if (imageUrl.includes('b1de960e-f2c8-4506')) {
    return "center top";
  }
  return "center top";
};

const getTransformOrigin = (imagePosition?: string | null): string | undefined => {
  const crop = parseCropPosition(imagePosition);
  return crop ? crop.transformOrigin : undefined;
};

const isLogoPlaceholder = (imageUrl: string | null | undefined): boolean => {
  if (!imageUrl) return false;
  return imageUrl.includes('000_LOGO_LEGALIT') || imageUrl.includes('logo_legalit_cropped');
};

interface Professional {
  id: number | string;
  name: string;
  title: string;
  role?: string | null;
  specializations?: string[] | null;
  office: string;
  email?: string | null;
  pec?: string | null;
  phone?: string | null;
  fullBio?: string | null;
  education?: string[] | null;
  languages?: string[] | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageZoom?: number | null;
  linkedin?: string | null;
}

const generateVCard = (professional: Professional): string => {
  const nameParts = professional.name.replace(/^(Avv\.|Prof\.|Dott\.)\s*/i, '').split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');
  
  let vcard = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${professional.name}
TITLE:${professional.title || professional.role || ''}
ORG:LEGALIT - Società tra Avvocati Srl`;

  if (professional.email) {
    vcard += `\nEMAIL;TYPE=WORK:${professional.email}`;
  }
  if (professional.pec) {
    vcard += `\nEMAIL;TYPE=PEC:${professional.pec}`;
  }
  if (professional.phone) {
    vcard += `\nTEL;TYPE=WORK:${professional.phone}`;
  }
  if (professional.office) {
    vcard += `\nADR;TYPE=WORK:;;${professional.office};;;IT`;
  }
  
  vcard += `\nEND:VCARD`;
  return vcard;
};

const downloadVCard = (professional: Professional) => {
  const vcard = generateVCard(professional);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = professional.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `${safeName}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface RelatedNews {
  id: number;
  title: string;
  createdAt: string | null;
}

interface ProfessionalModalProps {
  professional: Professional | null;
  isOpen: boolean;
  onClose: () => void;
  relatedNews?: RelatedNews[];
}

const getAreaIcon = (areaId: string) => {
  switch (areaId) {
    case "diritto-lavoro":
      return <HardHat className="h-3.5 w-3.5" />;
    case "diritto-penale":
    case "corporate-compliance":
      return <Gavel className="h-3.5 w-3.5" />;
    case "diritto-civile-commerciale":
    case "diritto-societario-ma":
      return <Scale className="h-3.5 w-3.5" />;
    case "diritto-amministrativo":
    case "responsabilita-contabile":
      return <Building2 className="h-3.5 w-3.5" />;
    default:
      return <Briefcase className="h-3.5 w-3.5" />;
  }
};

export default function ProfessionalModal({ professional, isOpen, onClose, relatedNews = [] }: ProfessionalModalProps) {
  const { t, language, autoT } = useLanguage();
  const [isSpecializationOpen, setIsSpecializationOpen] = useState(true);

  if (!professional) return null;

  const getRelatedPracticeAreas = () => {
    if (!professional.specializations || professional.specializations.length === 0) return [];
    return professional.specializations
      .map(specId => getPracticeAreaBySpecId(specId))
      .filter((area): area is NonNullable<typeof area> => area !== undefined);
  };

  const relatedAreas = getRelatedPracticeAreas();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="max-w-[92vw] md:max-w-5xl lg:max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden border-0 [&>button]:text-white [&>button]:z-[10]" onOpenAutoFocus={(e) => e.preventDefault()} data-testid="modal-professional">
        <VisuallyHidden>
          <DialogTitle>{professional.name}</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          className="flex flex-col h-full max-h-[90vh] overflow-y-auto"
          data-lenis-prevent
        >
          <div className="p-4 md:p-8 border-b bg-primary flex-shrink-0">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className={`w-28 h-36 md:w-40 md:h-52 rounded-lg overflow-hidden flex-shrink-0 shadow-lg ${isLogoPlaceholder(professional.imageUrl) ? 'bg-white' : 'bg-white/10'}`}
              >
                <ProfessionalImage imageUrl={professional.imageUrl} name={professional.name} imagePosition={professional.imagePosition} imageZoom={professional.imageZoom} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex-1"
              >
                <Badge className="bg-white/20 text-white border-white/30 mb-2 text-xs">
                  {autoT(professional.title)}
                </Badge>
                <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-white text-center md:text-left">{professional.name}</h2>
                
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-white/70 text-xs md:text-sm mb-3 md:mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    {professional.office}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                  <a href={`mailto:${professional.email}`}>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full text-xs md:text-sm px-2 md:px-3 h-7 md:h-8">
                      <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="text-white font-medium hidden md:inline">{professional.email}</span>
                      <span className="text-white font-medium md:hidden">Email</span>
                    </Button>
                  </a>
                  {professional.phone && (
                    <a href={`tel:${professional.phone.replace(/\s/g, '')}`}>
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full text-xs md:text-sm px-2 md:px-3 h-7 md:h-8">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        {language === "it" ? "Chiama" : "Call"}
                      </Button>
                    </a>
                  )}
                  {professional.linkedin && (
                    <a href={professional.linkedin} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white rounded-full text-xs md:text-sm px-2 md:px-3 h-7 md:h-8">
                        <Linkedin className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => downloadVCard(professional)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full text-xs md:text-sm px-2 md:px-3 h-7 md:h-8"
                    data-testid="button-download-vcard"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    vCard
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <div className="p-4 md:p-8 pb-8 md:pb-12 space-y-5 md:space-y-6">
              {professional.specializations && professional.specializations.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <button
                    onClick={() => setIsSpecializationOpen(!isSpecializationOpen)}
                    className="w-full flex items-center justify-between text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-2 -m-2 hover:bg-muted/50 transition-colors"
                    aria-expanded={isSpecializationOpen}
                    aria-controls="specialization-content"
                    data-testid="accordion-specialization"
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {language === "it" ? "Aree di attività" : "Practice Areas"}
                    </span>
                    <motion.div
                      animate={{ rotate: isSpecializationOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isSpecializationOpen && (
                      <motion.div
                        id="specialization-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 text-muted-foreground">
                          <div className="flex flex-wrap gap-2">
                            {professional.specializations.map((specId) => {
                              const area = getPracticeAreaBySpecId(specId);
                              const areaTitle = area ? (language === "it" ? area.titleIT : area.titleEN) : specId;
                              const linkId = getAreaIdForLink(specId);
                              return (
                                <Link key={specId} href={`/attivita/${linkId}`} onClick={onClose}>
                                  <Badge 
                                    variant="secondary" 
                                    className="rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5"
                                  >
                                    {getAreaIcon(specId)}
                                    {areaTitle}
                                  </Badge>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              )}

              {professional.specializations && professional.specializations.length > 0 && <Separator />}

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {language === "it" ? "Profilo" : "Profile"}
                </h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line pr-2">
                  {professional.fullBio ? autoT(professional.fullBio) : ""}
                </div>
              </motion.section>
              
              <Separator />
              
              {professional.education && professional.education.length > 0 && (
                <>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {language === "it" ? "Formazione" : "Education"}
                    </h3>
                    <ul className="space-y-2">
                      {professional.education.map((edu, index) => (
                        <li key={index} className="text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {autoT(edu)}
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                  <Separator />
                </>
              )}
              
              {professional.languages && professional.languages.length > 0 && (
                <>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {language === "it" ? "Lingue" : "Languages"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {professional.languages.map((lang, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </motion.section>
                  <Separator />
                </>
              )}
              
              {relatedAreas.length > 0 && (
                <>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      {language === "it" ? "Aree di Attività Correlate" : "Related Practice Areas"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {relatedAreas.map((area, index) => {
                        const areaTitle = language === "it" ? area.titleIT : area.titleEN;
                        const getIcon = () => {
                          if (area.id === "diritto-lavoro") return HardHat;
                          if (area.id === "diritto-penale" || area.id === "corporate-compliance") return Gavel;
                          if (area.id === "diritto-civile-commerciale" || area.id === "diritto-societario-ma") return Scale;
                          return Building2;
                        };
                        const AreaIcon = getIcon();
                        return (
                          <Link key={index} href={`/attivita/${area.id}`} onClick={onClose}>
                            <div 
                              className="group relative h-28 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-primary"
                              data-testid={`card-area-${area.id}`}
                            >
                              {area.image && (
                                <img 
                                  src={area.image} 
                                  alt={areaTitle}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                              <div className="absolute top-2 left-2">
                                <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <AreaIcon className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <h4 className="text-sm font-semibold text-white drop-shadow-lg line-clamp-2">
                                  {areaTitle}
                                </h4>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.section>
                  <Separator />
                </>
              )}
              
              {relatedNews.length > 0 && (
                <>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-primary" />
                      {language === "it" ? "News Correlate" : "Related News"}
                    </h3>
                    <ul className="space-y-3">
                      {relatedNews.slice(0, 5).map((news) => (
                        <li key={news.id}>
                          <Link 
                            href={`/news?article=${news.id}`}
                            className="group flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={onClose}
                            data-testid={`link-news-${news.id}`}
                          >
                            <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1">
                              <span className="group-hover:underline">{news.title}</span>
                              {news.createdAt && (
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(news.createdAt).toLocaleDateString("it-IT", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                  <Separator />
                </>
              )}
              
              {relatedNews.length === 0 && (
                <>
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-primary" />
                      {language === "it" ? "News Correlate" : "Related News"}
                    </h3>
                    <p className="text-muted-foreground text-sm italic">
                      {language === "it" ? "Nessuna news correlata al momento." : "No related news at this time."}
                    </p>
                  </motion.section>
                  <Separator />
                </>
              )}
              
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {language === "it" ? "Contatti" : "Contacts"}
                </h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${professional.email}`}
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    {professional.email}
                  </a>
                  {professional.pec && (
                    <a
                      href={`mailto:${professional.pec}`}
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      {professional.pec}
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">PEC</span>
                    </a>
                  )}
                  {professional.phone && (
                    <a
                      href={`tel:${professional.phone.replace(/\s/g, '')}`}
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      {professional.phone}
                    </a>
                  )}
                  {professional.linkedin && (
                    <a
                      href={professional.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A66C2] hover:text-[#0A66C2]/80 transition-colors flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  <div className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {language === "it" ? `Sede di ${professional.office}` : `${professional.office} Office`}
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
