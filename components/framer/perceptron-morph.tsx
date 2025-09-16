'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useTheme } from 'next-themes';

type StageId = 'neuron' | 'circuit' | 'math' | 'code' | 'chat';

interface StageDefinition {
  id: StageId;
  step: number;
  title: string;
  accent: string;
}

// Stage definitions moved to component to access theme
const getStages = (isDark: boolean): StageDefinition[] => [
  {
    id: 'neuron',
    step: 1,
    title: 'Biological Neuron',
    accent: isDark ? '#818cf8' : '#6366f1',
  },
  {
    id: 'circuit',
    step: 2,
    title: 'Electronic Circuit',
    accent: isDark ? '#4ade80' : '#10b981',
  },
  {
    id: 'math',
    step: 3,
    title: 'Mathematical Model',
    accent: isDark ? '#fbbf24' : '#eab308',
  },
  {
    id: 'code',
    step: 4,
    title: 'Code Implementation',
    accent: isDark ? '#fb923c' : '#f97316',
  },
  {
    id: 'chat',
    step: 5,
    title: 'AI Interface',
    accent: isDark ? '#c084fc' : '#a855f7',
  },
];

const STAGE_DURATION = 4000;

const stageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const CODE_LINES = [
  { content: 'def perceptron(inputs, weights, bias):', accent: true },
  { content: '    total = 0.0' },
  { content: '    for x, w in zip(inputs, weights):' },
  { content: '        total += x * w' },
  { content: '    total += bias' },
  { content: '    return 1 if total > 0 else 0', accent: true },
] as const;


const NeuronScene = ({ colors }: { colors: any }) => (
  <div 
    className="relative flex h-full w-full items-center justify-center overflow-hidden"
    style={{ backgroundColor: colors.sceneBg }}
  >
    <motion.svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
      <defs>
        <linearGradient id="neuron-signal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.neuronPrimary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.neuronSecondary} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Dendrites */}
      <motion.path
        d="M50 80L120 100"
        stroke="url(#neuron-signal)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.path
        d="M50 100L120 100"
        stroke="url(#neuron-signal)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.path
        d="M50 120L120 100"
        stroke="url(#neuron-signal)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      />
      
      {/* Cell body */}
      <motion.circle
        cx="150"
        cy="100"
        r="25"
        fill={`${colors.neuronPrimary}30`}
        stroke={colors.neuronPrimary}
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      
      {/* Axon */}
      <motion.path
        d="M175 100L320 100"
        stroke="url(#neuron-signal)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
      
      {/* Terminals */}
      <motion.circle
        cx="320"
        cy="90"
        r="4"
        fill={colors.neuronSecondary}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.5 }}
      />
      <motion.circle
        cx="320"
        cy="100"
        r="4"
        fill={colors.neuronSecondary}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.6 }}
      />
      <motion.circle
        cx="320"
        cy="110"
        r="4"
        fill={colors.neuronSecondary}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.7 }}
      />
    </motion.svg>
  </div>
);

const CircuitScene = ({ colors }: { colors: any }) => (
  <div 
    className="relative flex h-full w-full items-center justify-center overflow-hidden"
    style={{ backgroundColor: colors.sceneBg }}
  >
    <motion.svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
      <defs>
        <linearGradient id="circuit-signal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.circuitPrimary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.circuitSecondary} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Input nodes */}
      <motion.circle cx="50" cy="70" r="8" fill={colors.circuitPrimary} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
      <motion.circle cx="50" cy="100" r="8" fill={colors.circuitPrimary} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
      <motion.circle cx="50" cy="130" r="8" fill={colors.circuitPrimary} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />
      
      {/* Input lines */}
      <motion.line x1="58" y1="70" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
      <motion.line x1="58" y1="100" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />
      <motion.line x1="58" y1="130" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />
      
      {/* Summing junction */}
      <motion.circle
        cx="150"
        cy="100"
        r="20"
        fill={`${colors.circuitSecondary}30`}
        stroke={colors.circuitSecondary}
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
      />
      <motion.text
        x="150"
        y="108"
        textAnchor="middle"
        fontSize="24"
        fill={colors.circuitSecondary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Σ
      </motion.text>
      
      {/* Output line */}
      <motion.line x1="170" y1="100" x2="280" y2="100" stroke="url(#circuit-signal)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 }} />
      
      {/* Activation function */}
      <motion.rect
        x="280"
        y="80"
        width="60"
        height="40"
        rx="8"
        fill={`${colors.mathPrimary}30`}
        stroke={colors.mathPrimary}
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.4 }}
      />
      <motion.text
        x="310"
        y="105"
        textAnchor="middle"
        fontSize="16"
        fill={colors.mathPrimary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        f(x)
      </motion.text>
      
      {/* Output */}
      <motion.circle cx="360" cy="100" r="6" fill={colors.codePrimary} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
    </motion.svg>
  </div>
);

