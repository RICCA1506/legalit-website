import { useRef, ReactNode } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  viewportAmount?: number;
}

const containerVariants = (staggerDelay: number): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

export const staggerItemVariants = (y: number = 40, duration: number = 0.5): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },
});

export function StaggerItem({
  children,
  className = "",
  y = 40,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
}) {
  return (
    <motion.div
      variants={staggerItemVariants(y, duration)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.12,
  once = true,
  viewportAmount = 0.1,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: viewportAmount });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
