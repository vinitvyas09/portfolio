"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// Shared timeline constants and types
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
type StepName = typeof STEPS[number];
const D: Record<StepName, number> = {
  userType: 1400,
  llmToSw: 800,
  swToApi: 800,
  apiToSw: 700,
  swToLlm: 700,
  llmToUser: 700,
  llmType: 1800,
  pause: 1000,
};

/**
 * Sophisticated MCP Weather Flow Animation
 * - Theme-aware with dark/light mode support
 * - Elegant gradients and glow effects
 * - Smooth, modern animations with subtle interactions
 * - Fixed 1200×675 canvas for consistent rendering
 */

export default function MCPWeatherFlow({
  className,
  height = 675,
}: {
  className?: string;
  height?: number;
}) {
  // Theme handling (match pattern from mcp-port)
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  
  // Theme-aware sophisticated color palette
  const C = useMemo(() => {
    if (!mounted) {
      return {
        bg1: "#fafafa",
        bg2: "#f3f4f6",
        textPrimary: "#1f2937",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        cardShadow: "rgba(0, 0, 0, 0.05)",
        userGrad1: "#6366f1",
        userGrad2: "#8b5cf6",
        llmGrad1: "#3b82f6",
        llmGrad2: "#0ea5e9",
        swGrad1: "#8b5cf6",
        swGrad2: "#d946ef",
        apiGrad1: "#10b981",
        apiGrad2: "#34d399",
        pulseColor: "#3b82f6",
        pulseGlow: "#60a5fa",
        messageBg: "#ffffff",
        messageBorder: "#e2e8f0",
        messageText: "#1f2937",
        edgeColor: "#cbd5e1",
        edgeActive: "#3b82f6",
        labelBg: "#1e293b",
        labelText: "#f1f5f9",
      };
    }
    return isDark
      ? {
          // Dark theme - sophisticated palette
          bg1: "#0a0a0b",
          bg2: "#111113",
          textPrimary: "#f1f5f9",
          textSecondary: "#cbd5e1",
          textMuted: "#64748b",
          cardBg: "rgba(30, 41, 59, 0.5)",
          cardBorder: "rgba(71, 85, 105, 0.3)",
          cardShadow: "rgba(0, 0, 0, 0.5)",
          userGrad1: "#6366f1",
          userGrad2: "#8b5cf6",
          llmGrad1: "#3b82f6",
          llmGrad2: "#0ea5e9",
          swGrad1: "#8b5cf6",
          swGrad2: "#d946ef",
          apiGrad1: "#10b981",
          apiGrad2: "#34d399",
          pulseColor: "#60a5fa",
          pulseGlow: "#93bbfc",
          messageBg: "rgba(30, 41, 59, 0.8)",
          messageBorder: "rgba(71, 85, 105, 0.5)",
          messageText: "#e2e8f0",
          edgeColor: "rgba(100, 116, 139, 0.3)",
          edgeActive: "#60a5fa",
          labelBg: "rgba(15, 23, 42, 0.9)",
          labelText: "#e2e8f0",
        }
      : {
          // Light theme - sophisticated palette
          bg1: "#fafafa",
          bg2: "#f3f4f6",
          textPrimary: "#1f2937",
          textSecondary: "#64748b",
          textMuted: "#94a3b8",
          cardBg: "#ffffff",
          cardBorder: "#e2e8f0",
          cardShadow: "rgba(0, 0, 0, 0.05)",
          userGrad1: "#6366f1",
          userGrad2: "#8b5cf6",
          llmGrad1: "#3b82f6",
          llmGrad2: "#0ea5e9",
          swGrad1: "#8b5cf6",
          swGrad2: "#d946ef",
          apiGrad1: "#10b981",
          apiGrad2: "#34d399",
          pulseColor: "#3b82f6",
          pulseGlow: "#60a5fa",
          messageBg: "#ffffff",
          messageBorder: "#e2e8f0",
          messageText: "#1f2937",
          edgeColor: "#cbd5e1",
          edgeActive: "#3b82f6",
          labelBg: "#1e293b",
          labelText: "#f1f5f9",
        };
  }, [isDark, mounted]);
  // ====== Timeline ======
  const starts = useMemo(() => {
    const s: number[] = [];
    let acc = 0;
    for (const k of STEPS) {
      s.push(acc);
      acc += D[k];
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
      if (now < starts[i] + D[STEPS[i]]) break;
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
  // Compact canvas sizing
  const PAD = 24;

  const nodeW = 220;
  const nodeH = 68;

  // Reserve space at the top for the two message bubbles
  const MSG_W = nodeW; // keep bubbles similar width to nodes
  const MSG_Q_Y = PAD; // question bubble Y
  const MSG_A_Y = MSG_Q_Y + 64; // add a bit more space between bubbles

  // Stack nodes vertically below the message area
  const V_GAP = 24; // vertical gap between nodes (tighter)
  // More padding under lower message before the first node
  const MSG_TO_NODES_GAP = 112;
  const NODES_TOP_Y = MSG_A_Y + MSG_TO_NODES_GAP; // begin nodes after messages
  const nodeX = PAD;

  const user = { x: nodeX, y: NODES_TOP_Y, w: nodeW, h: nodeH, label: "User" };
  const llm = {
    x: nodeX,
    y: NODES_TOP_Y + nodeH + V_GAP,
    w: nodeW,
    h: nodeH,
    label: "LLM",
  };
  const sw = {
    x: nodeX,
    y: NODES_TOP_Y + (nodeH + V_GAP) * 2,
    w: nodeW,
    h: nodeH,
    label: "Software",
  };
  const api = {
    x: nodeX,
    y: NODES_TOP_Y + (nodeH + V_GAP) * 3,
    w: nodeW,
    h: nodeH,
    label: "Weather API",
  };

  // Helper to build straight edges
  type NodeRect = { x: number; y: number; w: number; h: number };
  const edgeH = (from: NodeRect, to: NodeRect) => {
    const y = from.y + from.h / 2;
    const x1 = from.x + from.w + 12;
    const x2 = to.x - 12;
    return { x: x1, y, len: x2 - x1 };
  };
  const edgeV = (from: NodeRect, to: NodeRect) => {
    const x = from.x + from.w / 2;
    const y1 = from.y + from.h + 12;
    const y2 = to.y - 12;
    return { x, y: y1, len: y2 - y1 };
  };

  // Vertical edges (top → bottom)
  const A = edgeV(user, llm); // user → llm (question)
  const B = edgeV(llm, sw);   // llm → software (function call)
  const C = edgeV(sw, api);   // software → api (HTTP GET)
  const Dv = edgeV(sw, api);  // api → software (reuse coords, reverse)
  const E = edgeV(llm, sw);   // software → llm (reverse)
  const F = edgeV(user, llm); // llm → user (reverse)

  // Compute compact width/height based on content
  const W = Math.max(nodeX + nodeW + PAD, nodeX + MSG_W + PAD);
  const contentBottom = api.y + nodeH; // bottom of last node
  const H = Math.max(contentBottom + PAD, NODES_TOP_Y + 4 * nodeH + 3 * V_GAP + PAD);

  const active = (name: StepName) => stepName === name;
  
  // Animation state tracking for active elements
  const [activeElements, setActiveElements] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!mounted) return;
    const newActive = new Set<string>();
    
    if (stepName === "userType" || stepName === "llmToUser") {
      newActive.add("user");
    }
    if (stepName === "llmToSw" || stepName === "swToLlm" || stepName === "llmType") {
      newActive.add("llm");
    }
    if (stepName === "swToApi" || stepName === "apiToSw") {
      newActive.add("sw");
    }
    if (stepName === "apiToSw") {
      newActive.add("api");
    }
    
    setActiveElements(newActive);
  }, [stepName, mounted]);
  
  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          width: W,
          height: H,
          borderRadius: 24,
          background: "transparent",
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: W,
        height: H,
        borderRadius: 24,
        background: `linear-gradient(135deg, ${C.bg1} 0%, ${C.bg2} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg 
        viewBox={`0 0 ${W} ${H}`} 
        width={W} 
        height={H}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          {/* Gradients for each node */}
          <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.userGrad1} />
            <stop offset="100%" stopColor={C.userGrad2} />
          </linearGradient>
          
          <linearGradient id="llmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.llmGrad1} />
            <stop offset="100%" stopColor={C.llmGrad2} />
          </linearGradient>
          
          <linearGradient id="swGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.swGrad1} />
            <stop offset="100%" stopColor={C.swGrad2} />
          </linearGradient>
          
          <linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.apiGrad1} />
            <stop offset="100%" stopColor={C.apiGrad2} />
          </linearGradient>
          
          {/* Sophisticated glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Pulse glow effect */}
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1"/>
          </filter>
        </defs>

      {/* Nodes */}
        <Node {...user} id="user" gradient="userGradient" isActive={activeElements.has("user")} C={C} />
        <Node {...llm} id="llm" gradient="llmGradient" isActive={activeElements.has("llm")} C={C} />
        <Node {...sw} id="sw" gradient="swGradient" isActive={activeElements.has("sw")} C={C} />
        <Node {...api} id="api" gradient="apiGradient" isActive={activeElements.has("api")} C={C} />

        {/* Edges with more sophisticated paths */}
        {/* Draw edges before messages so they appear behind */}
        <g opacity={0.8}>
          {/* User → LLM */}
          <motion.path
            d={`M ${user.x + user.w/2} ${user.y + user.h} L ${llm.x + llm.w/2} ${llm.y}`}
            stroke={activeElements.has("user") && activeElements.has("llm") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          {/* LLM → Software */}
          <motion.path
            d={`M ${llm.x + llm.w/2} ${llm.y + llm.h} L ${sw.x + sw.w/2} ${sw.y}`}
            stroke={activeElements.has("llm") && activeElements.has("sw") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          
          {/* Software → API */}
          <motion.path
            d={`M ${sw.x + sw.w/2} ${sw.y + sw.h} L ${api.x + api.w/2} ${api.y}`}
            stroke={activeElements.has("sw") && activeElements.has("api") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </g>
        
        {/* Animated packets with glow */}
        <AnimatePresence>
          {active("userType") && (
            <motion.circle
              r="5"
              fill={C.pulseColor}
              filter="url(#pulseGlow)"
              initial={{ cx: user.x + user.w/2, cy: user.y + user.h, opacity: 0 }}
              animate={{ 
                cx: llm.x + llm.w/2, 
                cy: llm.y,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.userType / 1000, ease: "easeInOut" }}
            />
          )}
          
          {active("llmToSw") && (
            <motion.circle
              r="5"
              fill={C.pulseColor}
              filter="url(#pulseGlow)"
              initial={{ cx: llm.x + llm.w/2, cy: llm.y + llm.h, opacity: 0 }}
              animate={{ 
                cx: sw.x + sw.w/2, 
                cy: sw.y,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.llmToSw / 1000, ease: "easeInOut" }}
            />
          )}
          
          {active("swToApi") && (
            <motion.circle
              r="5"
              fill={C.pulseColor}
              filter="url(#pulseGlow)"
              initial={{ cx: sw.x + sw.w/2, cy: sw.y + sw.h, opacity: 0 }}
              animate={{ 
                cx: api.x + api.w/2, 
                cy: api.y,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.swToApi / 1000, ease: "easeInOut" }}
            />
          )}
          
          {active("apiToSw") && (
            <motion.circle
              r="5"
              fill={C.apiGrad1}
              filter="url(#pulseGlow)"
              initial={{ cx: api.x + api.w/2, cy: api.y, opacity: 0 }}
              animate={{ 
                cx: sw.x + sw.w/2, 
                cy: sw.y + sw.h,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.apiToSw / 1000, ease: "easeInOut" }}
            />
          )}
          
          {active("swToLlm") && (
            <motion.circle
              r="5"
              fill={C.swGrad1}
              filter="url(#pulseGlow)"
              initial={{ cx: sw.x + sw.w/2, cy: sw.y, opacity: 0 }}
              animate={{ 
                cx: llm.x + llm.w/2, 
                cy: llm.y + llm.h,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.swToLlm / 1000, ease: "easeInOut" }}
            />
          )}
          
          {active("llmToUser") && (
            <motion.circle
              r="5"
              fill={C.llmGrad1}
              filter="url(#pulseGlow)"
              initial={{ cx: llm.x + llm.w/2, cy: llm.y, opacity: 0 }}
              animate={{ 
                cx: user.x + user.w/2, 
                cy: user.y + user.h,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.llmToUser / 1000, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
        
        {/* Message labels */}
        <AnimatePresence>
          {active("llmToSw") && (
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={llm.x + llm.w/2 - 110}
                y={llm.y + llm.h + 20}
                width={220}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={llm.x + llm.w/2}
                y={llm.y + llm.h + 36}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                getWeather("San Francisco")
              </text>
            </motion.g>
          )}
          
          {active("swToApi") && (
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={sw.x + sw.w/2 - 100}
                y={sw.y + sw.h + 20}
                width={200}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={sw.x + sw.w/2}
                y={sw.y + sw.h + 36}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                GET /weather?city=SF
              </text>
            </motion.g>
          )}
          
          {active("apiToSw") && (
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={api.x + api.w/2 - 90}
                y={api.y - 35}
                width={180}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={api.x + api.w/2}
                y={api.y - 19}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {"{ temp: 65, clear }"}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      
      {/* Message bubbles rendered as HTML overlays for better text handling */}
      <SpeechBubble
        x={nodeX}
        y={MSG_Q_Y}
        w={MSG_W}
        visible={stepIndex >= 0}
        text={
          stepName === "userType"
            ? typeSlice(userMsg, tInStep, D.userType)
            : userMsg
        }
        cursor={active("userType")}
        C={C}
      />

      <SpeechBubble
        x={nodeX}
        y={MSG_A_Y}
        w={MSG_W}
        visible={stepIndex >= 6}
        text={
          stepName === "llmType"
            ? typeSlice(finalMsg, tInStep, D.llmType)
            : finalMsg
        }
        cursor={active("llmType")}
        C={C}
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
      className="absolute rounded-xl wf-bubble shadow"
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
            className="mono-caret inline-block w-[8px] ml-[2px] h-[1.2em] align-middle"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      {/* tail */}
      <div
        className={`absolute -bottom-2 ${
          align === "left" ? "left-4" : "right-4"
        } w-0 h-0 border-t-[8px] wf-bubble-tail border-x-[8px] border-x-transparent`}
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
          className="relative wf-line"
          style={{ width: len, height: 2 }}
        >
          {/* arrowhead */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              headSide === "right" ? "right-0" : "left-0 rotate-180"
            }`}
          >
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-zinc-400 dark:border-l-zinc-500" />
          </div>

          {/* label pill */}
          {label && (
            <motion.div
              className="absolute -top-8 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-mono px-2 py-1 z-30 pointer-events-none"
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
            className="absolute -top-1 h-3 w-3 rounded-full bg-blue-600 shadow z-10"
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
          className="relative wf-line"
          style={{ width: 2, height: len }}
        >
          {/* arrowhead */}
          <div
            className={`absolute ${
              headSide === "bottom" ? "bottom-0" : "top-0 rotate-180"
            } left-1/2 -translate-x-1/2`}
          >
            <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[9px] border-t-zinc-400 dark:border-t-zinc-500" />
          </div>

          {/* label pill */}
          {label && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-mono px-2 py-1 z-30 pointer-events-none"
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
            className="absolute left-1/2 -translate-x-1/2 -top-1 h-3 w-3 rounded-full bg-blue-600 shadow z-10"
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
