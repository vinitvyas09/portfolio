"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export default function MCPArchitectureDiagram({ className }: { className?: string }) {
  const W = 1400;
  const H = 900;
  
  // Theme handling (match pattern used in other components)
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  
  // Animation state
  const [activeConnections, setActiveConnections] = useState<Array<{
    id: string;
    agent: string;
    tool: string;
    startTime: number;
  }>>([]);
  
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Theme-aware palette
  const C = useMemo(() => {
    // Default to light before mount to avoid hydration mismatch
    if (!mounted) {
      return {
        bg1: "#fafafa",
        bg2: "#f3f4f6",
        textMuted: "#475569",
        cardFill: "#ffffff",
        cardStroke: "#e5e7eb",
        hostGrad1: "#f3f4f6",
        hostGrad2: "#e5e7eb",
        hostStroke: "#e5e7eb",
        serverFill: "#e6f3f9",
        serverStroke: "#b6d3e4",
        serverText: "#346c80",
        serverDash: "#b6d3e4",
        serverLed: "#00c16a",
        dashedConn: "#a3a3a3",
        footer: "#475569",
        protocol: "#00a67e",
        clientPill: "#00a67e",
        clientPillText: "#ffffff",
        title: "#64748b",
        highlightStroke: "#00a67e",
        pulseColor: "#00ff88",
      };
    }
    return isDark
      ? {
          // Dark theme
          bg1: "#0f0f10",
          bg2: "#18181b",
          textMuted: "#a1a1aa",
          cardFill: "#2a2a2a",
          cardStroke: "#444",
          hostGrad1: "#2a2a2a",
          hostGrad2: "#1a1a1a",
          hostStroke: "#3a3a3a",
          serverFill: "#1e3a4a",
          serverStroke: "#2a5a7a",
          serverText: "#8ab4c4",
          serverDash: "#2a5a7a",
          serverLed: "#00ff88",
          dashedConn: "#666",
          footer: "#666",
          protocol: "#00a67e",
          clientPill: "#00a67e",
          clientPillText: "#ffffff",
          title: "#888",
          highlightStroke: "#00ff88",
          pulseColor: "#00ff88",
        }
      : {
          // Light theme
          bg1: "#fafafa",
          bg2: "#f3f4f6",
          textMuted: "#475569",
          cardFill: "#ffffff",
          cardStroke: "#e5e7eb",
          hostGrad1: "#f3f4f6",
          hostGrad2: "#e5e7eb",
          hostStroke: "#e5e7eb",
          serverFill: "#e6f3f9",
          serverStroke: "#b6d3e4",
          serverText: "#346c80",
          serverDash: "#b6d3e4",
          serverLed: "#00c16a",
          dashedConn: "#a3a3a3",
          footer: "#475569",
          protocol: "#10b981",
          clientPill: "#10b981",
          clientPillText: "#ffffff",
          title: "#64748b",
          highlightStroke: "#10b981",
          pulseColor: "#10b981",
        };
  }, [isDark, mounted]);
  
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
    { id: 'helpdesk', name: 'Helpdesk Agent', icon: '🎧', color: '#ffa93d' }
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
  
  // Helper function to calculate position on quadratic bezier curve
  const getQuadraticPoint = (t: number, p0: {x: number, y: number}, p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    return { x, y };
  };
  
  // Start random animations
  useEffect(() => {
    if (!mounted) return;
    
    const startRandomAnimation = () => {
      // Clean up old connections (remove those older than 9.5 seconds to ensure full animation completes)
      setActiveConnections(prev => prev.filter(conn => Date.now() - conn.startTime < 9500));
      
      // Pick a random agent
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const availableTools = connections[randomAgent.id];
      const randomTool = availableTools[Math.floor(Math.random() * availableTools.length)];
      
      // Add new connection (allow multiple connections per agent)
      setActiveConnections(prev => {
        const newConnection = {
          id: `${randomAgent.id}-${randomTool}-${Date.now()}`,
          agent: randomAgent.id,
          tool: randomTool,
          startTime: Date.now()
        };
        
        return [...prev, newConnection];
      });
    };
    
    // Start animations after initial render
    const initialDelay = setTimeout(() => {
      startRandomAnimation();
      animationIntervalRef.current = setInterval(startRandomAnimation, 1800);
    }, 2000);
    
    return () => {
      clearTimeout(initialDelay);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [mounted]);
  
  // Force re-render to update highlights
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 50);
    return () => clearInterval(interval);
  }, []);
  
  // Helper function to check if a box is active based on animation timing
  const isAgentActive = (agentId: string) => {
    return activeConnections.some(conn => {
      if (conn.agent !== agentId) return false;
      const elapsed = Date.now() - conn.startTime;
      // Active at start (0-600ms) and when return pulse arrives (8500-9100ms)
      return (elapsed >= 0 && elapsed <= 600) || (elapsed >= 8500 && elapsed <= 9100);
    });
  };
  
  const isServerActive = (toolId: string) => {
    return activeConnections.some(conn => {
      if (conn.tool !== toolId) return false;
      const elapsed = Date.now() - conn.startTime;
      // Active when forward pulse arrives (1500-2500ms) and when return pulse arrives (6000-7000ms)
      return (elapsed >= 1500 && elapsed <= 2500) || (elapsed >= 6000 && elapsed <= 7000);
    });
  };
  
  const isToolActive = (toolId: string) => {
    return activeConnections.some(conn => {
      if (conn.tool !== toolId) return false;
      const elapsed = Date.now() - conn.startTime;
      // Active when forward pulse arrives (4000-4500ms)
      return elapsed >= 4000 && elapsed <= 4500;
    });
  };

  // Placeholder to avoid SSR/CSR theme mismatch flash
  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
          aspectRatio: `${W} / ${H}`,
          borderRadius: 16,
          background: "transparent",
          padding: "20px",
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        aspectRatio: `${W} / ${H}`,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${C.bg1} 0%, ${C.bg2} 100%)`,
        padding: "20px",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          {/* Gradient for MCP Host box */}
          <linearGradient id="hostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.hostGrad1} />
            <stop offset="100%" stopColor={C.hostGrad2} />
          </linearGradient>
          
          {/* Glow effect for servers */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Pulse glow effect */}
          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <text x={W/2} y={40} fill={C.title} fontSize="18" fontWeight="500" textAnchor="middle">
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
            stroke={C.hostStroke}
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          
          <text x={70} y={110} fill={C.textMuted} fontSize="16" fontWeight="500">
            MCP Host
          </text>
          
          {/* LLM Agents */}
          {agents.map((agent, i) => {
            const isActive = isAgentActive(agent.id);
            return (
              <g key={agent.id} transform={`translate(90, ${150 + i * 200})`}>
                <motion.rect
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  x={0}
                  y={0}
                  width={240}
                  height={140}
                  rx={8}
                  fill={C.cardFill}
                  stroke={isActive ? C.highlightStroke : C.cardStroke}
                  strokeWidth={isActive ? 2 : 1}
                />
              <text x={15} y={35} fontSize="24">
                {agent.icon}
              </text>
              <text x={50} y={35} fill={agent.color} fontSize="16" fontWeight="600">
                {agent.name}
              </text>
              <rect x={15} y={60} width={210} height={35} rx={4} fill={C.clientPill} />
              <text x={120} y={82} fill={C.clientPillText} fontSize="14" fontWeight="500" textAnchor="middle">
                MCP Client
              </text>
              <text x={15} y={120} fill={C.textMuted} fontSize="11">
                Connects to {connections[agent.id].length} MCP servers →
              </text>
            </g>
            );
          })}
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
            const isActive = isServerActive(tool.id);
            return (
              <g key={tool.id} transform={`translate(600, ${y})`}>
                <motion.rect
                  x={0}
                  y={0}
                  width={180}
                  height={70}
                  rx={8}
                  fill={C.serverFill}
                  stroke={isActive ? C.highlightStroke : C.serverStroke}
                  strokeWidth={isActive ? "2" : "1.5"}
                  filter="url(#glow)"
                  animate={{
                    stroke: isActive ? C.highlightStroke : C.serverStroke,
                    strokeWidth: isActive ? 2 : 1.5,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <rect x={10} y={12} width={6} height={6} rx={1} fill={C.serverLed} />
                <rect x={10} y={22} width={6} height={6} rx={1} fill={C.serverLed} />
                <rect x={10} y={32} width={6} height={6} rx={1} fill={C.serverLed} />
                <rect x={22} y={12} width={30} height={3} rx={1} fill={C.serverDash} />
                <rect x={22} y={22} width={40} height={3} rx={1} fill={C.serverDash} />
                <rect x={22} y={32} width={25} height={3} rx={1} fill={C.serverDash} />
                <text x={90} y={52} fill={C.serverText} fontSize="13" fontWeight="500" textAnchor="middle">
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
            const isActive = isToolActive(tool.id);
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
                  stroke={isActive ? C.highlightStroke : tool.color}
                  strokeWidth={isActive ? 3 : 0}
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
              fill={C.protocol}
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
                stroke={C.dashedConn}
                strokeWidth="2"
                strokeDasharray="5 5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + i * 0.05 }}
              />
            );
          })}
        </g>
        
        {/* Animated Pulses */}
        <AnimatePresence>
          {activeConnections.map(conn => {
            const agentIdx = agents.findIndex(a => a.id === conn.agent);
            const toolIdx = tools.findIndex(t => t.id === conn.tool);
            
            const agentY = 220 + agentIdx * 200;
            const agentX = 330;
            const serverY = 135 + toolIdx * 95;
            const serverX = 600;
            const toolX = 900;
            const midX = (agentX + serverX) / 2;
            
            // Define path waypoints for smooth animation
            const p0 = { x: agentX, y: agentY };
            const p1 = { x: midX, y: agentY };
            const p2 = { x: serverX, y: serverY };
            
            // Generate smooth curve points
            const curvePoints = 20;
            const xPoints = [];
            const yPoints = [];
            for (let i = 0; i <= curvePoints; i++) {
              const t = i / curvePoints;
              const point = getQuadraticPoint(t, p0, p1, p2);
              xPoints.push(point.x);
              yPoints.push(point.y);
            }
            
            return (
              <g key={`pulse-${conn.id}`}>
                {/* Forward pulse: Agent → Server */}
                <motion.circle
                  r="6"
                  fill={C.pulseColor}
                  filter="url(#pulseGlow)"
                  initial={{ x: p0.x, y: p0.y, opacity: 1 }}
                  animate={{
                    x: xPoints,
                    y: yPoints,
                    opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
                
                {/* Forward pulse: Server → Tool */}
                <motion.circle
                  r="6"
                  fill={C.pulseColor}
                  filter="url(#pulseGlow)"
                  initial={{ x: 780, y: serverY, opacity: 0 }}
                  animate={{ 
                    x: toolX,
                    y: serverY,
                    opacity: [0, 1, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 2.5,
                    ease: "linear"
                  }}
                />
                
                {/* Return pulse: Tool → Server */}
                <motion.circle
                  r="6"
                  fill={C.pulseColor}
                  filter="url(#pulseGlow)"
                  initial={{ x: toolX, y: serverY, opacity: 0 }}
                  animate={{ 
                    x: 780,
                    y: serverY,
                    opacity: [0, 1, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 4.5,
                    ease: "linear"
                  }}
                />
                
                {/* Return pulse: Server → Agent */}
                <motion.circle
                  r="6"
                  fill={C.pulseColor}
                  filter="url(#pulseGlow)"
                  initial={{ x: p2.x, y: p2.y, opacity: 0 }}
                  animate={{
                    x: [...xPoints].reverse(),
                    y: [...yPoints].reverse(),
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 7,
                    ease: "linear"
                  }}
                />
              </g>
            );
          })}
        </AnimatePresence>

        {/* Bottom text */}
        <text x={W/2} y={H - 20} fill={C.footer} fontSize="14" textAnchor="middle">
          MCP enables flexible tool access: agents connect only to the tools they need
        </text>
      </svg>
    </div>
  );
}