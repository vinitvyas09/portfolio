"use client"

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * Framer Motion loop that reproduces the “Early ChatGPT interactions” GIF.
 *  - 1200x675 canvas, 10s loop, 24fps-friendly animation
 *  - Two exchanges, typewriter for user, dots→type for AI
 *  - No logos; simple chat UI (gray user, blue AI)
 *
 * How to use (quick):
 * 1) Drop into a React/Vite or Next.js page, install framer-motion.
 * 2) Run locally, record a 10s 1200×675 screen capture, convert to GIF.
 */

type Role = "user" | "ai";
export type ChatMessage = { role: Role; text: string };
export type ChatGifConfig = {
  stepMs?: number; // per-message duration
  dotsMs?: number; // AI thinking dots duration (subset of stepMs)
  pauseMs?: number; // pause after final message before loop
  showHeader?: boolean; // show minimal header bar
  height?: number; // px height of the container
};

const DEFAULT_MESSAGES: ChatMessage[] = [
  { role: "user", text: "Explain quantum physics from a cat’s perspective." },
  {
    role: "ai",
    text:
      "I’m Schrodi-cat: on your keyboard and not. When you look, the universe picks one; until then I nap in superposition.",
  },
  { role: "user", text: "Imagine gravity works backwards for ten seconds—what happens?" },
  {
    role: "ai",
    text:
      "Coffee lifts from cups, hair floats, dust sparkles upward; anchored things stay put. Gravity snaps back and everything settles.",
  },
];

const DEFAULT_CFG: Required<Pick<ChatGifConfig, "stepMs" | "dotsMs" | "pauseMs" | "showHeader" | "height">> = {
  stepMs: 2_500,
  dotsMs: 500,
  pauseMs: 1_000,
  showHeader: true,
  height: 424, // px, tuned for blog layout
};

export default function ChatGif({
  messages = DEFAULT_MESSAGES,
  config = {},
  className,
}: {
  messages?: ChatMessage[];
  config?: ChatGifConfig;
  className?: string;
}) {
  const [now, setNow] = useState(0);

  const cfg = { ...DEFAULT_CFG, ...config };
  const count = Math.max(0, messages.length);
  const totalMs = count * cfg.stepMs + cfg.pauseMs; // loop length

  // Timeline driver: requestAnimationFrame loop
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const elapsed = (t - start) % totalMs; // seamless loop
      setNow(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalMs]);

  // Current step index (0..count for pause step at the end)
  const step = Math.floor(now / cfg.stepMs); // up to count during pause
  const within = now - Math.min(step, count) * cfg.stepMs; // ms within current step

  // Helper: proportion within current step (0..1)
  const p = step < count ? Math.min(1, Math.max(0, within / cfg.stepMs)) : 1;

  // Typewriter helpers
  const sliceToProgress = (text: string, progress: number) =>
    text.slice(0, Math.round(text.length * progress));

  // Compute which messages are visible at this instant
  const rendered = useMemo(() => {
    type R = { role: Role; text: string; showDots?: boolean; showCursor?: boolean };
    // Nothing to show
    if (count === 0) return [] as R[];

    // During pause step (step === count), show all fully
    if (step >= count) {
      return messages.map((m) => ({ role: m.role, text: m.text, showDots: false, showCursor: false })) as R[];
    }

    const out: R[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];

      // Future messages are not yet visible
      if (i > step) break;

      if (i < step) {
        // Completed messages are fully visible
        out.push({ role: m.role, text: m.text });
        continue;
      }

      // i === step (current message)
      if (m.role === "user") {
        out.push({ role: m.role, text: sliceToProgress(m.text, p), showCursor: true });
      } else {
        if (within < cfg.dotsMs) {
          out.push({ role: m.role, text: "", showDots: true });
        } else {
          const denom = Math.max(1, cfg.stepMs - cfg.dotsMs);
          const typed = Math.min(1, Math.max(0, (within - cfg.dotsMs) / denom));
          out.push({ role: m.role, text: sliceToProgress(m.text, typed), showCursor: true });
        }
      }
    }
    return out;
  }, [count, messages, step, within, p, cfg.dotsMs, cfg.stepMs]);

  return (
    <div className={`relative w-full ${className ?? ""}`} style={{ height: cfg.height }}>
      <div className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden">
        <div className="w-full h-full flex flex-col p-3 md:p-4 gap-3 md:gap-4 overflow-hidden">
          {cfg.showHeader && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 md:pb-3">
              <div className="h-3 w-12 sm:w-14 rounded-full bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 text-[14px] sm:text-[15px] md:text-[16px] leading-6 sm:leading-7 overflow-hidden">
            {rendered.map((m, i) =>
              m.role === "user" ? (
                <UserRow key={i} text={m.text} showCursor={m.showCursor} />
              ) : (
                <AiRow key={i} text={m.text} showDots={m.showDots} showCursor={m.showCursor && !m.showDots} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRow({ text, showCursor }: { text: string; showCursor?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <Avatar hue="gray" />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="max-w-[85%] rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gray-100 text-gray-900 shadow-sm"
      >
        <Monospace text={text} showCursor={showCursor} />
      </motion.div>
    </div>
  );
}

function AiRow({
  text,
  showDots,
  showCursor,
}: {
  text: string;
  showDots?: boolean;
  showCursor?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3 justify-end">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="max-w-[85%] rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 bg-blue-600 text-white shadow-sm"
      >
        {showDots ? <TypingDots /> : <Monospace text={text} showCursor={showCursor} />}
      </motion.div>
      <Avatar hue="blue" />
    </div>
  );
}

function Avatar({ hue }: { hue: "gray" | "blue" }) {
  const cls = hue === "gray" ? "bg-gray-300" : "bg-blue-300";
  return <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full ${cls} shrink-0`} />;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-white/90"
          initial={{ opacity: 0.2, y: 0 }}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function Monospace({ text, showCursor }: { text: string; showCursor?: boolean }) {
  return (
    <span className="font-mono">
      {text}
      {showCursor && (
        <motion.span
          className="inline-block w-[8px] ml-[2px] h-[1.2em] align-middle bg-black/70"
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </span>
  );
}
