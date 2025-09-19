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
      { name: "Sign (Original)", formula: "sgn(x)", description: "Binary decisions: -1, 0, or 1" },
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
      formula: "sgn(x)",
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
      formula: "sigma(x) = 1/(1+e^{-x})",
      description: "Smooth probability between 0 and 1",
      fn: (x: number) => 1 / (1 + Math.exp(-x)),
      color: colors.secondary,
      range: { min: -0.1, max: 1.1 },
      domain: { min: -8, max: 8 },
      xTicks: [-8, -4, 0, 4, 8],
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      asymptotes: [0, 1],
      sampleCount: 400
    },
    {
      name: "Tanh",
      formula: "tanh(x) = (e^{x} - e^{-x})/(e^{x} + e^{-x})",
      description: "Centered sigmoid, outputs -1 to 1",
      fn: (x: number) => Math.tanh(x),
      color: colors.tertiary,
      range: { min: -1.1, max: 1.1 },
      domain: { min: -3, max: 3 },
      xTicks: [-3, -1.5, 0, 1.5, 3],
      yTicks: [-1, -0.5, 0, 0.5, 1],
      asymptotes: [-1, 1],
      sampleCount: 400
    },
    {
      name: "ReLU",
      formula: "ReLU(x) = max(0, x)",
      description: "Modern favorite: 0 or positive",
      fn: (x: number) => Math.max(0, x),
      color: colors.quaternary,
      range: { min: -0.5, max: 5 },
      domain: { min: -4, max: 5 },
      xTicks: [-4, -2, 0, 2, 4],
      yTicks: [0, 1, 2, 3, 4, 5],
      sampleCount: 320
    },
    {
      name: "Leaky ReLU",
      formula: "LeakyReLU(x) = max(0.01x, x)",
      description: "ReLU with a small negative slope (alpha = 0.01)",
      fn: (x: number) => (x >= 0 ? x : 0.01 * x),
      color: colors.quinary,
      range: { min: -0.2, max: 5 },
      domain: { min: -8, max: 5 },
      xTicks: [-8, -4, 0, 2, 4],
      yTicks: [-0.08, 0, 1, 2, 3, 4, 5],
      sampleCount: 400,
      reference: {
        fn: (x: number) => Math.max(0, x),
        label: "Standard ReLU",
        color: `${colors.quaternary}66`,
        strokeDasharray: "6,4"
      }
    }
  ], [colors]);

  const currentFunction = activationFunctions[selectedFunction];

  // SVG dimensions
  const svgWidth = 280;
  const svgHeight = 200;
  const padding = 40;
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
      // Clamp values to stay within SVG bounds but allow visual extension to edges
      const clampedValue = Math.max(range.min, Math.min(range.max, value));
      return padding + ((range.max - clampedValue) / rangeSpan) * graphHeight;
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
    let lastValidY: number | null = null;

    for (let i = 0; i <= effectiveSamples; i++) {
      const x = domain.min + (i / effectiveSamples) * domainSpan;
      const rawY = valueFn(x);

      // Handle infinite values by extending to viewport edge
      let y = rawY;
      if (!Number.isFinite(rawY)) {
        y = rawY > 0 ? range.max * 1.5 : range.min * 1.5;
      }

      // For functions that grow beyond range, extend them visually
      if (y > range.max) {
        y = range.max + (range.max - range.min) * 0.1; // Extend slightly beyond
      } else if (y < range.min) {
        y = range.min - (range.max - range.min) * 0.1; // Extend slightly beyond
      }

      const svgY = rangeToSvgY(y);

      // Check for discontinuities
      if (lastValidY !== null && Math.abs(y - lastValidY) > rangeSpan * 0.5) {
        // Large jump detected, might be a discontinuity
        segments.push(`M ${domainToSvgX(x)} ${svgY}`);
      } else {
        segments.push(`${i === 0 ? 'M' : 'L'} ${domainToSvgX(x)} ${svgY}`);
      }

      lastValidY = y;
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
  const sliderMin = currentDomain.min;
  const sliderMax = currentDomain.max;
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Graph */}
          <div className="flex flex-col items-center">
            <h3
              className="font-bold text-lg mb-4"
              style={{ color: colors.textPrimary }}
            >
              Function Graph
            </h3>
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.borderColor}`
              }}
            >
              <svg
                width={svgWidth}
                height={svgHeight}
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
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

                {/* Horizontal asymptotes */}
                {(currentFunction.asymptotes ?? [])
                  .filter((value) =>
                    value >= currentFunction.range.min &&
                    value <= currentFunction.range.max &&
                    !(Math.abs(value) <= 1e-6 && currentFunction.range.min <= 0 && currentFunction.range.max >= 0)
                  )
                  .map((value) => {
                    const svgY = toSvgY(value);
                    return (
                      <line
                        key={`asymptote-${value}`}
                        x1={padding}
                        y1={svgY}
                        x2={svgWidth - padding}
                        y2={svgY}
                        stroke={currentFunction.color}
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                        opacity="0.6"
                      />
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
                      fontSize="10"
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
                      fontSize="10"
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
                          fontSize="10"
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
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {formatted}
                        </text>
                      </g>
                    );
                  })}
                </g>

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
                <g clipPath="url(#graph-clip)">
                  <defs>
                    <clipPath id="graph-clip">
                      <rect
                        x={padding}
                        y={padding}
                        width={graphWidth}
                        height={graphHeight}
                      />
                    </clipPath>
                  </defs>
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
                  const yValue = currentFunction.fn(inputValue);
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

          {/* Properties and interactive controls */}
          <div className="flex flex-col">
            <h3
              className="font-bold text-lg mb-4"
              style={{ color: colors.textPrimary }}
            >
              Properties & Behavior
            </h3>

            {/* Description card */}
            <div
              className="rounded-lg p-4 mb-4"
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

            {/* Interactive slider */}
            {config.showInteractive && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.borderColor}`
                }}
              >
                <h4
                  className="font-medium mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  Try it yourself
                </h4>
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>
                    Input (x ∈ [{sliderMin.toFixed(2)}, {sliderMax.toFixed(2)}]): {inputValue.toFixed(2)}
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
                    f({inputValue.toFixed(2)}) = {currentFunction.fn(inputValue).toFixed(3)}
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
