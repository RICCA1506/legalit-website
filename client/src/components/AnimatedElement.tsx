import { useEffect, useRef, useState, ReactNode, CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant = "default" | "left" | "right" | "scale" | "fade";

interface AnimatedElementProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  as?: keyof JSX.IntrinsicElements;
  style?: CSSProperties;
}

export default function AnimatedElement({
  children,
  className = "",
  variant = "default",
  delay = 0,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  once = true,
  as: Component = "div",
  style,
  ...rest
}: AnimatedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (hasAnimated.current && once) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          hasAnimated.current = true;
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  const baseClass = variant === "default" 
    ? "animated-element" 
    : `animated-element-${variant}`;
  
  const stateClass = isVisible ? "is-visible" : "";

  const delayClass = delay > 0 ? `animation-delay-${Math.min(delay, 800)}` : "";

  const ElementTag = Component as any;

  return (
    <ElementTag
      ref={ref}
      className={cn(baseClass, stateClass, delayClass, className)}
      style={style}
      {...rest}
    >
      {children}
    </ElementTag>
  );
}

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function AnimatedContainer({
  children,
  className = "",
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  once = true,
}: AnimatedContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (hasAnimated.current && once) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          hasAnimated.current = true;
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return (
    <div ref={ref} className={cn(className, isVisible ? "is-visible animate-children" : "")}>
      {children}
    </div>
  );
}
