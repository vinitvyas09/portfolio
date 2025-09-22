"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface DecisionBoundaryGeometryProps {
  config?: {
    showWeightVector?: boolean;
    showBoundary?: boolean;
    showAngle?: boolean;
    dataset?: string;
    allowRotation?: boolean;
    annotation?: string;
  };
}

const DecisionBoundaryGeometry: React.FC<DecisionBoundaryGeometryProps> = ({
  config = {
    showWeightVector: true,
    showBoundary: true,
    showAngle: true,
    dataset: "interactive",
    allowRotation: true,
    annotation: "The weight vector and decision boundary are always at 90°"
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const {
    showWeightVector = true,
    showBoundary = true,
    showAngle = true,
    allowRotation = true,
    annotation = "The weight vector and decision boundary are always at 90°"
  } = config;

  // State for interactive rotation
  const [angle, setAngle] = useState(45); // Initial angle in degrees
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Colors
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        grid: "#e5e7eb",
        text: "#1e293b",
        textSecondary: "#64748b",
        weightVector: "#6366f1",
        boundary: "#10b981",
        positive: "#10b981",
        negative: "#ef4444",
        angle: "#f59e0b",
        axisPrimary: "#475569",
        axisSecondary: "#cbd5e1",
        vectorGlow: "#6366f1",
        boundaryGlow: "#10b981"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      grid: "#262626",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      weightVector: "#a78bfa",
      boundary: "#34d399",
      positive: "#34d399",
      negative: "#f87171",
      angle: "#fbbf24",
      axisPrimary: "#d1d5db",
      axisSecondary: "#525252",
      vectorGlow: "#a78bfa",
      boundaryGlow: "#34d399"
    } : {
      bg: "#ffffff",
      grid: "#e5e7eb",
      text: "#1e293b",
      textSecondary: "#64748b",
      weightVector: "#6366f1",
      boundary: "#10b981",
      positive: "#10b981",
      negative: "#ef4444",
      angle: "#f59e0b",
      axisPrimary: "#475569",
      axisSecondary: "#cbd5e1",
      vectorGlow: "#6366f1",
      boundaryGlow: "#10b981"
    };
  }, [isDark, mounted]);

  // Calculate weight vector and boundary from angle
  const { weightVector, boundaryNormal, dataPoints } = useMemo(() => {
    const radians = (angle * Math.PI) / 180;

    // Weight vector pointing at the given angle
    const w1 = Math.cos(radians);
    const w2 = Math.sin(radians);

    // Boundary is perpendicular to weight vector
    // If weight vector is (w1, w2), boundary normal is (-w2, w1)
    const boundaryNormal = { x: -w2, y: w1 };

    // Generate some data points on both sides of the boundary
    const points = [];
    const numPoints = 20;

    // Increase spread significantly to push points further from origin
    const spread = isMobile ? 15 : 10;

    for (let i = 0; i < numPoints; i++) {
      // Generate points in a pattern
      const offsetAngle = (i / numPoints) * Math.PI * 2;
      const distance = 1 + (i % 3) * 0.5;

      const x = Math.cos(offsetAngle) * distance * spread;
      const y = Math.sin(offsetAngle) * distance * spread;

      // Check which side of the boundary: w1*x + w2*y + bias
      // Using bias = 0 for simplicity (boundary passes through origin)
      const dotProduct = w1 * x + w2 * y;
      const label = dotProduct > 0 ? 'positive' : 'negative';

      points.push({ x, y, label });
    }

    // Adjust weight vector length based on viewport
    const vectorScale = isMobile ? 15 : 10;

    return {
      weightVector: { x: w1 * vectorScale, y: w2 * vectorScale },
      boundaryNormal,
      dataPoints: points
    };
  }, [angle, isMobile]);

  // Mouse handlers for rotation
  const handleMouseDown = useCallback(() => {
    if (!allowRotation) return;

    setIsDragging(true);
  }, [allowRotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (!isDragging || !allowRotation) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = centerY - (e.clientY - rect.top); // Flip Y axis

    // Calculate angle from center to mouse position
    const newAngle = Math.atan2(mouseY, mouseX) * 180 / Math.PI;
    setAngle(newAngle);
  }, [isDragging, allowRotation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(() => {
    if (!allowRotation) return;

    setIsDragging(true);
  }, [allowRotation]);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGElement>) => {
    if (!isDragging || !allowRotation) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const touchX = touch.clientX - rect.left - centerX;
    const touchY = centerY - (touch.clientY - rect.top);

    const newAngle = Math.atan2(touchY, touchX) * 180 / Math.PI;
    setAngle(newAngle);
  }, [isDragging, allowRotation]);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          background: 'transparent',
          borderRadius: '12px',
          margin: '2rem 0',
        }}
      />
    );
  }

  const svgWidth = 500;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const scale = isMobile ? 2.5 : 5; // Smaller scale for more zoom out

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '2rem auto',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${isDark ? '#171717' : '#fafafa'} 100%)`,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${isDark ? '#404040' : '#e2e8f0'}`,
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '400px',
          cursor: allowRotation ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <defs>
          <filter id="weightGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="boundaryGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill={colors.weightVector}
            />
          </marker>
        </defs>

        {/* Grid */}
        <g opacity="0.3">
          {(isMobile ?
            [-40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40] :
            [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20]
          ).map(i => (
            <g key={`grid-${i}`}>
              <line
                x1={0}
                y1={centerY + i * scale}
                x2={svgWidth}
                y2={centerY + i * scale}
                stroke={colors.grid}
                strokeWidth={i === 0 ? 1 : 0.5}
              />
              <line
                x1={centerX + i * scale}
                y1={0}
                x2={centerX + i * scale}
                y2={svgHeight}
                stroke={colors.grid}
                strokeWidth={i === 0 ? 1 : 0.5}
              />
            </g>
          ))}
        </g>

        {/* Axes */}
        <g>
          <line
            x1={0}
            y1={centerY}
            x2={svgWidth}
            y2={centerY}
            stroke={colors.axisPrimary}
            strokeWidth="2"
          />
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={svgHeight}
            stroke={colors.axisPrimary}
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={svgWidth - 15}
            y={centerY - 10}
            fill={colors.text}
            fontSize="12"
            fontWeight="500"
          >
            x₁
          </text>
          <text
            x={centerX + 10}
            y={15}
            fill={colors.text}
            fontSize="12"
            fontWeight="500"
          >
            x₂
          </text>
        </g>

        {/* Data points */}
        <g opacity="0.8">
          {dataPoints.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={centerX + point.x * scale}
              cy={centerY - point.y * scale}
              r="4"
              fill={point.label === 'positive' ? colors.positive : colors.negative}
              stroke={point.label === 'positive' ? colors.positive : colors.negative}
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
        </g>

        {/* Decision boundary */}
        {showBoundary && (
          <g filter="url(#boundaryGlow)">
            <line
              x1={centerX - boundaryNormal.x * 200}
              y1={centerY + boundaryNormal.y * 200}
              x2={centerX + boundaryNormal.x * 200}
              y2={centerY - boundaryNormal.y * 200}
              stroke={colors.boundary}
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.9"
            />
            <text
              x={centerX + boundaryNormal.x * 100}
              y={centerY - boundaryNormal.y * 100 - 10}
              fill={colors.boundary}
              fontSize="11"
              fontWeight="600"
            >
              Decision Boundary
            </text>
          </g>
        )}

        {/* Weight vector */}
        {showWeightVector && (
          <g filter="url(#weightGlow)">
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX + weightVector.x * scale}
              y2={centerY - weightVector.y * scale}
              stroke={colors.weightVector}
              strokeWidth="4"
              markerEnd="url(#arrowhead)"
            />

            <text
              x={centerX + weightVector.x * scale * 0.5}
              y={centerY - weightVector.y * scale * 0.5 - 10}
              fill={colors.weightVector}
              fontSize="12"
              fontWeight="600"
            >
              w = [{(weightVector.x / (isMobile ? 15 : 10)).toFixed(1)}, {(weightVector.y / (isMobile ? 15 : 10)).toFixed(1)}]
            </text>
          </g>
        )}

        {/* Angle indicator */}
        {showAngle && showWeightVector && showBoundary && (
          <g>
            <path
              d={`
                M ${centerX + 30} ${centerY}
                A 30 30 0 0 0 ${centerX + Math.cos((angle * Math.PI) / 180) * 30} ${centerY - Math.sin((angle * Math.PI) / 180) * 30}
              `}
              fill="none"
              stroke={colors.angle}
              strokeWidth="2"
              opacity="0.7"
            />
            <text
              x={centerX + 45}
              y={centerY - 5}
              fill={colors.angle}
              fontSize="14"
              fontWeight="600"
            >
              90°
            </text>
          </g>
        )}

        {/* Origin dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="4"
          fill={colors.text}
          opacity="0.8"
        />

        {/* Annotation */}
        {annotation && (
          <text
            x={centerX}
            y={svgHeight - 10}
            fill={colors.textSecondary}
            fontSize="11"
            textAnchor="middle"
            fontStyle="italic"
          >
            {annotation}
          </text>
        )}

        {/* Interactive hint */}
        {allowRotation && (
          <text
            x={centerX}
            y={20}
            fill={colors.textSecondary}
            fontSize="10"
            textAnchor="middle"
            opacity="0.7"
          >
            🔄 Drag to rotate the weight vector
          </text>
        )}
      </svg>

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        fontSize: '12px',
        color: colors.textSecondary
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: colors.positive
          }} />
          <span>Positive (w·x {'>'} 0)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: colors.negative
          }} />
          <span>Negative (w·x {'<'} 0)</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionBoundaryGeometry;