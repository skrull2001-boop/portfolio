import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { animate, cubicBezier, stagger } from "animejs";

const EASE = [0.22, 1, 0.36, 1] as const;
const ease = cubicBezier(0.22, 1, 0.36, 1);

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Text blocks: a short rise when they come into view, once. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/** Fires once when the element comes past the bottom 15% of the viewport. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/**
 * Visuals: they turn in from the page plane in 3D, like a sheet laid on the
 * bench and lifted up. `from` picks the side it swings from.
 */
export function TurnIn({ children, from = "left", className }: { children: ReactNode; from?: "left" | "right" | "below"; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = inner.current;
    if (!el || !seen) return;
    if (reduced()) {
      el.style.opacity = "1";
      return;
    }
    const side = from === "left" ? -1 : 1;
    const swing: Record<string, number[]> =
      from === "below"
        ? { rotateX: [48, 0], translateY: [80, 0] }
        : { rotateY: [side * 38, 0], translateX: [side * 60, 0] };
    animate(el, { ...swing, translateZ: [-120, 0], opacity: [0, 1], duration: 1300, ease });
  }, [seen, from]);

  return (
    <div className={`[perspective:1600px] ${className ?? ""}`} ref={ref}>
      <div className="opacity-0 [transform-style:preserve-3d]" ref={inner}>
        {children}
      </div>
    </div>
  );
}

/** A grid whose children deal in like cards, one after another. */
export function DealIn({ children, className }: { children: ReactNode; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  useEffect(() => {
    const el = ref.current;
    if (!el || !seen) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (reduced()) {
      items.forEach((i) => (i.style.opacity = "1"));
      return;
    }
    animate(items, {
      rotateX: [-70, 0],
      translateY: [60, 0],
      translateZ: [-80, 0],
      opacity: [0, 1],
      duration: 1100,
      delay: stagger(60),
      ease,
    });
  }, [seen, ref]);
  return (
    <div className={`[perspective:1800px] ${className ?? ""}`} ref={ref}>
      {children}
    </div>
  );
}
