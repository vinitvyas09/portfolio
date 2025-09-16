'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

type StageId = 'neuron' | 'circuit' | 'math' | 'code' | 'chat';

interface StageDefinition {
  id: StageId;
  step: number;
  title: string;
  accent: string;
}

const STAGES: StageDefinition[] = [
  {
    id: 'neuron',
    step: 1,
    title: 'Biological Neuron',
    accent: '#60a5fa',
  },
  {
    id: 'circuit',
    step: 2,
    title: 'Electronic Circuit',
    accent: '#34d399',
  },
  {
    id: 'math',
    step: 3,
    title: 'Mathematical Model',
    accent: '#facc15',
  },
  {
    id: 'code',
    step: 4,
    title: 'Code Implementation',
    accent: '#f97316',
  },
  {
    id: 'chat',
    step: 5,
    title: 'AI Interface',
    accent: '#a855f7',
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


const NeuronScene = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-900">
    <motion.svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
      <defs>
        <linearGradient id="neuron-signal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
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
        fill="rgba(96, 165, 250, 0.3)"
        stroke="#60a5fa"
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
        fill="#34d399"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.5 }}
      />
      <motion.circle
        cx="320"
        cy="100"
        r="4"
        fill="#34d399"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.6 }}
      />
      <motion.circle
        cx="320"
        cy="110"
        r="4"
        fill="#34d399"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.7 }}
      />
    </motion.svg>
  </div>
);

const CircuitScene = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-900">
    <motion.svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
      <defs>
        <linearGradient id="circuit-signal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Input nodes */}
      <motion.circle cx="50" cy="70" r="8" fill="#34d399" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
      <motion.circle cx="50" cy="100" r="8" fill="#34d399" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
      <motion.circle cx="50" cy="130" r="8" fill="#34d399" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />
      
      {/* Input lines */}
      <motion.line x1="58" y1="70" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
      <motion.line x1="58" y1="100" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />
      <motion.line x1="58" y1="130" x2="140" y2="100" stroke="url(#circuit-signal)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />
      
      {/* Summing junction */}
      <motion.circle
        cx="150"
        cy="100"
        r="20"
        fill="rgba(34, 211, 238, 0.2)"
        stroke="#22d3ee"
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
        fill="#22d3ee"
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
        fill="rgba(250, 204, 21, 0.2)"
        stroke="#facc15"
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
        fill="#facc15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        f(x)
      </motion.text>
      
      {/* Output */}
      <motion.circle cx="360" cy="100" r="6" fill="#f97316" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
    </motion.svg>
  </div>
);

const MathScene = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-900 px-8 text-center">
    <motion.div
      className="font-mono text-3xl text-slate-100 md:text-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span style={{ color: '#facc15' }}>y</span> = f<span className="text-slate-400">(</span>
      <span style={{ color: '#22d3ee' }}>∑</span> 
      <span style={{ color: '#34d399' }}>w</span><sub className="text-slate-400">i</sub>
      <span style={{ color: '#60a5fa' }}>x</span><sub className="text-slate-400">i</sub> + 
      <span style={{ color: '#f97316' }}>b</span>
      <span className="text-slate-400">)</span>
    </motion.div>
  </div>
);

const CodeScene = () => (
  <div className="relative flex h-full w-full flex-col justify-center overflow-hidden bg-slate-900 px-8 py-8">
    <motion.div
      className="rounded-lg border border-slate-700 bg-slate-950 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="space-y-2 font-mono text-sm text-slate-200">
        {CODE_LINES.map((line, index) => (
          <motion.div
            key={line.content}
            className={'accent' in line && line.accent ? 'text-orange-300' : 'text-slate-300'}
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

const ChatScene = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-900 px-8">
    <motion.div
      className="max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
        <span className="text-slate-400 text-sm">AI Chat</span>
      </div>
      <div className="space-y-3">
        <motion.div
          className="bg-indigo-500 text-white p-3 rounded-lg rounded-br-sm text-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Hello AI!
        </motion.div>
        <motion.div
          className="bg-slate-700 text-slate-200 p-3 rounded-lg rounded-bl-sm text-sm"
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

const STAGE_COMPONENTS: Record<StageId, () => React.JSX.Element> = {
  neuron: NeuronScene,
  circuit: CircuitScene,
  math: MathScene,
  code: CodeScene,
  chat: ChatScene,
};

const PerceptronContinuum = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDirection(1);
      setStageIndex((current) => (current + 1) % STAGES.length);
    }, STAGE_DURATION);

    return () => window.clearTimeout(timeout);
  }, [stageIndex]);

  const stage = STAGES[stageIndex];
  const StageVisual = STAGE_COMPONENTS[stage.id];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-2xl backdrop-blur">
        {/* Step Number Indicator */}
        <motion.div
          key={`step-${stage.step}`}
          className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
          style={{ backgroundColor: stage.accent, color: '#0f172a' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {stage.step}
        </motion.div>

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
              <StageVisual />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="border-t border-slate-800/80 bg-slate-950/70 px-6 py-6">
          <motion.h3
            key={`${stage.id}-title`}
            className="text-xl font-semibold text-slate-100 md:text-2xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stage.title}
          </motion.h3>
        </div>
        
        <div className="px-6 pb-6">
          <Timeline
            stageIndex={stageIndex}
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
  stageIndex: number;
  onSelectStage: (index: number) => void;
}

const Timeline = ({ stageIndex, onSelectStage }: TimelineProps) => {
  const accent = STAGES[stageIndex].accent;
  const progress = (stageIndex / (STAGES.length - 1)) * 100;

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-4 py-4">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-800/70">
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
          {STAGES.map((stage, index) => {
            const isActive = index === stageIndex;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(index)}
                className="group relative flex flex-col items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-slate-600/80 transition-transform group-hover:scale-125" />
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