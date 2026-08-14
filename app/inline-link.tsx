"use client";

import { useRef, useState } from "react";

export function InlineLink({
  href,
  tooltip,
  children,
}: {
  href: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [dx, setDx] = useState(0);

  function onMouseMove(e: React.MouseEvent) {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    setDx(Math.max(-1, Math.min(1, rel)) * 8);
  }

  return (
    <a
      ref={anchorRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={tooltip ? onMouseMove : undefined}
      onMouseLeave={tooltip ? () => setDx(0) : undefined}
      className="group relative font-medium text-foreground underline decoration-muted/50 underline-offset-[3px] transition-colors hover:decoration-foreground"
    >
      {children}
      {tooltip && (
        <span
          role="tooltip"
          style={{ transform: `translateX(calc(-50% + ${dx}px))` }}
          className="pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-md bg-foreground px-3 py-1 font-serif text-[14px] font-normal tracking-tight text-background no-underline opacity-0 shadow-md transition-[transform,opacity] duration-200 ease-out group-hover:opacity-100"
        >
          {tooltip}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </span>
      )}
    </a>
  );
}
