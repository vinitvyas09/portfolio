"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export type Headline = {
  title: string;
  source: string;
  url?: string;
};

export type HeadlineCascadeConfig = {
  height?: number; // px height
  durationMs?: number; // full loop time across all headlines
  density?: number; // kept for backwards-compat (unused)
  tilt?: number; // kept for backwards-compat (unused)
  visibleCount?: number; // how many stacked cards to keep visible
  gap?: number; // px gap between stacked cards
  verticalPadding?: number; // px padding above/below the stack when auto height
  // Overlap tuning
  topArrival?: number; // 0..1 point when top reaches final Y
  shiftStart?: number; // 0..1 point when lower cards start shifting
  overlapRatio?: number; // 0..1 of card height to enter before shift
  overlapPx?: number; // explicit px override for overlap depth
  overlapFeather?: number; // px softness of the mask edge
};

const DEFAULT_HEADLINES: Headline[] = [
  {
    title: "ChatGPT sets record for fastest-growing user base — analyst note",
    source: "Reuters",
    url:
      "https://web.archive.org/web/20230202084643/https://www.reuters.com/technology/chatgpt-sets-record-fastest-growing-user-base-analyst-note-2023-02-01/",
  },
  {
    title: "ChatGPT banned in Italy over privacy concerns",
    source: "BBC News",
    url: "https://www.bbc.com/news/technology-65139406",
  },
  {
    title:
      "Sparks of Artificial General Intelligence: Early experiments with GPT‑4",
    source: "arXiv",
    url: "https://arxiv.org/abs/2303.12712",
  },
  {
    title: "Pause Giant AI Experiments: An Open Letter",
    source: "Future of Life Institute",
    url: "https://futureoflife.org/open-letter/pause-giant-ai-experiments/",
  },
  {
    title: "New York City public schools ban ChatGPT on devices and networks",
    source: "The Verge",
    url: "https://www.theverge.com/2023/1/5/23540082/new-york-city-public-schools-ban-chatgpt-devices-networks",
  },
  {
    title: "Reinventing search with a new AI‑powered Bing and Edge",
    source: "Microsoft Blog",
    url: "https://blogs.microsoft.com/blog/2023/02/07/reinventing-search-with-a-new-ai-powered-bing-and-edge-your-copilot-for-the-web/",
  },
  {
    title: "Introducing ChatGPT Plugins",
    source: "OpenAI",
    url: "https://openai.com/blog/chatgpt-plugins",
  },
  {
    title: "Function calling and other API updates",
    source: "OpenAI",
    url: "https://openai.com/blog/function-calling-and-other-api-updates",
  },
  {
    title: "Introducing LLaMA: A foundational, 65‑billion‑parameter LLM",
    source: "Meta AI",
    url: "https://ai.facebook.com/blog/large-language-model-llama-meta-ai/",
  },
];

const DEFAULTS: Required<Pick<HeadlineCascadeConfig, "durationMs">> &
  Omit<HeadlineCascadeConfig, "durationMs"> = {
  durationMs: 12_000,
  // extras
  density: 1,
  tilt: 0,
  visibleCount: 6,
  gap: 10,
  verticalPadding: 8,
  // overlap defaults: more visible overlap window
  topArrival: 0.4,
  shiftStart: 0.65,
  overlapRatio: 0.66,
  overlapPx: undefined,
  overlapFeather: 8,
};

