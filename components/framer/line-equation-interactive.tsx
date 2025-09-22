"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

interface TestPoint {
  x: number;
  y: number;
  label: string;
}

interface LineEquationInteractiveProps {
  config?: {
    equation?: string;
    showRegions?: boolean;
    testPoints?: TestPoint[];
    animateCalculation?: boolean;
    showDistanceFormula?: boolean;
  };
}

// Parse equation string like "2x + 3y - 6 = 0" to extract A, B, C
const parseEquation = (equation: string): { A: number; B: number; C: number } => {
  // Remove spaces and = 0
  const cleanEq = equation.replace(/\s/g, '').replace('=0', '');

  // Parse coefficients with regex
  const xMatch = cleanEq.match(/([+-]?\d*\.?\d*)x/);
  const yMatch = cleanEq.match(/([+-]?\d*\.?\d*)y/);
  const cMatch = cleanEq.match(/([+-]\d+\.?\d*)(?!x|y)/);

  const A = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseFloat(xMatch[1])) : 0;
  const B = yMatch ? (yMatch[1] === '' || yMatch[1] === '+' ? 1 : yMatch[1] === '-' ? -1 : parseFloat(yMatch[1])) : 0;
  const C = cMatch ? parseFloat(cMatch[1]) : 0;

  return { A, B, C };
};

