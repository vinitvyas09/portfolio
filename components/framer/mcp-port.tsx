"use client";
import * as React from "react";
import { motion } from "framer-motion";

/**
 * MCPPort — animated, labeled with MCP Client/Server and "MCP Protocol" connectors
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

  // Utility: make a smooth cubic curve from (x1,y1) to (x2,y2)
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const c1 = `${x1},${y1 + 40}`;          // pull down from the pill
    const c2 = `${x2},${y2 - 40}`;          // pull up into the slot
    return `M ${x1},${y1} C ${c1} ${c2} ${x2},${y2}`;
  };

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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block", background: "transparent" }}
      >
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

        {/* --- MCP CLIENTS LABEL --- */}
        <g>
          <rect
            x={cx - 160}
            y={48}
            width={120}
            height={24}
            rx={6}
            fill="#EEF2FF"
            stroke="#C7D2FE"
          />
          <text
            x={cx - 100}
            y={65}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
            fontWeight={600}
            fontSize="11"
            fill="#3730A3"
          >
            MCP Clients
          </text>
        </g>

        {/* Top: App pills in a horizontal row */}
        {apps.map((a, i) => {
          const pillW = 100;
          const pillH = 28;
          const totalWidth = apps.length * pillW + (apps.length - 1) * 20;
          const startX = cx - totalWidth / 2;
          const x = startX + i * (pillW + 20);
          const y = 86;

          // Connection points on top slot
          const docks = apps.length;
          const span = Math.min(140, slotTop.w - 20);
          const xDock = slotTop.x + 10 + (span * i) / Math.max(1, docks - 1);
          const yDock = slotTop.y + slotTop.h;

          const pathId = `conn-${a.id}`;
          const d = curve(x + pillW / 2, y + pillH + 8, xDock, yDock);

          return (
            <g key={a.id}>
              {/* connector path (animated draw) */}
              <motion.path
                id={pathId}
                d={d}
                fill="none"
                stroke={a.color}
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: "easeInOut" }}
              />
              {/* "MCP Protocol" label riding the path */}
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
                fontSize="10"
                fontWeight={600}
                fill="#6B7280"
                pointerEvents="none"
              >
                <textPath href={`#${pathId}`} startOffset="50%">
                  <tspan textAnchor="middle">MCP Protocol</tspan>
                </textPath>
              </motion.text>

              {/* dock point */}
              <circle cx={xDock} cy={yDock} r={3.5} fill={a.color} />

              {/* pill */}
              <motion.g
                transform={`translate(${x}, ${y})`}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
              >
                <rect
                  className="pill"
                  width={pillW}
                  height={pillH}
                  rx={pillH / 2}
                  fill="#F3F4F6"
                  stroke="#E5E7EB"
                />
                <text
                  className="pill-label"
                  x={pillW / 2}
                  y={pillH / 2 + 5}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
                  fontSize="12"
                  fill="#111827"
                >
                  {a.label}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Center: MCP Server box */}
        <motion.g
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <rect
            className="mcp-box"
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx={16}
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="1.5"
          />
          {/* Server label */}
          <text
            x={box.x + 12}
            y={box.y + 22}
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
            fontWeight={600}
            fontSize="12"
            fill="#111827"
          >
            MCP Server
          </text>

          {/* MCP chip in center */}
          <rect
            className="mcp-chip"
            x={box.x + box.w / 2 - 42}
            y={box.y + box.h / 2 - 13}
            width={84}
            height={26}
            rx={13}
            fill="#F3F4F6"
          />
          <text
            className="mcp-chip-text"
            x={box.x + box.w / 2}
            y={box.y + box.h / 2 + 4}
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="14"
            fontWeight="600"
            fill="#111827"
          >
            MCP
          </text>

          {/* Top slot */}
          <rect
            x={slotTop.x}
            y={slotTop.y}
            width={slotTop.w}
            height={slotTop.h}
            rx={10}
            fill="#111827"
            opacity={0.9}
          />
          <rect
            x={slotTop.x + 18}
            y={slotTop.y + 4}
            width={slotTop.w - 36}
            height={slotTop.h - 8}
            rx={5}
            fill="#374151"
          />

          {/* Bottom slot */}
          <rect
            x={slotBottom.x}
            y={slotBottom.y}
            width={slotBottom.w}
            height={slotBottom.h}
            rx={10}
            fill="#111827"
            opacity={0.9}
          />
          <rect
            x={slotBottom.x + 18}
            y={slotBottom.y + 4}
            width={slotBottom.w - 36}
            height={slotBottom.h - 8}
            rx={5}
            fill="#374151"
          />
        </motion.g>

        {/* Bottom: Google Drive (example tool) */}
        <g>
          {(() => {
            const pillW = 120;
            const pillH = 28;
            const driveX = cx - pillW / 2;
            const driveY = box.y + box.h + 80;

            // Connection point on bottom slot
            const connX = slotBottom.x + slotBottom.w / 2;
            const connY = slotBottom.y;

            // Gentle curve downward
            const d = curve(connX, connY, driveX + pillW / 2, driveY - 8);
            const pathId = "conn-drive";

            return (
              <>
                <motion.path
                  id={pathId}
                  d={d}
                  fill="none"
                  stroke="#4285F4"
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.7 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: "easeInOut" }}
                />
                {/* (This one is not MCP; it's the tool/backend side) */}
                <motion.g
                  transform={`translate(${driveX}, ${driveY})`}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                >
                  <rect
                    className="pill"
                    width={pillW}
                    height={pillH}
                    rx={pillH / 2}
                    fill="#F3F4F6"
                    stroke="#E5E7EB"
                  />
                  <text
                    className="pill-label"
                    x={pillW / 2}
                    y={pillH / 2 + 5}
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
                    fontSize="12"
                    fill="#111827"
                  >
                    Google Drive
                  </text>
                </motion.g>
              </>
            );
          })()}
        </g>

        {/* Legend / concise definitions */}
        <g>
          <text
            x={cx}
            y={H - 42}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
            fontSize="11"
            fill="#6B7280"
          >
            MCP Client: runs in the model host and speaks MCP.
          </text>
          <text
            x={cx}
            y={H - 24}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI"
            fontSize="11"
            fill="#6B7280"
          >
            MCP Server: external process exposing tools/resources over MCP.
          </text>
        </g>
      </svg>
    </div>
  );
}
