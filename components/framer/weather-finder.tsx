"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// Shared timeline constants and types
const STEPS = [
  "userType",
  "userToLlm",  // New step for the packet animation after typing
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
  userToLlm: 700,  // Time for packet to travel
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
          messageBg: "rgba(0, 0, 0, 0.75)",
          messageBorder: "rgba(24, 24, 24, 0.9)",
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
  const MSG_Q_Y = PAD - 6; // pull question bubble up slightly
  const MSG_A_Y = MSG_Q_Y + 70; // increase separation by a few pixels

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
  const edgeA = edgeV(user, llm); // user → llm (question)
  const edgeB = edgeV(llm, sw);   // llm → software (function call)
  const edgeC = edgeV(sw, api);   // software → api (HTTP GET)
  const edgeD = edgeV(sw, api);  // api → software (reuse coords, reverse)
  const edgeE = edgeV(llm, sw);   // software → llm (reverse)
  const edgeF = edgeV(user, llm); // llm → user (reverse)

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
    
    if (stepName === "userType") {
      newActive.add("user");
    }
    if (stepName === "userToLlm") {
      newActive.add("user");
      newActive.add("llm");
    }
    if (stepName === "llmToSw") {
      newActive.add("llm");
      newActive.add("sw");
    }
    if (stepName === "swToApi") {
      newActive.add("sw");
      newActive.add("api");
    }
    if (stepName === "apiToSw") {
      newActive.add("api");
      newActive.add("sw");
    }
    if (stepName === "swToLlm") {
      newActive.add("sw");
      newActive.add("llm");
    }
    if (stepName === "llmToUser") {
      newActive.add("llm");
      newActive.add("user");
    }
    // llmType should NOT highlight the LLM node, just the user seeing the response
    if (stepName === "llmType") {
      newActive.add("user");
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
        margin: "0 auto",
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

        {/* Title and Stage Indicator */}
        <motion.text
          x={W / 2}
          y={25}
          fill={C.textSecondary}
          fontSize="13"
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
        </motion.text>
        
        {/* Current Stage Indicator */}
        <motion.text
          x={W / 2}
          y={45}
          fill={C.textMuted}
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stepName === "userType" && "User asking question..."}
          {stepName === "userToLlm" && "Sending to LLM..."}
          {stepName === "llmToSw" && "LLM calling function..."}
          {stepName === "swToApi" && "Software calling API..."}
          {stepName === "apiToSw" && "API returning data..."}
          {stepName === "swToLlm" && "Software processing response..."}
          {stepName === "llmToUser" && "LLM preparing answer..."}
          {stepName === "llmType" && "LLM responding..."}
          {stepName === "pause" && "Complete"}
        </motion.text>

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
            stroke={(stepName === "userToLlm" || stepName === "llmToUser") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          {/* LLM → Software */}
          <motion.path
            d={`M ${llm.x + llm.w/2} ${llm.y + llm.h} L ${sw.x + sw.w/2} ${sw.y}`}
            stroke={(stepName === "llmToSw" || stepName === "swToLlm") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          
          {/* Software → API */}
          <motion.path
            d={`M ${sw.x + sw.w/2} ${sw.y + sw.h} L ${api.x + api.w/2} ${api.y}`}
            stroke={(stepName === "swToApi" || stepName === "apiToSw") ? C.edgeActive : C.edgeColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </g>
        
        {/* Animated packets with glow */}
        <AnimatePresence>
          {active("userToLlm") && (
            <>
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
                transition={{ duration: D.userToLlm / 1000, ease: "easeInOut" }}
              />
              {/* Label for user to LLM (centered between nodes) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect 
                  x={edgeA.x - 25}
                  y={edgeA.y + edgeA.len / 2 - 10}
                  width={50}
                  height={20}
                  rx={10}
                  fill={C.labelBg}
                  fillOpacity={0.9}
                />
                <text
                  x={edgeA.x}
                  y={edgeA.y + edgeA.len / 2}
                  fill={C.labelText}
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  ask
                </text>
              </motion.g>
            </>
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
            <>
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
              {/* Label for Software to LLM (centered between nodes) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect 
                  x={edgeE.x - 60}
                  y={edgeE.y + edgeE.len / 2 - 10}
                  width={120}
                  height={20}
                  rx={10}
                  fill={C.labelBg}
                  fillOpacity={0.9}
                />
                <text
                  x={edgeE.x}
                  y={edgeE.y + edgeE.len / 2}
                  fill={C.labelText}
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  results → LLM
                </text>
              </motion.g>
            </>
          )}
          
          {active("llmToUser") && (
            <>
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
              {/* Label for LLM to User (centered between nodes) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect 
                  x={edgeF.x - 30}
                  y={edgeF.y + edgeF.len / 2 - 10}
                  width={60}
                  height={20}
                  rx={10}
                  fill={C.labelBg}
                  fillOpacity={0.9}
                />
                <text
                  x={edgeF.x}
                  y={edgeF.y + edgeF.len / 2}
                  fill={C.labelText}
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  reply
                </text>
              </motion.g>
            </>
          )}
        </AnimatePresence>
        
        {/* Message labels */}
        <AnimatePresence>
          {active("llmToSw") && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={edgeB.x - 110}
                y={edgeB.y + edgeB.len / 2 - 12}
                width={220}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={edgeB.x}
                y={edgeB.y + edgeB.len / 2}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                getWeather("San Francisco")
              </text>
            </motion.g>
          )}
          
          {active("swToApi") && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={edgeC.x - 100}
                y={edgeC.y + edgeC.len / 2 - 12}
                width={200}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={edgeC.x}
                y={edgeC.y + edgeC.len / 2}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                GET /weather?city=SF
              </text>
            </motion.g>
          )}
          
          {active("apiToSw") && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect 
                x={edgeD.x - 90}
                y={edgeD.y + edgeD.len / 2 - 12}
                width={180}
                height={24}
                rx={12}
                fill={C.labelBg}
                fillOpacity={0.9}
              />
              <text
                x={edgeD.x}
                y={edgeD.y + edgeD.len / 2}
                fill={C.labelText}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="middle"
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
        visible={stepIndex >= 7}  // Show after llmToUser completes
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

/* ========================== Sophisticated Components ========================== */

function Node({
  x,
  y,
  w,
  h,
  label,
  id,
  gradient,
  isActive,
  C,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  id: string;
  gradient: string;
  isActive: boolean;
  C: any;
}) {
  const iconMap: Record<string, string> = {
    user: "👤",
    llm: "🤖",
    sw: "⚙️",
    api: "🌐",
  };
  
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ 
        opacity: { duration: 0.5, delay: 0.2 },
        scale: { duration: 0.3 }
      }}
    >
      {/* Card background with gradient */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={`url(#${gradient})`}
        fillOpacity={isActive ? 1 : 0.9}
        stroke={isActive ? C.pulseGlow : C.cardBorder}
        strokeWidth={isActive ? 2 : 1}
        filter={isActive ? "url(#glow)" : "url(#shadow)"}
      />
      
      {/* Glass overlay effect */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h / 2}
        rx={16}
        fill="white"
        fillOpacity={0.1}
      />
      
      {/* Icon */}
      <text
        x={x + 24}
        y={y + h/2 + 2}
        fontSize="24"
        dominantBaseline="middle"
      >
        {iconMap[id]}
      </text>
      
      {/* Label */}
      <text
        x={x + 60}
        y={y + h/2 + 2}
        fill="white"
        fontSize="16"
        fontWeight="600"
        dominantBaseline="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
      
      {/* Status indicator */}
      <circle
        cx={x + w - 20}
        cy={y + h/2}
        r="4"
        fill={isActive ? "#10ff00" : "#666"}
        filter={isActive ? "url(#pulseGlow)" : "none"}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="4;6;4"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </motion.g>
  );
}

function SpeechBubble({
  x,
  y,
  w,
  text,
  visible,
  cursor,
  C,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  visible: boolean;
  cursor?: boolean;
  C: any;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ 
        left: x, 
        top: y, 
        width: w,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -10
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        style={{
          background: C.messageBg,
          border: `1px solid ${C.messageBorder}`,
          borderRadius: 16,
          padding: "12px 16px",
          boxShadow: `0 4px 12px ${C.cardShadow}`,
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 14,
            lineHeight: 1.6,
            color: C.messageText,
            whiteSpace: "pre-wrap",
          }}
      >
        {text}
        {cursor && (
          <motion.span
              style={{
                display: "inline-block",
                width: 2,
                height: 16,
                backgroundColor: C.pulseColor,
                marginLeft: 2,
                verticalAlign: "text-bottom",
              }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
        
        {/* Subtle tail */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: 24,
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${C.messageBg}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -7,
            left: 24,
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${C.messageBorder}`,
            }}
          />
        </div>
    </motion.div>
  );
}
