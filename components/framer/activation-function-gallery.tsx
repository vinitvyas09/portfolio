"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

const DEFAULT_DOMAIN = { min: -5, max: 5 } as const;

const generateTicks = (min: number, max: number, divisions = 4) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0];
  }

  if (min === max) {
    return [Number.parseFloat(min.toFixed(4))];
  }

  const step = (max - min) / divisions;
  const ticks = Array.from({ length: divisions + 1 }, (_, index) => min + index * step);

  if (min < 0 && max > 0) {
    ticks.push(0);
  }

  const unique = Array.from(new Set(ticks.map((tick) => Number.parseFloat(tick.toFixed(4)))));
  return unique.sort((a, b) => a - b);
};

const formatTick = (value: number) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  const absValue = Math.abs(value);

  if (absValue < 1e-4) {
    return '0';
  }

  if (absValue >= 1000 || (absValue > 0 && absValue < 1e-2)) {
    return value.toExponential(1);
  }

  if (absValue < 1) {
    return Number.parseFloat(value.toFixed(2)).toString();
  }

  if (absValue < 10) {
    return Number.parseFloat(value.toFixed(1)).toString();
  }

  return Number.parseFloat(value.toFixed(0)).toString();
};

interface ActivationFunction {
  name: string;
  formula: string;
  description: string;
  fn: (x: number) => number;
  color: string;
  range: { min: number; max: number };
  domain?: { min: number; max: number };
  xTicks?: number[];
  yTicks?: number[];
  asymptotes?: number[];
  sampleCount?: number;
  customPath?: (helpers: {
    toSvgX: (x: number) => number;
    toSvgY: (y: number) => number;
    domain: { min: number; max: number };
    range: { min: number; max: number };
  }) => string;
  reference?: {
    fn: (x: number) => number;
    label: string;
    color?: string;
    strokeDasharray?: string;
  };
}

interface ActivationFunctionGalleryProps {
  config?: {
    functions?: Array<{
      name: string;
      formula: string;
      description: string;
    }>;
    showInteractive?: boolean;
    animateTransitions?: boolean;
    highlightCurrent?: string;
  };
}

