"use client";
import React from "react";

/**
 * MCP Server — ultra-simple static visualization
 *
 * Concept: many apps at the top and tools at the bottom plug into ONE MCP
 * through a standard MCP "port". Minimal SVG, no animation.
 */
export default function MCPPort({ className }: { className?: string }) {
  const W = 800;
  const H = 600;
  const cx = W / 2;
  const cy = H / 2;

  // Top row: many apps/clients that can use the tool via MCP
  const apps = [
    { id: "gpt", label: "GPT", color: "#111827" },
    { id: "chatgpt", label: "ChatGPT", color: "#10A37F" },
    { id: "claude", label: "Claude", color: "#0F766E" },
    { id: "gemini", label: "Gemini", color: "#2563EB" },
    { id: "copilot", label: "Copilot", color: "#7C3AED" },
    { id: "cursor", label: "Cursor", color: "#DB2777" },
  ] as const;

  // Center: MCP server box
  const box = { x: cx - 180, y: cy - 60, w: 360, h: 120 };
  const slotTop = { x: box.x + 90, y: box.y - 10, w: 180, h: 20 };
  const slotBottom = { x: box.x + 90, y: box.y + box.h - 10, w: 180, h: 20 };

  return (
    <div
      className={["mcp-card", className].filter(Boolean).join(" ")}
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        aspectRatio: `${W} / ${H}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
        {/* Title */}
        <text
          x={cx}
          y={28}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
          fontSize="14"
          fill="#6B7280"
        >
          Apps & Tools connect via MCP
        </text>

        {/* Top: App pills in a horizontal row */}
        {apps.map((a, i) => {
          const pillW = 100;
          const pillH = 28;
          const totalWidth = apps.length * pillW + (apps.length - 1) * 20;
          const startX = cx - totalWidth / 2;
          const x = startX + i * (pillW + 20);
          const y = 60;

          // Connection points on top slot
          const docks = apps.length;
          const span = Math.min(140, slotTop.w - 20);
          const xDock = slotTop.x + 10 + (span * i) / Math.max(1, docks - 1);
          const yDock = slotTop.y + slotTop.h;

          return (
            <g key={a.id}>
              {/* pill */}
              <g transform={`translate(${x}, ${y})`}>
                <rect className="pill" width={pillW} height={pillH} rx={pillH / 2} fill="#F3F4F6" stroke="#E5E7EB" />
                <text className="pill-label" x={pillW / 2} y={pillH / 2 + 5} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI" fontSize="12" fill="#111827">{a.label}</text>
              </g>
              {/* connector line */}
              <line x1={x + pillW / 2} y1={y + pillH + 8} x2={xDock} y2={yDock} stroke={a.color} strokeWidth={3} strokeLinecap="round" />
              <circle cx={xDock} cy={yDock} r={3.5} fill={a.color} />
            </g>
          );
        })}

        {/* Center: MCP Server box */}
        <g>
          <rect className="mcp-box" x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
          {/* MCP chip in center */}
          <rect className="mcp-chip" x={box.x + box.w / 2 - 42} y={box.y + box.h / 2 - 13} width={84} height={26} rx={13} fill="#F3F4F6" />
          <text className="mcp-chip-text" x={box.x + box.w / 2} y={box.y + box.h / 2 + 4} textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="14" fontWeight="600" fill="#111827">MCP</text>
          
          {/* Top slot */}
          <rect x={slotTop.x} y={slotTop.y} width={slotTop.w} height={slotTop.h} rx={10} fill="#111827" opacity={0.9} />
          <rect x={slotTop.x + 18} y={slotTop.y + 4} width={slotTop.w - 36} height={slotTop.h - 8} rx={5} fill="#374151" />
          
          {/* Bottom slot */}
          <rect x={slotBottom.x} y={slotBottom.y} width={slotBottom.w} height={slotBottom.h} rx={10} fill="#111827" opacity={0.9} />
          <rect x={slotBottom.x + 18} y={slotBottom.y + 4} width={slotBottom.w - 36} height={slotBottom.h - 8} rx={5} fill="#374151" />
        </g>

        {/* Bottom: Google Drive */}
        <g>
          {(() => {
            const pillW = 120;
            const pillH = 28;
            const driveX = cx - pillW / 2;
            const driveY = box.y + box.h + 80;
            
            // Connection point on bottom slot
            const connX = slotBottom.x + slotBottom.w / 2;
            const connY = slotBottom.y;
            
            return (
              <>
                {/* Google Drive pill */}
                <g transform={`translate(${driveX}, ${driveY})`}>
                  <rect className="pill" width={pillW} height={pillH} rx={pillH / 2} fill="#F3F4F6" stroke="#E5E7EB" />
                  <text className="pill-label" x={pillW / 2} y={pillH / 2 + 5} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI" fontSize="12" fill="#111827">Google Drive</text>
                </g>
                {/* Connection line from MCP box to Google Drive */}
                <line x1={connX} y1={connY} x2={driveX + pillW / 2} y2={driveY - 8} stroke="#4285F4" strokeWidth={3} strokeLinecap="round" />
                <circle cx={connX} cy={connY} r={3.5} fill="#4285F4" />
              </>
            );
          })()}
        </g>

        {/* Legend at bottom */}
        <text x={cx} y={H - 20} textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="12" fill="#9CA3AF">M apps + N tools → MCP</text>
      </svg>
    </div>
  );
}
