"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * Framer Motion loop: MCP-style “weather tool call” flow as a simple GIFable scene.
 * - Fixed 1200×675 canvas, ~8s loop, minimal UI (no headings).
 * - Sequence:
 *   1) User asks     → “What’s the weather in SF today?”
 *   2) LLM signals   → function call
 *   3) Software      → calls Weather API
 *   4) Weather API   → returns JSON
 *   5) Software      → feeds results to LLM
 *   6) LLM           → replies (with citation)
 *
 * How to use (quick):
 * 1) Install framer-motion. Drop component into a Next.js/React page.
 * 2) Render at 1200×675; screen-record 8–9 s; convert to GIF.
 */

export default function MCPWeatherFlow({
  className,
  height = 675,
}: {
  className?: string;
  height?: number;
}) {
  // ====== Timeline ======
  const D = {
    userType: 1400,
    llmToSw: 800,
    swToApi: 800,
    apiToSw: 700,
    swToLlm: 700,
    llmToUser: 700,
    llmType: 1800,
    pause: 1000,
  };
  const STEPS = [
    "userType",
    "llmToSw",
    "swToApi",
    "apiToSw",
    "swToLlm",
    "llmToUser",
    "llmType",
    "pause",
  ] as const;

  const starts = useMemo(() => {
    const s: number[] = [];
    let acc = 0;
    for (const k of STEPS) {
      s.push(acc);
      acc += (D as any)[k];
    }
    return s;
  }, []);
  const totalMs = starts[starts.length - 1] + D.pause;

  const [now, setNow] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      setNow(((t - start) % totalMs + totalMs) % totalMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalMs]);

  const stepIndex = useMemo(() => {
    let i = 0;
    for (; i < starts.length; i++) {
      if (now < starts[i] + (D as any)[STEPS[i]]) break;
    }
    return Math.min(i, STEPS.length - 1);
  }, [now, starts]);
  const stepKey = useMemo(() => `${stepIndex}-${Math.floor(now)}`, [stepIndex, now]);
  const stepName = STEPS[stepIndex];
  const tInStep =
    now - starts[stepIndex] >= 0 ? now - starts[stepIndex] : 0;

  // ====== Content ======
  const userMsg = `What's the weather in SF today?`;
  const finalMsg = `San Francisco today: 65°F, clear.\nSource: weather.gov`;

  const typeSlice = (text: string, ms: number, dur: number) => {
    const p = Math.min(1, Math.max(0, ms / Math.max(1, dur)));
    return text.slice(0, Math.round(text.length * p));
  };

  // ====== Geometry (fixed canvas for GIF capture) ======
  const W = 1200;
  const H = height; // 675 default
  const PAD = 72;

  const nodeW = 220;
  const nodeH = 68;

  const user = { x: PAD, y: 240, w: nodeW, h: nodeH, label: "User" };
  const llm = { x: PAD + 320, y: 240, w: nodeW, h: nodeH, label: "LLM" };
  const sw = { x: PAD + 640, y: 240, w: nodeW, h: nodeH, label: "Software" };
  const api = { x: sw.x, y: 420, w: nodeW, h: nodeH, label: "Weather API" };

  // Helper to build straight edges
  const edgeH = (from: any, to: any) => {
    const y = from.y + from.h / 2;
    const x1 = from.x + from.w + 12;
    const x2 = to.x - 12;
    return { x: x1, y, len: x2 - x1 };
  };
  const edgeV = (from: any, to: any) => {
    const x = from.x + from.w / 2;
    const y1 = from.y + from.h + 12;
    const y2 = to.y - 12;
    return { x, y: y1, len: y2 - y1 };
  };

  const A = edgeH(user, llm); // user → llm (question)
  const B = edgeH(llm, sw);   // llm → software (function call)
  const C = edgeV(sw, api);   // software → api (HTTP GET)
  const Dv = edgeV(sw, api);  // api → software (reuse coords, reverse)
  const E = edgeH(llm, sw);   // software → llm (reverse)
  const F = edgeH(user, llm); // llm → user (reverse)

  const active = (name: (typeof STEPS)[number]) => stepName === name;

  return (
    <div
      className={`relative mx-auto ${className ?? ""}`}
      style={{ width: W, height: H, background: "white" }}
    >
      {/* Nodes */}
      <Node {...user} hue="zinc" />
      <Node {...llm} hue="blue" />
      <Node {...sw} hue="violet" />
      <Node {...api} hue="emerald" />

      {/* User typed question */}
      <SpeechBubble
        x={user.x + user.w + 16}
        y={user.y - 42}
        w={300}
        visible={stepIndex >= 0}
        text={
          stepName === "userType"
            ? typeSlice(userMsg, tInStep, D.userType)
            : userMsg
        }
        cursor={active("userType")}
        align="left"
      />

      {/* Final LLM answer (with citation) */}
      <SpeechBubble
        x={llm.x - 340}
        y={llm.y - 42}
        w={320}
        visible={stepIndex >= 6 /* show only from step 6 onward */}
        text={
          stepName === "llmType"
            ? typeSlice(finalMsg, tInStep, D.llmType)
            : finalMsg
        }
        cursor={active("llmType")}
        align="right"
      />

      {/* Edges + packets */}
      {/* A: User → LLM (question) */}
      <ArrowH
        {...A}
        direction={1}
        showLine={true}
        packetActive={active("userType")}
        packetKey={`A-${stepKey}`}
        durationMs={D.userType}
        label="ask"
        labelX="center"
      />

      {/* B: LLM → Software (function call) */}
      <ArrowH
        {...B}
        direction={1}
        showLine={true}
        packetActive={active("llmToSw")}
        packetKey={`B-${stepKey}`}
        durationMs={D.llmToSw}
        label={`function: getWeather({ city: "San Francisco" })`}
        labelX="center"
      />

      {/* C: Software → Weather API (HTTP GET) */}
      <ArrowV
        {...C}
        direction={1}
        showLine={true}
        packetActive={active("swToApi")}
        packetKey={`C-${stepKey}`}
        durationMs={D.swToApi}
        label={`GET /v1/weather?city=San%20Francisco`}
        labelX="right"
      />

      {/* D: Weather API → Software (200 OK JSON) */}
      <ArrowV
        {...Dv}
        direction={-1}
        showLine={true}
        packetActive={active("apiToSw")}
        packetKey={`D-${stepKey}`}
        durationMs={D.apiToSw}
        label={`200 OK  { temp: 65, cond: "Clear" }`}
        labelX="right"
      />

      {/* E: Software → LLM (feed results) */}
      <ArrowH
        {...E}
        direction={-1}
        showLine={true}
        packetActive={active("swToLlm")}
        packetKey={`E-${stepKey}`}
        durationMs={D.swToLlm}
        label={`results → LLM`}
        labelX="center"
      />

      {/* F: LLM → User (final answer) */}
      <ArrowH
        {...F}
        direction={-1}
        showLine={true}
        packetActive={active("llmToUser")}
        packetKey={`F-${stepKey}`}
        durationMs={D.llmToUser}
        label={`reply`}
        labelX="center"
      />
    </div>
  );
}

