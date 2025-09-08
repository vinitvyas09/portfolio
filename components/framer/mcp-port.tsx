"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MCPArchitectureDiagram({ className }: { className?: string }) {
  const W = 1400;
  const H = 900;
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const slideFromLeft = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };
  
  const slideFromRight = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };
  
  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };
  
  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  } as const;

  // Define the 3 LLM agents
  const agents = [
    { id: 'chat', name: 'Chat App', icon: '💬', color: '#4a9eff' },
    { id: 'ide', name: 'IDE Agent', icon: '🔧', color: '#ff6b6b' },
    { id: 'helpdesk', name: 'Helpdesk Agent', icon: '🎧', color: '#ffd93d' }
  ];

  // Define the 8 tools/servers
  const tools = [
    { id: 'search', name: 'Search', icon: '🔍', color: '#4285f4' },
    { id: 'db', name: 'Database', icon: '🗄️', color: '#336791' },
    { id: 'github', name: 'GitHub', icon: '🐙', color: '#24292e' },
    { id: 'email', name: 'Email', icon: '📧', color: '#ea4335' },
    { id: 'calendar', name: 'Calendar', icon: '📅', color: '#0f9d58' },
    { id: 'payments', name: 'Payments', icon: '💳', color: '#635bff' },
    { id: 'analytics', name: 'Analytics', icon: '📊', color: '#ff6900' },
    { id: 'internal', name: 'Internal Services', icon: '⚙️', color: '#6b7280' }
  ];

  // Define which tools each agent connects to (3-4 each)
  const connections: Record<string, string[]> = {
    'chat': ['search', 'db', 'calendar', 'analytics'],
    'ide': ['github', 'db', 'internal'],
    'helpdesk': ['email', 'db', 'payments', 'analytics']
  };

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        aspectRatio: `${W} / ${H}`,
        borderRadius: 16,
        background: "#1a1a1a",
        padding: "20px",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          {/* Gradient for MCP Host box */}
          <linearGradient id="hostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
          
          {/* Glow effect for servers */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <text x={W/2} y={40} fill="#888" fontSize="18" fontWeight="500" textAnchor="middle">
          3 LLM Agents × 8 Tools via MCP
        </text>

        {/* MCP Host Container */}
        <motion.g
          initial="hidden"
          animate="visible"
          variants={slideFromLeft}
          transition={{ duration: 0.5 }}
        >
          <rect
            x={50}
            y={80}
            width={320}
            height={700}
            rx={12}
            fill="url(#hostGradient)"
            stroke="#3a3a3a"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          
          <text x={70} y={110} fill="#888" fontSize="16" fontWeight="500">
            MCP Host
          </text>
          
          {/* LLM Agents */}
          {agents.map((agent, i) => (
            <g key={agent.id} transform={`translate(90, ${150 + i * 200})`}>
              <motion.rect
                variants={scaleIn}
                transition={{ delay: 0.3 + i * 0.1 }}
                x={0}
                y={0}
                width={240}
                height={140}
                rx={8}
                fill="#2a2a2a"
                stroke="#444"
              />
              <text x={15} y={35} fontSize="24">
                {agent.icon}
              </text>
              <text x={50} y={35} fill={agent.color} fontSize="16" fontWeight="600">
                {agent.name}
              </text>
              <rect x={15} y={60} width={210} height={35} rx={4} fill="#00a67e" />
              <text x={120} y={82} fill="white" fontSize="14" fontWeight="500" textAnchor="middle">
                MCP Client
              </text>
              <text x={15} y={120} fill="#666" fontSize="11">
                Connects to {connections[agent.id].length} MCP servers →
              </text>
            </g>
          ))}
        </motion.g>

        {/* MCP Servers */}
        <motion.g
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {tools.map((tool, i) => {
            const y = 100 + i * 95;
            return (
              <g key={tool.id} transform={`translate(600, ${y})`}>
                <rect
                  x={0}
                  y={0}
                  width={180}
                  height={70}
                  rx={8}
                  fill="#1e3a4a"
                  stroke="#2a5a7a"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                <rect x={10} y={12} width={6} height={6} rx={1} fill="#00ff88" />
                <rect x={10} y={22} width={6} height={6} rx={1} fill="#00ff88" />
                <rect x={10} y={32} width={6} height={6} rx={1} fill="#00ff88" />
                <rect x={22} y={12} width={30} height={3} rx={1} fill="#2a5a7a" />
                <rect x={22} y={22} width={40} height={3} rx={1} fill="#2a5a7a" />
                <rect x={22} y={32} width={25} height={3} rx={1} fill="#2a5a7a" />
                <text x={90} y={52} fill="#8ab4c4" fontSize="13" fontWeight="500" textAnchor="middle">
                  MCP Server
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* Tools/Resources on the right - Made wider */}
        <motion.g
          initial="hidden"
          animate="visible"
          variants={slideFromRight}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {tools.map((tool, i) => {
            const y = 100 + i * 95;
            return (
              <g key={tool.id} transform={`translate(900, ${y})`}>
                <rect 
                  x={0} 
                  y={0} 
                  width={260} 
                  height={70} 
                  rx={8} 
                  fill={tool.color} 
                  opacity={0.9}
                />
                <text x={20} y={40} fontSize="28">
                  {tool.icon}
                </text>
                <text x={60} y={40} fill="white" fontSize="16" fontWeight="500">
                  {tool.name}
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* Connection Lines - Selective connections based on the connections map */}
        <g>
          {agents.map((agent, agentIdx) => {
            const agentY = 220 + agentIdx * 200;
            const agentX = 330;
            
            return connections[agent.id].map((toolId: string, connIdx: number) => {
              const toolIdx = tools.findIndex(t => t.id === toolId);
              const serverY = 135 + toolIdx * 95;
              const serverX = 600;
              
              // Calculate control points for curved paths
              const midX = (agentX + serverX) / 2;
              
              return (
                <g key={`${agent.id}-${toolId}`}>
                  <motion.path
                    d={`M ${agentX} ${agentY} Q ${midX} ${agentY} ${serverX} ${serverY}`}
                    stroke={agent.color}
                    strokeWidth="1.5"
                    fill="none"
                    opacity={0.6}
                    initial="hidden"
                    animate="visible"
                    variants={drawLine}
                    transition={{ delay: 0.8 + agentIdx * 0.2 + connIdx * 0.1 }}
                  />
                </g>
              );
            });
          })}
          
          {/* MCP Protocol labels - one for each agent's bundle of connections */}
          {agents.map((agent, idx) => (
            <motion.text
              key={`protocol-${agent.id}`}
              x={465}
              y={220 + idx * 200}
              fill="#00a67e"
              fontSize="11"
              fontWeight="500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              textAnchor="middle"
            >
              MCP Protocol
            </motion.text>
          ))}
        </g>

        {/* Server to Tool connections (dashed lines) */}
        <g>
          {tools.map((tool, i) => {
            const y = 135 + i * 95;
            return (
              <motion.line
                key={`server-tool-${tool.id}`}
                x1={780}
                y1={y}
                x2={900}
                y2={y}
                stroke="#666"
                strokeWidth="2"
                strokeDasharray="5 5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + i * 0.05 }}
              />
            );
          })}
        </g>

        {/* Bottom text */}
        <text x={W/2} y={H - 20} fill="#666" fontSize="14" textAnchor="middle">
          MCP enables flexible tool access: agents connect only to the tools they need
        </text>
      </svg>
    </div>
  );
}