import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { stats } from "@/lib/data";
import StaggerContainer, { staggerItemVariants } from "./StaggerContainer";
import { useLanguage } from "@/lib/i18n";

interface Professional {
  id: number;
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="text-primary">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function calculateClientsServed(): number {
  const baseDate = new Date("2025-01-01");
  const baseValue = 5340;
  const incrementPer4Days = 7;
  
  const now = new Date();
  const diffTime = now.getTime() - baseDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const periods = Math.floor(diffDays / 4);
  
  return baseValue + (periods * incrementPer4Days);
}

export default function StatsCounter() {
  const { language } = useLanguage();
  
  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const clientsServed = calculateClientsServed();

  const dynamicStats = stats.map((stat, index) => {
    if (index === 1) {
      return {
        ...stat,
        label: language === "it" ? "Professionisti" : "Professionals",
        value: professionals.length > 0 ? professionals.length : stat.value,
      };
    }
    if (index === 0) {
      return { ...stat, label: language === "it" ? "Anni di Esperienza" : "Years of Experience" };
    }
    if (index === 2) {
      return { 
        ...stat, 
        label: language === "it" ? "Clienti Assistiti" : "Clients Served",
        value: clientsServed
      };
    }
    if (index === 3) {
      return { ...stat, label: language === "it" ? "Casi Risolti" : "Cases Resolved" };
    }
    return stat;
  });

  return (
    <section className="py-16 text-primary-foreground overflow-hidden bg-accent">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {dynamicStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItemVariants(30, 0.5)}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 text-primary">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm md:text-base text-accent-foreground/80">{stat.label}</div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