const MathScene = ({ colors }: { colors: any }) => (
  <div 
    className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 text-center"
    style={{ backgroundColor: colors.sceneBg }}
  >
    <motion.div
      className="font-mono text-3xl md:text-4xl"
      style={{ color: colors.textPrimary }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span style={{ color: colors.mathPrimary }}>y</span> = f<span style={{ color: colors.textMuted }}>(</span>
      <span style={{ color: colors.circuitSecondary }}>∑</span> 
      <span style={{ color: colors.circuitPrimary }}>w</span><sub style={{ color: colors.textMuted }}>i</sub>
      <span style={{ color: colors.neuronPrimary }}>x</span><sub style={{ color: colors.textMuted }}>i</sub> + 
      <span style={{ color: colors.codePrimary }}>b</span>
      <span style={{ color: colors.textMuted }}>)</span>
    </motion.div>
  </div>
);

const CodeScene = ({ colors }: { colors: any }) => (
  <div 
    className="relative flex h-full w-full flex-col justify-center overflow-hidden px-8 py-8"
    style={{ backgroundColor: colors.sceneBg }}
  >
    <motion.div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.borderColor
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div 
        className="space-y-2 font-mono text-sm"
        style={{ color: colors.textSecondary }}
      >
        {CODE_LINES.map((line, index) => (
          <motion.div
            key={line.content}
            style={{ 
              color: 'accent' in line && line.accent ? colors.codePrimary : colors.textSecondary 
            }}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {line.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

const ChatScene = ({ colors }: { colors: any }) => (
  <div 
    className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8"
    style={{ backgroundColor: colors.sceneBg }}
  >
    <motion.div
      className="max-w-sm rounded-2xl border p-6"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.borderColor
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.circuitPrimary }}></div>
        <span className="text-sm" style={{ color: colors.textMuted }}>AI Chat</span>
      </div>
      <div className="space-y-3">
        <motion.div
          className="p-3 rounded-lg rounded-br-sm text-sm"
          style={{ backgroundColor: colors.chatPrimary, color: colors.sceneBg }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Hello AI!
        </motion.div>
        <motion.div
          className="p-3 rounded-lg rounded-bl-sm text-sm"
          style={{ backgroundColor: colors.timelineTrack, color: colors.textPrimary }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          Hello! How can I help?
        </motion.div>
      </div>
    </motion.div>
  </div>
);

const STAGE_COMPONENTS: Record<StageId, (props: { colors: any }) => React.JSX.Element> = {
  neuron: NeuronScene,
  circuit: CircuitScene,
  math: MathScene,
  code: CodeScene,
  chat: ChatScene,
};

const PerceptronContinuum = () => {
  // Theme handling
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  
  const [stageIndex, setStageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  
  // Get theme-aware stages (use light theme stages as default before mount)
  const STAGES = useMemo(() => getStages(isDark), [isDark]);
  
  // Sophisticated color palette
  const colors = useMemo(() => {
    // Default to light colors before mount to avoid hydration mismatch
    if (!mounted) {
      return {
        // Background colors
        containerBg: "rgba(248, 250, 252, 0.95)",
        borderColor: "rgba(226, 232, 240, 0.8)",
        sceneBg: "#ffffff",
        
        // Stage-specific colors
        neuronPrimary: "#6366f1",
        neuronSecondary: "#10b981",
        circuitPrimary: "#10b981",
        circuitSecondary: "#06b6d4",
        mathPrimary: "#eab308",
        codePrimary: "#f97316",
        chatPrimary: "#a855f7",
        
        // Text colors
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        
        // UI elements
        cardBg: "rgba(255, 255, 255, 0.9)",
        cardBorder: "rgba(226, 232, 240, 0.8)",
        timelineBg: "rgba(248, 250, 252, 0.9)",
        timelineTrack: "rgba(148, 163, 184, 0.3)",
        timelineDot: "rgba(100, 116, 139, 0.6)",
      };
    }
    
    return isDark ? {
      // Dark mode - sophisticated blacks and grays
      containerBg: "rgba(10, 10, 10, 0.95)",
      borderColor: "rgba(64, 64, 64, 0.8)",
      sceneBg: "#0a0a0a",
      
      // Stage-specific colors - more vibrant for dark mode
      neuronPrimary: "#a78bfa",
      neuronSecondary: "#34d399",
      circuitPrimary: "#34d399",
      circuitSecondary: "#22d3ee",
      mathPrimary: "#fbbf24",
      codePrimary: "#fb923c",
      chatPrimary: "#c084fc",
      
      // Text colors
      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      textMuted: "#94a3b8",
      
      // UI elements
      cardBg: "rgba(23, 23, 23, 0.9)",
      cardBorder: "rgba(64, 64, 64, 0.8)",
      timelineBg: "rgba(23, 23, 23, 0.9)",
      timelineTrack: "rgba(64, 64, 64, 0.7)",
      timelineDot: "rgba(115, 115, 115, 0.8)",
    } : {
      // Light mode - clean whites and subtle colors
      containerBg: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(226, 232, 240, 0.8)",
      sceneBg: "#ffffff",
      
      // Stage-specific colors
      neuronPrimary: "#6366f1",
      neuronSecondary: "#10b981",
      circuitPrimary: "#10b981",
      circuitSecondary: "#06b6d4",
      mathPrimary: "#eab308",
      codePrimary: "#f97316",
      chatPrimary: "#a855f7",
      
      // Text colors
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      
      // UI elements
      cardBg: "rgba(255, 255, 255, 0.9)",
      cardBorder: "rgba(226, 232, 240, 0.8)",
      timelineBg: "rgba(248, 250, 252, 0.9)",
      timelineTrack: "rgba(148, 163, 184, 0.3)",
      timelineDot: "rgba(100, 116, 139, 0.6)",
    };
  }, [isDark, mounted]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDirection(1);
      setStageIndex((current) => (current + 1) % STAGES.length);
    }, STAGE_DURATION);

    return () => window.clearTimeout(timeout);
  }, [stageIndex]);

  const stage = STAGES[stageIndex];
  const StageVisual = STAGE_COMPONENTS[stage.id];
  
  // Placeholder to avoid SSR/CSR theme mismatch flash
  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-2xl backdrop-blur" style={{ height: '32rem' }}>
          {/* Empty placeholder */}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div 
        className="relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur"
        style={{
          backgroundColor: colors.containerBg,
          borderColor: colors.borderColor
        }}
      >

        <div className="relative h-[24rem] md:h-[28rem]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={stage.id}
              className="absolute inset-0"
              variants={stageVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            >
              <StageVisual colors={colors} />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div 
          className="border-t px-6 py-6"
          style={{
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBg
          }}
        >
          <motion.h3
            key={`${stage.id}-title`}
            className="text-xl font-semibold md:text-2xl"
            style={{ color: colors.textPrimary }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stage.title}
          </motion.h3>
        </div>
        
        <div className="px-6 pb-6">
          <Timeline
            stages={STAGES}
            stageIndex={stageIndex}
            colors={colors}
            onSelectStage={(index) => {
              if (index === stageIndex) {
                return;
              }
              setDirection(index > stageIndex ? 1 : -1);
              setStageIndex(index);
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface TimelineProps {
  stages: StageDefinition[];
  stageIndex: number;
  colors: any;
  onSelectStage: (index: number) => void;
}

const Timeline = ({ stages, stageIndex, colors, onSelectStage }: TimelineProps) => {
  const accent = stages[stageIndex].accent;
  const progress = (stageIndex / (stages.length - 1)) * 100;

  return (
    <div 
      className="rounded-xl border px-4 py-4"
      style={{
        backgroundColor: colors.timelineBg,
        borderColor: colors.borderColor
      }}
    >
      <div 
        className="relative h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: colors.timelineTrack }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          style={{ backgroundColor: accent }}
        />
      </div>
      <LayoutGroup>
        <div className="mt-4 flex items-center justify-between">
          {stages.map((stage, index) => {
            const isActive = index === stageIndex;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(index)}
                className="group relative flex flex-col items-center gap-2 text-xs transition-colors"
                style={{ 
                  color: colors.textMuted,
                  ['&:hover' as any]: { color: colors.textSecondary }
                }}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span 
                    className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: colors.timelineDot }}
                  />
                  {isActive && (
                    <motion.span
                      layoutId="timeline-dot"
                      className="absolute h-3 w-3 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{ backgroundColor: accent }}
                    />
                  )}
                </span>
                <span className={isActive ? 'font-medium' : ''} style={isActive ? { color: accent } : undefined}>
                  {stage.step}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
};

export default PerceptronContinuum;