import { useTheme } from "@/contexts/ThemeContext";
import LandoReveal from "./LandoReveal";

interface PageHeaderProps {
  title: string;
  description?: string;
}

const themeOverlays: Record<string, { gradient: string; accent: string }> = {
  default: {
    gradient: 'linear-gradient(135deg, rgba(8, 57, 107, 0.85) 0%, rgba(10, 102, 194, 0.75) 50%, rgba(8, 57, 107, 0.9) 100%)',
    accent: '#7eb8e5',
  },
  colosseo: {
    gradient: 'linear-gradient(135deg, rgba(139, 69, 19, 0.85) 0%, rgba(180, 100, 50, 0.75) 50%, rgba(139, 69, 19, 0.9) 100%)',
    accent: '#e8b88a',
  },
  'villa-este': {
    gradient: 'linear-gradient(135deg, rgba(34, 85, 51, 0.85) 0%, rgba(60, 120, 70, 0.75) 50%, rgba(34, 85, 51, 0.9) 100%)',
    accent: '#90c090',
  },
  trevi: {
    gradient: 'linear-gradient(135deg, rgba(0, 100, 100, 0.85) 0%, rgba(32, 140, 140, 0.75) 50%, rgba(0, 100, 100, 0.9) 100%)',
    accent: '#80d4d4',
  },
  borghese: {
    gradient: 'linear-gradient(135deg, rgba(25, 80, 60, 0.85) 0%, rgba(50, 120, 90, 0.75) 50%, rgba(25, 80, 60, 0.9) 100%)',
    accent: '#88c8a8',
  },
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  const { currentTheme } = useTheme();
  const overlay = themeOverlays[currentTheme.id] || themeOverlays.default;
  
  return (
    <div className="relative z-0 pt-24 md:pt-32 pb-10 md:pb-16 text-white overflow-hidden min-h-[220px] md:min-h-[280px]">
      {/* Background image from theme */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${currentTheme.heroImage})`,
        }}
      />
      {/* Theme-specific overlay */}
      <div 
        className="absolute inset-0 bg-[#2e6884cf]"
        style={{ background: '#2e6884e6' }}
      />
      {/* Content */}
      <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
        <span 
          className="text-sm uppercase tracking-[0.2em] mb-4 block font-medium"
          style={{ color: overlay.accent }}
        >
          Legalit
        </span>
        <LandoReveal
          text={title}
          as="h1"
          className="text-3xl md:text-5xl mb-4 text-white drop-shadow-sm text-brutalist"
          delay={100}
        />
        {description && (
          <p className="text-white/85 text-base md:text-lg max-w-2xl text-editorial" data-testid="text-page-title">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
