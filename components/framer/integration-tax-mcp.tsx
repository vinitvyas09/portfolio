"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * Framer Motion loop: "Integration Tax — Before/After (M×N → m+n via MCP)"
 * - SVG 1200×675 (scales with container), seamless 8s loop
 * - Phase A: dense bipartite (m×n) edges between LLM clients ↔ tools
 * - Crossfade
 * - Phase B: hub "MCP server(s)" between them; only m + n edges
 * - Minimal labels, no headings; drop into a page, screen‑record to GIF
 *
 * Quick use:
 *   <IntegrationTaxGif m={5} n={7} />
 */

type Props = {
  m?: number;               // number of LLM clients (left)
  n?: number;               // number of tools (right)
  beforeMs?: number;        // duration of "before" phase
  afterMs?: number;         // duration of "after" phase
  xfadeMs?: number;         // crossfade duration
  className?: string;
  showLabels?: boolean;
};

export default function IntegrationTaxMcpGif({
  m = 3,
  n = 8,
  beforeMs = 3000,
  afterMs = 3000,
  xfadeMs = 1000,
  className,
  showLabels = true,
}: Props) {
  const W = 1200;
  const H = 675;
  const totalMs = beforeMs + xfadeMs + afterMs + xfadeMs;

  const [now, setNow] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = (t - start) % totalMs;
      setNow(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalMs]);

  // Timeline → alphas
  const t = now;
  const T1 = beforeMs;
  const T2 = T1 + xfadeMs;
  const T3 = T2 + afterMs;
  const T4 = T3 + xfadeMs;

  const s = (x: number) => Math.min(1, Math.max(0, x));
  const ease = (x: number) => x * x * (3 - 2 * x); // smoothstep

  const beforeAlpha =
    t < T1 ? 1 :
    t < T2 ? 1 - (t - T1) / xfadeMs :
    t < T3 ? 0 :
    0 + (t - T3) / xfadeMs;
  const afterAlpha =
    t < T1 ? 0 :
    t < T2 ? (t - T1) / xfadeMs :
    t < T3 ? 1 :
    1 - (t - T3) / xfadeMs;

  // Draw behavior: grow left→right, then disappear (no reverse "undraw").
  // - BEFORE edges: 0→1 during T0..T1, hold at 1 during T1..T2, hidden afterwards until next loop
  // - AFTER edges:  0→1 during T1..T2, continue to 1 during T2..T3, hold at 1 during T3..T4 (fade out via alpha)
  const beforeDraw =
    t < T1 ? ease(s(t / beforeMs)) :
    t < T2 ? 1 :
    0;
  const afterDraw =
    t < T2 ? ease(s((t - T1) / xfadeMs)) :
    t < T3 ? ease(s((t - T2) / afterMs)) :
    1;

  // Layout
  const marginX = 140;
  const top = 90;
  const bottom = 90;
  const leftX = marginX;
  const rightX = W - marginX;
  const hub = { x: W * 0.5, y: H * 0.5 };

  const clients = useMemo(() => {
    const count = Math.max(1, m);
    const span = H - top - bottom;
    const step = count > 1 ? span / (count - 1) : 0;
    return Array.from({ length: count }, (_, i) => ({
      x: leftX,
      y: top + i * step,
    }));
  }, [m]);

  const tools = useMemo(() => {
    const count = Math.max(1, n);
    const span = H - top - bottom;
    const step = count > 1 ? span / (count - 1) : 0;
    return Array.from({ length: count }, (_, i) => ({
      x: rightX,
      y: top + i * step,
    }));
  }, [n]);

  // Edges
  type Edge = { x1: number; y1: number; x2: number; y2: number };
  const beforeEdges: Edge[] = useMemo(() => {
    const out: Edge[] = [];
    for (let i = 0; i < clients.length; i++) {
      for (let j = 0; j < tools.length; j++) {
        out.push({
          x1: clients[i].x,
          y1: clients[i].y,
          x2: tools[j].x,
          y2: tools[j].y,
        });
      }
    }
    return out;
  }, [clients, tools]);

  const afterEdges: Edge[] = useMemo(() => {
    const out: Edge[] = [];
    for (let i = 0; i < clients.length; i++) {
      out.push({ x1: clients[i].x, y1: clients[i].y, x2: hub.x, y2: hub.y });
    }
    for (let j = 0; j < tools.length; j++) {
      out.push({ x1: hub.x, y1: hub.y, x2: tools[j].x, y2: tools[j].y });
    }
    return out;
  }, [clients, tools]);

  // Visual constants - enhanced color palette
  const C = {
    bg: "#fafafa",
    grid: "#e5e7eb",
    beforeLine: "#94a3b8",   // slate-400 (more visible)
    afterLine: "#4f46e5",    // indigo-600 (richer)
    client: "#7c3aed",       // violet-600 (more vibrant)
    clientShadow: "#ddd6fe", // violet-200
    tool: "#0891b2",         // cyan-600 (more distinct)
    toolShadow: "#cffafe",   // cyan-100
    hub: "#dc2626",          // red-600 (strong focal point)
    hubGlow: "#fca5a5",      // red-300
    label: "#475569",        // slate-600 (better contrast)
  };

  const hubPulse =
    0.5 + 0.5 * Math.sin(((now / 1000) * 2 * Math.PI) / 2); // gentle 0..1

  // Helpers
  const edgePath = (e: Edge) => `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        aspectRatio: "1200 / 675",
        background: `linear-gradient(135deg, ${C.bg} 0%, #f3f4f6 100%)`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-hidden>
        {/* Define gradients and filters */}
        <defs>
          <linearGradient id="clientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="toolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <radialGradient id="hubGrad">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Soft grid with pattern */}
        <g opacity={0.15}>
          <line x1={W * 0.5} y1={0} x2={W * 0.5} y2={H} stroke={C.grid} strokeWidth={1} strokeDasharray="5,5" />
          <line x1={0} y1={H * 0.5} x2={W} y2={H * 0.5} stroke={C.grid} strokeWidth={1} strokeDasharray="5,5" />
          {/* Additional grid lines for depth */}
          <line x1={W * 0.25} y1={0} x2={W * 0.25} y2={H} stroke={C.grid} strokeWidth={0.5} strokeDasharray="2,8" />
          <line x1={W * 0.75} y1={0} x2={W * 0.75} y2={H} stroke={C.grid} strokeWidth={0.5} strokeDasharray="2,8" />
        </g>

        {/* BEFORE: dense bipartite edges */}
        <motion.g style={{ opacity: beforeAlpha * 0.7 }}>
          {beforeEdges.map((e, i) => (
            <motion.path
              key={`b-${i}`}
              d={edgePath(e)}
              fill="none"
              stroke={C.beforeLine}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="5,3"
              initial={false}
              animate={{ pathLength: Math.max(0.0001, beforeDraw) }}
              transition={{ duration: 0 }}
            />
          ))}
        </motion.g>

        {/* AFTER: hub-and-spoke via MCP */}
        <motion.g style={{ opacity: afterAlpha }}>
          {afterEdges.map((e, i) => (
            <g key={`a-${i}`}>
              {/* Glow effect for the lines */}
              <motion.path
                d={edgePath(e)}
                fill="none"
                stroke={C.afterLine}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.3}
                initial={false}
                animate={{ pathLength: Math.max(0.0001, afterDraw) }}
                transition={{ duration: 0 }}
                filter="url(#glow)"
              />
              <motion.path
                d={edgePath(e)}
                fill="none"
                stroke={C.afterLine}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: Math.max(0.0001, afterDraw) }}
                transition={{ duration: 0 }}
              />
            </g>
          ))}
        </motion.g>

        {/* Nodes: clients (left) */}
        {clients.map((p, i) => (
          <g key={`c-${i}`}>
            {/* Shadow/glow */}
            <circle cx={p.x} cy={p.y} r={14} fill={C.clientShadow} opacity={0.3} />
            {/* Main node with gradient */}
            <circle cx={p.x} cy={p.y} r={11} fill="url(#clientGrad)" filter="url(#shadow)" />
            {/* Inner highlight */}
            <circle cx={p.x - 2} cy={p.y - 2} r={3} fill="white" opacity={0.5} />
          </g>
        ))}

        {/* Nodes: tools (right) */}
        {tools.map((p, i) => (
          <g key={`t-${i}`}>
            {/* Shadow/glow */}
            <circle cx={p.x} cy={p.y} r={14} fill={C.toolShadow} opacity={0.3} />
            {/* Main node with gradient */}
            <circle cx={p.x} cy={p.y} r={11} fill="url(#toolGrad)" filter="url(#shadow)" />
            {/* Inner highlight */}
            <circle cx={p.x - 2} cy={p.y - 2} r={3} fill="white" opacity={0.5} />
          </g>
        ))}

        {/* Hub */}
        <motion.g style={{ opacity: afterAlpha }}>
          {/* Outer glow */}
          <motion.circle
            cx={hub.x}
            cy={hub.y}
            r={25 + 8 * hubPulse}
            fill={C.hubGlow}
            opacity={0.3 + 0.2 * hubPulse}
            filter="url(#glow)"
          />
          {/* Mid ring */}
          <motion.circle
            cx={hub.x}
            cy={hub.y}
            r={20 + 4 * hubPulse}
            fill="none"
            stroke={C.hub}
            strokeWidth={2}
            opacity={0.5}
          />
          {/* Main hub */}
          <motion.circle
            cx={hub.x}
            cy={hub.y}
            r={18 + 2 * hubPulse}
            fill="url(#hubGrad)"
            filter="url(#shadow)"
          />
          {/* Inner highlight */}
          <motion.circle
            cx={hub.x - 3}
            cy={hub.y - 3}
            r={5}
            fill="white"
            opacity={0.6}
          />
        </motion.g>
        {showLabels && (
          <>
            <text x={leftX} y={42} textAnchor="start" fontSize={24} fontWeight="600" fill={C.label}>
              LLM clients ({m})
            </text>
            <text x={rightX} y={42} textAnchor="end" fontSize={24} fontWeight="600" fill={C.label}>
              Tools ({n})
            </text>
            <motion.text
              x={hub.x}
              y={hub.y + 45}
              textAnchor="middle"
              fontSize={22}
              fontWeight="bold"
              fill={C.hub}
              style={{ opacity: afterAlpha }}
            >
              MCP server
            </motion.text>
          </>
        )}
      </svg>
    </div>
  );
}
