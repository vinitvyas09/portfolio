'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface NeuronVsPerceptronConfig {
  side?: 'split' | 'toggle' | 'overlay' | 'vertical';
  animateTransition?: boolean;
  showLabels?: boolean;
  neuronLabels?: string[];
  perceptronLabels?: string[];
  transitionMs?: number;
}

interface NeuronVsPerceptronProps {
  config?: NeuronVsPerceptronConfig;
  className?: string;
}

const NeuronVsPerceptron: React.FC<NeuronVsPerceptronProps> = ({
  config = {},
  className = ''
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  const [showPerceptron, setShowPerceptron] = useState(false);

  const {
    side = 'split',
    animateTransition = true,
    showLabels = true,
    neuronLabels = ['Dendrites', 'Cell Body', 'Axon', 'Chemical Signals'],
    perceptronLabels = ['Inputs (x₁, x₂...)', 'Weighted Sum', 'Activation Function', 'Output'],
    transitionMs = 2000,
  } = config;

  // Toggle between neuron and perceptron every transitionMs
  useEffect(() => {
    if (side === 'toggle' && animateTransition) {
      const interval = setInterval(() => {
        setShowPerceptron(prev => !prev);
      }, transitionMs);
      return () => clearInterval(interval);
    }
  }, [side, animateTransition, transitionMs]);

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: '#ffffff',
        neuronPrimary: '#7c3aed',
        neuronSecondary: '#059669',
        perceptronPrimary: '#10b981',
        perceptronSecondary: '#06b6d4',
        text: '#1e293b',
        textMuted: '#94a3b8',
        accent: '#f97316',
        border: '#e2e8f0',
        labelBg: '#f8fafc',
      };
    }

    return isDark ? {
      bg: '#0a0a0a',
      neuronPrimary: '#8b5cf6',
      neuronSecondary: '#06ffa5',
      perceptronPrimary: '#34d399',
      perceptronSecondary: '#22d3ee',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      accent: '#fb923c',
      border: '#404040',
      labelBg: '#171717',
    } : {
      bg: '#ffffff',
      neuronPrimary: '#7c3aed',
      neuronSecondary: '#059669',
      perceptronPrimary: '#10b981',
      perceptronSecondary: '#06b6d4',
      text: '#1e293b',
      textMuted: '#94a3b8',
      accent: '#f97316',
      border: '#e2e8f0',
      labelBg: '#f8fafc',
    };
  }, [isDark, mounted]);

  const BiologicalNeuron = ({ showLabels: showL = true, labels = neuronLabels }) => {
    const somaX = 150;
    const somaY = 120;
    const somaRadius = 40;

    return (
      <svg viewBox="-40 40 480 160" className="w-full h-full" fill="none">
        <defs>
          <radialGradient id="neuron-soma-grad" cx="50%" cy="50%" r="85%">
            <stop offset="0%" stopColor={`${colors.neuronPrimary}30`} />
            <stop offset="70%" stopColor={`${colors.neuronPrimary}60`} />
            <stop offset="100%" stopColor={`${colors.neuronPrimary}90`} />
          </radialGradient>
          <filter id="neuron-glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Dendrites */}
        {[
          { angle: 135, length: 90 },
          { angle: 160, length: 80 },
          { angle: 180, length: 95 },
          { angle: 200, length: 85 },
          { angle: 225, length: 90 },
        ].map((d, i) => {
          const rad = (d.angle * Math.PI) / 180;
          const endX = somaX + Math.cos(rad) * d.length;
          const endY = somaY + Math.sin(rad) * d.length;
          const midX = somaX + Math.cos(rad) * (d.length * 0.5);
          const midY = somaY + Math.sin(rad) * (d.length * 0.5);

          return (
            <g key={`dendrite-${i}`}>
              <motion.path
                d={`M ${somaX},${somaY} Q ${midX + Math.sin(i) * 10},${midY + Math.cos(i) * 10} ${endX},${endY}`}
                stroke={colors.neuronSecondary}
                strokeWidth={3}
                opacity={0.7}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
              {/* Dendrite branches */}
              {[0.3, 0.6, 0.85].map((prog, j) => {
                const branchX = somaX + Math.cos(rad) * (d.length * prog);
                const branchY = somaY + Math.sin(rad) * (d.length * prog);
                return [-20, 20].map((offset, k) => {
                  const branchRad = ((d.angle + offset) * Math.PI) / 180;
                  const branchEndX = branchX + Math.cos(branchRad) * 20;
                  const branchEndY = branchY + Math.sin(branchRad) * 20;
                  return (
                    <motion.path
                      key={`branch-${i}-${j}-${k}`}
                      d={`M ${branchX},${branchY} L ${branchEndX},${branchEndY}`}
                      stroke={colors.neuronSecondary}
                      strokeWidth={1}
                      opacity={0.4}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: (i * 0.1) + (j * 0.05) }}
                    />
                  );
                });
              })}
            </g>
          );
        })}

        {/* Cell Body (Soma) */}
        <motion.circle
          cx={somaX}
          cy={somaY}
          r={somaRadius}
          fill="url(#neuron-soma-grad)"
          filter="url(#neuron-glow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.circle
          cx={somaX}
          cy={somaY}
          r={somaRadius}
          fill="none"
          stroke={colors.neuronPrimary}
          strokeWidth={2}
          opacity={0.8}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Nucleus */}
        <motion.circle
          cx={somaX - 2}
          cy={somaY - 2}
          r={10}
          fill={colors.neuronPrimary}
          opacity={0.6}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
        <motion.circle
          cx={somaX}
          cy={somaY}
          r={4}
          fill={colors.neuronPrimary}
          opacity={0.9}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        />

        {/* Axon */}
        <motion.path
          d={`M ${somaX + somaRadius},${somaY}
              C ${somaX + 60},${somaY + 10}
                ${somaX + 100},${somaY - 10}
                ${somaX + 140},${somaY}`}
          stroke={colors.neuronPrimary}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />

        {/* Myelin Sheaths */}
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={`myelin-${i}`}
            x={somaX + 40 + i * 35}
            y={somaY - 8}
            width={25}
            height={16}
            rx={8}
            fill={colors.neuronSecondary}
            opacity={0.3}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
          />
        ))}

        {/* Axon Terminals */}
        <g>
          {[-20, 0, 20].map((offset, i) => {
            const terminalX = somaX + 160;
            const terminalY = somaY + offset;
            return (
              <motion.g key={`terminal-${i}`}>
                <motion.path
                  d={`M ${somaX + 140},${somaY} L ${terminalX},${terminalY}`}
                  stroke={colors.neuronPrimary}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                />
                <motion.circle
                  cx={terminalX + 10}
                  cy={terminalY}
                  r={6}
                  fill={colors.neuronPrimary}
                  opacity={0.6}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                />
                {/* Vesicles */}
                {[0, 1, 2].map((j) => (
                  <motion.circle
                    key={`vesicle-${i}-${j}`}
                    cx={terminalX + 8 + j * 2}
                    cy={terminalY - 2 + j}
                    r={1.5}
                    fill={colors.accent}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 1.2 + (i * 0.1) + (j * 0.05) }}
                  />
                ))}
              </motion.g>
            );
          })}
        </g>

        {/* Labels */}
        {showL && (
          <g className="text-xs">
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {/* Dendrites Label */}
              <rect x={25} y={165} width={52} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={51} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[0]}
              </text>
              <line x1={77} y1={165} x2={100} y2={95} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Cell Body Label */}
              <rect x={100} y={165} width={45} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={122} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[1]}
              </text>
              <line x1={122} y1={165} x2={150} y2={150} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Axon Label */}
              <rect x={168} y={165} width={32} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={184} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[2]}
              </text>
              <line x1={184} y1={165} x2={235} y2={130} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Chemical Signals Label */}
              <rect x={223} y={165} width={75} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={260} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[3]}
              </text>
              <line x1={298} y1={165} x2={310} y2={150} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />
            </motion.g>
          </g>
        )}
      </svg>
    );
  };

  const PerceptronDiagram = ({ showLabels: showL = true, labels = perceptronLabels }) => {
    return (
      <svg viewBox="-20 30 440 160" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="perceptron-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.perceptronSecondary} />
            <stop offset="100%" stopColor={colors.perceptronPrimary} />
          </linearGradient>
          <filter id="perceptron-glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Input Nodes */}
        {[70, 95, 120, 145].map((y, i) => (
          <g key={`input-${i}`}>
            <motion.circle
              cx={60}
              cy={y}
              r={12}
              fill={colors.perceptronSecondary}
              opacity={0.8}
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            <motion.text
              x={32}
              y={y + 4}
              fill={colors.text}
              fontSize={11}
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
            >
              x{i === 3 ? 'n' : i + 1}
            </motion.text>
          </g>
        ))}

        {/* Weights on connections */}
        {[70, 95, 120, 145].map((y, i) => (
          <g key={`weight-${i}`}>
            <motion.line
              x1={68}
              y1={y}
              x2={152}
              y2={107}
              stroke={colors.perceptronSecondary}
              strokeWidth={2}
              opacity={0.6}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            />
            <motion.rect
              x={100}
              y={y + (107 - y) * 0.4 - 10}
              width={24}
              height={16}
              rx={3}
              fill={colors.bg}
              stroke={colors.perceptronSecondary}
              strokeWidth={1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
            />
            <motion.text
              x={112}
              y={y + (107 - y) * 0.4 - 1}
              fill={colors.text}
              fontSize={9}
              textAnchor="middle"
              fontWeight="600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
            >
              w{i === 3 ? 'n' : i + 1}
            </motion.text>
          </g>
        ))}

        {/* Summation Node */}
        <motion.circle
          cx={160}
          cy={107}
          r={28}
          fill="url(#perceptron-grad)"
          filter="url(#perceptron-glow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        />
        <motion.text
          x={160}
          y={115}
          fill={colors.bg}
          fontSize={28}
          fontWeight="bold"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          Σ
        </motion.text>

        {/* Bias */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <circle cx={60} cy={45} r={6} fill={colors.accent} />
          <text x={60} y={48} fill={colors.bg} fontSize={9} textAnchor="middle" fontWeight="bold">
            +1
          </text>
          <line
            x1={66}
            y1={45}
            x2={140}
            y2={90}
            stroke={colors.accent}
            strokeWidth={1.5}
            strokeDasharray="3 2"
            opacity={0.6}
          />
          <text x={35} y={48} fill={colors.text} fontSize={9} textAnchor="middle">
            b
          </text>
        </motion.g>

        {/* Activation Function */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <rect x={220} y={87} width={50} height={40} rx={8} fill={colors.perceptronPrimary} opacity={0.2} />
          <rect x={222} y={90} width={46} height={34} rx={6} fill={colors.bg} stroke={colors.perceptronPrimary} strokeWidth={2} />
          <path
            d="M 235 112 Q 245 95 255 112"
            stroke={colors.perceptronPrimary}
            strokeWidth={2}
            fill="none"
          />
          <text x={245} y={78} fill={colors.text} fontSize={11} textAnchor="middle" fontWeight="500">
            σ(z)
          </text>
        </motion.g>

        {/* Connection from sum to activation */}
        <motion.line
          x1={180}
          y1={107}
          x2={220}
          y2={107}
          stroke={colors.perceptronPrimary}
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        />

        {/* Output */}
        <motion.g
          initial={{ scale: 0, x: 20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <circle cx={320} cy={107} r={16} fill={colors.accent} filter="url(#perceptron-glow)" />
          <text x={348} y={112} fill={colors.text} fontSize={14} textAnchor="middle" fontWeight="500">
            y
          </text>
        </motion.g>

        {/* Connection from activation to output */}
        <motion.line
          x1={270}
          y1={107}
          x2={308}
          y2={107}
          stroke={colors.accent}
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        />

        {/* Arrow for signal flow */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <polygon
            points="305,102 315,107 305,112"
            fill={colors.accent}
          />
        </motion.g>

        {/* Labels */}
        {showL && (
          <g className="text-xs">
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              {/* Inputs Label */}
              <rect x={10} y={165} width={70} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={45} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[0]}
              </text>
              <line x1={80} y1={165} x2={60} y2={145} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Weighted Sum Label */}
              <rect x={95} y={165} width={70} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={130} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[1]}
              </text>
              <line x1={130} y1={165} x2={160} y2={127} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Activation Function Label */}
              <rect x={180} y={165} width={90} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={225} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[2]}
              </text>
              <line x1={225} y1={165} x2={245} y2={127} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />

              {/* Output Label */}
              <rect x={285} y={165} width={40} height={12} fill={colors.labelBg} rx={2} opacity={0.9} />
              <text x={305} y={173} fill={colors.text} textAnchor="middle" fontSize={7} fontWeight="500">
                {labels[3]}
              </text>
              <line x1={305} y1={165} x2={320} y2={119} stroke={colors.textMuted} strokeWidth={0.5} opacity={0.5} />
            </motion.g>
          </g>
        )}

        {/* Animated pulse */}
        <motion.circle
          r={3}
          fill={colors.perceptronPrimary}
          filter="url(#perceptron-glow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            cx: [60, 110, 160, 245, 320],
            cy: [95, 100, 107, 107, 107],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
            delay: 2,
          }}
        />
      </svg>
    );
  };

  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative overflow-hidden rounded-2xl border bg-white" style={{ height: '14rem' }}>
          {/* Loading placeholder */}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className="relative overflow-hidden rounded-2xl border shadow-lg"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        {side === 'split' && (
          <div className="flex h-56">
            {/* Biological Neuron Side */}
            <div className="flex-1 relative" style={{
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${isDark ? '#0f0f0f' : '#fafafa'} 100%)`
            }}>
              <div className="absolute top-2 left-3 z-10">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${colors.neuronPrimary}15`,
                    color: colors.neuronPrimary,
                    border: `1px solid ${colors.neuronPrimary}30`
                  }}
                >
                  Biological Neuron
                </span>
              </div>
              <div className="h-full flex items-center justify-center p-2">
                <BiologicalNeuron showLabels={showLabels} labels={neuronLabels} />
              </div>
            </div>

            {/* Sophisticated divider */}
            <div className="relative flex items-center justify-center" style={{ width: '40px' }}>
              <div className="absolute inset-y-0" style={{
                width: '1px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: `linear-gradient(180deg, transparent 0%, ${colors.border}50 25%, ${colors.border}50 75%, transparent 100%)`
              }} />
              <motion.div
                className="absolute rounded-full blur-md"
                style={{
                  background: `radial-gradient(circle, ${colors.accent}25 0%, transparent 60%)`,
                  width: '50px',
                  height: '50px'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div
                className="relative bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm z-10"
                style={{
                  border: `1px solid ${colors.border}`,
                  width: '20px',
                  height: '20px'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M13 5l7 7-7 7M4 12h16"
                    stroke={colors.accent}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
              </div>
            </div>

            {/* Perceptron Side */}
            <div className="flex-1 relative" style={{
              background: `linear-gradient(225deg, ${colors.bg} 0%, ${isDark ? '#0f0f0f' : '#fafafa'} 100%)`
            }}>
              <div className="absolute top-2 right-3 z-10">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${colors.perceptronPrimary}15`,
                    color: colors.perceptronPrimary,
                    border: `1px solid ${colors.perceptronPrimary}30`
                  }}
                >
                  Artificial Perceptron
                </span>
              </div>
              <div className="h-full flex items-center justify-center p-2">
                <PerceptronDiagram showLabels={showLabels} labels={perceptronLabels} />
              </div>
            </div>
          </div>
        )}

        {side === 'toggle' && (
          <div className="h-56 relative">
            <AnimatePresence mode="wait">
              {showPerceptron ? (
                <motion.div
                  key="perceptron"
                  className="absolute inset-0 flex items-center justify-center p-8"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${colors.perceptronPrimary}20`,
                        color: colors.perceptronPrimary,
                      }}
                    >
                      Artificial Perceptron
                    </span>
                  </div>
                  <PerceptronDiagram showLabels={showLabels} labels={perceptronLabels} />
                </motion.div>
              ) : (
                <motion.div
                  key="neuron"
                  className="absolute inset-0 flex items-center justify-center p-8"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${colors.neuronPrimary}20`,
                        color: colors.neuronPrimary,
                      }}
                    >
                      Biological Neuron
                    </span>
                  </div>
                  <BiologicalNeuron showLabels={showLabels} labels={neuronLabels} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  !showPerceptron ? 'w-6' : ''
                }`}
                style={{
                  backgroundColor: !showPerceptron ? colors.neuronPrimary : colors.textMuted,
                  opacity: !showPerceptron ? 1 : 0.3,
                }}
              />
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  showPerceptron ? 'w-6' : ''
                }`}
                style={{
                  backgroundColor: showPerceptron ? colors.perceptronPrimary : colors.textMuted,
                  opacity: showPerceptron ? 1 : 0.3,
                }}
              />
            </div>
          </div>
        )}

        {side === 'overlay' && (
          <div className="h-56 relative">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: showPerceptron ? 0.3 : 1 }}
              >
                <BiologicalNeuron showLabels={!showPerceptron && showLabels} labels={neuronLabels} />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: showPerceptron ? 1 : 0.3 }}
              >
                <PerceptronDiagram showLabels={showPerceptron && showLabels} labels={perceptronLabels} />
              </motion.div>
            </div>

            {/* Toggle button */}
            <button
              className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: showPerceptron
                  ? `${colors.perceptronPrimary}20`
                  : `${colors.neuronPrimary}20`,
                color: showPerceptron ? colors.perceptronPrimary : colors.neuronPrimary,
              }}
              onClick={() => setShowPerceptron(!showPerceptron)}
            >
              {showPerceptron ? 'Show Neuron' : 'Show Perceptron'}
            </button>
          </div>
        )}

        {side === 'vertical' && (
          <div className="space-y-4">
            {/* Biological Neuron */}
            <div className="relative rounded-lg overflow-hidden" style={{
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${isDark ? '#0a0a0a' : '#fcfcfc'} 100%)`
            }}>
              <div className="absolute top-3 left-4 z-10">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${colors.neuronPrimary}15`,
                    color: colors.neuronPrimary,
                    border: `1px solid ${colors.neuronPrimary}30`
                  }}
                >
                  Biological Neuron
                </span>
              </div>
              <div className="h-52 flex items-center justify-center">
                <BiologicalNeuron showLabels={showLabels} labels={neuronLabels} />
              </div>
            </div>

            {/* Divider with arrow */}
            <div className="relative flex items-center justify-center" style={{ height: '40px' }}>
              <div className="absolute inset-x-0" style={{
                height: '2px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: `linear-gradient(90deg, transparent 0%, ${colors.accent}30 25%, ${colors.accent}50 50%, ${colors.accent}30 75%, transparent 100%)`
              }} />
              <motion.div
                className="absolute"
                style={{
                  width: '60px',
                  height: '60px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.accent}20 0%, transparent 60%)`,
                    filter: 'blur(8px)'
                  }}
                />
              </motion.div>
              <motion.div
                className="relative bg-white dark:bg-gray-900 rounded-full shadow-lg z-10 flex items-center justify-center"
                style={{
                  border: `2px solid ${colors.accent}`,
                  width: '36px',
                  height: '36px'
                }}
                animate={{
                  y: [0, 4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M12 5v14m0 0l7-7m-7 7l-7-7"
                    stroke={colors.accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
              </motion.div>
            </div>

            {/* Artificial Perceptron */}
            <div className="relative rounded-lg overflow-hidden" style={{
              background: `linear-gradient(225deg, ${colors.bg} 0%, ${isDark ? '#0a0a0a' : '#fcfcfc'} 100%)`
            }}>
              <div className="absolute top-3 right-4 z-10">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${colors.perceptronPrimary}15`,
                    color: colors.perceptronPrimary,
                    border: `1px solid ${colors.perceptronPrimary}30`
                  }}
                >
                  Artificial Perceptron
                </span>
              </div>
              <div className="h-52 flex items-center justify-center">
                <PerceptronDiagram showLabels={showLabels} labels={perceptronLabels} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom info bar */}
        <div
          className="px-4 py-1.5 border-t flex items-center justify-between"
          style={{
            borderColor: colors.border,
            color: colors.textMuted,
            fontSize: '10px'
          }}
        >
          <div>
            <span style={{ color: colors.neuronPrimary }}>●</span> Biological inspiration
          </div>
          <div>
            <span style={{ color: colors.accent }}>→</span> Mathematical abstraction
          </div>
          <div>
            <span style={{ color: colors.perceptronPrimary }}>●</span> Computational model
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuronVsPerceptron;