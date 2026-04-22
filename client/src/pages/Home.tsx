import Hero from "@/components/Hero";
import QuickLinks from "@/components/QuickLinks";
import ValuesSection from "@/components/ValuesSection";
import OfficesPreview from "@/components/OfficesPreview";
import CtaSection from "@/components/CtaSection";
import ManagingPartnerSection from "@/components/ManagingPartnerSection";
import { useLoadingState } from "@/contexts/LoadingContext";

export default function Home() {
  const { loadingComplete } = useLoadingState();
  return (
    <div className="overflow-hidden">
      <Hero loadingComplete={loadingComplete} />
      <QuickLinks />
      <ValuesSection />
      <ManagingPartnerSection />
      <OfficesPreview />
      <CtaSection />
    </div>
  );
}
