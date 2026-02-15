import Hero from "@/components/Hero";
import QuickLinks from "@/components/QuickLinks";
import ValuesSection from "@/components/ValuesSection";
import ProfessionalsPreview from "@/components/ProfessionalsPreview";
import OfficesPreview from "@/components/OfficesPreview";
import CtaSection from "@/components/CtaSection";
import { useLoadingState } from "@/contexts/LoadingContext";

export default function Home() {
  const { loadingComplete } = useLoadingState();
  return (
    <div className="overflow-hidden">
      <Hero loadingComplete={loadingComplete} />
      <QuickLinks />
      <ValuesSection />
      <ProfessionalsPreview />
      <OfficesPreview />
      <CtaSection />
    </div>
  );
}
