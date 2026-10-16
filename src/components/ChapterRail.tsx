"use client";

import React, { useEffect, useState } from "react";

/**
 * A fixed index of the service chapters, so the slide structure is legible while
 * you scroll rather than something you only infer. Desktop only — on a phone the
 * chapters are a continuous read and a rail would just be chrome.
 *
 * Uses IntersectionObserver, not a scroll handler: no work on the main thread
 * between intersections.
 */
export default function ChapterRail({
  chapters,
}: {
  chapters: { number: string; title: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(`chapter-${c.number}`))
      .filter((el): el is HTMLElement => !!el);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The chapter occupying the middle band of the viewport wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id.replace("chapter-", ""));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  // Nothing is in view yet (hero, or past the chapters) — stay out of the way.
  if (!active) return null;

  return (
    <nav
      aria-label="Service chapters"
      className="hidden lg:flex fixed left-6 xl:left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-5"
    >
      {chapters.map((c) => {
        const isActive = c.number === active;
        return (
          <a
            key={c.number}
            href={`#chapter-${c.number}`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-3 outline-none"
          >
            <span
              className={`block h-[1px] transition-[width,background-color] duration-300 ${
                isActive
                  ? "w-6 bg-[#FF5A1F]"
                  : "w-2.5 bg-[#878074]/40 group-hover:w-5 group-hover:bg-[#878074]"
              }`}
            />
            <span
              className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                isActive
                  ? "text-[#FF5A1F]"
                  : "text-[#878074]/50 group-hover:text-[#878074]"
              }`}
            >
              {c.number}
            </span>
            <span className="sr-only">{c.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
