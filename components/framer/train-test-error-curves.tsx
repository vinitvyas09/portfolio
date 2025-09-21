"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';

interface TrainTestErrorCurvesProps {
  config?: {
    showOptimalPoint?: boolean;
    interactive?: boolean;
    annotations?: Array<{
      point: 'early' | 'optimal' | 'late';
      text: string;
    }>;
  };
}

const TrainTestErrorCurves: React.FC<TrainTestErrorCurvesProps> = ({
  config = {
    showOptimalPoint: true,
    interactive: true,
    annotations: [
      { point: 'early', text: 'Underfitting: Haven\'t learned enough' },
      { point: 'optimal', text: 'Sweet spot: Good generalization' },
      { point: 'late', text: 'Overfitting: Memorized training data' }
    ]
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredEpoch, setHoveredEpoch] = useState<number | null>(null);
  const [selectedEpoch, setSelectedEpoch] = useState<number>(25);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);

    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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
        trainLine: "#3b82f6",
        testLine: "#ef4444",
        optimalPoint: "#10b981",
        underfitRegion: "rgba(245, 158, 11, 0.1)",
        optimalRegion: "rgba(16, 185, 129, 0.1)",
        overfitRegion: "rgba(239, 68, 68, 0.1)"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      border: "#404040",
      grid: "#262626",
      trainLine: "#60a5fa",
      testLine: "#f87171",
      optimalPoint: "#34d399",
      underfitRegion: "rgba(251, 191, 36, 0.1)",
      optimalRegion: "rgba(52, 211, 153, 0.1)",
      overfitRegion: "rgba(248, 113, 113, 0.1)"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9",
      trainLine: "#3b82f6",
      testLine: "#ef4444",
      optimalPoint: "#10b981",
      underfitRegion: "rgba(245, 158, 11, 0.1)",
      optimalRegion: "rgba(16, 185, 129, 0.1)",
      overfitRegion: "rgba(239, 68, 68, 0.1)"
    };
  }, [isDark, mounted]);

  // Generate error curves
  const { trainErrors, testErrors, optimalEpoch } = useMemo(() => {
    const epochs = 100;
    const train: number[] = [];
    const test: number[] = [];

    for (let i = 0; i <= epochs; i++) {
      // Training error: exponentially decreasing from 35% to near 2%
      const baseTrainError = 33 * Math.exp(-i / 15) + 2;
      const trainError = baseTrainError + (Math.random() - 0.5) * 0.3;
      train.push(Math.max(0, trainError));

      // Test error: U-shaped curve (decreases then increases)
      let testError;
      if (i < 25) {
        // Decreasing phase from 35% to about 8%
        const baseTestError = 27 * Math.exp(-i / 20) + 8;
        testError = baseTestError + (Math.random() - 0.5) * 0.5;
      } else {
        // Increasing phase (overfitting)
        const overfitAmount = Math.pow((i - 25) / 75, 1.5) * 12;
        testError = 8 + overfitAmount + (Math.random() - 0.5) * 0.5;
      }
      test.push(Math.max(0, Math.min(40, testError)));
    }

    // Find optimal epoch (minimum test error)
    let minTestError = test[0];
    let optimal = 0;
    for (let i = 1; i < test.length; i++) {
      if (test[i] < minTestError) {
        minTestError = test[i];
        optimal = i;
      }
    }

    return { trainErrors: train, testErrors: test, optimalEpoch: optimal };
  }, []);

  // Chart dimensions - responsive for mobile
  const width = useMemo(() => {
    if (!mounted) return 600;
    return isMobile ? Math.min(window.innerWidth - 60, 320) : 600;
  }, [isMobile, mounted]);

  const height = isMobile ? 200 : 350;
  const margin = isMobile
    ? { top: 15, right: 15, bottom: 35, left: 35 }
    : { top: 30, right: 30, bottom: 50, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scale functions
  const xScale = (epoch: number) => (epoch / 100) * chartWidth;
  const yScale = (error: number) => chartHeight - (error / 40) * chartHeight;

  // Create path data for curves
  const trainPath = trainErrors
    .map((error, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(error)}`)
    .join(' ');

  const testPath = testErrors
    .map((error, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(error)}`)
    .join(' ');

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!config.interactive) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - margin.left;
    if (x >= 0 && x <= chartWidth) {
      const epoch = Math.round((x / chartWidth) * 100);
      setHoveredEpoch(epoch);
    } else {
      setHoveredEpoch(null);
    }
  };

  const handleClick = () => {
    if (hoveredEpoch !== null) {
      setSelectedEpoch(hoveredEpoch);
    }
  };

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        margin: '2rem 0',
        height: '400px',
        background: 'transparent',
      }} />
    );
  }

  const displayEpoch = hoveredEpoch !== null ? hoveredEpoch : selectedEpoch;

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
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        Training vs Test Error: The Overfitting Story
      </div>

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
        onMouseLeave={() => setHoveredEpoch(null)}
        onClick={handleClick}
      >
        {/* Background regions */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Underfitting region */}
          <rect
            x={0}
            y={0}
            width={xScale(15)}
            height={chartHeight}
            fill={colors.underfitRegion}
          />

          {/* Optimal region */}
          <rect
            x={xScale(15)}
            y={0}
            width={xScale(35) - xScale(15)}
            height={chartHeight}
            fill={colors.optimalRegion}
          />

          {/* Overfitting region */}
          <rect
            x={xScale(35)}
            y={0}
            width={chartWidth - xScale(35)}
            height={chartHeight}
            fill={colors.overfitRegion}
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(epoch => (
            <line
              key={`vgrid-${epoch}`}
              x1={xScale(epoch)}
              y1={0}
              x2={xScale(epoch)}
              y2={chartHeight}
              stroke={colors.grid}
              strokeWidth="1"
              opacity="0.5"
              strokeDasharray={epoch === 50 ? "none" : "2,2"}
            />
          ))}

          {[0, 10, 20, 30, 40].map(error => (
            <line
              key={`hgrid-${error}`}
              x1={0}
              y1={yScale(error)}
              x2={chartWidth}
              y2={yScale(error)}
              stroke={colors.grid}
              strokeWidth="1"
              opacity="0.5"
              strokeDasharray={error === 20 ? "none" : "2,2"}
            />
          ))}

          {/* Axis lines */}
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

          {/* Error curves */}
          <path
            d={trainPath}
            fill="none"
            stroke={colors.trainLine}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={testPath}
            fill="none"
            stroke={colors.testLine}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Optimal point */}
          {config.showOptimalPoint && (
            <>
              <circle
                cx={xScale(optimalEpoch)}
                cy={yScale(testErrors[optimalEpoch])}
                r="6"
                fill={colors.optimalPoint}
                stroke={colors.bg}
                strokeWidth="2"
              />
              <text
                x={xScale(optimalEpoch)}
                y={yScale(testErrors[optimalEpoch]) - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={colors.optimalPoint}
              >
                Optimal
              </text>
            </>
          )}

          {/* Interactive hover line and points */}
          {config.interactive && displayEpoch !== null && (
            <>
              <line
                x1={xScale(displayEpoch)}
                y1={0}
                x2={xScale(displayEpoch)}
                y2={chartHeight}
                stroke={colors.text}
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="4,2"
              />
              <circle
                cx={xScale(displayEpoch)}
                cy={yScale(trainErrors[displayEpoch])}
                r="4"
                fill={colors.trainLine}
              />
              <circle
                cx={xScale(displayEpoch)}
                cy={yScale(testErrors[displayEpoch])}
                r="4"
                fill={colors.testLine}
              />
            </>
          )}

          {/* Region labels */}
          {config.annotations?.map((annotation) => {
            const x = annotation.point === 'early' ? 7.5 :
                     annotation.point === 'optimal' ? 25 :
                     67.5;
            const y = 15;

            return (
              <text
                key={annotation.point}
                x={xScale(x)}
                y={y}
                textAnchor="middle"
                fontSize="11"
                fill={colors.textSecondary}
                fontWeight="500"
              >
                {annotation.text.split(':')[0]}
              </text>
            );
          })}

          {/* Axis labels */}
          {[0, 25, 50, 75, 100].map(epoch => (
            <text
              key={`xlabel-${epoch}`}
              x={xScale(epoch)}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill={colors.textSecondary}
            >
              {epoch}
            </text>
          ))}

          {[0, 10, 20, 30, 40].map(error => (
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
          Training Epochs
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
          Error Rate (%)
        </text>
      </svg>

      {/* Legend and info */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '24px',
            height: '3px',
            background: colors.trainLine,
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '13px', color: colors.text }}>Training Error</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '24px',
            height: '3px',
            background: colors.testLine,
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '13px', color: colors.text }}>Test Error</span>
        </div>
      </div>

      {/* Current values display */}
      {config.interactive && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem'
        }}>
          <div style={{ fontSize: '12px', color: colors.text }}>
            <strong>Epoch {displayEpoch}:</strong>
          </div>
          <div style={{ fontSize: '12px', color: colors.trainLine }}>
            Train: {trainErrors[displayEpoch]?.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: colors.testLine }}>
            Test: {testErrors[displayEpoch]?.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Key insight */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
        border: `1px solid ${colors.optimalPoint}`,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.text,
          lineHeight: '1.6'
        }}>
          <strong>💡 The pattern:</strong> Training error always decreases, but test error tells the real story.
          It drops initially as the model learns patterns, hits a sweet spot around epoch {optimalEpoch},
          then rises as the model starts memorizing training data instead of generalizing.
        </div>
      </div>
    </div>
  );
};

export default TrainTestErrorCurves;