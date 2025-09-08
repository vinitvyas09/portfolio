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

export default function IntegrationTaxGif({
  m = 5,
  n = 7,
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

  const beforeDraw = ease(s(t < T1 ? t / beforeMs : t < T2 ? 1 - (t - T1) / xfadeMs : 0));
  const afterDraw  = ease(s(t < T2 ? (t - T1) / xfadeMs : t < T3 ? (t - T2) / afterMs : 1 - (t - T3) / xfadeMs));

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

  // Visual constants
  const C = {
    bg: "#ffffff",
    grid: "#f3f4f6",
    beforeLine: "#cbd5e1",   // slate-300
    afterLine: "#6366f1",    // indigo-500
    client: "#4b5563",       // gray-600
    tool: "#334155",         // slate-700
    hub: "#6d28d9",          // violet-700
    label: "#6b7280",        // gray-500
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
        background: C.bg,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-hidden>
        {/* Soft grid */}
        <g opacity={0.25}>
          <line x1={W * 0.5} y1={0} x2={W * 0.5} y2={H} stroke={C.grid} strokeWidth={1} />
          <line x1={0} y1={H * 0.5} x2={W} y2={H * 0.5} stroke={C.grid} strokeWidth={1} />
        </g>

        {/* BEFORE: dense bipartite edges */}
        <motion.g style={{ opacity: beforeAlpha }}>
          {beforeEdges.map((e, i) => (
            <motion.path
              key={`b-${i}`}
              d={edgePath(e)}
              fill="none"
              stroke={C.beforeLine}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: Math.max(0.0001, beforeDraw) }}
              transition={{ duration: 0 }}
            />
          ))}
        </motion.g>

        {/* AFTER: hub-and-spoke via MCP */}
        <motion.g style={{ opacity: afterAlpha }}>
          {afterEdges.map((e, i) => (
            <motion.path
              key={`a-${i}`}
              d={edgePath(e)}
              fill="none"
              stroke={C.afterLine}
              strokeWidth={2}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: Math.max(0.0001, afterDraw) }}
              transition={{ duration: 0 }}
            />
          ))}
        </motion.g>

        {/* Nodes: clients (left) */}
        {clients.map((p, i) => (
          <g key={`c-${i}`}>
            <circle cx={p.x} cy={p.y} r={10} fill={C.client} />
          </g>
        ))}

        {/* Nodes: tools (right) */}
        {tools.map((p, i) => (
          <g key={`t-${i}`}>
            <circle cx={p.x} cy={p.y} r={10} fill={C.tool} />
          </g>
        ))}

        {/* Hub */}
        <motion.circle
          cx={hub.x}
          cy={hub.y}
          r={18 + 4 * afterAlpha + 2 * hubPulse * afterAlpha}
          fill={C.hub}
          style={{ opacity: 0.9 * afterAlpha }}
        />
        {showLabels && (
          <>
            <text x={leftX} y={42} textAnchor="start" fontSize={22} fill={C.label}>
              LLM clients (5)
            </text>
            <text x={rightX} y={42} textAnchor="end" fontSize={22} fill={C.label}>
              Tools (7)
            </text>
            <motion.text
              x={hub.x}
              y={hub.y + 40}
              textAnchor="middle"
              fontSize={20}
              fill={C.hub}
              style={{ opacity: afterAlpha }}
            >
              MCP server(s)
            </motion.text>
          </>
        )}
      </svg>
    </div>
  );
}
