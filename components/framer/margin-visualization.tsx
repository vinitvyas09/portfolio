"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface DataPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

interface MarginVisualizationProps {
  config?: {
    showMargin?: boolean;
    showDistances?: boolean;
    interactive?: boolean;
    datasets?: string[];
  };
}

const MarginVisualization: React.FC<MarginVisualizationProps> = ({
  config = {
    showMargin: true,
    showDistances: true,
    interactive: true,
    datasets: ["easy_margin", "hard_margin"]
  }
}) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredDataset, setHoveredDataset] = useState<number | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Color scheme
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8f9fa",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        grid: "#f1f5f9",
        positive: "#10b981",
        negative: "#ef4444",
        boundary: "#6366f1",
        margin: "#a78bfa",
        marginFill: "rgba(167, 139, 250, 0.15)",
        supportVector: "#f59e0b",
        hover: "#fbbf24"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      border: "#404040",
      grid: "#262626",
      positive: "#34d399",
      negative: "#f87171",
      boundary: "#a78bfa",
      margin: "#c084fc",
      marginFill: "rgba(192, 132, 252, 0.1)",
      supportVector: "#fbbf24",
      hover: "#fde047"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9",
      positive: "#10b981",
      negative: "#ef4444",
      boundary: "#6366f1",
      margin: "#a78bfa",
      marginFill: "rgba(167, 139, 250, 0.15)",
      supportVector: "#f59e0b",
      hover: "#fbbf24"
    };
  }, [isDark, mounted]);

  // Generate datasets
  const datasets = useMemo(() => {
    const easyMargin: DataPoint[] = [
      // Positive points (dogs)
      { x: 3.5, y: 3.2, label: 1 },
      { x: 4.2, y: 3.8, label: 1 },
      { x: 3.8, y: 2.8, label: 1 },
      { x: 4.5, y: 3.5, label: 1 },
      { x: 4.0, y: 4.0, label: 1 },
      // Negative points (cats)
      { x: 1.0, y: 1.2, label: -1 },
      { x: 1.5, y: 0.8, label: -1 },
      { x: 0.8, y: 1.5, label: -1 },
      { x: 1.2, y: 1.8, label: -1 },
      { x: 0.5, y: 1.0, label: -1 },
    ];

    const hardMargin: DataPoint[] = [
      // Positive points (dogs) - closer to boundary
      { x: 2.8, y: 2.6, label: 1 },
      { x: 3.2, y: 2.8, label: 1 },
      { x: 3.0, y: 3.0, label: 1 },
      { x: 3.5, y: 3.2, label: 1 },
      { x: 3.3, y: 2.5, label: 1 },
      // Negative points (cats) - closer to boundary
      { x: 2.0, y: 2.2, label: -1 },
      { x: 2.2, y: 1.8, label: -1 },
      { x: 1.8, y: 2.0, label: -1 },
      { x: 2.3, y: 2.4, label: -1 },
      { x: 1.5, y: 1.5, label: -1 },
    ];

    return {
      easy_margin: easyMargin,
      hard_margin: hardMargin
    };
  }, []);

  // Calculate decision boundary and margin for each dataset
  const boundaries = useMemo(() => {
    return {
      easy_margin: {
        // Line roughly at x = 2.5
        A: 1,
        B: 0,
        C: -2.5,
        margin: 0.8, // Large margin
        supportVectors: [4, 9] // Indices of closest points
      },
      hard_margin: {
        // Line roughly at x = 2.5
        A: 1,
        B: 0,
        C: -2.5,
        margin: 0.3, // Small margin
        supportVectors: [0, 3] // Indices of closest points
      }
    };
  }, []);

  const renderDataset = (datasetName: string, index: number) => {
    const data = datasets[datasetName as keyof typeof datasets];
    const boundary = boundaries[datasetName as keyof typeof boundaries];

    const svgWidth = 280;
    const svgHeight = 280;
    const padding = 40;
    const graphSize = svgWidth - 2 * padding;

    // Coordinate bounds
    const xMin = 0;
    const xMax = 5;
    const yMin = 0;
    const yMax = 5;

    // Transform functions
    const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphSize;
    const toSvgY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * graphSize;

    // Calculate line endpoints
    const lineY1 = (-boundary.C - boundary.A * xMin) / (boundary.B || 1);
    const lineY2 = (-boundary.C - boundary.A * xMax) / (boundary.B || 1);

    const isHovered = hoveredDataset === index;

    return (
      <div
        key={datasetName}
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgSecondary})`,
          borderRadius: '12px',
          padding: '1.5rem',
          border: `1px solid ${colors.border}`,
          boxShadow: isHovered ?
            (isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)') :
            (isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'),
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setHoveredDataset(index)}
        onMouseLeave={() => setHoveredDataset(null)}
      >
        {/* Title */}
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          {datasetName === 'easy_margin' ? 'Easy Problem' : 'Hard Problem'}
        </div>

        {/* Margin value */}
        <div style={{
          fontSize: '13px',
          color: colors.textSecondary,
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Margin (γ) = {boundary.margin.toFixed(2)}
        </div>

        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: 'block', margin: '0 auto' }}
        >
          {/* Grid lines */}
          {[1, 2, 3, 4].map(val => (
            <g key={`grid-${val}`}>
              <line
                x1={toSvgX(val)}
                y1={padding}
                x2={toSvgX(val)}
                y2={padding + graphSize}
                stroke={colors.grid}
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1={padding}
                y1={toSvgY(val)}
                x2={padding + graphSize}
                y2={toSvgY(val)}
                stroke={colors.grid}
                strokeWidth="1"
                opacity="0.3"
              />
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding + graphSize}
            x2={padding + graphSize}
            y2={padding + graphSize}
            stroke={colors.border}
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + graphSize}
            stroke={colors.border}
            strokeWidth="2"
          />

          {/* Margin visualization */}
          {config.showMargin && (
            <>
              {/* Margin area (shaded region) */}
              <rect
                x={toSvgX(2.5 - boundary.margin)}
                y={padding}
                width={toSvgX(2.5 + boundary.margin) - toSvgX(2.5 - boundary.margin)}
                height={graphSize}
                fill={colors.marginFill}
                opacity="0.5"
              />

              {/* Margin boundaries (dashed lines) */}
              <line
                x1={toSvgX(2.5 - boundary.margin)}
                y1={padding}
                x2={toSvgX(2.5 - boundary.margin)}
                y2={padding + graphSize}
                stroke={colors.margin}
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <line
                x1={toSvgX(2.5 + boundary.margin)}
                y1={padding}
                x2={toSvgX(2.5 + boundary.margin)}
                y2={padding + graphSize}
                stroke={colors.margin}
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.6"
              />
            </>
          )}

          {/* Decision boundary */}
          <line
            x1={toSvgX(2.5)}
            y1={padding}
            x2={toSvgX(2.5)}
            y2={padding + graphSize}
            stroke={colors.boundary}
            strokeWidth="3"
          />

          {/* Data points */}
          {data.map((point, idx) => {
            const isSupportVector = boundary.supportVectors.includes(idx);
            const isSelected = selectedPointIndex === idx && hoveredDataset === index;

            return (
              <g key={`point-${idx}`}>
                {/* Support vector highlight */}
                {isSupportVector && (
                  <circle
                    cx={toSvgX(point.x)}
                    cy={toSvgY(point.y)}
                    r="12"
                    fill={colors.supportVector}
                    opacity="0.2"
                  />
                )}

                {/* Distance line to boundary */}
                {config.showDistances && isSupportVector && (
                  <line
                    x1={toSvgX(point.x)}
                    y1={toSvgY(point.y)}
                    x2={toSvgX(2.5)}
                    y2={toSvgY(point.y)}
                    stroke={colors.supportVector}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}

                {/* Point */}
                <circle
                  cx={toSvgX(point.x)}
                  cy={toSvgY(point.y)}
                  r={isSelected ? "8" : "6"}
                  fill={point.label === 1 ? colors.positive : colors.negative}
                  stroke={isSupportVector ? colors.supportVector : colors.bg}
                  strokeWidth={isSupportVector ? "2" : "1"}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={() => setSelectedPointIndex(idx)}
                  onMouseLeave={() => setSelectedPointIndex(null)}
                />

                {/* Point label on hover */}
                {isSelected && (
                  <text
                    x={toSvgX(point.x)}
                    y={toSvgY(point.y) - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill={colors.text}
                    fontWeight="600"
                  >
                    {point.label === 1 ? 'Dog' : 'Cat'}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={padding + graphSize / 2}
            y={svgHeight - 10}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
          >
            Feature 1
          </text>
          <text
            x={15}
            y={padding + graphSize / 2}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
            transform={`rotate(-90, 15, ${padding + graphSize / 2})`}
          >
            Feature 2
          </text>
        </svg>

        {/* Description */}
        <div style={{
          marginTop: '1rem',
          fontSize: '12px',
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          {datasetName === 'easy_margin' ?
            'Classes are well-separated. Large margin means robust classification.' :
            'Classes are close together. Small margin means sensitive to noise.'
          }
        </div>
      </div>
    );
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

  return (
    <div style={{
      padding: '2rem 1rem',
      margin: '2rem 0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        {(config.datasets || ["easy_margin", "hard_margin"]).map((dataset, idx) =>
          renderDataset(dataset, idx)
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.positive
          }} />
          <span style={{ color: colors.textSecondary }}>Class +1 (Dogs)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.negative
          }} />
          <span style={{ color: colors.textSecondary }}>Class -1 (Cats)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '24px',
            height: '3px',
            backgroundColor: colors.boundary
          }} />
          <span style={{ color: colors.textSecondary }}>Decision Boundary</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: `2px solid ${colors.supportVector}`,
            backgroundColor: 'transparent'
          }} />
          <span style={{ color: colors.textSecondary }}>Support Vectors</span>
        </div>
      </div>

      {/* Insight box */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
        border: `1px solid ${colors.margin}`,
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '2rem auto 0'
      }}>
        <div style={{
          fontSize: '13px',
          color: colors.text,
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          <strong>💡 Key Insight:</strong> The margin γ is the distance from the decision boundary to the nearest points (support vectors).
          Larger margins indicate easier classification problems and lead to faster convergence.
        </div>
      </div>
    </div>
  );
};

export default MarginVisualization;