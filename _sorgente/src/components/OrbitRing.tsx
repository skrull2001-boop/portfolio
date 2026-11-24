import { useEffect, useRef, useState } from "react";
import { animate, cubicBezier, createTimer } from "animejs";

export interface OrbitItem {
  title: string;
  tag: string;
  image: string;
  href: string;
  live?: boolean;
}

const ease = cubicBezier(0.22, 1, 0.36, 1);

/**
 * The things I built, on a slow 3D orbit. Hover holds it, drag spins it,
 * clicking a screen opens that project.
 */
export default function OrbitRing({ items }: { items: OrbitItem[] }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const [front, setFront] = useState(0);
  const step = 360 / items.length;

  useEffect(() => {
    const ring = ringRef.current;
    const stage = stageRef.current;
    if (!ring || !stage) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      ring.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${angle.current}deg)`;
      const idx = ((Math.round(-angle.current / step) % items.length) + items.length) % items.length;
      setFront(idx);
    };
    apply();

    // Entrance: the ring swings up from flat and lands facing the reader.
    if (!still) {
      animate(stage, { rotateX: [70, -8], opacity: [0, 1], translateY: [120, 0], duration: 1800, ease });
    } else {
      stage.style.opacity = "1";
    }

    let held = false;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let velocity = 0;

    const timer = createTimer({
      onUpdate: (self) => {
        if (still || dragging) return;
        const dt = Math.min(self.deltaTime, 50) / 1000;
        // Coast after a drag, then fall back to the slow orbit.
        velocity *= 0.94;
        const drift = held ? 0 : -6;
        angle.current += (drift + velocity) * dt;
        apply();
      },
    });

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      angle.current += dx * 0.25;
      velocity = dx * 12;
      apply();
    };
    const onUp = () => {
      dragging = false;
    };
    // A drag should not open the screen it ended on.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) e.preventDefault();
    };
    const onEnter = () => (held = true);
    const onLeave = () => {
      held = false;
      dragging = false;
    };

    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      timer.pause();
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [items.length, step]);

  const current = items[front];

  return (
    <div className="relative">
      <div
        className="relative mx-auto h-[300px] cursor-grab touch-pan-y select-none [--r:230px] [perspective:1400px] active:cursor-grabbing sm:h-[380px] sm:[--r:380px]"
        style={{ perspectiveOrigin: "50% 20%" }}
      >
        <div className="absolute inset-0 opacity-0 [transform-style:preserve-3d]" ref={stageRef}>
          {/* The orbit itself: a thin ring the screens ride on. */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[calc(var(--r)*2.2)] rounded-full border border-accent/30"
            style={{ transform: "translate(-50%,-50%) translateY(130px) rotateX(90deg)" }}
          />
          <div className="absolute inset-0 [transform-style:preserve-3d]" ref={ringRef}>
            {items.map((it, i) => (
              <a
                className="absolute top-1/2 left-1/2 block w-[210px] overflow-hidden rounded-[12px] border border-white/10 bg-card shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] [backface-visibility:hidden] sm:w-[340px]"
                draggable={false}
                href={it.href}
                key={it.title}
                style={{ transform: `translate(-50%,-50%) rotateY(${i * step}deg) translateZ(var(--r))` }}
              >
                <img alt={it.title} className="pointer-events-none block aspect-[16/10] w-full object-cover object-top" draggable={false} src={it.image} />
                <span className="flex items-center justify-between border-t border-white/10 bg-deep px-3 py-2 font-mono text-[11px] text-ink-2">
                  <span className="text-ink">{it.title}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${it.live ? "bg-ok" : "bg-ink-3"}`} />
                    {it.tag}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <p aria-live="polite" className="mt-4 text-center font-mono text-xs text-ink-3">
        <span className="text-accent">{String(front + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")} · {current.title}
      </p>
    </div>
  );
}
