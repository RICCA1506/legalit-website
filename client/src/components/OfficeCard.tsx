import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, ExternalLink, Printer } from "lucide-react";
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

interface OfficeCardProps {
  id?: string;
  city: string;
  address: string;
  cap?: string;
  phone: string;
  fax?: string;
  email: string;
  mapUrl?: string;
  googleMapsLink?: string;
}

export default function OfficeCard({ id, city, address, cap, phone, fax, email, mapUrl, googleMapsLink }: OfficeCardProps) {
  const { t } = useLanguage();
  const officeId = id || city.toLowerCase();
  const cityImageData = cityImages[officeId];
  const mapsLink = googleMapsLink || `https://www.google.com/maps/search/${encodeURIComponent(address + " " + city)}`;
  
  return (
    <Card className="overflow-hidden border-0 bg-card" data-testid={`card-office-${city.toLowerCase()}`}>
      {cityImageData && (
        <a 
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-video w-full overflow-hidden group block cursor-pointer"
        >
          <picture>
            <source srcSet={cityImageData.avif} type="image/avif" />
            <source srcSet={cityImageData.webp} type="image/webp" />
            <img
              src={cityImageData.webp}
              alt={city}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
            />
          </picture>
        </a>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          {city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3 text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{address} - {cap}</span>
        </div>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Phone className="h-4 w-4 flex-shrink-0" />
          {phone}
        </a>
        {fax && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Printer className="h-4 w-4 flex-shrink-0" />
            {fax}
          </div>
        )}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          {email}
        </a>
        <Button variant="outline" className="w-full mt-4 rounded-full" asChild>
          <a
            href={googleMapsLink || `https://www.google.com/maps/search/${encodeURIComponent(address + " " + city)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("sedi.directions")}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
