"use client";

import Image from "next/image";
import { useState } from "react";

type IconSpec = { src: string; invertDark?: boolean };

type Skill = {
  name: string;
  category: string;
  badge?: string;
  icon?: IconSpec;
  stack?: IconSpec[];
};

const SKILLS: Skill[] = [
  {
    name: "TypeScript & JavaScript",
    stack: [
      { src: "/skills/typescript.svg" },
      { src: "/skills/javascript.svg" },
    ],
    category: "Language",
  },
  {
    name: "Next.js",
    icon: { src: "/skills/nextjs.svg", invertDark: true },
    category: "Full-stack",
    badge: "Daily driver",
  },
  {
    name: "React & React Native",
    icon: { src: "/skills/react.svg" },
    category: "Frontend & Mobile",
  },
  { name: "Node.js", icon: { src: "/skills/nodejs.svg" }, category: "Backend" },
  {
    name: "Databases",
    stack: [
      { src: "/skills/postgresql.svg" },
      { src: "/skills/mongodb.svg" },
      { src: "/skills/redis.svg" },
    ],
    category: "Database",
  },
  {
    name: "BaaS",
    stack: [
      { src: "/skills/convex.svg" },
      { src: "/skills/supabase.svg" },
      { src: "/skills/firebase.svg" },
    ],
    category: "Backend",
  },
  {
    name: "Python & Django",
    stack: [
      { src: "/skills/python.svg" },
      { src: "/skills/django.svg", invertDark: true },
    ],
    category: "Backend",
  },
  {
    name: "ORMs",
    stack: [
      { src: "/skills/drizzle.svg" },
      { src: "/skills/prisma.svg", invertDark: true },
    ],
    category: "Database",
  },
  {
    name: "State",
    stack: [
      { src: "/skills/redux.svg" },
      { src: "/skills/zustand.png" },
    ],
    category: "Frontend",
  },
  {
    name: "WebSockets & LiveKit",
    stack: [
      { src: "/skills/socketdotio.svg", invertDark: true },
      { src: "/skills/livekit.svg", invertDark: true },
    ],
    category: "Realtime",
  },
  {
    name: "Vite & TanStack Start",
    stack: [
      { src: "/skills/vite.svg" },
      { src: "/skills/tanstack.png" },
    ],
    category: "Tooling",
  },
  {
    name: "AI SDK & Eve",
    stack: [
      { src: "/skills/vercel.svg", invertDark: true },
      { src: "/skills/eve.ico" },
    ],
    category: "AI",
  },
  {
    name: "Git & GitHub",
    stack: [
      { src: "/skills/git.svg" },
      { src: "/skills/github.svg", invertDark: true },
    ],
    category: "Version Control",
  },
  {
    name: "Tailwind CSS",
    icon: { src: "/skills/tailwind.svg" },
    category: "Styling",
  },
  {
    name: "Motion",
    stack: [
      { src: "/skills/framer.svg" },
      { src: "/skills/gsap.svg" },
    ],
    category: "Animation",
  },
  {
    name: "AI Usage",
    stack: [
      { src: "/skills/claude.svg" },
      { src: "/skills/openai-mark.svg", invertDark: true },
      { src: "/skills/grok.svg", invertDark: true },
    ],
    category: "Workflow",
  },
];

const VISIBLE_COUNT = 6;

export function Skills() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? SKILLS : SKILLS.slice(0, VISIBLE_COUNT);

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl tracking-tight">/Skills</h2>
      <ul className="mt-5 -mx-3">
        {visible.map((skill, i) => (
          <li
            key={skill.name}
            className={i >= VISIBLE_COUNT ? "skill-enter" : undefined}
            style={
              i >= VISIBLE_COUNT
                ? ({
                    "--enter-delay": `${(i - VISIBLE_COUNT) * 40}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className="flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]">
              {skill.icon && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-background shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)]">
                  <Image
                    src={skill.icon.src}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className={`size-5${skill.icon.invertDark ? " dark:invert" : ""}`}
                  />
                </span>
              )}
              {skill.stack && (
                <span className="flex w-10 shrink-0 flex-col items-center">
                  {skill.stack.length > 2 && (
                    <Image
                      src={skill.stack[0].src}
                      alt=""
                      width={16}
                      height={16}
                      unoptimized
                      className={`size-4${skill.stack[0].invertDark ? " dark:invert" : ""}`}
                    />
                  )}
                  <span className="-mt-[3px] flex gap-[3px] first:mt-0">
                    {(skill.stack.length > 2
                      ? skill.stack.slice(1)
                      : skill.stack
                    ).map((icon) => (
                      <Image
                        key={icon.src}
                        src={icon.src}
                        alt=""
                        width={16}
                        height={16}
                        unoptimized
                        className={`size-4${icon.invertDark ? " dark:invert" : ""}`}
                      />
                    ))}
                  </span>
                </span>
              )}
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="truncate text-[16px] font-medium">
                  {skill.name}
                </span>
                {skill.badge && (
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[13px] font-medium text-sky-600 dark:text-sky-400">
                    {skill.badge}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-serif text-[16px] tracking-tight text-muted">
                {skill.category}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setShowAll((s) => !s)}
        className="mt-2 flex cursor-pointer items-center gap-1.5 px-0 text-[14px] text-muted transition-colors hover:text-foreground"
      >
        {showAll ? "Show less" : `View all (${SKILLS.length})`}
        <svg
          viewBox="0 0 12 12"
          className={`size-3 fill-none stroke-current stroke-[1.5] transition-transform duration-200 ${
            showAll ? "rotate-180" : ""
          }`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" />
        </svg>
      </button>
    </section>
  );
}