const ActivationFunctionGallery: React.FC<ActivationFunctionGalleryProps> = ({
  config = {
    functions: [
      { name: "Sign (Original)", formula: "sgn(x) where x is the input", description: "Binary decisions: -1, 0, or 1" },
      { name: "Sigmoid", formula: "1/(1+e^-x)", description: "Smooth probability between 0 and 1" },
      { name: "Tanh", formula: "tanh(x)", description: "Centered sigmoid, outputs -1 to 1" },
      { name: "ReLU", formula: "max(0, x)", description: "Modern favorite: 0 or positive" },
      { name: "Leaky ReLU", formula: "max(0.01x, x)", description: "ReLU with a small negative slope" }
    ],
    showInteractive: true,
    animateTransitions: true,
    highlightCurrent: "Sign"
  }
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const [selectedFunction, setSelectedFunction] = useState(0);
  const [hoveredFunction, setHoveredFunction] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Color scheme
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        primary: "#6366f1",
        secondary: "#10b981",
        tertiary: "#f59e0b",
        quaternary: "#ec4899",
        quinary: "#8b5cf6",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        cardBg: "rgba(248, 250, 252, 0.95)",
        cardHoverBg: "rgba(241, 245, 249, 0.98)",
        borderColor: "#e2e8f0",
        gridLine: "#e2e8f0",
        axisLine: "#94a3b8"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      primary: "#a78bfa",
      secondary: "#34d399",
      tertiary: "#fbbf24",
      quaternary: "#f87171",
      quinary: "#c084fc",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      cardBg: "rgba(23, 23, 23, 0.9)",
      cardHoverBg: "rgba(31, 41, 55, 0.95)",
      borderColor: "#404040",
      gridLine: "#262626",
      axisLine: "#6b7280"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      primary: "#6366f1",
      secondary: "#10b981",
      tertiary: "#f59e0b",
      quaternary: "#ec4899",
      quinary: "#8b5cf6",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      cardBg: "rgba(248, 250, 252, 0.95)",
      cardHoverBg: "rgba(241, 245, 249, 0.98)",
      borderColor: "#e2e8f0",
      gridLine: "#e2e8f0",
      axisLine: "#94a3b8"
    };
  }, [isDark, mounted]);

  // Activation functions implementation
  const activationFunctions: ActivationFunction[] = useMemo(() => [
    {
      name: "Sign (Original)",
      formula: "sgn(x) where x is the input",
      description: "Binary decisions: -1, 0, or 1",
      fn: (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0),
      color: colors.primary,
      range: { min: -1.5, max: 1.5 },
      domain: { min: -5, max: 5 },
      xTicks: [-5, -2.5, 0, 2.5, 5],
      yTicks: [-1, 0, 1],
      sampleCount: 2,
      customPath: ({ toSvgX, toSvgY, domain }) => {
        const epsilon = 0.01;

        // Create three separate segments for the sign function
        const segments = [];

        // Left segment: y = -1 for x < 0
        if (domain.min < -epsilon) {
          segments.push(
            `M ${toSvgX(domain.min)} ${toSvgY(-1)}`,
            `L ${toSvgX(-epsilon)} ${toSvgY(-1)}`
          );
        }

        // Center point: y = 0 at x = 0
        segments.push(
          `M ${toSvgX(0)} ${toSvgY(0)}`,
          `L ${toSvgX(0)} ${toSvgY(0)}`
        );

        // Right segment: y = 1 for x > 0
        if (domain.max > epsilon) {
          segments.push(
            `M ${toSvgX(epsilon)} ${toSvgY(1)}`,
            `L ${toSvgX(domain.max)} ${toSvgY(1)}`
          );
        }

        return segments.join(' ');
      }
    },
    {
      name: "Sigmoid",
      formula: "σ(x) = 1/(1+e^{-x})",
      description: "Smooth probability between 0 and 1",
      fn: (x: number) => 1 / (1 + Math.exp(-x)),
      color: colors.secondary,
      range: { min: -0.05, max: 1.05 },
      domain: { min: -8, max: 8 },
      xTicks: [-8, -4, 0, 4, 8],
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      asymptotes: [0, 1],
      sampleCount: 400,
      customPath: ({ toSvgX, toSvgY, domain }) => {
        const points: string[] = [];
        const samples = 400;

        // Don't extend too far - keep visual gap from asymptotes
        for (let i = 0; i <= samples; i++) {
          const x = domain.min + (i / samples) * (domain.max - domain.min);
          const y = 1 / (1 + Math.exp(-x));

          // Stop drawing if we get too close to asymptotes
          if (y < 0.02 || y > 0.98) {
            // Add a small gap to show it doesn't touch
            const clampedY = y < 0.5 ? 0.02 : 0.98;
            const svgX = toSvgX(x);
            const svgY = toSvgY(clampedY);
            points.push(`${points.length === 0 ? 'M' : 'L'} ${svgX} ${svgY}`);
          } else {
            const svgX = toSvgX(x);
            const svgY = toSvgY(y);
            points.push(`${points.length === 0 ? 'M' : 'L'} ${svgX} ${svgY}`);
          }
        }
        return points.join(' ');
      }
    },
    {
      name: "Tanh",
      formula: "tanh(x) = (e^x - e^{-x})/(e^x + e^{-x})",
      description: "Centered sigmoid, outputs -1 to 1",
      fn: (x: number) => Math.tanh(x),
      color: colors.tertiary,
      range: { min: -1.05, max: 1.05 },
      domain: { min: -5, max: 5 },
      xTicks: [-5, -2.5, 0, 2.5, 5],
      yTicks: [-1, -0.5, 0, 0.5, 1],
      asymptotes: [-1, 1],
      sampleCount: 400,
      customPath: ({ toSvgX, toSvgY, domain }) => {
        const points: string[] = [];
        const samples = 400;

        for (let i = 0; i <= samples; i++) {
          const x = domain.min + (i / samples) * (domain.max - domain.min);
          const y = Math.tanh(x);

          // Stop drawing if we get too close to asymptotes
          if (y < -0.95 || y > 0.95) {
            const clampedY = y < 0 ? -0.95 : 0.95;
            const svgX = toSvgX(x);
            const svgY = toSvgY(clampedY);
            points.push(`${points.length === 0 ? 'M' : 'L'} ${svgX} ${svgY}`);
          } else {
            const svgX = toSvgX(x);
            const svgY = toSvgY(y);
            points.push(`${points.length === 0 ? 'M' : 'L'} ${svgX} ${svgY}`);
          }
        }
        return points.join(' ');
      }
    },
    {
      name: "ReLU",
      formula: "ReLU(x) = max(0, x)",
      description: "Modern favorite: 0 or positive",
      fn: (x: number) => Math.max(0, x),
      color: colors.quaternary,
      range: { min: -1, max: 6 },
      domain: { min: -3, max: 6 },
      xTicks: [-3, 0, 3, 6],
      yTicks: [0, 2, 4, 6],
      sampleCount: 100
    },
    {
      name: "Leaky ReLU",
      formula: "LeakyReLU(x) = max(0.01x, x)",
      description: "ReLU with a small negative slope (alpha = 0.01)",
      fn: (x: number) => (x >= 0 ? x : 0.01 * x),
      color: colors.quinary,
      range: { min: -0.2, max: 6 },
      domain: { min: -20, max: 6 },
      xTicks: [-20, -10, 0, 3, 6],
      yTicks: [-0.2, 0, 2, 4, 6],
      sampleCount: 200,
      reference: {
        fn: (x: number) => Math.max(0, x),
        label: "Standard ReLU",
        color: `${colors.quaternary}66`,
        strokeDasharray: "6,4"
      }
    }
  ], [colors]);

  const currentFunction = activationFunctions[selectedFunction];

  // SVG dimensions - responsive for mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const svgWidth = isMobile ? 320 : 600;
  const svgHeight = isMobile ? 240 : 400;
  const padding = isMobile ? 35 : 50;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;
  const currentDomain = currentFunction.domain ?? DEFAULT_DOMAIN;
  const domainWidth = currentDomain.max - currentDomain.min || 1;
  const rangeHeight = currentFunction.range.max - currentFunction.range.min || 1;

  const toSvgX = (x: number) => padding + ((x - currentDomain.min) / domainWidth) * graphWidth;
  const toSvgY = (y: number) => padding + ((currentFunction.range.max - y) / rangeHeight) * graphHeight;

  const buildPath = (
    valueFn: (x: number) => number,
    domain: { min: number; max: number },
    range: { min: number; max: number },
    samples: number,
    customPath?: ActivationFunction['customPath']
  ) => {
    const domainSpan = domain.max - domain.min || 1;
    const rangeSpan = range.max - range.min || 1;

    const domainToSvgX = (x: number) => padding + ((x - domain.min) / domainSpan) * graphWidth;
    const rangeToSvgY = (value: number) => {
      // Don't clamp - let values extend beyond viewport
      return padding + ((range.max - value) / rangeSpan) * graphHeight;
    };

    if (customPath) {
      return customPath({
        toSvgX: domainToSvgX,
        toSvgY: rangeToSvgY,
        domain,
        range
      });
    }

    const effectiveSamples = Math.max(2, Math.floor(samples));
    const segments: string[] = [];

    // For sigmoid and tanh, extend beyond visible domain to show asymptotic behavior
    const extendedDomain = { ...domain };
    if (valueFn.name === '' && (domain.max === 10 || domain.max === 5)) {
      // Extend domain for smooth functions to show they continue
      extendedDomain.min = domain.min - 2;
      extendedDomain.max = domain.max + 2;
    }
    const extendedSpan = extendedDomain.max - extendedDomain.min || 1;

    for (let i = 0; i <= effectiveSamples; i++) {
      const x = extendedDomain.min + (i / effectiveSamples) * extendedSpan;
      const y = valueFn(x);

      const svgX = domainToSvgX(x);
      const svgY = rangeToSvgY(y);

      // Simply plot the points, let clipping handle overflow
      segments.push(`${i === 0 ? 'M' : 'L'} ${svgX} ${svgY}`);
    }

    return segments.join(' ');
  };

  const generatePath = (fn: ActivationFunction) => {
    const domain = fn.domain ?? currentDomain;
    return buildPath(fn.fn, domain, fn.range, fn.sampleCount ?? 300, fn.customPath);
  };

  const generateReferencePath = () => {
    if (!currentFunction.reference) {
      return null;
    }

    return buildPath(
      currentFunction.reference.fn,
      currentDomain,
      currentFunction.range,
      currentFunction.sampleCount ?? 300
    );
  };

  const xTicks = currentFunction.xTicks ?? generateTicks(currentDomain.min, currentDomain.max, 4);
  const yTicks = currentFunction.yTicks ?? generateTicks(currentFunction.range.min, currentFunction.range.max, 4);

  const currentPath = generatePath(currentFunction);
  const referencePath = generateReferencePath();
  // Adjust slider range for better interaction
  const sliderMin = currentFunction.name === "Sigmoid" || currentFunction.name === "Tanh"
    ? currentDomain.min * 0.8  // Slightly smaller range for S-curves
    : currentDomain.min;
  const sliderMax = currentFunction.name === "Sigmoid" || currentFunction.name === "Tanh"
    ? currentDomain.max * 0.8  // Slightly smaller range for S-curves
    : currentDomain.max;
  const sliderStep = Math.max(0.01, Number.parseFloat(((sliderMax - sliderMin) / 200).toFixed(3)));
  const xAxisY = currentFunction.range.min <= 0 && currentFunction.range.max >= 0
    ? toSvgY(0)
    : padding + graphHeight;
  const yAxisX = currentDomain.min <= 0 && currentDomain.max >= 0
    ? toSvgX(0)
    : padding;
  const tickLength = 4;
  const xTickLabelY = xAxisY > padding + graphHeight * 0.6
    ? xAxisY + tickLength + 10
    : xAxisY - tickLength - 6;

  useEffect(() => {
    const domain = currentFunction.domain ?? DEFAULT_DOMAIN;
    setInputValue((prev) => {
      if (prev < domain.min) return domain.min;
      if (prev > domain.max) return domain.max;
      return prev;
    });
  }, [currentFunction]);

  const handleFunctionSelect = (index: number) => {
    if (config.animateTransitions) {
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedFunction(index);
        setIsAnimating(false);
      }, 150);
    } else {
      setSelectedFunction(index);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full my-8" style={{ height: '500px' }} />
    );
  }

  return (
    <div className="w-full my-8">
      <div
        className="p-6 rounded-xl shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${colors.bgGradient1}, ${colors.bgGradient2})`,
          border: `1px solid ${colors.borderColor}`
        }}
      >
        {/* Function selector buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {activationFunctions.map((fn, i) => (
            <button
              key={i}
              onClick={() => handleFunctionSelect(i)}
              onMouseEnter={() => setHoveredFunction(i)}
              onMouseLeave={() => setHoveredFunction(null)}
              className="p-3 rounded-lg transition-all duration-300 transform"
              style={{
                backgroundColor: selectedFunction === i ? fn.color : colors.cardBg,
                borderColor: selectedFunction === i ? fn.color : colors.borderColor,
                borderWidth: '2px',
                borderStyle: 'solid',
                color: selectedFunction === i ?
                  (isDark ? colors.bgGradient1 : '#fff') :
                  colors.textPrimary,
                transform: hoveredFunction === i ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedFunction === i ?
                  `0 4px 12px ${fn.color}40` :
                  'none'
              }}
            >
              <div className="font-bold text-sm mb-1">{fn.name}</div>
              <div
                className="font-mono text-xs opacity-75"
                style={{ fontFamily: 'monospace' }}
              >
                {fn.formula}
              </div>
            </button>
          ))}
        </div>

        {/* Main visualization area */}
        <div className="flex flex-col gap-6">
          {/* Graph - centered and larger */}
          <div className="flex flex-col items-center">
            <h3
              className="font-bold text-lg mb-4"
              style={{ color: colors.textPrimary }}
            >
              Function Graph
            </h3>
            <div
              className="rounded-lg p-2 sm:p-4 mx-auto overflow-x-auto"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.borderColor}`,
                maxWidth: '100%'
              }}
            >
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'} ${isMobile ? 'w-full h-auto' : ''}`}
                style={isMobile ? { maxWidth: '100%', height: 'auto' } : {}}
              >
                {/* Grid */}
                <g opacity="0.3">
                  {xTicks.map((x) => (
                    <line
                      key={`vgrid-${x}`}
                      x1={toSvgX(x)}
                      y1={padding}
                      x2={toSvgX(x)}
                      y2={svgHeight - padding}
                      stroke={colors.gridLine}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  {yTicks.map((y) => {
                    const svgY = toSvgY(y);
                    if (!Number.isFinite(svgY)) {
                      return null;
                    }

                    return (
                      <line
                        key={`hgrid-${y}`}
                        x1={padding}
                        y1={svgY}
                        x2={svgWidth - padding}
                        y2={svgY}
                        stroke={colors.gridLine}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    );
                  })}
                </g>

                {/* Horizontal asymptotes with labels */}
                {(currentFunction.asymptotes ?? [])
                  .filter((value) =>
                    value >= currentFunction.range.min &&
                    value <= currentFunction.range.max
                  )
                  .map((value) => {
                    const svgY = toSvgY(value);
                    return (
                      <g key={`asymptote-${value}`}>
                        <line
                          x1={padding}
                          y1={svgY}
                          x2={svgWidth - padding}
                          y2={svgY}
                          stroke={currentFunction.color}
                          strokeWidth="1.5"
                          strokeDasharray="6,4"
                          opacity="0.4"
                        />
                        <text
                          x={svgWidth - padding + 5}
                          y={svgY + 4}
                          fill={colors.textMuted}
                          fontSize={isMobile ? "8" : "10"}
                          fontFamily="monospace"
                          opacity="0.8"
                        >
                          y={value}
                        </text>
                      </g>
                    );
                  })}

                {/* Axes */}
                <g>
                  {!(currentDomain.min <= 0 && currentDomain.max >= 0) && (
                    <line
                      x1={padding}
                      y1={padding}
                      x2={padding}
                      y2={svgHeight - padding}
                      stroke={colors.axisLine}
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                  )}
                  {currentDomain.min <= 0 && currentDomain.max >= 0 && (
                    <line
                      x1={toSvgX(0)}
                      y1={padding}
                      x2={toSvgX(0)}
                      y2={svgHeight - padding}
                      stroke={colors.axisLine}
                      strokeWidth="2"
                    />
                  )}
                  {!(currentFunction.range.min <= 0 && currentFunction.range.max >= 0) && (
                    <line
                      x1={padding}
                      y1={padding + graphHeight}
                      x2={svgWidth - padding}
                      y2={padding + graphHeight}
                      stroke={colors.axisLine}
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                  )}
                  {currentFunction.range.min <= 0 && currentFunction.range.max >= 0 && (
                    <line
                      x1={padding}
                      y1={toSvgY(0)}
                      x2={svgWidth - padding}
                      y2={toSvgY(0)}
                      stroke={colors.axisLine}
                      strokeWidth="2"
                    />
                  )}

                  {/* Axis labels */}
                  {currentFunction.range.min <= 0 && currentFunction.range.max >= 0 && (
                    <text
                      x={svgWidth - padding + 5}
                      y={toSvgY(0) + 5}
                      fill={colors.textSecondary}
                      fontSize={isMobile ? "8" : "10"}
                      fontFamily="monospace"
                    >
                      x
                    </text>
                  )}
                  {currentDomain.min <= 0 && currentDomain.max >= 0 && (
                    <text
                      x={toSvgX(0) - 10}
                      y={padding - 5}
                      fill={colors.textSecondary}
                      fontSize={isMobile ? "8" : "10"}
                      fontFamily="monospace"
                    >
                      y
                    </text>
                  )}
                </g>

                {/* Tick marks & labels */}
                <g>
                  {xTicks.map((x) => {
                    const xPos = toSvgX(x);
                    const formatted = formatTick(x);
                    if (!formatted) {
                      return null;
                    }

                    return (
                      <g key={`xtick-${x}`}>
                        <line
                          x1={xPos}
                          y1={xAxisY - tickLength}
                          x2={xPos}
                          y2={xAxisY + tickLength}
                          stroke={colors.axisLine}
                          strokeWidth="1"
                        />
                        <text
                          x={xPos}
                          y={xTickLabelY}
                          fill={colors.textSecondary}
                          fontSize={isMobile ? "8" : "10"}
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {formatted}
                        </text>
                      </g>
                    );
                  })}
                  {yTicks.map((y) => {
                    const yPos = toSvgY(y);
                    if (!Number.isFinite(yPos)) {
                      return null;
                    }

                    const formatted = formatTick(y);
                    if (!formatted) {
                      return null;
                    }

                    return (
                      <g key={`ytick-${y}`}>
                        <line
                          x1={yAxisX - tickLength}
                          y1={yPos}
                          x2={yAxisX + tickLength}
                          y2={yPos}
                          stroke={colors.axisLine}
                          strokeWidth="1"
                        />
                        <text
                          x={yAxisX - tickLength - 4}
                          y={yPos + 3}
                          fill={colors.textSecondary}
                          fontSize={isMobile ? "8" : "10"}
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {formatted}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Define clipping region */}
                <defs>
                  <clipPath id="graph-clip">
                    <rect
                      x={padding}
                      y={padding}
                      width={graphWidth}
                      height={graphHeight}
                    />
                  </clipPath>
                  <marker
                    id="arrow-end"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M0,0 L0,6 L9,3 z"
                      fill={currentFunction.color}
                    />
                  </marker>
                </defs>

                {/* Apply clipping to both curves */}
                <g clipPath="url(#graph-clip)">
                  {/* Reference curve (for comparisons) */}
                  {referencePath && (
                    <path
                      d={referencePath}
                      fill="none"
                      stroke={currentFunction.reference?.color ?? colors.gridLine}
                      strokeWidth="2"
                      strokeDasharray={currentFunction.reference?.strokeDasharray ?? '6,4'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Function curve */}
                  <path
                    d={currentPath}
                    fill="none"
                    stroke={currentFunction.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                </g>

                {/* Arrows for functions that extend to infinity or asymptotes */}
                {(currentFunction.name === "Sigmoid" || currentFunction.name === "Tanh") && (
                  <>
                    {/* Left side arrow approaching asymptote */}
                    <g>
                      <line
                        x1={padding + 30}
                        y1={toSvgY(currentFunction.fn(currentDomain.min))}
                        x2={padding + 5}
                        y2={toSvgY(currentFunction.fn(currentDomain.min))}
                        stroke={currentFunction.color}
                        strokeWidth="3"
                      />
                      <polygon
                        points={`${padding + 5},${toSvgY(currentFunction.fn(currentDomain.min))} ${padding + 10},${toSvgY(currentFunction.fn(currentDomain.min)) - 5} ${padding + 10},${toSvgY(currentFunction.fn(currentDomain.min)) + 5}`}
                        fill={currentFunction.color}
                      />
                      <text
                        x={padding - (isMobile ? 25 : 35)}
                        y={toSvgY(currentFunction.name === "Sigmoid" ? 0 : -1) + 5}
                        fill={colors.textMuted}
                        fontSize={isMobile ? "8" : "11"}
                        fontFamily="monospace"
                      >
                        {isMobile ? "→-∞" : "x→-∞"}
                      </text>
                    </g>
                    {/* Right side arrow approaching asymptote */}
                    <g>
                      <line
                        x1={svgWidth - padding - 30}
                        y1={toSvgY(currentFunction.fn(currentDomain.max))}
                        x2={svgWidth - padding - 5}
                        y2={toSvgY(currentFunction.fn(currentDomain.max))}
                        stroke={currentFunction.color}
                        strokeWidth="3"
                      />
                      <polygon
                        points={`${svgWidth - padding - 5},${toSvgY(currentFunction.fn(currentDomain.max))} ${svgWidth - padding - 10},${toSvgY(currentFunction.fn(currentDomain.max)) - 5} ${svgWidth - padding - 10},${toSvgY(currentFunction.fn(currentDomain.max)) + 5}`}
                        fill={currentFunction.color}
                      />
                      <text
                        x={svgWidth - padding + (isMobile ? 5 : 10)}
                        y={toSvgY(currentFunction.name === "Sigmoid" ? 1 : 1) + 5}
                        fill={colors.textMuted}
                        fontSize={isMobile ? "8" : "11"}
                        fontFamily="monospace"
                      >
                        {isMobile ? "→+∞" : "x→+∞"}
                      </text>
                    </g>
                  </>
                )}

                {(currentFunction.name === "ReLU" || currentFunction.name === "Leaky ReLU") && (() => {
                  const rightEdgeX = currentDomain.max;
                  const rightEdgeY = currentFunction.fn(rightEdgeX);
                  const rightSvgY = Math.min(Math.max(padding, toSvgY(rightEdgeY)), padding + graphHeight);

                  return (
                    <>
                      {/* Arrow at the right edge for positive infinity */}
                      <g>
                        <line
                          x1={svgWidth - padding - 30}
                          y1={rightSvgY}
                          x2={svgWidth - padding - 5}
                          y2={rightSvgY}
                          stroke={currentFunction.color}
                          strokeWidth="3"
                        />
                        <polygon
                          points={`${svgWidth - padding - 5},${rightSvgY} ${svgWidth - padding - 10},${rightSvgY - 5} ${svgWidth - padding - 10},${rightSvgY + 5}`}
                          fill={currentFunction.color}
                        />
                        <text
                          x={svgWidth - padding + (isMobile ? 5 : 10)}
                          y={rightSvgY + 5}
                          fill={colors.textMuted}
                          fontSize={isMobile ? "9" : "12"}
                          fontFamily="monospace"
                        >
                          →∞
                        </text>
                      </g>
                    </>
                  );
                })()}

                {currentFunction.name === "Leaky ReLU" && (() => {
                  const leftEdgeX = currentDomain.min;
                  const leftEdgeY = currentFunction.fn(leftEdgeX);
                  const leftSvgY = Math.min(Math.max(padding, toSvgY(leftEdgeY)), padding + graphHeight);

                  return (
                    <>
                      {/* Arrow at the left edge for negative infinity */}
                      <g>
                        <line
                          x1={padding + 30}
                          y1={leftSvgY}
                          x2={padding + 5}
                          y2={leftSvgY}
                          stroke={currentFunction.color}
                          strokeWidth="3"
                        />
                        <polygon
                          points={`${padding + 5},${leftSvgY} ${padding + 10},${leftSvgY - 5} ${padding + 10},${leftSvgY + 5}`}
                          fill={currentFunction.color}
                        />
                        <text
                          x={padding - (isMobile ? 18 : 25)}
                          y={leftSvgY + 5}
                          fill={colors.textMuted}
                          fontSize={isMobile ? "9" : "12"}
                          fontFamily="monospace"
                        >
                          -∞
                        </text>
                      </g>
                    </>
                  );
                })()}

                {/* Show discontinuity points for Sign function */}
                {currentFunction.name.includes("Sign") && currentDomain.min <= 0 && currentDomain.max >= 0 && (
                  <>
                    {/* Open circle at (0, -1) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(-1)}
                      r="4"
                      fill={colors.cardBg}
                      stroke={currentFunction.color}
                      strokeWidth="2"
                    />
                    {/* Filled circle at (0, 0) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(0)}
                      r="4"
                      fill={currentFunction.color}
                    />
                    {/* Open circle at (0, 1) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(1)}
                      r="4"
                      fill={colors.cardBg}
                      stroke={currentFunction.color}
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Interactive point */}
                {config.showInteractive && (() => {
                  let yValue = currentFunction.fn(inputValue);

                  // Apply the same visual constraints as the curve
                  if (currentFunction.name === "Sigmoid") {
                    // Clamp sigmoid to visual range [0.02, 0.98]
                    if (yValue < 0.02) yValue = 0.02;
                    if (yValue > 0.98) yValue = 0.98;
                  } else if (currentFunction.name === "Tanh") {
                    // Clamp tanh to visual range [-0.95, 0.95]
                    if (yValue < -0.95) yValue = -0.95;
                    if (yValue > 0.95) yValue = 0.95;
                  }

                  // Also clamp to the display range
                  const clampedY = Math.max(currentFunction.range.min, Math.min(currentFunction.range.max, yValue));

                  return (
                    <>
                      <circle
                        cx={toSvgX(inputValue)}
                        cy={toSvgY(clampedY)}
                        r="5"
                        fill={currentFunction.color}
                        stroke={isDark ? colors.bgGradient1 : '#fff'}
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                      <line
                        x1={toSvgX(inputValue)}
                        y1={toSvgY(currentFunction.range.min)}
                        x2={toSvgX(inputValue)}
                        y2={toSvgY(clampedY)}
                        stroke={currentFunction.color}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Properties and Behavior - two boxes side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Properties card */}
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.borderColor}`
              }}
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: currentFunction.color }}
              >
                {currentFunction.name}
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium" style={{ color: colors.textSecondary }}>
                    Formula:{' '}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      color: colors.textPrimary,
                      backgroundColor: isDark ? colors.borderColor : colors.bgGradient2,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    y = {currentFunction.formula}
                  </span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: colors.textSecondary }}>
                    Description:{' '}
                  </span>
                  <span style={{ color: colors.textPrimary }}>
                    {currentFunction.description}
                  </span>
                </div>

                {/* Judge analogy */}
                <div
                  className="mt-3 p-3 rounded"
                  style={{
                    backgroundColor: isDark ? colors.borderColor : colors.bgGradient2,
                    borderLeft: `4px solid ${currentFunction.color}`
                  }}
                >
                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                    Judge Type:{' '}
                  </span>
                  <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {currentFunction.name.includes('Sign') && 'The harsh binary judge'}
                    {currentFunction.name.includes('Sigmoid') && 'The probability judge'}
                    {currentFunction.name.includes('Tanh') && 'The balanced judge'}
                    {currentFunction.name.includes('ReLU') && !currentFunction.name.includes('Leaky') && 'The optimist'}
                    {currentFunction.name.includes('Leaky') && 'The cautious optimist'}
                  </span>
                </div>
                {currentFunction.reference && (
                  <div
                    className="flex items-center gap-2 text-xs mt-2"
                    style={{ color: colors.textSecondary }}
                  >
                    <span>Comparison baseline:</span>
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {currentFunction.reference.label} (dashed)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive behavior */}
            {config.showInteractive && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.borderColor}`
                }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  Interactive Behavior
                </h4>
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>
                    Input (x ∈ [{sliderMin.toFixed(1)}, {sliderMax.toFixed(1)}]): {inputValue.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={sliderStep}
                    value={inputValue}
                    onChange={(e) => setInputValue(parseFloat(e.target.value))}
                    className="w-full mb-3"
                    style={{
                      accentColor: currentFunction.color
                    }}
                  />
                  <div
                    className="text-center p-3 rounded font-mono text-lg"
                    style={{
                      backgroundColor: isDark ? colors.borderColor : colors.bgGradient2,
                      color: currentFunction.color
                    }}
                  >
                    {(() => {
                      const yValue = currentFunction.fn(inputValue);
                      let displayValue = yValue;
                      let approxSymbol = "=";

                      // For Sigmoid and Tanh, show approximation when near asymptotes
                      if (currentFunction.name === "Sigmoid") {
                        if (yValue < 0.02) {
                          displayValue = 0.02;
                          approxSymbol = "≈";
                        } else if (yValue > 0.98) {
                          displayValue = 0.98;
                          approxSymbol = "≈";
                        }
                      } else if (currentFunction.name === "Tanh") {
                        if (yValue < -0.95) {
                          displayValue = -0.95;
                          approxSymbol = "≈";
                        } else if (yValue > 0.95) {
                          displayValue = 0.95;
                          approxSymbol = "≈";
                        }
                      }

                      return `f(${inputValue.toFixed(2)}) ${approxSymbol} ${displayValue.toFixed(3)}`;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationFunctionGallery;
