"use client";
import React from "react";

/**
 * MCP Server (Drive) — ultra-simple static visualization
 *
 * Concept: many apps on the left plug into ONE tool on the right
 * through a standard MCP "port". Minimal SVG, no animation.
 */
export default function MCPPort({ className }: { className?: string }) {
  const W = 1000;
  const H = 380;
  const cx = W / 2;
  const cy = H / 2;

  // Left column: many apps/clients that can use the same tool via MCP
  const apps = [
    { id: "gpt", label: "GPT", color: "#111827" },
    { id: "claude", label: "Claude", color: "#0F766E" },
    { id: "gemini", label: "Gemini", color: "#2563EB" },
    { id: "copilot", label: "Copilot", color: "#7C3AED" },
    { id: "cursor", label: "Cursor", color: "#DB2777" },
  ] as const;

  // Layout for left app pills
  const leftX = 80;
  const topY = 60;
  const rowGap = 48;

  // Right: single MCP server box for Drive
  const box = { x: W - 420, y: cy - 100, w: 360, h: 200 };
  const slot = { x: box.x + 110, y: box.y + box.h / 2 - 10, w: 180, h: 20 };

  return (
    <div
      className={className}
      style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
        {/* Title */}
        <text
          x={20}
          y={28}
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
          fontSize="14"
          fill="#6B7280"
        >
          Many apps → one tool via MCP
        </text>

        {/* Right: MCP Server box (for Drive) */}
        <g>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#FFFFFF" stroke="#E5E7EB" />
          {/* MCP chip */}
          <rect x={box.x + box.w / 2 - 42} y={box.y + 16} width={84} height={26} rx={13} fill="#F3F4F6" />
          <text x={box.x + box.w / 2} y={box.y + 34} textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="13" fill="#111827">MCP</text>
          {/* Slot */}
          <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} rx={10} fill="#111827" opacity={0.9} />
          <rect x={slot.x + 18} y={slot.y + 4} width={slot.w - 36} height={slot.h - 8} rx={5} fill="#374151" />
          {/* Tool label */}
          <text x={box.x + box.w / 2} y={box.y + box.h - 16} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI" fontSize="13" fill="#4B5563">Drive (tool)</text>
        </g>

        {/* Left: app pills and connectors into the slot */}
        {apps.map((a, i) => {
          const pillW = 120;
          const pillH = 28;
          const x = leftX;
          const y = topY + i * rowGap;

          // start of line at right edge of pill
          const x1 = x + pillW + 12;
          const y1 = y + pillH / 2;

          // distribute docks along the slot vertically
          const docks = apps.length;
          const span = Math.min(96, slot.h + 96); // keep tidy
          const yDock = slot.y + slot.h / 2 - span / 2 + (span * i) / Math.max(1, docks - 1);
          const xDock = slot.x; // left edge of slot

          return (
            <g key={a.id}>
              {/* pill */}
              <g transform={`translate(${x}, ${y})`}>
                <rect width={pillW} height={pillH} rx={pillH / 2} fill="#F3F4F6" stroke="#E5E7EB" />
                <text x={pillW / 2} y={pillH / 2 + 5} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI" fontSize="12" fill="#111827">{a.label}</text>
              </g>
              {/* connector line */}
              <line x1={x1} y1={y1} x2={xDock} y2={yDock} stroke={a.color} strokeWidth={3.5} strokeLinecap="round" />
              <circle cx={xDock} cy={yDock} r={4} fill={a.color} />
            </g>
          );
        })}

        {/* Legend: M+N intuition at bottom-right (optional subtle) */}
        <text x={box.x + box.w} y={H - 16} textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="12" fill="#9CA3AF">M apps + 1 tool → MCP</text>
      </svg>
    </div>
  );
}