/* ========================== Presentational Bits ========================== */

function Node({
  x,
  y,
  w,
  h,
  label,
  hue,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  hue: "zinc" | "blue" | "violet" | "emerald";
}) {
  const bg =
    hue === "blue"
      ? "bg-blue-600"
      : hue === "violet"
      ? "bg-violet-600"
      : hue === "emerald"
      ? "bg-emerald-600"
      : "bg-zinc-700";
  return (
    <motion.div
      className={`absolute ${bg} text-white rounded-xl shadow-lg`}
      style={{ left: x, top: y, width: w, height: h }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="h-full w-full flex items-center justify-center font-medium tracking-wide">
        <span className="font-mono text-[15px]">{label}</span>
      </div>
    </motion.div>
  );
}

function SpeechBubble({
  x,
  y,
  w,
  text,
  visible,
  cursor,
  align,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  visible: boolean;
  cursor?: boolean;
  align: "left" | "right";
}) {
  return (
    <motion.div
      className="absolute rounded-xl bg-zinc-100 text-zinc-900 shadow"
      style={{ left: x, top: y, width: w, padding: 10 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="font-mono text-[14px] leading-6"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {text}
        {cursor && (
          <motion.span
            className="inline-block w-[8px] ml-[2px] h-[1.2em] align-middle bg-black/70"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      {/* tail */}
      <div
        className={`absolute -bottom-2 ${
          align === "left" ? "left-4" : "right-4"
        } w-0 h-0 border-t-[8px] border-t-zinc-100 border-x-[8px] border-x-transparent`}
      />
    </motion.div>
  );
}

function ArrowH({
  x,
  y,
  len,
  direction,
  showLine,
  packetActive,
  packetKey,
  durationMs,
  label,
  labelX = "center",
}: {
  x: number;
  y: number;
  len: number;
  direction: 1 | -1;
  showLine: boolean;
  packetActive: boolean;
  packetKey: string;
  durationMs: number;
  label?: string;
  labelX?: "left" | "center" | "right";
}) {
  const headSide = direction === 1 ? "right" : "left";
  const dotStart = direction === 1 ? 0 : len - 8;
  const dotEnd = direction === 1 ? len - 8 : 0;
  const labelLeft =
    labelX === "left" ? 0 : labelX === "right" ? len - 140 : len / 2 - 140 / 2;

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {showLine && (
        <div
          className="relative"
          style={{ width: len, height: 2, background: "rgba(0,0,0,0.12)" }}
        >
          {/* arrowhead */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              headSide === "right" ? "right-0" : "left-0 rotate-180"
            }`}
          >
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-zinc-400" />
          </div>

          {/* label pill */}
          {label && (
            <motion.div
              className="absolute -top-8 rounded-md bg-zinc-900 text-white text-[11px] font-mono px-2 py-1"
              style={{ left: labelLeft, width: 140, textAlign: "center" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: packetActive ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.div>
          )}

          {/* packet */}
          <motion.div
            key={packetKey}
            className="absolute -top-1 h-3 w-3 rounded-full bg-blue-600 shadow"
            initial={{ opacity: 0, x: dotStart }}
            animate={
              packetActive
                ? { opacity: [0, 1, 1, 0], x: dotEnd }
                : { opacity: 0, x: dotStart }
            }
            transition={{
              duration: durationMs / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}
    </div>
  );
}

function ArrowV({
  x,
  y,
  len,
  direction,
  showLine,
  packetActive,
  packetKey,
  durationMs,
  label,
  labelX = "right",
}: {
  x: number;
  y: number;
  len: number;
  direction: 1 | -1;
  showLine: boolean;
  packetActive: boolean;
  packetKey: string;
  durationMs: number;
  label?: string;
  labelX?: "left" | "center" | "right";
}) {
  const headSide = direction === 1 ? "bottom" : "top";
  const dotStart = direction === 1 ? 0 : len - 8;
  const dotEnd = direction === 1 ? len - 8 : 0;

  const labelLeft =
    labelX === "left" ? -140 : labelX === "right" ? 8 : -70;

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {showLine && (
        <div
          className="relative"
          style={{ width: 2, height: len, background: "rgba(0,0,0,0.12)" }}
        >
          {/* arrowhead */}
          <div
            className={`absolute ${
              headSide === "bottom" ? "bottom-0" : "top-0 rotate-180"
            } left-1/2 -translate-x-1/2`}
          >
            <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[9px] border-t-zinc-400" />
          </div>

          {/* label pill */}
          {label && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rounded-md bg-zinc-900 text-white text-[11px] font-mono px-2 py-1"
              style={{ left: labelLeft, width: 140, textAlign: "center" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: packetActive ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.div>
          )}

          {/* packet */}
          <motion.div
            key={packetKey}
            className="absolute left-1/2 -translate-x-1/2 -top-1 h-3 w-3 rounded-full bg-blue-600 shadow"
            initial={{ opacity: 0, y: dotStart }}
            animate={
              packetActive
                ? { opacity: [0, 1, 1, 0], y: dotEnd }
                : { opacity: 0, y: dotStart }
            }
            transition={{
              duration: durationMs / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}
    </div>
  );
}