export default function HeadlineCascade({
  headlines = DEFAULT_HEADLINES,
  config = {},
  className,
}: {
  headlines?: Headline[];
  config?: HeadlineCascadeConfig;
  className?: string;
}) {
  const cfg = useMemo(() => ({ ...DEFAULTS, ...config }), [config]);

  const base = headlines?.length ? headlines : DEFAULT_HEADLINES;
  const n = base.length;

  const [now, setNow] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  // Simple RAF driver to advance the stack
  useEffect(() => {
    if (typeof window !== "undefined" && "matchMedia" in window) {
      reducedMotionRef.current = window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
    }
    startRef.current = performance.now();
    const tick = (t: number) => {
      const d = Math.max(1, cfg.durationMs);
      const elapsed = (t - startRef.current) % d;
      setNow(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    if (!reducedMotionRef.current) rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [cfg.durationMs]);

  // Derive per-card step from total duration
  const safeN = Math.max(1, n);
  const stepMs = Math.max(600, Math.floor(cfg.durationMs / safeN));
  const step = Math.floor(now / stepMs) % safeN; // which headline is on top
  const within = now % stepMs;
  const appearP = Math.min(1, within / stepMs);

  // Build stack indices: [top, next, ...]
  const depth = Math.min(cfg.visibleCount ?? 6, n);
  const stack = Array.from({ length: depth }, (_, k) => (step - k + n) % n);

  // Measure approximate card height to compute overlap accurately
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [cardH, setCardH] = useState(72);
  useEffect(() => {
    if (!measureRef.current) return;
    const h = measureRef.current.offsetHeight;
    if (h && Math.abs(h - cardH) > 1) setCardH(h);
    // Re-measure on resize
    const onResize = () => {
      if (!measureRef.current) return;
      const hh = measureRef.current.offsetHeight;
      if (hh && Math.abs(hh - cardH) > 1) setCardH(hh);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, headlines, config]);

  // Tuning + helpers outside the map so we can compute top position once
  const gap = Math.max(0, cfg.gap ?? 10);
  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const topArrival = clamp(cfg.topArrival ?? 0.4); // portion of step where top fully arrives
  const shiftStart = clamp(cfg.shiftStart ?? 0.65); // portion after which lower cards shift down
  const blurMax = 7; // px max blur on the previous top during overlap

  // Compute top card Y once for overlap math
  const desiredOverlap = cfg.overlapPx ?? Math.floor(cardH * (cfg.overlapRatio ?? 0.66));
  const yTopInitial = -Math.max(gap + 12, Math.min(Math.max(8, desiredOverlap), Math.max(8, cardH - 4)));
  const yTopFinal = 0;
  const yTop = lerp(yTopInitial, yTopFinal, easeOut(clamp(appearP / topArrival)));
  // Progress used by all non-top cards
  const pRestCommon = clamp((appearP - shiftStart) / (1 - shiftStart));
  const yForLayer = (kk: number) => {
    if (kk === 0) return yTop;
    const i = (kk - 1) * gap;
    const f = kk * gap;
    return lerp(i, f, easeOut(pRestCommon));
  };

  if (!n) return null;

  // Compute auto height: account for full card + stack depth + animation space
  const stackDepth = Math.max(0, depth - 1) * gap; // Space taken by stacked cards
  const animationBuffer = 50; // Space needed for overlap animation (further reduced)
  const stackH = cardH + stackDepth + animationBuffer;
  // Fixed top padding (40px in the container) + minimal bottom padding
  const topPadding = 20; // This matches the paddingTop in the container
  const bottomPadding = 0; // Minimal bottom padding - just enough to avoid cutoff
  const autoHeight = Math.round(stackH + topPadding + bottomPadding);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm ${
        className ?? ""
      }`}
      style={{ height: cfg.height ?? autoHeight }}
    >
      {/* Header removed (no three-dot chrome) */}

      {/* Stack positioned with balanced spacing */}
      <div className="absolute inset-0 flex justify-center" style={{ paddingTop: '40px' }}>
        <div className="relative w-[min(92vw,860px)] px-3">
          {/* Render bottom → top to ensure correct stacking */}
          {stack
            .slice()
            .reverse()
            .map((idx, rIndex) => {
              // rIndex: 0 = oldest visible, depth-1 = newest (top)
              const k = depth - 1 - rIndex; // 0 = top, increasing downward
              const h = base[idx];

              // Easing helper (local smooth for blur falloff)
              const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

              // Target positions
              const initialY = k === 0 ? yTopInitial : (k - 1) * gap;
              const finalY = k * gap;

              // Progress per layer
              const pTop = k === 0 ? clamp(appearP / topArrival) : 0;
              const yProgress = k === 0 ? easeOut(pTop) : easeOut(pRestCommon);
              const y = lerp(initialY, finalY, yProgress);

              const scale = 1 - Math.min(0.06, k * 0.015);
              const opacity = 1 - Math.min(0.5, k * 0.08);
              const shadow = k === 0 ? "0 10px 28px rgba(0,0,0,0.38)" : "0 4px 14px rgba(0,0,0,0.25)";

              // Blur based on geometric overlap with the card above
              // and build a mask to hide the overlapped region to prevent text doubling.
              let blur = 0;
              let maskImage: string | undefined;
              if (k > 0) {
                const yAbove = yForLayer(k - 1);
                const delta = y - yAbove; // vertical distance between this and above
                const overlapPx = clamp(cardH - delta, 0, cardH); // how much of this card is covered from the top
                const ratio = clamp(overlapPx / Math.max(1, cardH));
                // Slight blur for the immediate previous top to keep depth
                if (k === 1) blur = blurMax * easeInOut(ratio);

                // Build mask: hide from 0 -> overlapPx (with a soft feather)
                const feather = Math.max(0, cfg.overlapFeather ?? 8); // px feather for softer edge
                const fadeEnd = Math.min(cardH, overlapPx + feather);
                // Use alpha-only stops: transparent (hidden) to opaque (visible)
                maskImage = `linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) ${overlapPx.toFixed(2)}px, rgba(0,0,0,1) ${fadeEnd.toFixed(2)}px, rgba(0,0,0,1) 100%)`;
              }

              return (
                <motion.div
                  key={`${idx}`}
                  animate={{ y, opacity, scale }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute left-1/2 -translate-x-1/2 will-change-transform select-none"
                  style={{ zIndex: 100 + (depth - k), width: "100%", maxWidth: 860 }}
                >
                  <div
                    className="rounded-xl border border-border bg-card/80 dark:bg-card/60 backdrop-blur-sm px-4 py-3 md:px-5 md:py-4 shadow"
                    style={{
                      boxShadow: shadow,
                      filter: blur ? `blur(${blur.toFixed(2)}px)` : undefined,
                      WebkitMaskImage: maskImage,
                      maskImage,
                    }}
                  >
                    {h.url ? (
                      <a
                        href={h.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block text-foreground text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-snug tracking-tight break-words hover:text-primary transition-colors"
                      >
                        {h.title}
                      </a>
                    ) : (
                      <div className="block text-foreground text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-snug tracking-tight break-words">
                        {h.title}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          {/* offscreen measurer to estimate card height for overlap math */}
          <div className="absolute -z-50 opacity-0 pointer-events-none left-0 top-0 w-full">
            <div ref={measureRef} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:px-5 md:py-4">
              <div className="block text-white text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-snug tracking-tight break-words">
                {base[step]?.title || "Sample"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
