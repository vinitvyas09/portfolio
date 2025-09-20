"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';

interface ConvergenceBoundVisualProps {
  config?: {
    showTheoreticalBound?: boolean;
    showActualConvergence?: boolean;
    varyMargin?: boolean;
    interactive?: boolean;
  };
}

const ConvergenceBoundVisual: React.FC<ConvergenceBoundVisualProps> = ({
  config = {
    showTheoreticalBound: true,
    showActualConvergence: true,
    varyMargin: true,
    interactive: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [margin, setMargin] = useState(0.5); // γ value (0.1 to 1.0)
  const [hoveredIteration, setHoveredIteration] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8f9fa",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        grid: "#f1f5f9",
        theoreticalLine: "#a855f7",
        actualLine: "#10b981",
        convergencePoint: "#ef4444"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      border: "#404040",
      grid: "#262626",
      theoreticalLine: "#c084fc",
      actualLine: "#34d399",
      convergencePoint: "#f87171"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9",
      theoreticalLine: "#a855f7",
      actualLine: "#10b981",
      convergencePoint: "#ef4444"
    };
  }, [isDark, mounted]);

  // Generate convergence data based on margin
  const { theoreticalBound, actualConvergence, maxIterations } = useMemo(() => {
    // ||x||²_max assumed to be 10 for normalization
    const xMaxSquared = 10;
    const gammaSquared = margin * margin;

    // Theoretical bound: k ≤ ||x||²_max / γ²
    const theoreticalMax = xMaxSquared / gammaSquared;

    // Generate actual convergence data (usually much faster)
    // Actual convergence follows an exponential decay pattern
    const actualData: number[] = [];
    const iterations = Math.min(Math.ceil(theoreticalMax), 200); // Cap for visualization

    for (let i = 0; i <= iterations; i++) {
      // Actual errors decay exponentially and converge much faster
      const actualError = 100 * Math.exp(-i * margin * 0.3); // Faster with larger margin
      actualData.push(actualError);
    }

    // Find actual convergence point (where error < 1%)
    let actualConvergencePoint = iterations;
    for (let i = 0; i < actualData.length; i++) {
      if (actualData[i] < 1) {
        actualConvergencePoint = i;
        break;
      }
    }

    return {
      theoreticalBound: Math.min(theoreticalMax, 200),
      actualConvergence: actualData,
      maxIterations: iterations,
      actualConvergencePoint
    };
  }, [margin]);

  // Chart dimensions
  const width = 600;
  const height = 350;
  const margin_chart = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - margin_chart.left - margin_chart.right;
  const chartHeight = height - margin_chart.top - margin_chart.bottom;

  // Scale functions
  const xScale = (iteration: number) => (iteration / maxIterations) * chartWidth;
  const yScale = (error: number) => chartHeight - (Math.max(0, Math.min(error, 100)) / 100) * chartHeight;

  // Create path for actual convergence
  const actualPath = actualConvergence
    .map((error, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(error)}`)
    .join(' ');

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!config.interactive) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - margin_chart.left;
    if (x >= 0 && x <= chartWidth) {
      const iteration = Math.round((x / chartWidth) * maxIterations);
      setHoveredIteration(Math.min(iteration, actualConvergence.length - 1));
    } else {
      setHoveredIteration(null);
    }
  };

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        margin: '2rem 0',
        height: '450px',
        background: 'transparent',
      }} />
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
    }}>
      {/* Title */}
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: colors.text,
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Convergence Bound: Theory vs Reality
      </div>

      {/* Margin slider */}
      {config.varyMargin && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <label style={{
              fontSize: '13px',
              color: colors.text,
              fontWeight: '600',
              minWidth: '140px'
            }}>
              Margin (γ): {margin.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                outline: 'none',
                background: `linear-gradient(to right, ${colors.convergencePoint} 0%, ${colors.actualLine} 100%)`,
                cursor: 'pointer'
              }}
            />
          </div>
          <div style={{
            marginTop: '0.5rem',
            fontSize: '11px',
            color: colors.textSecondary,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Harder problem (small margin)</span>
            <span>Easier problem (large margin)</span>
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
          margin: '0 auto',
          cursor: config.interactive ? 'crosshair' : 'default'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIteration(null)}
      >
        <g transform={`translate(${margin_chart.left}, ${margin_chart.top})`}>
          {/* Grid lines */}
          {Array.from({ length: 5 }, (_, i) => (i + 1) * maxIterations / 5).map(iter => (
            <line
              key={`vgrid-${iter}`}
              x1={xScale(iter)}
              y1={0}
              x2={xScale(iter)}
              y2={chartHeight}
              stroke={colors.grid}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="2,2"
            />
          ))}

          {[0, 25, 50, 75, 100].map(error => (
            <line
              key={`hgrid-${error}`}
              x1={0}
              y1={yScale(error)}
              x2={chartWidth}
              y2={yScale(error)}
              stroke={colors.grid}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="2,2"
            />
          ))}

          {/* Axes */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={colors.border}
            strokeWidth="2"
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke={colors.border}
            strokeWidth="2"
          />

          {/* Theoretical bound area */}
          {config.showTheoreticalBound && (
            <rect
              x={0}
              y={0}
              width={xScale(theoreticalBound)}
              height={chartHeight}
              fill={colors.theoreticalLine}
              opacity="0.1"
            />
          )}

          {/* Theoretical bound line */}
          {config.showTheoreticalBound && (
            <>
              <line
                x1={xScale(theoreticalBound)}
                y1={0}
                x2={xScale(theoreticalBound)}
                y2={chartHeight}
                stroke={colors.theoreticalLine}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={xScale(theoreticalBound) - 5}
                y={-10}
                textAnchor="end"
                fontSize="11"
                fontWeight="600"
                fill={colors.theoreticalLine}
              >
                Theoretical Bound: {Math.round(theoreticalBound)} iterations
              </text>
            </>
          )}

          {/* Actual convergence curve */}
          {config.showActualConvergence && (
            <path
              d={actualPath}
              fill="none"
              stroke={colors.actualLine}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Actual convergence point */}
          {config.showActualConvergence && (() => {
            const convergenceIndex = actualConvergence.findIndex(e => e < 1);
            // Only show if convergence actually happened within our visualization range
            if (convergenceIndex >= 0 && convergenceIndex <= maxIterations) {
              return (
                <>
                  <circle
                    cx={xScale(convergenceIndex)}
                    cy={yScale(1)}
                    r="5"
                    fill={colors.convergencePoint}
                    stroke={colors.bg}
                    strokeWidth="2"
                  />
                  <text
                    x={xScale(convergenceIndex)}
                    y={yScale(1) - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={colors.convergencePoint}
                  >
                    Converged!
                  </text>
                </>
              );
            }
            return null;
          })()}

          {/* Interactive hover */}
          {config.interactive && hoveredIteration !== null && (
            <>
              <line
                x1={xScale(hoveredIteration)}
                y1={0}
                x2={xScale(hoveredIteration)}
                y2={chartHeight}
                stroke={colors.text}
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="4,2"
              />
              {actualConvergence[hoveredIteration] !== undefined && (
                <circle
                  cx={xScale(hoveredIteration)}
                  cy={yScale(actualConvergence[hoveredIteration])}
                  r="4"
                  fill={colors.actualLine}
                />
              )}
            </>
          )}

          {/* Axis labels */}
          {Array.from({ length: 6 }, (_, i) => i * maxIterations / 5).map(iter => (
            <text
              key={`xlabel-${iter}`}
              x={xScale(iter)}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill={colors.textSecondary}
            >
              {Math.round(iter)}
            </text>
          ))}

          {[0, 25, 50, 75, 100].map(error => (
            <text
              key={`ylabel-${error}`}
              x={-10}
              y={yScale(error) + 4}
              textAnchor="end"
              fontSize="11"
              fill={colors.textSecondary}
            >
              {error}%
            </text>
          ))}
        </g>

        {/* Axis titles */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={colors.text}
        >
          Number of Updates (k)
        </text>
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={colors.text}
          transform={`rotate(-90, 20, ${height / 2})`}
        >
          Classification Error (%)
        </text>
      </svg>

      {/* Legend */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        {config.showTheoreticalBound && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '3px',
              background: colors.theoreticalLine,
              borderRadius: '2px',
              border: `1px dashed ${colors.theoreticalLine}`
            }} />
            <span style={{ fontSize: '13px', color: colors.text }}>
              Theoretical Bound (k ≤ ||x||²/γ²)
            </span>
          </div>
        )}
        {config.showActualConvergence && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px',
              height: '3px',
              background: colors.actualLine,
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '13px', color: colors.text }}>Actual Convergence</span>
          </div>
        )}
      </div>

      {/* Current values display */}
      {config.interactive && hoveredIteration !== null && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: colors.text }}>
            <strong>Iteration {hoveredIteration}:</strong>{' '}
            Error = {actualConvergence[hoveredIteration]?.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Key insight */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
        border: `1px solid ${colors.theoreticalLine}`,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.text,
          lineHeight: '1.6'
        }}>
          <strong>💡 Key insight:</strong> The theoretical bound guarantees convergence in at most {Math.round(theoreticalBound)} iterations
          for margin γ = {margin.toFixed(2)}, but actual convergence happens much faster
          (around {actualConvergence.findIndex(e => e < 1)} iterations).
          Larger margins lead to dramatically faster convergence—notice how both bounds shrink as γ increases.
        </div>
      </div>
    </div>
  );
};

export default ConvergenceBoundVisual;