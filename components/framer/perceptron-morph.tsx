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
    title: 'Simple Neuron',
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
  const somaRadius = 35;

  const withAlpha = (hex: string, alpha: string) => {
    if (typeof hex !== 'string' || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 9)) {
      return hex;
    }
    return hex.length === 7 ? `${hex}${alpha}` : hex;
  };

  const roundCoord = (value: number) => Math.round(value * 1000) / 1000;

  const revealClipId = useRef(`neuron-reveal-${Math.random().toString(36).slice(2)}`);

  const parseHex = (hex: string) => {
    if (typeof hex !== 'string' || !hex.startsWith('#')) {
      return null;
    }
    const normalized = hex.length === 9 ? hex.slice(0, 7) : hex;
    if (normalized.length !== 7) {
      return null;
    }
    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);
    if ([r, g, b].some((value) => Number.isNaN(value))) {
      return null;
    }
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
    return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
  };

  const blendColors = (hexA: string, hexB: string, ratio: number) => {
    const colorA = parseHex(hexA);
    const colorB = parseHex(hexB);
    if (!colorA || !colorB) {
      return hexA;
    }
    const t = Math.max(0, Math.min(1, ratio));
    const r = colorA.r + (colorB.r - colorA.r) * t;
    const g = colorA.g + (colorB.g - colorA.g) * t;
    const b = colorA.b + (colorB.b - colorA.b) * t;
    return rgbToHex(r, g, b);
  };

  const lightenColor = (hex: string, amount: number) => blendColors(hex, '#ffffff', amount);
  const darkenColor = (hex: string, amount: number) => blendColors(hex, '#000000', amount);

  const palette = useMemo(() => {
    const primary = colors.neuronPrimary;
    const secondary = colors.neuronSecondary ?? colors.neuronPrimary;
    const accentWarm = '#ff6b35'; // More vibrant orange-red
    const accentCool = '#00d4aa'; // Bright cyan-green
    const accentElectric = '#7c3aed'; // Electric purple
    const accentGold = '#fbbf24'; // Golden yellow

    return {
      somaGradientId: 'neuron-soma-detailed',
      // Enhanced soma with more depth and vibrancy
      somaOuter: withAlpha(blendColors(lightenColor(primary, 0.3), accentElectric, 0.15), 'f8'),
      somaMid: withAlpha(blendColors(primary, secondary, 0.6), 'e8'),
      somaInner: withAlpha(blendColors(darkenColor(primary, 0.1), accentElectric, 0.2), '90'),
      membrane: withAlpha(blendColors(primary, accentElectric, 0.25), 'f5'),
      
      // More dynamic dendrite colors with gradient-like transitions
      dendriteMain: withAlpha(blendColors(primary, accentCool, 0.3), 'e0'),
      dendriteSecondary: withAlpha(blendColors(lightenColor(primary, 0.2), accentCool, 0.4), 'c8'),
      dendriteFine: withAlpha(blendColors(secondary, accentCool, 0.6), '85'),
      dendriteSpine: withAlpha(blendColors(lightenColor(secondary, 0.3), accentGold, 0.3), 'b8'),
      
      // Enhanced axon with more electrical feel
      axonHillock: withAlpha(blendColors(blendColors(primary, secondary, 0.5), accentElectric, 0.2), 'a8'),
      axonCore: withAlpha(blendColors(secondary, accentCool, 0.5), 'e5'),
      myelinFill: withAlpha(blendColors(lightenColor(secondary, 0.4), accentGold, 0.2), '45'),
      myelinStroke: withAlpha(blendColors(lightenColor(secondary, 0.2), accentCool, 0.3), 'c0'),
      
      // More vibrant terminals with energy-like colors
      terminal: withAlpha(blendColors(secondary, accentWarm, 0.5), 'f0'),
      terminalSoft: withAlpha(blendColors(secondary, accentCool, 0.6), 'c5'),
      vesicle: withAlpha(blendColors(blendColors(secondary, primary, 0.3), accentGold, 0.4), 'e0'),
      
      // Enhanced nucleus with more biological depth
      nucleus: withAlpha(blendColors(blendColors(primary, '#1d4ed8', 0.4), accentElectric, 0.2), 'f8'),
      nucleolus: withAlpha(blendColors(lightenColor(secondary, 0.3), accentGold, 0.3), 'ff'),
    };
  }, [colors.neuronPrimary, colors.neuronSecondary]);

  const numMainBranches = 8;

  const mainBranches = useMemo(() => {
    return Array.from({ length: numMainBranches }, (_, i) => {
      const baseAngle = 90 + (i / (numMainBranches - 1 || 1)) * 180;
      const angleVariation = Math.sin(i * 2.7) * 12;
      const angleDeg = baseAngle + angleVariation;
      const angleRad = (angleDeg * Math.PI) / 180;
      const length = 90 + Math.sin(i * 1.3) * 25;
      const startX = roundCoord(somaX + Math.cos(angleRad) * somaRadius);
      const startY = roundCoord(somaY + Math.sin(angleRad) * somaRadius);
      const endX = roundCoord(somaX + Math.cos(angleRad) * (length + somaRadius));
      const endY = roundCoord(somaY + Math.sin(angleRad) * (length + somaRadius));
      return { startX, startY, endX, endY, angleDeg, index: i };
    });
  }, [numMainBranches, somaRadius, somaX, somaY]);

  const fineDendrites = useMemo(() => {
    return [45, 135, 180, 225, 315].map((angle, idx) => {
      const angleRad = (angle * Math.PI) / 180;
      const length = 50 + Math.sin(idx * 2.3) * 20;
      const startX = roundCoord(somaX + Math.cos(angleRad) * somaRadius);
      const startY = roundCoord(somaY + Math.sin(angleRad) * somaRadius);
      const endX = roundCoord(somaX + Math.cos(angleRad) * (length + somaRadius));
      const endY = roundCoord(somaY + Math.sin(angleRad) * (length + somaRadius));
      return { startX, startY, endX, endY, angle };
    });
  }, [somaRadius, somaX, somaY]);

  const somaPaths = useMemo(() => {
    const points: Array<{ x: number; y: number; angle: number }> = [];
    const numPoints = 24;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const baseRadius = 32;
      const angleDeg = (angle * 180) / Math.PI;
      let radius = baseRadius;

      if (angleDeg > 90 && angleDeg < 270) {
        radius += Math.sin(angle * 4) * 5 + Math.cos(angle * 3) * 3;
      } else {
        radius += Math.sin(angle * 2) * 2;
      }

      points.push({
        x: somaX + Math.cos(angle) * radius,
        y: somaY + Math.sin(angle) * radius,
        angle,
      });
    }

    const buildPath = () => {
      if (!points.length) {
        return '';
      }
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const cp1x = current.x + Math.cos(current.angle + Math.PI / 2) * 8;
        const cp1y = current.y + Math.sin(current.angle + Math.PI / 2) * 8;
        const cp2x = next.x + Math.cos(next.angle - Math.PI / 2) * 8;
        const cp2y = next.y + Math.sin(next.angle - Math.PI / 2) * 8;
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
      }
      return `${path} Z`;
    };

    return {
      fill: buildPath(),
      outline: buildPath(),
    };
  }, [somaX, somaY]);

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

  const terminalData = useMemo(() => {
    const primaryX = axonTerminalX;
    const primaryY = terminalBaseY;
    const mainAngles = [-25, 0, 25];

    const mainCurves = mainAngles.map((angle, idx) => {
      const length = 25 + Math.sin(idx * 1.7) * 5;
      const endX = primaryX + length;
      const endY = primaryY + Math.sin((angle * Math.PI) / 180) * length;
      return { angle, endX, endY };
    });

    const branches: Array<{
      id: string;
      secondaryStartX: number;
      secondaryStartY: number;
      secondaryEndX: number;
      secondaryEndY: number;
      terminalStartX: number;
      terminalStartY: number;
      terminalEndX: number;
      terminalEndY: number;
      boutonX: number;
      boutonY: number;
    }> = [];

    mainAngles.forEach((angle, mainIdx) => {
      const mainLength = 25 + Math.sin(mainIdx * 1.7) * 5;
      const mainEndX = primaryX + mainLength;
      const mainEndY = primaryY + Math.sin((angle * Math.PI) / 180) * mainLength;
      const numSecondary = mainIdx === 1 ? 3 : 2;

      for (let secIdx = 0; secIdx < numSecondary; secIdx++) {
        const secAngle = angle + (secIdx - (numSecondary - 1) / 2) * 15;
        const secLength = 20 + Math.sin((mainIdx + secIdx) * 2.1) * 5;
        const secEndX = mainEndX + Math.cos((secAngle * Math.PI) / 180) * secLength;
        const secEndY = mainEndY + Math.sin((secAngle * Math.PI) / 180) * secLength * 1.2;
        const numBoutons = secIdx % 2 === 0 ? 2 : 1;

        for (let boutIdx = 0; boutIdx < numBoutons; boutIdx++) {
          const boutAngle = secAngle + (boutIdx - (numBoutons - 1) / 2) * 20;
          const boutLength = 12 + Math.sin((secIdx + boutIdx) * 3.1) * 3;
          const boutonX = secEndX + Math.cos((boutAngle * Math.PI) / 180) * boutLength;
          const boutonY = secEndY + Math.sin((boutAngle * Math.PI) / 180) * boutLength;

          branches.push({
            id: `${mainIdx}-${secIdx}-${boutIdx}`,
            secondaryStartX: mainEndX,
            secondaryStartY: mainEndY,
            secondaryEndX: secEndX,
            secondaryEndY: secEndY,
            terminalStartX: secEndX,
            terminalStartY: secEndY,
            terminalEndX: boutonX,
            terminalEndY: boutonY,
            boutonX,
            boutonY,
          });
        }
      }
    });

    const extra = [-18, 18].map((angle, idx) => {
      const startX = primaryX;
      const startY = primaryY;
      const controlX = startX + 24;
      const controlY = startY + angle * 1.3;
      const endX = controlX + 32;
      const endY = controlY + angle * 0.9;
      return { id: `extra-${idx}`, path: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`, endX, endY };
    });

    return { primaryX, primaryY, mainAngles, mainCurves, branches, extra };
  }, [axonTerminalX, terminalBaseY]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.sceneBg }}
    >
      <motion.svg
        viewBox="0 0 700 320"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <radialGradient id={palette.somaGradientId} cx="45%" cy="40%" r="85%">
            <stop offset="0%" stopColor={palette.somaOuter} />
            <stop offset="35%" stopColor={palette.somaMid} />
            <stop offset="70%" stopColor={palette.somaInner} />
            <stop offset="100%" stopColor={withAlpha(darkenColor(colors.neuronPrimary, 0.3), '60')} />
          </radialGradient>
          <radialGradient id="neuron-membrane-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={withAlpha(colors.neuronPrimary, '40')} />
            <stop offset="100%" stopColor={withAlpha(colors.neuronPrimary, '00')} />
          </radialGradient>
          <linearGradient id="dendrite-energy" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.dendriteMain} />
            <stop offset="50%" stopColor={palette.dendriteSecondary} />
            <stop offset="100%" stopColor={palette.dendriteFine} />
          </linearGradient>
          <radialGradient id="axon-pulse" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={withAlpha(lightenColor(colors.neuronSecondary, 0.2), 'cc')} />
            <stop offset="60%" stopColor={palette.axonCore} />
            <stop offset="100%" stopColor={withAlpha(darkenColor(colors.neuronSecondary, 0.2), '80')} />
          </radialGradient>
          <filter id="neuron-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <clipPath id={revealClipId.current}>
            <motion.rect
              x="0"
              y="0"
              height="320"
              initial={{ width: 0 }}
              animate={{ width: 700 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />
          </clipPath>
        </defs>

        <motion.g
          clipPath={`url(#${revealClipId.current})`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Dendritic canopy */}
          {mainBranches.map((branch) => {
            const ctrl1X = roundCoord(branch.startX + (branch.endX - branch.startX) * 0.3 + Math.sin(branch.index * 0.4) * 6);
            const ctrl1Y = roundCoord(branch.startY + (branch.endY - branch.startY) * 0.3 + Math.cos(branch.index * 0.4) * 6);
            const trunkThickness = 3 + Math.sin(branch.index * 0.5) * 0.8;

            return (
              <g key={`dendrite-${branch.index}`}>
                <path
                  d={`M ${branch.startX},${branch.startY} Q ${ctrl1X},${ctrl1Y} ${branch.endX},${branch.endY}`}
                  stroke="url(#dendrite-energy)"
                  strokeWidth={trunkThickness}
                  opacity={0.6}
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neuron-glow)"
                />

                {[0.4, 0.6, 0.8].map((progress, pIdx) => {
                  const trunkX = roundCoord(branch.startX + (branch.endX - branch.startX) * progress);
                  const trunkY = roundCoord(branch.startY + (branch.endY - branch.startY) * progress);

                  return [-30, 0, 30].map((angleOffset, sIdx) => {
                    const subAngle = branch.angleDeg + angleOffset + Math.sin((pIdx + sIdx) * 2.1) * 10;
                    const subLength = 40 + Math.sin((pIdx + sIdx) * 1.7) * 15;
                    const subEndX = roundCoord(trunkX + Math.cos((subAngle * Math.PI) / 180) * subLength);
                    const subEndY = roundCoord(trunkY + Math.sin((subAngle * Math.PI) / 180) * subLength);

                    return (
                      <g key={`sub-${branch.index}-${pIdx}-${sIdx}`}>
                        <path
                          d={`M ${trunkX},${trunkY} C ${trunkX + 5},${trunkY + Math.sin(angleOffset) * 2} ${(trunkX + subEndX) / 2},${(trunkY + subEndY) / 2} ${subEndX},${subEndY}`}
                          stroke={palette.dendriteSecondary}
                          strokeWidth={1.6}
                          opacity={0.3}
                          strokeLinecap="round"
                          fill="none"
                        />

                        {[-20, 20].map((tAngle, tIdx) => {
                          const spikeAngle = subAngle + tAngle;
                          const spikeLength = 15 + Math.sin((tIdx + sIdx) * 3.1) * 5;
                          const spikeEndX = roundCoord(subEndX + Math.cos((spikeAngle * Math.PI) / 180) * spikeLength);
                          const spikeEndY = roundCoord(subEndY + Math.sin((spikeAngle * Math.PI) / 180) * spikeLength);

                          return (
                            <path
                              key={`spike-${tIdx}`}
                              d={`M ${subEndX},${subEndY} L ${spikeEndX},${spikeEndY}`}
                              stroke={palette.dendriteFine}
                              strokeWidth={0.8}
                              opacity={0.2}
                              strokeLinecap="round"
                            />
                          );
                        })}

                        <circle cx={subEndX} cy={subEndY} r={1.2} fill={palette.dendriteSpine} opacity={0.25} />
                      </g>
                    );
                  });
                })}

                {[-25, 0, 25].map((angleOffset, tIdx) => {
                  const termAngle = branch.angleDeg + angleOffset;
                  const termLength = 24;
                  const termEndX = roundCoord(branch.endX + Math.cos((termAngle * Math.PI) / 180) * termLength);
                  const termEndY = roundCoord(branch.endY + Math.sin((termAngle * Math.PI) / 180) * termLength);

                  return (
                    <path
                      key={`terminal-${tIdx}`}
                      d={`M ${branch.endX},${branch.endY} L ${termEndX},${termEndY}`}
                      stroke={palette.dendriteFine}
                      strokeWidth={1}
                      opacity={0.18}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            );
          })}

          {fineDendrites.map((branch, idx) => (
            <g key={`fine-${idx}`}>
              <path
                d={`M ${branch.startX},${branch.startY} L ${branch.endX},${branch.endY}`}
                stroke={palette.dendriteSecondary}
                strokeWidth={1.4}
                opacity={0.18}
                strokeLinecap="round"
              />
              {[-15, 15].map((offset, i) => {
                const offsetAngle = (branch.angle + offset) * (Math.PI / 180);
                const budX = roundCoord(branch.endX + Math.cos(offsetAngle) * 16);
                const budY = roundCoord(branch.endY + Math.sin(offsetAngle) * 16);
                return (
                  <path
                    key={`${idx}-${i}`}
                    d={`M ${branch.endX},${branch.endY} L ${budX},${budY}`}
                    stroke={palette.dendriteFine}
                    strokeWidth={0.6}
                    opacity={0.12}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ))}

          {/* Soma with enhanced gradients and glow */}
          <circle cx={somaX} cy={somaY} r={somaRadius + 8} fill="url(#neuron-membrane-glow)" opacity={0.6} />
          <path d={somaPaths.fill} fill={`url(#${palette.somaGradientId})`} opacity={0.92} filter="url(#neuron-glow)" />
          <ellipse cx="168" cy="160" rx="26" ry="24" fill={palette.somaInner} opacity={0.4} transform="rotate(15 168 160)" />
          <ellipse cx="172" cy="158" rx="22" ry="20" fill={withAlpha(colors.neuronSecondary, '35')} opacity={0.6} transform="rotate(-25 172 158)" />
          <path d={somaPaths.outline} fill="none" stroke={palette.membrane} strokeWidth={1.3} opacity={0.95} />
          <circle cx={somaX - 5} cy={somaY - 5} r={3} fill={withAlpha(lightenColor(colors.neuronPrimary, 0.4), 'aa')} opacity={0.8} />

          {/* Nucleus */}
          <ellipse cx="168" cy="158" rx="14" ry="12" fill={palette.nucleus} opacity={0.85} transform="rotate(10 168 158)" />
          <circle cx="170" cy="157" r="4" fill={palette.nucleolus} opacity={0.9} />

          {/* Axon hillock */}
          <g>
            <path
              d={`M 203,153 C 210,151 218,151 225,152 C 232,153 237,155 ${axonStartX},${firstSegmentY - 2} L ${axonStartX},${firstSegmentY + 2} C 237,165 232,167 225,168 C 218,169 210,169 203,167 C 201,164 201,156 203,153 Z`}
              fill={palette.axonHillock}
              opacity={0.5}
            />
            <path
              d={`M 206,156 Q 215,155 225,${155 + Math.sin(0.5) * 2} T ${axonStartX - 5},${firstSegmentY - 1}`}
              stroke={palette.axonHillock}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
            <path
              d={`M 206,164 Q 215,165 225,${165 + Math.sin(0.5) * 2} T ${axonStartX - 5},${firstSegmentY + 1}`}
              stroke={palette.axonHillock}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
            <path
              d={`M 208,160 C 218,160 228,${160 + Math.sin(0.8) * 3} ${axonStartX},${firstSegmentY}`}
              stroke="url(#axon-pulse)"
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.95}
              filter="url(#neuron-glow)"
            />
          </g>

          {/* Axon */}
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
                    stroke="url(#axon-pulse)"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                )}
                <rect
                  x={x}
                  y={segmentY - axonSegmentHeight / 2}
                  width={axonSegmentWidth}
                  height={axonSegmentHeight}
                  rx={10}
                  fill={palette.myelinFill}
                  stroke={palette.myelinStroke}
                  strokeWidth={1.5}
                  opacity={0.9}
                  transform={`rotate(${Math.sin((i + 1) * 0.6) * 2} ${x + axonSegmentWidth / 2} ${segmentY})`}
                />
                <path
                  d={`M ${x + 3},${segmentY} Q ${x + axonSegmentWidth / 2},${segmentY + Math.sin((i + 1) * 1.1)} ${x + axonSegmentWidth - 3},${segmentY}`}
                  stroke={palette.axonCore}
                  strokeWidth={2}
                  opacity={0.35}
                  fill="none"
                />
              </g>
            );
          })}

          <path
            d={`M ${axonEndX},${axonEndY} Q ${(axonEndX + axonTerminalX) / 2},${(axonEndY + terminalBaseY) / 2 + Math.sin(axonSegmentCount * 1.3) * 3} ${axonTerminalX},${terminalBaseY}`}
            stroke="url(#axon-pulse)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
            filter="url(#neuron-glow)"
          />

          {/* Axon terminals */}
          {terminalData.mainCurves.map((curve, idx) => (
            <path
              key={`terminal-main-${idx}`}
              d={`M ${terminalData.primaryX},${terminalData.primaryY} Q ${terminalData.primaryX + 10},${terminalData.primaryY + Math.sin((curve.angle * Math.PI) / 180) * 5} ${curve.endX},${curve.endY}`}
              stroke={palette.terminal}
              strokeWidth={3}
              fill="none"
              opacity={0.6}
              strokeLinecap="round"
            />
          ))}

          {terminalData.branches.map((branch) => {
            const boutonRadius = 6 + Math.sin(branch.boutonX * 0.1) * 1;
            return (
              <g key={branch.id}>
                <path
                  d={`M ${branch.secondaryStartX},${branch.secondaryStartY} C ${branch.secondaryStartX + 5},${branch.secondaryStartY + 2} ${(branch.secondaryStartX + branch.secondaryEndX) / 2},${(branch.secondaryStartY + branch.secondaryEndY) / 2} ${branch.secondaryEndX},${branch.secondaryEndY}`}
                  stroke={palette.terminal}
                  strokeWidth={2}
                  fill="none"
                  opacity={0.5}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${branch.terminalStartX},${branch.terminalStartY} L ${branch.terminalEndX},${branch.terminalEndY}`}
                  stroke={palette.terminalSoft}
                  strokeWidth={1.5}
                  fill="none"
                  opacity={0.45}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${branch.boutonX},${branch.boutonY} m -${boutonRadius},0 c 0,-${boutonRadius * 0.8} ${boutonRadius * 0.8},-${boutonRadius} ${boutonRadius},-${boutonRadius} c ${boutonRadius * 0.2},0 ${boutonRadius},${boutonRadius * 0.2} ${boutonRadius},${boutonRadius} c 0,${boutonRadius * 0.8} -${boutonRadius * 0.8},${boutonRadius} -${boutonRadius},${boutonRadius} c -${boutonRadius * 0.2},0 -${boutonRadius},-${boutonRadius * 0.2} -${boutonRadius},-${boutonRadius} Z`}
                  fill={palette.terminal}
                  opacity={0.7}
                />
                <ellipse
                  cx={branch.boutonX + boutonRadius * 0.3}
                  cy={branch.boutonY}
                  rx={boutonRadius * 0.4}
                  ry={boutonRadius * 0.5}
                  fill={palette.terminalSoft}
                  opacity={0.6}
                />
                <circle cx={branch.boutonX - 2} cy={branch.boutonY - 1} r={1.8} fill={palette.vesicle} opacity={0.4} />
                <circle cx={branch.boutonX + 1} cy={branch.boutonY + 1} r={1.5} fill={palette.vesicle} opacity={0.35} />
                <circle cx={branch.boutonX - 1} cy={branch.boutonY + 2} r={1.3} fill={palette.vesicle} opacity={0.3} />
                <circle cx={branch.boutonX + 2} cy={branch.boutonY - 2} r={1.6} fill={palette.vesicle} opacity={0.35} />
              </g>
            );
          })}

          {terminalData.extra.map((extra) => (
            <g key={extra.id}>
              <path d={extra.path} stroke={palette.terminalSoft} strokeWidth={1} fill="none" opacity={0.35} strokeLinecap="round" />
              <circle cx={extra.endX} cy={extra.endY} r={3.5} fill={palette.terminalSoft} opacity={0.4} />
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
};

const CircuitScene = ({ colors }: { colors: any }) => {
  const inputYs = [70, 100, 130];
  const board = { x: 32, y: 34, width: 336, height: 132 };
  const weightBlock = { x: 112, width: 26, height: 18 };
  const sumNode = { x: 224, y: 100, radius: 20 };
  const activationBlock = { x: sumNode.x + 60, width: weightBlock.width, height: weightBlock.height };
  const outputNodeX = sumNode.x + 136; // Position output node with tighter spacing

  const inputNode = { x: 50, radius: 13 };
  const weightEntryX = weightBlock.x;
  const weightExitX = weightBlock.x + weightBlock.width;
  const sumEntryX = sumNode.x - sumNode.radius;
  const sumExitX = sumNode.x + sumNode.radius;
  const activationEntryX = activationBlock.x;
  const activationExitX = activationBlock.x + activationBlock.width;
  const angledTraceExitX = weightExitX + 20;

  const inputLeadInX = inputNode.x + inputNode.radius; // Hard-connect the traces to the right edge of the input nodes
  const traceMaskId = 'circuit-trace-mask';

  const centralTraceSegments = useMemo(() => {
    const y = sumNode.y;
    return [
      {
        key: 'x2-to-weight',
        d: `M ${inputLeadInX},${y} L ${weightEntryX},${y}`,
        stroke: colors.circuitPrimary,
        strokeWidth: 3.6,
      },
      {
        key: 'through-weight',
        d: `M ${weightEntryX},${y} L ${weightExitX},${y}`,
        stroke: colors.circuitPrimary,
        strokeWidth: 3.6,
      },
      {
        key: 'weight-to-sum',
        d: `M ${weightExitX},${y} L ${sumEntryX},${y}`,
        stroke: colors.circuitPrimary,
        strokeWidth: 3.6,
      },
      {
        key: 'sum-cross',
        d: `M ${sumEntryX},${y} L ${sumExitX},${y}`,
        stroke: colors.circuitSecondary,
        strokeWidth: 3.4,
      },
      {
        key: 'sum-to-activation',
        d: `M ${sumExitX},${y} L ${activationEntryX},${y}`,
        stroke: colors.circuitSecondary,
        strokeWidth: 3.4,
      },
      {
        key: 'through-activation',
        d: `M ${activationEntryX},${y} L ${activationExitX},${y}`,
        stroke: colors.mathPrimary,
        strokeWidth: 3.2,
      },
      {
        key: 'activation-to-output',
        d: `M ${activationExitX},${y} L ${outputNodeX},${y}`,
        stroke: colors.mathPrimary,
        strokeWidth: 3.2,
      },
    ];
  }, [
    activationEntryX,
    activationExitX,
    colors.circuitPrimary,
    colors.circuitSecondary,
    colors.mathPrimary,
    inputLeadInX,
    outputNodeX,
    sumEntryX,
    sumExitX,
    sumNode.y,
    weightEntryX,
    weightExitX,
  ]);

  const createTracePath = (y: number, index: number) => {
    // Create individual straight line paths from each input through its weight block to summation
    if (index === 1) {
      return '';
    }

    // Top and bottom traces (x1 and x3) - need to angle to summation node
    return [
      `M ${inputLeadInX},${y}`,           // Start at input lead-in
      `L ${weightEntryX},${y}`,           // Line to weight block entry
      `L ${weightExitX},${y}`,            // Line through weight block
      `L ${angledTraceExitX},${y}`,       // Extend horizontally a bit
      `L ${sumEntryX},${sumNode.y}`,      // Angle to summation node
    ].join(' ');
  };

  const signalPath = useMemo(() => {
    return [
      `M ${inputLeadInX},${sumNode.y}`,
      `L ${weightEntryX},${sumNode.y}`,
      `L ${weightExitX},${sumNode.y}`,
      `L ${sumEntryX},${sumNode.y}`,
      `L ${sumExitX},${sumNode.y}`,
      `L ${activationEntryX},${sumNode.y}`,
      `L ${activationExitX},${sumNode.y}`,
      `L ${outputNodeX},${sumNode.y}`,
    ].join(' ');
  }, [
    inputLeadInX,
    weightEntryX,
    weightExitX,
    sumEntryX,
    sumExitX,
    sumNode.y,
    activationEntryX,
    activationExitX,
    outputNodeX,
  ]);

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
            <rect
              x={activationBlock.x - 2}
              y={sumNode.y - activationBlock.height / 2 - 2}
              width={activationBlock.width + 4}
              height={activationBlock.height + 4}
              rx={6}
              fill="black"
            />
            <circle cx={outputNodeX} cy={sumNode.y} r={8.5} fill="black" />
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
              y={y - weightBlock.height / 2 - 2}
              fontSize={7}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              w{i + 1}
            </text>
          </motion.g>
        ))}

        <path ref={signalPathRef} d={signalPath} fill="none" stroke="none" pointerEvents="none" />

        {/* Summing junction */}
        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 140, damping: 9 }}>
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius + 8} stroke={`${colors.circuitSecondary}33`} strokeWidth={1} strokeDasharray="4 2" fill="none" />
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius} fill={`${colors.circuitSecondary}18`} stroke={colors.circuitSecondary} strokeWidth={2} filter="url(#circuit-shadow)" />
          <circle cx={sumNode.x} cy={sumNode.y} r={sumNode.radius - 6} fill={`${colors.circuitSecondary}12`} />
          <text x={sumNode.x} y={sumNode.y + 6.5} textAnchor="middle" fontSize={22} fill={colors.circuitSecondary} fontWeight="bold">Σ</text>
          <text x={sumNode.x} y={sumNode.y - sumNode.radius - 8} fontSize={9} fill={colors.textMuted} textAnchor="middle">
            perceptron
          </text>
          <text x={sumNode.x} y={sumNode.y + sumNode.radius + 14} fontSize={8} fill={colors.textMuted} textAnchor="middle">
            Σwᵢxᵢ + b
          </text>
        </motion.g>

        {/* Bias input */}
        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 170, damping: 10 }}>
          <circle cx={100} cy={44} r={9} fill={colors.circuitSecondary} filter="url(#circuit-glow)" />
          <text x={100} y={47} fontSize={10} fill={colors.sceneBg} textAnchor="middle" fontWeight="bold">+1</text>
          <text x={100} y={28} fontSize={7} fill={colors.textMuted} textAnchor="middle">bias</text>
          <motion.path
            d={`M 108,44 L ${sumNode.x - 12},${sumNode.y - 10}`}
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

        {/* Activation to Output connector block - similar to weight blocks */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.4 }}
        >
           <rect
             x={activationBlock.x}
             y={sumNode.y - activationBlock.height / 2}
             width={activationBlock.width}
             height={activationBlock.height}
             rx={4}
             fill={`${colors.mathPrimary}25`}
             stroke={`${colors.mathPrimary}88`}
             strokeWidth={1.2}
             filter="url(#circuit-shadow)"
           />
           <path
             d={`M ${activationBlock.x + 4},${sumNode.y - 4} L ${activationBlock.x + activationBlock.width - 4},${sumNode.y - 4} M ${activationBlock.x + 4},${sumNode.y + 4} L ${activationBlock.x + activationBlock.width - 4},${sumNode.y + 4}`}
             stroke={`${colors.mathPrimary}66`}
             strokeWidth={0.9}
           />
           <text
             x={activationBlock.x + activationBlock.width / 2}
             y={sumNode.y + 2}
             fontSize={11}
             fill={colors.mathPrimary}
             textAnchor="middle"
             fontWeight="bold"
           >
             f(·)
           </text>
           <text
             x={activationBlock.x + activationBlock.width / 2}
             y={sumNode.y - activationBlock.height / 2 - 6}
             fontSize={7}
             fill={colors.textMuted}
             textAnchor="middle"
           >
             activation
           </text>
        </motion.g>

        {/* Output node */}
        <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, type: 'spring', stiffness: 180, damping: 12 }}>
          <circle cx={outputNodeX} cy={sumNode.y} r={10} fill={`${colors.codePrimary}26`} filter="url(#circuit-glow)" />
          <circle cx={outputNodeX} cy={sumNode.y} r={7} fill={colors.codePrimary} filter="url(#circuit-shadow)" />
          <circle cx={outputNodeX} cy={sumNode.y} r={3.6} fill={`${colors.codePrimary}ee`} />
          <text x={outputNodeX} y={sumNode.y + 20} fontSize={9} fill={colors.textMuted} textAnchor="middle">output (y)</text>
        </motion.g>

        {/* Input traces for x₁ and x₃ */}
        {inputYs.map((y, i) => {
          if (i === 1) {
            return null;
          }

          return (
            <motion.path
              key={`trace-${i}`}
              d={createTracePath(y, i)}
              stroke={colors.circuitPrimary}
              strokeWidth={3.2}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.9, ease: 'easeInOut' }}
              filter="url(#circuit-shadow)"
            />
          );
        })}

        {/* Central trace showing x₂ travelling through each module */}
        {centralTraceSegments.map((segment, segmentIndex) => (
          <motion.path
            key={segment.key}
            d={segment.d}
            stroke={segment.stroke}
            strokeWidth={segment.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              delay: 0.35 + 1 * 0.12 + segmentIndex * 0.08,
              duration: 0.55,
              ease: 'easeInOut',
            }}
            filter="url(#circuit-shadow)"
          />
        ))}


        {/* Animated signal pulse */}
        {pulseTrajectory && (
          <motion.circle
            r={4.5}
            fill={colors.circuitPrimary}
            filter="url(#circuit-glow)"
            initial={{ opacity: 0 }}
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
        neuronPrimary: "#7c3aed",
        neuronSecondary: "#059669",
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
      
      // Stage-specific colors - more vibrant and dynamic for dark mode
      neuronPrimary: "#8b5cf6", // Rich purple with more saturation
      neuronSecondary: "#06ffa5", // Electric green with cyan undertones
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
      
      // Stage-specific colors - enhanced vibrancy for light mode
      neuronPrimary: "#7c3aed", // Deeper purple for better contrast
      neuronSecondary: "#059669", // Richer emerald green
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
