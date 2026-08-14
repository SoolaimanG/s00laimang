"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const LEVEL_CLASSES = [
  "bg-foreground/[0.07]",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

const TICK_MS = 70;

export function ContributionsGrid({
  weeks,
}: {
  weeks: (ContributionDay | null)[][];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(-1); // -1 = not in view yet

  // each week settles after a few scramble ticks, sweeping left to right
  const settleTicks = useMemo(
    () => weeks.map((_, wi) => 6 + Math.floor(wi / 3)),
    [weeks]
  );
  const lastTick = settleTicks[settleTicks.length - 1] ?? 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (reducedMotion) {
          setTick(Number.MAX_SAFE_INTEGER);
          return;
        }
        setTick(0);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tick < 0 || tick > lastTick) return;
    const id = setTimeout(() => setTick((t) => t + 1), TICK_MS);
    return () => clearTimeout(id);
  }, [tick, lastTick]);

  return (
    <div ref={containerRef} className="thin-scrollbar mt-5 w-full overflow-x-auto pb-1">
      <div className="flex w-[530px] shrink-0 gap-[2px]">
        {weeks.map((week, wi) => {
          const settled = tick >= settleTicks[wi];
          return (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => {
                if (!day) return <div key={`pad-${di}`} className="size-2" />;
                const level =
                  tick < 0
                    ? 0
                    : settled
                      ? day.level
                      : Math.floor(Math.random() * 5);
                return (
                  <div
                    key={day.date}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                    className={`size-2 rounded-[2px] transition-colors duration-150 ${LEVEL_CLASSES[level]}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
