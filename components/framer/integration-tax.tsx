"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * Framer Motion loop: "Integration Tax — Dense Connections (M×N)"
 * - SVG 1200×675 (scales with container), 4.5s loop (3s animation + 1.5s pause)
 * - Shows dense bipartite (m×n) edges between LLM clients ↔ tools
 * - Animates lines drawing from left to right
 * - Pauses briefly, then restarts
 * - Minimal labels, no headings; drop into a page, screen‑record to GIF
 *
 * Quick use:
 *   <IntegrationTaxGif m={5} n={7} />
 */

type Props = {
  m?: number;               // number of LLM clients (left)
  n?: number;               // number of tools (right)
  className?: string;
  showLabels?: boolean;
};

export default function IntegrationTaxMcpGif({
  m = 3,
  n = 8,
  className,
  showLabels = true,
}: Props) {
  const W = 1200;
  const H = 675;
  const animDuration = 3000;  // Animation duration
  const pauseDuration = 1500;  // Pause duration
  const totalMs = animDuration + pauseDuration;

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

  // Timeline → animation state
  const t = now;
  const s = (x: number) => Math.min(1, Math.max(0, x));
  const ease = (x: number) => x * x * (3 - 2 * x); // smoothstep

  // Simple animation: draw lines during animation phase, then pause
  const isAnimating = t < animDuration;
  const animProgress = isAnimating ? t / animDuration : 1;
  
  // Draw lines progressively during animation, keep them during pause
  const lineDraw = isAnimating ? ease(s(animProgress)) : 1;

  // Layout
  const marginX = 140;
  const top = 90;
  const bottom = 90;
  const leftX = marginX;
  const rightX = W - marginX;

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
  const edges: Edge[] = useMemo(() => {
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

  // Visual constants - enhanced color palette
  const C = {
    bg: "#fafafa",
    grid: "#e5e7eb",
    line: "#94a3b8",         // slate-400 (visible connections)
    progressBar: "#4f46e5",  // indigo-600 (progress indicator)
    client: "#7c3aed",       // violet-600 (more vibrant)
    clientShadow: "#ddd6fe", // violet-200
    tool: "#0891b2",         // cyan-600 (more distinct)
    toolShadow: "#cffafe",   // cyan-100
    label: "#475569",        // slate-600 (better contrast)
  };

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

        {/* Dense bipartite edges */}
        <g style={{ opacity: 0.7 }}>
          {edges.map((e, i) => {
            const len = Math.sqrt((e.x2 - e.x1) ** 2 + (e.y2 - e.y1) ** 2);
            const dashLength = len;
            const dashOffset = dashLength * (1 - lineDraw);
            
            return (
              <path
                key={`edge-${i}`}
                d={edgePath(e)}
                fill="none"
                stroke={C.line}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={dashLength}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </g>

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

        {showLabels && (
          <>
            <text x={leftX} y={42} textAnchor="start" fontSize={24} fontWeight="600" fill={C.label}>
              LLM clients ({m})
            </text>
            <text x={rightX} y={42} textAnchor="end" fontSize={24} fontWeight="600" fill={C.label}>
              Tools ({n})
            </text>
            {/* Phase indicator */}
            <text x={W/2} y={H - 30} textAnchor="middle" fontSize={16} fill={C.label} opacity={0.7}>
              {isAnimating ? `Integration Tax: ${m}×${n} = ${m*n} connections` : "Pausing..."}
            </text>
            {/* Progress bar */}
            <rect x={W/2 - 100} y={H - 15} width={200} height={4} fill={C.grid} rx={2} />
            <rect x={W/2 - 100} y={H - 15} width={200 * (t / totalMs)} height={4} fill={C.progressBar} rx={2} />
          </>
        )}
      </svg>
    </div>
  );
}
