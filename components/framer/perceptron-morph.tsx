'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  { content: '    weighted_sum = sum(x * w for x, w in zip(inputs, weights))' },
  { content: '    return 1 if weighted_sum + bias > 0 else 0', accent: true },
] as const;


const NeuronScene = ({ colors }: { colors: any }) => {
  const somaX = 170;
  const somaY = 160;
  const somaRadius = 38;

  const withAlpha = (hex: string, alpha: string) => {
    if (typeof hex !== 'string' || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 9)) {
      return hex;
    }
    return hex.length === 7 ? `${hex}${alpha}` : hex;
  };

  const numMainBranches = 8;

  const mainBranches = useMemo(() => {
    return Array.from({ length: numMainBranches }, (_, i) => {
      const baseAngle = 90 + (i / (numMainBranches - 1 || 1)) * 180;
      const angleVariation = Math.sin(i * 2.7) * 12;
      const angleDeg = baseAngle + angleVariation;
      const angleRad = (angleDeg * Math.PI) / 180;
      const length = 90 + Math.sin(i * 1.3) * 25;
      const startX = somaX + Math.cos(angleRad) * somaRadius;
      const startY = somaY + Math.sin(angleRad) * somaRadius;
      const endX = somaX + Math.cos(angleRad) * (length + somaRadius);
      const endY = somaY + Math.sin(angleRad) * (length + somaRadius);
      return { startX, startY, endX, endY, angleDeg, angleRad, index: i };
    });
  }, [numMainBranches, somaRadius, somaX, somaY]);

  const somaOutlinePath = useMemo(() => {
    const segments = 16;
    const points = Array.from({ length: segments }, (_, i) => {
      const angle = (i / segments) * Math.PI * 2;
      const radius = somaRadius + 8 + Math.sin(i * 1.3) * 4;
      return {
        x: somaX + Math.cos(angle) * radius,
        y: somaY + Math.sin(angle) * radius,
        angle,
      };
    });

    if (!points.length) {
      return '';
    }

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const prev = points[i - 1];
      const cp1x = prev.x + Math.cos(prev.angle + Math.PI / 2) * 12;
      const cp1y = prev.y + Math.sin(prev.angle + Math.PI / 2) * 12;
      const cp2x = current.x + Math.cos(current.angle - Math.PI / 2) * 12;
      const cp2y = current.y + Math.sin(current.angle - Math.PI / 2) * 12;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
    }
    path += ' Z';
    return path;
  }, [somaRadius, somaX, somaY]);

  const axonSegmentCount = 4;
  const axonSegmentSpacing = 82;
  const axonSegmentWidth = 48;
  const axonSegmentHeight = 20;
  const axonStartX = 240;
  const axonBaselineY = 160;
  const axonCurveAmplitude = 6;
  const firstSegmentY = axonBaselineY + Math.sin(0.9) * axonCurveAmplitude;
  const axonEndX = axonStartX + (axonSegmentCount - 1) * axonSegmentSpacing + axonSegmentWidth;
  const axonEndY = axonBaselineY + Math.sin(axonSegmentCount * 0.9) * axonCurveAmplitude;
  const axonTerminalX = 570;
  const terminalBaseY = axonBaselineY + Math.sin((axonSegmentCount + 1) * 0.9) * axonCurveAmplitude;

  interface TerminalBranch {
    id: string;
    path: string;
    boutonX: number;
    boutonY: number;
  }

  const terminalBranches = useMemo<TerminalBranch[]>(() => {
    const branches: TerminalBranch[] = [];
    const primaryX = axonTerminalX;
    const primaryY = terminalBaseY;
    const mainAngles = [-25, 0, 25];

    mainAngles.forEach((angle, mainIdx) => {
      const mainLength = 28 + Math.sin(mainIdx * 1.7) * 6;
      const mainEndX = primaryX + mainLength;
      const mainEndY = primaryY + Math.sin((angle * Math.PI) / 180) * mainLength;
      const numSecondary = mainIdx === 1 ? 3 : 2;

      for (let secIdx = 0; secIdx < numSecondary; secIdx++) {
        const secAngle = angle + (secIdx - (numSecondary - 1) / 2) * 18;
        const secLength = 22 + Math.sin((mainIdx + secIdx) * 2.1) * 6;
        const secEndX = mainEndX + Math.cos((secAngle * Math.PI) / 180) * secLength;
        const secEndY = mainEndY + Math.sin((secAngle * Math.PI) / 180) * secLength * 1.15;
        const numBoutons = secIdx % 2 === 0 ? 2 : 1;

        for (let boutIdx = 0; boutIdx < numBoutons; boutIdx++) {
          const boutAngle = secAngle + (boutIdx - (numBoutons - 1) / 2) * 22;
          const boutLength = 14 + Math.sin((secIdx + boutIdx) * 3.1) * 3;
          const boutEndX = secEndX + Math.cos((boutAngle * Math.PI) / 180) * boutLength;
          const boutEndY = secEndY + Math.sin((boutAngle * Math.PI) / 180) * boutLength;
          const control1X = primaryX + (mainEndX - primaryX) * 0.6;
          const control1Y = primaryY + (mainEndY - primaryY) * 0.6 + Math.sin(mainIdx * 1.2) * 4;
          const control2X = mainEndX + (secEndX - mainEndX) * 0.5;
          const control2Y = mainEndY + (secEndY - mainEndY) * 0.5 + Math.sin(secIdx * 1.5) * 4;
          const control3X = secEndX + (boutEndX - secEndX) * 0.6;
          const control3Y = secEndY + (boutEndY - secEndY) * 0.6;
          const path = [
            `M ${primaryX},${primaryY}`,
            `Q ${control1X},${control1Y} ${mainEndX},${mainEndY}`,
            `Q ${control2X},${control2Y} ${secEndX},${secEndY}`,
            `Q ${control3X},${control3Y} ${boutEndX},${boutEndY}`,
          ].join(' ');

          branches.push({
            id: `terminal-${mainIdx}-${secIdx}-${boutIdx}`,
            path,
            boutonX: boutEndX,
            boutonY: boutEndY,
          });
        }
      }
    });

    return branches;
  }, [axonTerminalX, terminalBaseY]);

  const extraTerminals = useMemo(() => {
    return [-18, 18].map((angle, idx) => {
      const startX = axonTerminalX;
      const startY = terminalBaseY;
      const controlX = startX + 24;
      const controlY = startY + angle * 1.3;
      const endX = controlX + 32;
      const endY = controlY + angle * 0.9;

      return {
        id: `extra-terminal-${idx}`,
        path: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`,
        boutonX: endX,
        boutonY: endY,
      };
    });
  }, [axonTerminalX, terminalBaseY]);

  return (
    <div 
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.sceneBg }}
    >
      <motion.svg viewBox="0 0 700 320" className="h-full w-full" preserveAspectRatio="xMidYMid meet" fill="none">
        <defs>
          <radialGradient id="neuron-soma-morph" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={withAlpha(colors.neuronSecondary, 'dd')} />
            <stop offset="60%" stopColor={withAlpha(colors.neuronPrimary, 'cc')} />
            <stop offset="100%" stopColor={withAlpha(colors.neuronPrimary, '99')} />
          </radialGradient>
          <linearGradient id="neuron-axon-morph" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={withAlpha(colors.neuronPrimary, 'cc')} />
            <stop offset="100%" stopColor={withAlpha(colors.neuronSecondary, 'cc')} />
          </linearGradient>
        </defs>

        <g>
          {mainBranches.map((branch) => {
            const ctrl1X =
              branch.startX +
              (branch.endX - branch.startX) * 0.35 +
              Math.sin(branch.index * 0.8) * 10;
            const ctrl1Y =
              branch.startY +
              (branch.endY - branch.startY) * 0.35 +
              Math.cos(branch.index * 0.8) * 12;
            const ctrl2X =
              branch.startX +
              (branch.endX - branch.startX) * 0.75 +
              Math.cos(branch.index * 0.9) * 12;
            const ctrl2Y =
              branch.startY +
              (branch.endY - branch.startY) * 0.75 +
              Math.sin(branch.index * 0.9) * 14;
            const trunkThickness = 2.6 + (Math.sin(branch.index * 1.4) + 1) * 1.2;
            const trunkOpacity = 0.35 + (Math.cos(branch.index * 1.2) + 1) * 0.2;

            return (
              <g key={`dendrite-${branch.index}`}>
                <path
                  d={`M ${branch.startX},${branch.startY} C ${ctrl1X},${ctrl1Y} ${ctrl2X},${ctrl2Y} ${branch.endX},${branch.endY}`}
                  stroke={colors.neuronPrimary}
                  strokeWidth={trunkThickness}
                  opacity={trunkOpacity}
                  strokeLinecap="round"
                  fill="none"
                />
                {[0.45, 0.65, 0.85].map((progress, pIdx) => {
                  const trunkX =
                    branch.startX + (branch.endX - branch.startX) * progress;
                  const trunkY =
                    branch.startY + (branch.endY - branch.startY) * progress;
                  return [-35, 0, 32].map((angleOffset, sIdx) => {
                    const subAngleDeg =
                      branch.angleDeg +
                      angleOffset +
                      Math.sin((branch.index + pIdx + sIdx) * 2.1) * 8;
                    const subAngle = (subAngleDeg * Math.PI) / 180;
                    const subLength =
                      46 + Math.sin((branch.index + pIdx + sIdx) * 1.9) * 12;
                    const subEndX = trunkX + Math.cos(subAngle) * subLength;
                    const subEndY = trunkY + Math.sin(subAngle) * subLength;
                    const subThickness =
                      1 + (Math.sin((pIdx + sIdx) * 1.5) + 1) * 0.6;
                    const subOpacity =
                      0.22 + (Math.cos((branch.index + sIdx) * 1.1) + 1) * 0.12;

                    return (
                      <g key={`sub-${branch.index}-${pIdx}-${sIdx}`}>
                        <path
                          d={`M ${trunkX},${trunkY} Q ${trunkX + Math.cos(subAngle) * 8},${trunkY + Math.sin(subAngle) * 8} ${subEndX},${subEndY}`}
                          stroke={colors.neuronPrimary}
                          strokeWidth={subThickness}
                          opacity={subOpacity}
                          strokeLinecap="round"
                          fill="none"
                        />
                        {[-18, 18].map((tAngle, tIdx) => {
                          const spikeAngle = ((subAngleDeg + tAngle) * Math.PI) / 180;
                          const spikeLength =
                            16 + Math.sin((branch.index + sIdx + tIdx) * 3.1) * 4;
                          const spikeEndX =
                            subEndX + Math.cos(spikeAngle) * spikeLength;
                          const spikeEndY =
                            subEndY + Math.sin(spikeAngle) * spikeLength;
                          return (
                            <line
                              key={`spike-${branch.index}-${pIdx}-${sIdx}-${tIdx}`}
                              x1={subEndX}
                              y1={subEndY}
                              x2={spikeEndX}
                              y2={spikeEndY}
                              stroke={colors.neuronPrimary}
                              strokeWidth={0.8}
                              opacity={0.18}
                              strokeLinecap="round"
                            />
                          );
                        })}
                        <circle
                          cx={subEndX}
                          cy={subEndY}
                          r={1.6}
                          fill={withAlpha(colors.neuronSecondary, '88')}
                          opacity={0.4}
                        />
                      </g>
                    );
                  });
                })}
              </g>
            );
          })}
        </g>

        <path
          d={somaOutlinePath}
          fill="url(#neuron-soma-morph)"
          stroke={withAlpha(colors.neuronPrimary, 'aa')}
          strokeWidth={2}
          opacity={0.9}
        />
        <ellipse
          cx={somaX}
          cy={somaY}
          rx={somaRadius - 6}
          ry={somaRadius - 8}
          fill={withAlpha(colors.neuronPrimary, '40')}
          transform="rotate(-8 170 160)"
        />

        <ellipse
          cx={168}
          cy={158}
          rx={14}
          ry={12}
          fill={withAlpha(colors.neuronSecondary, 'cc')}
          opacity={0.9}
          transform="rotate(10 168 158)"
        />
        <circle
          cx={170}
          cy={157}
          r={4}
          fill={withAlpha(colors.neuronSecondary, 'ee')}
          opacity={0.9}
        />

        <g>
          <path
            d={`M 203,153 C 210,151 218,151 225,152 C 232,153 237,155 ${axonStartX},${firstSegmentY - 2} L ${axonStartX},${firstSegmentY + 2} C 237,165 232,167 225,168 C 218,169 210,169 203,167 C 201,164 201,156 203,153 Z`}
            fill={withAlpha(colors.neuronPrimary, '55')}
          />
          <path
            d={`M 206,156 Q 215,155 225,${155 + Math.sin(0.5) * 2} T ${axonStartX - 5},${firstSegmentY - 1}`}
            stroke={withAlpha(colors.neuronPrimary, 'aa')}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
          <path
            d={`M 206,164 Q 215,165 225,${165 + Math.sin(0.5) * 2} T ${axonStartX - 5},${firstSegmentY + 1}`}
            stroke={withAlpha(colors.neuronPrimary, 'aa')}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
          <path
            d={`M 208,160 C 218,160 228,${160 + Math.sin(0.8) * 3} ${axonStartX},${firstSegmentY}`}
            stroke="url(#neuron-axon-morph)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
          />
        </g>

        {Array.from({ length: axonSegmentCount }).map((_, i) => {
          const x = axonStartX + i * axonSegmentSpacing;
          const wave = Math.sin((i + 1) * 0.9) * axonCurveAmplitude;
          const segmentY = axonBaselineY + wave;
          const prevWave = Math.sin(i * 0.9) * axonCurveAmplitude;
          const prevSegmentY = axonBaselineY + prevWave;
          const prevSegmentX = axonStartX + (i - 1) * axonSegmentSpacing;
          const prevSegmentRight = prevSegmentX + axonSegmentWidth;
          const gap = x - prevSegmentRight;
          const connectorMidY = (prevSegmentY + segmentY) / 2 + Math.sin(i * 1.2) * 3;
          const connectorControlX = prevSegmentRight + gap / 2;

          return (
            <g key={`axon-segment-${i}`}>
              {i > 0 && (
                <path
                  d={`M ${prevSegmentRight},${prevSegmentY} Q ${connectorControlX},${connectorMidY} ${x},${segmentY}`}
                  stroke="url(#neuron-axon-morph)"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              )}
              <rect
                x={x}
                y={segmentY - axonSegmentHeight / 2}
                width={axonSegmentWidth}
                height={axonSegmentHeight}
                rx={10}
                fill={withAlpha(colors.neuronSecondary, '1f')}
                stroke={withAlpha(colors.neuronSecondary, '88')}
                strokeWidth={1.5}
                opacity={0.9}
                transform={`rotate(${Math.sin((i + 1) * 0.6) * 2} ${x + axonSegmentWidth / 2} ${segmentY})`}
              />
              <path
                d={`M ${x + 3},${segmentY} Q ${x + axonSegmentWidth / 2},${segmentY + Math.sin((i + 1) * 1.1)} ${x + axonSegmentWidth - 3},${segmentY}`}
                stroke={withAlpha(colors.neuronPrimary, 'aa')}
                strokeWidth={2}
                opacity={0.35}
                fill="none"
              />
            </g>
          );
        })}

        <path
          d={`M ${axonEndX},${axonEndY} Q ${(axonEndX + axonTerminalX) / 2},${(axonEndY + terminalBaseY) / 2 + Math.sin(axonSegmentCount * 1.3) * 3} ${axonTerminalX},${terminalBaseY}`}
          stroke="url(#neuron-axon-morph)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.75}
        />

        {terminalBranches.map((branch) => (
          <g key={branch.id}>
            <path
              d={branch.path}
              stroke={withAlpha(colors.neuronSecondary, 'cc')}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
            />
            <circle
              cx={branch.boutonX}
              cy={branch.boutonY}
              r={4}
              fill={withAlpha(colors.neuronSecondary, 'bb')}
              opacity={0.85}
            />
          </g>
        ))}

        {extraTerminals.map((branch) => (
          <g key={branch.id}>
            <path
              d={branch.path}
              stroke={withAlpha(colors.neuronSecondary, '88')}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
              opacity={0.5}
            />
            <circle
              cx={branch.boutonX}
              cy={branch.boutonY}
              r={3.2}
              fill={withAlpha(colors.neuronSecondary, 'aa')}
              opacity={0.6}
            />
          </g>
        ))}
      </motion.svg>
    </div>
  );
};

const CircuitScene = ({ colors }: { colors: any }) => {
  const inputYs = [70, 100, 130];
  const board = { x: 32, y: 34, width: 336, height: 132 };
  const weightBlock = { x: 112, width: 26, height: 18 };
  const sumNode = { x: 224, y: 100, radius: 20 };
  const chip = { x: 284, y: 74, width: 66, height: 52 };
  const moduleEntryX = weightBlock.x - 10;
  const moduleExitX = weightBlock.x + weightBlock.width + 4;
  const inputLeadInX = 64;
  const middleTraceCrest = 12;

  const activationStart = { x: sumNode.x + sumNode.radius, y: sumNode.y };
  const activationConnectorSegment = `C ${sumNode.x + 38},${sumNode.y - 12} ${chip.x - 12},${sumNode.y - 8} ${chip.x - 6},${sumNode.y} S ${chip.x + 8},${sumNode.y + 12} ${chip.x + 12},${sumNode.y}`;
  const activationConnector = `M ${activationStart.x},${activationStart.y} ${activationConnectorSegment}`;
  const outputStart = { x: chip.x + chip.width, y: sumNode.y };
  const outputEndX = chip.x + chip.width + 44; // Position of output node
  const outputConnectorSegment = `C ${outputStart.x + 18},${sumNode.y} ${outputStart.x + 32},${sumNode.y} ${outputEndX},${sumNode.y}`;
  const outputConnector = `M ${outputStart.x},${sumNode.y} ${outputConnectorSegment}`;
  const traceMaskId = 'circuit-trace-mask';
  const traceMaskUrl = `url(#${traceMaskId})`;

  const createTracePath = (y: number, index: number) => {
    const controlX = (moduleExitX + sumNode.x) / 2;
    const controlY = y + (sumNode.y - y) * 0.55;

    if (index === 1) {
      return [
        `M ${inputLeadInX},${y}`,
        `L ${moduleEntryX},${y}`,
        `L ${moduleExitX},${y}`,
        `Q ${moduleExitX + 32},${y - middleTraceCrest} ${sumNode.x - 26},${sumNode.y - middleTraceCrest / 2}`,
        `T ${sumNode.x},${sumNode.y}`,
      ].join(' ');
    }

    if (y === sumNode.y) {
      return [
        `M ${inputLeadInX},${y}`,
        `L ${moduleEntryX},${y}`,
        `L ${moduleExitX},${y}`,
        `L ${sumNode.x - 20},${y}`,
        `L ${sumNode.x},${sumNode.y}`,
      ].join(' ');
    }

    return [
      `M ${inputLeadInX},${y}`,
      `L ${moduleEntryX},${y}`,
      `L ${moduleExitX},${y}`,
      `Q ${moduleExitX + 28},${y} ${controlX},${controlY}`,
      `T ${sumNode.x},${sumNode.y}`,
    ].join(' ');
  };

  const signalPath = useMemo(() => {
    return [
      `M ${inputLeadInX},${sumNode.y}`,
      `L ${moduleEntryX},${sumNode.y}`,
      `L ${moduleExitX},${sumNode.y}`,
      `Q ${moduleExitX + 32},${sumNode.y - middleTraceCrest} ${sumNode.x - 26},${sumNode.y - middleTraceCrest / 2}`,
      `T ${sumNode.x},${sumNode.y}`,
      `L ${activationStart.x},${activationStart.y}`,
      activationConnectorSegment,
      `L ${outputStart.x},${sumNode.y}`,
      outputConnectorSegment,
    ].join(' ');
  }, [activationConnectorSegment, activationStart.x, activationStart.y, inputLeadInX, middleTraceCrest, moduleEntryX, moduleExitX, outputConnectorSegment, outputStart.x, sumNode.x, sumNode.y, outputEndX]);

  const signalPathRef = useRef<SVGPathElement | null>(null);
  const [pulseTrajectory, setPulseTrajectory] = useState<{
    x: number[];
    y: number[];
    opacity: number[];
  } | null>(null);

  useEffect(() => {
    const targetPath = signalPathRef.current;
    if (!targetPath) {
      return;
    }

    const totalLength = targetPath.getTotalLength();
    const steps = 64;
    const xKeyframes: number[] = [];
    const yKeyframes: number[] = [];
    const opacityKeyframes: number[] = [];
    const fadeWindow = Math.max(4, Math.floor(steps / 8));

    for (let i = 0; i <= steps; i++) {
      const point = targetPath.getPointAtLength((totalLength * i) / steps);
      xKeyframes.push(point.x);
      yKeyframes.push(point.y);
    }

    const lastIndex = xKeyframes.length - 1;
    xKeyframes.forEach((_, index) => {
      let opacity = 1;
      if (index < fadeWindow) {
        opacity = index / fadeWindow;
      } else if (index > lastIndex - fadeWindow) {
        opacity = Math.max(0, (lastIndex - index) / fadeWindow);
      }
      opacityKeyframes.push(opacity);
    });

    setPulseTrajectory({ x: xKeyframes, y: yKeyframes, opacity: opacityKeyframes });
  }, [signalPath]);

  return (
    <div 
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.sceneBg }}
    >
      <motion.svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="circuit-signal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.circuitPrimary} stopOpacity="0.95" />
            <stop offset="45%" stopColor={colors.circuitSecondary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.mathPrimary} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="circuit-trace" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`${colors.circuitPrimary}dd`} />
            <stop offset="100%" stopColor={`${colors.circuitSecondary}cc`} />
          </linearGradient>
          <radialGradient id="circuit-node" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={`${colors.circuitPrimary}f5`} />
            <stop offset="60%" stopColor={`${colors.circuitSecondary}d0`} />
            <stop offset="100%" stopColor={`${colors.mathPrimary}a0`} />
          </radialGradient>
          <filter id="circuit-glow">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="circuit-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.18" />
          </filter>
          <mask id={traceMaskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="400" height="200" fill="white" />
            {inputYs.map((y, i) => (
              <circle key={`mask-input-${i}`} cx={50} cy={y} r={11} fill="black" />
            ))}
            {inputYs.map((y, i) => (
              <rect
                key={`mask-weight-${i}`}
                x={weightBlock.x - 2}
                y={y - weightBlock.height / 2 - 2}
                width={weightBlock.width + 6}
                height={weightBlock.height + 4}
                rx={6}
                fill="black"
              />
            ))}
            <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius - 2} fill="black" />
            <rect x={chip.x - 4} y={chip.y - 4} width={chip.width + 8} height={chip.height + 8} rx={10} fill="black" />
            <circle cx={chip.x + chip.width + 44} cy={sumNode.y} r={8.5} fill="black" />
          </mask>
        </defs>

        {/* Board backplate with subtle texture */}
        <motion.rect
          x={board.x}
          y={board.y}
          width={board.width}
          height={board.height}
          rx={10}
          fill={`${colors.containerBg}cc`}
          stroke={`${colors.borderColor}55`}
          strokeWidth={0.75}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.path
          d={`M ${board.x + 16},${board.y + 18} H ${board.x + board.width - 16} M ${board.x + 12},${board.y + board.height - 18} H ${board.x + board.width - 12}`}
          stroke={`${colors.borderColor}33`}
          strokeWidth={0.7}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />

        {/* Input nodes */}
        {inputYs.map((y, i) => (
          <motion.g
            key={`input-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 160, damping: 10 }}
          >
            <circle cx={50} cy={y} r={13} stroke={`${colors.circuitPrimary}66`} strokeWidth={1.5} fill="none" filter="url(#circuit-shadow)" />
            <circle cx={50} cy={y} r={9} fill="url(#circuit-node)" filter="url(#circuit-glow)" />
            <circle cx={50} cy={y} r={3} fill={colors.sceneBg} />
            <text x={24} y={y + 2} fontSize={8} fill={colors.textMuted} textAnchor="middle">x{i + 1}</text>
          </motion.g>
        ))}

        {/* Weight modules */}
        {inputYs.map((y, i) => (
          <motion.g
            key={`weight-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
          >
            <rect
              x={weightBlock.x}
              y={y - weightBlock.height / 2}
              width={weightBlock.width}
              height={weightBlock.height}
              rx={4}
              fill={`${colors.circuitSecondary}25`}
              stroke={`${colors.circuitSecondary}88`}
              strokeWidth={1.2}
              filter="url(#circuit-shadow)"
            />
            <path
              d={`M ${weightBlock.x + 4},${y - 4} L ${weightBlock.x + weightBlock.width - 4},${y - 4} M ${weightBlock.x + 4},${y + 4} L ${weightBlock.x + weightBlock.width - 4},${y + 4}`}
              stroke={`${colors.circuitSecondary}66`}
              strokeWidth={0.9}
            />
            <text
              x={weightBlock.x + weightBlock.width / 2}
              y={y - weightBlock.height / 2 - 6}
              fontSize={7}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              w{i + 1}
            </text>
          </motion.g>
        ))}

        {/* Input traces */}
        {inputYs.map((y, i) => (
          <motion.path
            key={`trace-${i}`}
            d={createTracePath(y, i)}
            stroke="url(#circuit-trace)"
            strokeWidth={i === 1 ? 3.4 : 3}
            strokeLinecap="round"
            fill="none"
            mask={traceMaskUrl}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.9, ease: 'easeInOut' }}
            filter="url(#circuit-shadow)"
          />
        ))}

        <path ref={signalPathRef} d={signalPath} fill="none" stroke="none" pointerEvents="none" />

        {/* Summing junction */}
        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 140, damping: 9 }}>
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius + 8} stroke={`${colors.circuitSecondary}33`} strokeWidth={1} strokeDasharray="4 2" fill="none" />
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius} fill={`${colors.circuitSecondary}18`} stroke={colors.circuitSecondary} strokeWidth={2} filter="url(#circuit-shadow)" />
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius - 6} fill={`${colors.circuitSecondary}12`} />
          <text x={sumNode.x} y={sumNode.y + 6.5} textAnchor="middle" fontSize={22} fill={colors.circuitSecondary} fontWeight="bold">Σ</text>
          <text x={sumNode.x} y={sumNode.y - sumNode.radius - 8} fontSize={9} fill={colors.textMuted} textAnchor="middle">
            weighted sum
          </text>
        </motion.g>

        {/* Bias input */}
        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 170, damping: 10 }}>
          <circle cx={100} cy={44} r={9} fill={colors.circuitSecondary} filter="url(#circuit-glow)" />
          <text x={100} y={47} fontSize={10} fill={colors.sceneBg} textAnchor="middle" fontWeight="bold">+1</text>
          <text x={100} y={28} fontSize={7} fill={colors.textMuted} textAnchor="middle">bias</text>
          <motion.path
            d={`M 108,44 Q ${sumNode.x - 40},64 ${sumNode.x - 12},${sumNode.y - 10}`}
            stroke={`${colors.circuitSecondary}aa`}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.72, duration: 0.7 }}
            opacity={0.75}
          />
        </motion.g>

        {/* Direct connection from summation to output */}
        <motion.path
          d={`M ${sumNode.x + sumNode.radius},${sumNode.y} L ${sumNode.x + 80},${sumNode.y}`}
          stroke="url(#circuit-signal)"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.7, ease: 'easeInOut' }}
          filter="url(#circuit-shadow)"
        />

        {/* Output node - positioned closer to summation */}
        <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.4, type: 'spring', stiffness: 180, damping: 12 }}>
          <circle cx={sumNode.x + 90} cy={sumNode.y} r={10} fill={`${colors.codePrimary}26`} filter="url(#circuit-glow)" />
          <circle cx={sumNode.x + 90} cy={sumNode.y} r={7} fill={colors.codePrimary} filter="url(#circuit-shadow)" />
          <circle cx={sumNode.x + 90} cy={sumNode.y} r={3.6} fill={`${colors.codePrimary}ee`} />
          <text x={sumNode.x + 90} y={sumNode.y + 20} fontSize={9} fill={colors.textMuted} textAnchor="middle">output (y)</text>
        </motion.g>

        {/* Glide highlight along the main bus */}
        <motion.path
          d={activationConnector}
          stroke={`${colors.circuitPrimary}66`}
          strokeWidth={1.2}
          strokeDasharray="6 10"
          strokeDashoffset={40}
          fill="none"
          mask={traceMaskUrl}
          animate={{ strokeDashoffset: [40, -60] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Animated signal pulse */}
        {pulseTrajectory && (
          <motion.circle
            r={4.5}
            fill={colors.circuitPrimary}
            filter="url(#circuit-glow)"
            initial={{ opacity: 0 }}
            mask={traceMaskUrl}
            animate={{
              x: pulseTrajectory.x,
              y: pulseTrajectory.y,
              opacity: pulseTrajectory.opacity,
            }}
            transition={{ delay: 2, duration: 3, repeat: Infinity, repeatDelay: 1.2, ease: 'linear' }}
          />
        )}
      </motion.svg>
    </div>
  );
};

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
        style={{ color: colors.textSecondary, whiteSpace: 'pre' }}
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
      className="w-full max-w-md rounded-2xl border p-6"
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
        <span className="text-sm" style={{ color: colors.textMuted }}>AI Assistant</span>
      </div>
      <div className="space-y-3">
        {/* User message - right aligned */}
        <div className="flex justify-end">
          <motion.div
            className="max-w-[70%] p-3 rounded-2xl rounded-br-sm text-sm"
            style={{ backgroundColor: colors.chatPrimary, color: colors.sceneBg }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Write a haiku about a 986 Boxster
          </motion.div>
        </div>
        
        {/* AI response - left aligned */}
        <div className="flex justify-start">
          <motion.div
            className="max-w-[70%] p-3 rounded-2xl rounded-bl-sm text-sm"
            style={{ backgroundColor: colors.timelineTrack, color: colors.textPrimary }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="whitespace-pre-line">
              Mid-engine purrs soft,{'\n'}
              Silver curves catch morning sun—{'\n'}
              Freedom has no roof.
            </div>
          </motion.div>
        </div>
        
        {/* User follow-up - right aligned */}
        <div className="flex justify-end">
          <motion.div
            className="max-w-[70%] p-3 rounded-2xl rounded-br-sm text-sm"
            style={{ backgroundColor: colors.chatPrimary, color: colors.sceneBg }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            Beautiful!
          </motion.div>
        </div>
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

        <div className="relative h-[18rem] md:h-[20rem]">
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
        
        <div className="px-6 py-4">
          <Timeline
            stages={STAGES}
            stageIndex={stageIndex}
            colors={colors}
            currentTitle={stage.title}
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
  currentTitle: string;
  onSelectStage: (index: number) => void;
}

const Timeline = ({ stages, stageIndex, colors, currentTitle, onSelectStage }: TimelineProps) => {
  const accent = stages[stageIndex].accent;
  
  // Calculate exact percentage based on dot positions
  // For 5 stages: 0%, 25%, 50%, 75%, 100%
  const dotPositions = stages.map((_, i) => (i / (stages.length - 1)) * 100);
  const currentProgress = dotPositions[stageIndex];

  return (
    <div 
      className="rounded-xl border px-5 py-4"
      style={{
        backgroundColor: colors.timelineBg,
        borderColor: colors.borderColor
      }}
    >
      {/* Integrated Title */}
      <motion.h3
        key={`${currentTitle}-title`}
        className="text-lg font-semibold md:text-xl mb-3"
        style={{ color: colors.textPrimary }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentTitle}
      </motion.h3>
      
      <div className="relative">
        <LayoutGroup>
          <div className="relative flex items-center justify-between">
            {stages.map((stage, index) => {
              const isActive = index === stageIndex;
              const dotX = dotPositions[index];
              
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onSelectStage(index)}
                  className="group relative z-10 flex flex-col items-center gap-1.5 text-xs transition-colors"
                  style={{ 
                    color: colors.textMuted,
                    ['&:hover' as any]: { color: colors.textSecondary }
                  }}
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
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
          
          {/* Progress bar positioned under dots, perfectly aligned */}
          <div className="absolute top-2.5 left-2.5 right-2.5 -translate-y-1/2">
            <div 
              className="relative h-0.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: colors.timelineTrack }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                initial={false}
                animate={{ width: `${currentProgress}%` }}
                transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                style={{ backgroundColor: accent }}
              />
            </div>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
};

export default PerceptronContinuum;
