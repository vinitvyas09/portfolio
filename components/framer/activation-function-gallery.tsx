"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface ActivationFunction {
  name: string;
  formula: string;
  description: string;
  fn: (x: number) => number;
  color: string;
  range: { min: number; max: number };
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
      fn: (x: number) => x > 0 ? 1 : x < 0 ? -1 : 0,
      color: colors.primary,
      range: { min: -1.5, max: 1.5 }
    },
    {
      name: "Sigmoid",
      formula: "1/(1+e^-x)",
      description: "Smooth probability between 0 and 1",
      fn: (x: number) => 1 / (1 + Math.exp(-x)),
      color: colors.secondary,
      range: { min: -0.1, max: 1.1 }
    },
    {
      name: "Tanh",
      formula: "tanh(x)",
      description: "Centered sigmoid, outputs -1 to 1",
      fn: (x: number) => Math.tanh(x),
      color: colors.tertiary,
      range: { min: -1.2, max: 1.2 }
    },
    {
      name: "ReLU",
      formula: "max(0, x)",
      description: "Modern favorite: 0 or positive",
      fn: (x: number) => Math.max(0, x),
      color: colors.quaternary,
      range: { min: -0.5, max: 5 }
    },
    {
      name: "Leaky ReLU",
      formula: "max(0.01x, x)",
      description: "ReLU with a small negative slope",
      fn: (x: number) => x > 0 ? x : 0.01 * x,
      color: colors.quinary,
      range: { min: -2, max: 5 }
    }
  ], [colors]);

  const currentFunction = activationFunctions[selectedFunction];

  // SVG dimensions
  const svgWidth = 280;
  const svgHeight = 200;
  const padding = 40;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // X domain
  const xMin = -5;
  const xMax = 5;

  // Convert between coordinate systems
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
  const toSvgY = (y: number, yMin: number, yMax: number) =>
    padding + ((yMax - y) / (yMax - yMin)) * graphHeight;

  // Generate path for function
  const generatePath = (fn: ActivationFunction) => {
    const points = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = fn.fn(x);
      points.push({ x, y });
    }

    // For step function, create proper steps with discontinuities
    if (fn.name.includes("Sign")) {
      // Draw three separate segments for the discontinuous sign function
      return `
        M ${toSvgX(xMin)} ${toSvgY(-1, fn.range.min, fn.range.max)}
        L ${toSvgX(-0.001)} ${toSvgY(-1, fn.range.min, fn.range.max)}
        M ${toSvgX(0.001)} ${toSvgY(1, fn.range.min, fn.range.max)}
        L ${toSvgX(xMax)} ${toSvgY(1, fn.range.min, fn.range.max)}
        M ${toSvgX(0)} ${toSvgY(0, fn.range.min, fn.range.max)}
        L ${toSvgX(0)} ${toSvgY(0, fn.range.min, fn.range.max)}
      `;
    }

    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y, fn.range.min, fn.range.max)}`
    ).join(' ');
  };

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
                  {[-4, -2, 0, 2, 4].map(x => (
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
                  {[-1, 0, 1].map(y => {
                    const svgY = toSvgY(y, currentFunction.range.min, currentFunction.range.max);
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

                {/* Axes */}
                <g>
                  <line
                    x1={toSvgX(0)}
                    y1={padding}
                    x2={toSvgX(0)}
                    y2={svgHeight - padding}
                    stroke={colors.axisLine}
                    strokeWidth="2"
                  />
                  <line
                    x1={padding}
                    y1={toSvgY(0, currentFunction.range.min, currentFunction.range.max)}
                    x2={svgWidth - padding}
                    y2={toSvgY(0, currentFunction.range.min, currentFunction.range.max)}
                    stroke={colors.axisLine}
                    strokeWidth="2"
                  />

                  {/* Axis labels */}
                  <text
                    x={svgWidth - padding + 5}
                    y={toSvgY(0, currentFunction.range.min, currentFunction.range.max) + 5}
                    fill={colors.textSecondary}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    x
                  </text>
                  <text
                    x={toSvgX(0) - 10}
                    y={padding - 5}
                    fill={colors.textSecondary}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    y
                  </text>
                </g>

                {/* Function curve */}
                <path
                  d={generatePath(currentFunction)}
                  fill="none"
                  stroke={currentFunction.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />

                {/* Show discontinuity points for Sign function */}
                {currentFunction.name.includes("Sign") && (
                  <>
                    {/* Open circle at (0, -1) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(-1, currentFunction.range.min, currentFunction.range.max)}
                      r="4"
                      fill={colors.cardBg}
                      stroke={currentFunction.color}
                      strokeWidth="2"
                    />
                    {/* Filled circle at (0, 0) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(0, currentFunction.range.min, currentFunction.range.max)}
                      r="4"
                      fill={currentFunction.color}
                    />
                    {/* Open circle at (0, 1) */}
                    <circle
                      cx={toSvgX(0)}
                      cy={toSvgY(1, currentFunction.range.min, currentFunction.range.max)}
                      r="4"
                      fill={colors.cardBg}
                      stroke={currentFunction.color}
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Interactive point */}
                {config.showInteractive && (
                  <>
                    <circle
                      cx={toSvgX(inputValue)}
                      cy={toSvgY(currentFunction.fn(inputValue), currentFunction.range.min, currentFunction.range.max)}
                      r="5"
                      fill={currentFunction.color}
                      stroke={isDark ? colors.bgGradient1 : '#fff'}
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    <line
                      x1={toSvgX(inputValue)}
                      y1={toSvgY(currentFunction.range.min, currentFunction.range.min, currentFunction.range.max)}
                      x2={toSvgX(inputValue)}
                      y2={toSvgY(currentFunction.fn(inputValue), currentFunction.range.min, currentFunction.range.max)}
                      stroke={currentFunction.color}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.5"
                    />
                  </>
                )}
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
                    Input (x): {inputValue.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
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