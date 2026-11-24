import { useEffect, useRef } from "react";
import { animate, cubicBezier } from "animejs";
import { Check } from "lucide-react";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { Content } from "@/content";

const ease = cubicBezier(0.22, 1, 0.36, 1);
const REST = { rotateX: 14, rotateY: -16 };

// Orbita's disk ring from a real scan: 23 GB of NVIDIA cache out of 38 GB to free.
export default function DiskPanel({ t }: { t: Content["disk"] }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.style.transform = `rotateX(${REST.rotateX}deg) rotateY(${REST.rotateY}deg)`;
      stage.style.opacity = "1";
      return;
    }

    // Rises out of the desk and turns toward the reader.
    animate(stage, {
      rotateX: [62, REST.rotateX],
      rotateY: [-4, REST.rotateY],
      rotateZ: [-9, 0],
      translateY: [140, 0],
      opacity: [0, 1],
      duration: 1600,
      ease,
    });

    // Follows the pointer a few degrees, like picking the panel up.
    const hero = stage.closest("section");
    if (!hero) return;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      animate(stage, {
        rotateX: REST.rotateX - y * 10,
        rotateY: REST.rotateY + x * 14,
        duration: 700,
        ease,
      });
    };
    const onLeave = () => animate(stage, { ...REST, duration: 900, ease });
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const data = [
    { label: t.slices[0], value: 23, color: "var(--chart-1)" },
    { label: t.slices[1], value: 15, color: "var(--chart-2)" },
  ];

  return (
    <figure className="[perspective:1400px]">
      <div
        className="rounded-[18px] border hairline bg-card opacity-0 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] [transform-style:preserve-3d]"
        ref={stageRef}
      >
        <div className="flex h-10 items-center justify-between border-b hairline px-4 text-[13px] text-ink-2">
          <span>{t.window}</span>
          <span aria-hidden="true" className="flex gap-4 text-ink-3">
            <span>–</span>
            <span>□</span>
            <span>×</span>
          </span>
        </div>

        <div className="grid items-center gap-6 p-6 sm:grid-cols-[220px_1fr] [transform-style:preserve-3d]">
          <div className="mx-auto [transform:translateZ(48px)]">
            <PieChart cornerRadius={4} data={data} innerRadius={76} padAngle={0.03} size={220}>
              {data.map((d, i) => (
                <PieSlice color={d.color} hoverEffect="grow" index={i} key={d.label} />
              ))}
              <PieCenter defaultLabel={t.total} />
            </PieChart>
          </div>

          <ul className="space-y-2 [transform:translateZ(24px)]">
            {data.map((d) => (
              <li className="flex items-center gap-3 rounded-[10px] bg-raised px-3 py-3" key={d.label}>
                <span className="grid size-5 shrink-0 place-items-center rounded-[5px] bg-amber text-amber-ink">
                  <Check size={14} strokeWidth={2} />
                </span>
                <span className="flex-1 text-sm">{d.label}</span>
                <span className="font-mono text-[13px] text-ink-2 tnum">{d.value} GB</span>
              </li>
            ))}
            <li className="pt-2">
              <span className="flex h-10 w-full items-center justify-center rounded-[10px] bg-ink text-sm font-medium text-deep">
                {t.action}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <figcaption className="mt-6 text-center font-mono text-xs text-ink-3">{t.caption}</figcaption>
    </figure>
  );
}