const LineEquationInteractive: React.FC<LineEquationInteractiveProps> = ({
  config = {
    equation: "2x + 3y - 6 = 0",
    showRegions: true,
    testPoints: [
      { x: 1, y: 0.5, label: "Quiet cat" },
      { x: 2, y: 2.5, label: "Energetic dog" },
      { x: 1.5, y: 1, label: "On the fence" }
    ],
    animateCalculation: true,
    showDistanceFormula: false
  }
}) => {
  const [mounted, setMounted] = useState(false);

  // Use theme hook - this should work if ThemeProvider is properly set up
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [points, setPoints] = useState<TestPoint[]>(config.testPoints || []);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animatingPoint, setAnimatingPoint] = useState<number | null>(null);

  const { A, B, C } = useMemo(() => parseEquation(config.equation || "2x + 3y - 6 = 0"), [config.equation]);

  // Color scheme
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        primary: "#6366f1",
        secondary: "#10b981",
        accent: "#f59e0b",
        negative: "#ef4444",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        cardBg: "rgba(248, 250, 252, 0.95)",
        borderColor: "#e2e8f0",
        gridLine: "#e2e8f0",
        axisLine: "#94a3b8",
        positiveRegion: "rgba(16, 185, 129, 0.1)",
        negativeRegion: "rgba(239, 68, 68, 0.1)",
        lineColor: "#6366f1",
        zeroLine: "#fbbf24"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      primary: "#a78bfa",
      secondary: "#34d399",
      accent: "#fbbf24",
      negative: "#f87171",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      cardBg: "rgba(23, 23, 23, 0.9)",
      borderColor: "#404040",
      gridLine: "#262626",
      axisLine: "#6b7280",
      positiveRegion: "rgba(52, 211, 153, 0.1)",
      negativeRegion: "rgba(248, 113, 113, 0.1)",
      lineColor: "#a78bfa",
      zeroLine: "#fbbf24"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      primary: "#6366f1",
      secondary: "#10b981",
      accent: "#f59e0b",
      negative: "#ef4444",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      cardBg: "rgba(248, 250, 252, 0.95)",
      borderColor: "#e2e8f0",
      gridLine: "#e2e8f0",
      axisLine: "#94a3b8",
      positiveRegion: "rgba(16, 185, 129, 0.1)",
      negativeRegion: "rgba(239, 68, 68, 0.1)",
      lineColor: "#6366f1",
      zeroLine: "#fbbf24"
    };
  }, [isDark, mounted]);

  // SVG dimensions and scaling
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 50;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // Coordinate system bounds
  const xMin = -2;
  const xMax = 5;
  const yMin = -1;
  const yMax = 4;

  // Convert between coordinate systems
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
  const toSvgY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * graphHeight;
  const fromSvgX = useCallback((svgX: number) => ((svgX - padding) / graphWidth) * (xMax - xMin) + xMin, [padding, graphWidth, xMax, xMin]);
  const fromSvgY = useCallback((svgY: number) => yMax - ((svgY - padding) / graphHeight) * (yMax - yMin), [yMax, padding, graphHeight, yMin]);

  // Calculate line points
  const linePoints = useMemo(() => {
    if (B === 0) {
      // Vertical line: x = -C/A
      const x = -C / A;
      return [
        { x, y: yMin },
        { x, y: yMax }
      ];
    } else {
      // Calculate y for given x: y = (-Ax - C) / B
      const points = [];
      const y1 = (-A * xMin - C) / B;
      const y2 = (-A * xMax - C) / B;

      if (y1 >= yMin && y1 <= yMax) {
        points.push({ x: xMin, y: y1 });
      }
      if (y2 >= yMin && y2 <= yMax) {
        points.push({ x: xMax, y: y2 });
      }

      // Also check intersections with horizontal bounds
      const x1 = (-B * yMin - C) / A;
      const x2 = (-B * yMax - C) / A;

      if (x1 >= xMin && x1 <= xMax && points.length < 2) {
        points.push({ x: x1, y: yMin });
      }
      if (x2 >= xMin && x2 <= xMax && points.length < 2) {
        points.push({ x: x2, y: yMax });
      }

      return points.slice(0, 2);
    }
  }, [A, B, C, xMin, xMax, yMin, yMax]);

  // Calculate equation value for a point
  const calculateValue = (x: number, y: number) => A * x + B * y + C;

  // Handle dragging
  const handleMouseDown = (index: number) => {
    setIsDragging(index);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;

    const x = fromSvgX(svgX);
    const y = fromSvgY(svgY);

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints[isDragging] = { ...newPoints[isDragging], x, y };
      return newPoints;
    });

    // Trigger animation
    setAnimatingPoint(isDragging);
    setTimeout(() => setAnimatingPoint(null), 300);
  }, [isDragging, fromSvgX, fromSvgY]);

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging !== null) {
      const handleGlobalMouseUp = () => setIsDragging(null);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <div className="w-full flex flex-col items-center gap-4 my-8">
      {/* Mobile scroll hint */}
      <div className="md:hidden text-xs text-center" style={{ color: colors.textMuted }}>
        ← Swipe horizontally to explore the graph →
      </div>

      {/* Make the graph container scrollable on mobile */}
      <div className="relative w-full max-w-[600px] overflow-x-auto md:overflow-visible rounded-xl">
        <div className="min-w-[500px] md:min-w-0">
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="w-full h-auto rounded-xl shadow-lg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              background: `linear-gradient(135deg, ${colors.bgGradient1}, ${colors.bgGradient2})`,
              cursor: isDragging !== null ? 'grabbing' : 'default',
              minWidth: '500px'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoveredPoint(null)}
          >
          {/* Grid */}
          <g>
            {/* Vertical grid lines */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = xMin + i;
              const svgX = toSvgX(x);
              return (
                <line
                  key={`vgrid-${i}`}
                  x1={svgX}
                  y1={padding}
                  x2={svgX}
                  y2={svgHeight - padding}
                  stroke={x === 0 ? colors.axisLine : colors.gridLine}
                  strokeWidth={x === 0 ? 2 : 1}
                  strokeDasharray={x === 0 ? "none" : "2,2"}
                />
              );
            })}

            {/* Horizontal grid lines */}
            {Array.from({ length: 6 }, (_, i) => {
              const y = yMin + i;
              const svgY = toSvgY(y);
              return (
                <line
                  key={`hgrid-${i}`}
                  x1={padding}
                  y1={svgY}
                  x2={svgWidth - padding}
                  y2={svgY}
                  stroke={y === 0 ? colors.axisLine : colors.gridLine}
                  strokeWidth={y === 0 ? 2 : 1}
                  strokeDasharray={y === 0 ? "none" : "2,2"}
                />
              );
            })}
          </g>

          {/* Regions */}
          {config.showRegions && linePoints.length === 2 && (
            <>
              <defs>
                <linearGradient id="positive-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="negative-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.negative} stopOpacity="0.05" />
                  <stop offset="100%" stopColor={colors.negative} stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Calculate regions based on line - need to check which corners are positive/negative */}
              {(() => {
                // Test the four corners to determine which side is which
                const topLeft = calculateValue(xMin, yMax);
                const topRight = calculateValue(xMax, yMax);
                const bottomLeft = calculateValue(xMin, yMin);
                const bottomRight = calculateValue(xMax, yMin);

                // Create paths for positive and negative regions
                const positivePath = [];
                const negativePath = [];

                // Start with the line points
                const linePathStr = `M ${toSvgX(linePoints[0].x)} ${toSvgY(linePoints[0].y)} L ${toSvgX(linePoints[1].x)} ${toSvgY(linePoints[1].y)}`;

                // Determine which corners belong to which region
                if (topLeft > 0 && topRight > 0) {
                  // Top side is positive
                  positivePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMax)} L ${toSvgX(xMin)} ${toSvgY(yMax)} Z`);
                  negativePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMin)} L ${toSvgX(xMin)} ${toSvgY(yMin)} Z`);
                } else if (bottomLeft > 0 && bottomRight > 0) {
                  // Bottom side is positive
                  positivePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMin)} L ${toSvgX(xMin)} ${toSvgY(yMin)} Z`);
                  negativePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMax)} L ${toSvgX(xMin)} ${toSvgY(yMax)} Z`);
                } else if (topLeft > 0 && bottomLeft > 0) {
                  // Left side is positive
                  positivePath.push(`${linePathStr} L ${toSvgX(xMin)} ${toSvgY(yMin)} L ${toSvgX(xMin)} ${toSvgY(yMax)} Z`);
                  negativePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMin)} L ${toSvgX(xMax)} ${toSvgY(yMax)} Z`);
                } else if (topRight > 0 && bottomRight > 0) {
                  // Right side is positive
                  positivePath.push(`${linePathStr} L ${toSvgX(xMax)} ${toSvgY(yMin)} L ${toSvgX(xMax)} ${toSvgY(yMax)} Z`);
                  negativePath.push(`${linePathStr} L ${toSvgX(xMin)} ${toSvgY(yMin)} L ${toSvgX(xMin)} ${toSvgY(yMax)} Z`);
                }

                return (
                  <>
                    {positivePath.length > 0 && (
                      <path
                        d={positivePath[0]}
                        fill="url(#positive-gradient)"
                        opacity="0.5"
                      />
                    )}
                    {negativePath.length > 0 && (
                      <path
                        d={negativePath[0]}
                        fill="url(#negative-gradient)"
                        opacity="0.5"
                      />
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* The line */}
          {linePoints.length === 2 && (
            <line
              x1={toSvgX(linePoints[0].x)}
              y1={toSvgY(linePoints[0].y)}
              x2={toSvgX(linePoints[1].x)}
              y2={toSvgY(linePoints[1].y)}
              stroke={colors.lineColor}
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Axis labels */}
          <text x={svgWidth - padding + 15} y={toSvgY(0) + 5} fill={colors.textSecondary} fontSize="12" fontFamily="monospace">x</text>
          <text x={toSvgX(0) - 15} y={padding - 10} fill={colors.textSecondary} fontSize="12" fontFamily="monospace">y</text>

          {/* Tick labels */}
          {[0, 1, 2, 3, 4].map(x => (
            <text
              key={`x-tick-${x}`}
              x={toSvgX(x)}
              y={toSvgY(0) + 20}
              fill={colors.textMuted}
              fontSize="10"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {x}
            </text>
          ))}
          {[0, 1, 2, 3].map(y => (
            <text
              key={`y-tick-${y}`}
              x={toSvgX(0) - 10}
              y={toSvgY(y) + 3}
              fill={colors.textMuted}
              fontSize="10"
              textAnchor="end"
              fontFamily="monospace"
            >
              {y}
            </text>
          ))}

          {/* Test points */}
          {points.map((point, i) => {
            const value = calculateValue(point.x, point.y);

            // Determine if point is correctly classified
            let isCorrect = false;
            if (point.label.toLowerCase().includes("cat")) {
              // Cats should be on negative side (value < 0)
              isCorrect = value < 0;
            } else if (point.label.toLowerCase().includes("dog")) {
              // Dogs should be on positive side (value > 0)
              isCorrect = value > 0;
            } else if (point.label.toLowerCase().includes("fence")) {
              // Fence should be near the line
              isCorrect = Math.abs(value) < 0.5;
            }

            return (
              <g key={i}>
                {/* Connection line to show distance */}
                {config.showDistanceFormula && Math.abs(value) > 0.1 && (
                  <line
                    x1={toSvgX(point.x)}
                    y1={toSvgY(point.y)}
                    x2={toSvgX(point.x)}
                    y2={toSvgY((-A * point.x - C) / B)}
                    stroke={colors.textMuted}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={toSvgX(point.x)}
                  cy={toSvgY(point.y)}
                  r={hoveredPoint === i || isDragging === i ? 10 : 8}
                  fill={isCorrect ? colors.secondary : colors.negative}
                  stroke={isDark ? colors.cardBg : "#fff"}
                  strokeWidth="2"
                  cursor="grab"
                  onMouseDown={() => handleMouseDown(i)}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className={`transition-all duration-300 ${animatingPoint === i ? 'animate-pulse' : ''}`}
                  style={{
                    filter: hoveredPoint === i || isDragging === i ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                  }}
                />

                {/* Point label */}
                <text
                  x={toSvgX(point.x)}
                  y={toSvgY(point.y) - 15}
                  fill={colors.textPrimary}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="system-ui"
                  pointerEvents="none"
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          {/* Equation label */}
          {config.equation && (
            <text
              x={padding - 10}
              y={padding - 20}
              fill={colors.lineColor}
              fontSize="14"
              fontWeight="bold"
              textAnchor="start"
              fontFamily="monospace"
              style={{
                filter: `drop-shadow(0 0 4px ${colors.bgGradient1})`
              }}
            >
              {config.equation.replace('=0', '').replace(/\s/g, '')} = 0
            </text>
          )}
        </svg>
        </div>
      </div>

      {/* Calculations panel */}
      <div className="w-full max-w-[600px] space-y-3">
        {points.map((point, i) => {
          const value = calculateValue(point.x, point.y);

          // Determine if point is correctly classified
          let isCorrect = false;
          let expectedSide = "";
          if (point.label.toLowerCase().includes("cat")) {
            isCorrect = value < 0;
            expectedSide = "negative side (cats)";
          } else if (point.label.toLowerCase().includes("dog")) {
            isCorrect = value > 0;
            expectedSide = "positive side (dogs)";
          } else if (point.label.toLowerCase().includes("fence")) {
            isCorrect = Math.abs(value) < 0.5;
            expectedSide = "on the line";
          }

          return (
            <div
              key={i}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                animatingPoint === i ? 'scale-[1.02] shadow-lg' : ''
              }`}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: isCorrect ? colors.secondary : colors.negative
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: isCorrect ? colors.secondary : colors.negative
                    }}
                  />
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>
                    {point.label}
                  </span>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                    ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                  </span>
                </div>

                {config.animateCalculation && (
                  <div className="font-mono text-sm" style={{ color: colors.textSecondary }}>
                    {A.toFixed(0)}({point.x.toFixed(2)}) + {B.toFixed(0)}({point.y.toFixed(2)}) + {C.toFixed(0)} =
                    <span
                      className="ml-2 font-bold text-base"
                      style={{
                        color: isCorrect ? colors.secondary : colors.negative
                      }}
                    >
                      {value.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm font-medium" style={{ color: colors.textPrimary }}>
                {isCorrect ?
                  `✅ Correctly classified! (${value.toFixed(2)} ${value > 0 ? '>' : value < 0 ? '<' : '='} 0)` :
                  `❌ Wrong side! Should be on ${expectedSide}`
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="w-full max-w-[600px] text-center space-y-2 mt-4">
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          <strong>🎯 Try it yourself:</strong> Drag any point to see how the perceptron classifies it
        </p>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          Green = correctly classified | Red = misclassified <br />Cats belong on the negative side (below line) | Dogs on the positive side (above line)
        </p>
      </div>
    </div>
  );
};

export default LineEquationInteractive;
