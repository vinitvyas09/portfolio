"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface XORProblemProps {
  config?: {
    dataset?: string;
    points?: Array<{ x: number; y: number; label: string; text: string }>;
    showFailedAttempts?: boolean;
    animateLineSearch?: boolean;
  };
}

const XORProblem: React.FC<XORProblemProps> = ({
  config = {
    dataset: "sentiment_with_negation",
    showFailedAttempts: true,
    animateLineSearch: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentLineAngle, setCurrentLineAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPoints, setShowPoints] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // XOR points
  const points = config.points || [
    { x: 0, y: 0, label: 'positive', text: 'not terrible' },
    { x: 1, y: 0, label: 'positive', text: 'excellent' },
    { x: 0, y: 1, label: 'negative', text: 'terrible' },
    { x: 1, y: 1, label: 'negative', text: 'not excellent' }
  ];

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        positive: "#10b981",
        negative: "#ef4444",
        line: "#6b7280",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        grid: "#f1f5f9"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      positive: "#34d399",
      negative: "#f87171",
      line: "#9ca3af",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#404040",
      grid: "#262626"
    } : {
      bg: "#ffffff",
      positive: "#10b981",
      negative: "#ef4444",
      line: "#6b7280",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9"
    };
  }, [isDark, mounted]);

  // Chart dimensions
  const size = 300;
  const padding = 40;
  const innerSize = size - 2 * padding;

  // Scale functions for 0-1 range
  const scaleX = (x: number) => padding + x * innerSize;
  const scaleY = (y: number) => size - padding - y * innerSize;

  // Animate points appearing
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    for (let i = 0; i <= points.length; i++) {
      const timeout = setTimeout(() => {
        setShowPoints(i);
      }, i * 200);
      timeouts.push(timeout);
    }
    return () => timeouts.forEach(clearTimeout);
  }, [points.length]);

  // Animate line rotation
  useEffect(() => {
    if (!config.animateLineSearch || !config.showFailedAttempts) return;

    const timeout = setTimeout(() => {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setCurrentLineAngle((prev) => (prev + 15) % 360);
      }, 100);

      const stopTimeout = setTimeout(() => {
        clearInterval(interval);
        setIsAnimating(false);
      }, 7200); // Full rotation

      return () => {
        clearInterval(interval);
        clearTimeout(stopTimeout);
      };
    }, points.length * 200 + 500);

    return () => clearTimeout(timeout);
  }, [config.animateLineSearch, config.showFailedAttempts, points.length]);

  // Calculate line endpoints
  const getLinePoints = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const cx = 0.5;
    const cy = 0.5;
    const len = 1;

    const dx = Math.cos(rad) * len;
    const dy = Math.sin(rad) * len;

    return {
      x1: Math.max(0, Math.min(1, cx - dx)),
      y1: Math.max(0, Math.min(1, cy - dy)),
      x2: Math.max(0, Math.min(1, cx + dx)),
      y2: Math.max(0, Math.min(1, cy + dy))
    };
  };

  const linePoints = getLinePoints(currentLineAngle);

  // Check how many points are misclassified for current line
  const calculateMisclassified = () => {
    const { x1, y1, x2, y2 } = linePoints;
    const a = y2 - y1;
    const b = x1 - x2;
    const c = x2 * y1 - x1 * y2;

    let misclassified = 0;
    points.forEach(p => {
      const side = a * p.x + b * p.y + c;
      const predictedPositive = side > 0;
      const actuallyPositive = p.label === 'positive';
      if (predictedPositive !== actuallyPositive) {
        misclassified++;
      }
    });

    return misclassified;
  };

  const misclassifiedCount = calculateMisclassified();
  const accuracy = ((4 - misclassifiedCount) / 4 * 100).toFixed(0);

  if (!mounted) {
    return <div style={{ height: '400px', background: 'transparent' }} />;
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <svg
        width="100%"
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: '400px', margin: '0 auto', display: 'block' }}
      >
        {/* Grid */}
        <g opacity="0.5">
          <line x1={scaleX(0.5)} y1={padding} x2={scaleX(0.5)} y2={size - padding} stroke={colors.grid} strokeWidth="1" />
          <line x1={padding} y1={scaleY(0.5)} x2={size - padding} y2={scaleY(0.5)} stroke={colors.grid} strokeWidth="1" />
        </g>

        {/* Border */}
        <rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          fill="none"
          stroke={colors.border}
          strokeWidth="2"
        />

        {/* Separating line attempt */}
        {config.showFailedAttempts && showPoints === points.length && (
          <line
            x1={scaleX(linePoints.x1)}
            y1={scaleY(linePoints.y1)}
            x2={scaleX(linePoints.x2)}
            y2={scaleY(linePoints.y2)}
            stroke={colors.line}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.6"
            style={{
              transition: isAnimating ? 'none' : 'all 0.3s ease'
            }}
          />
        )}

        {/* Data points */}
        {points.slice(0, showPoints).map((point, index) => (
          <g key={index}>
            <circle
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r="12"
              fill={point.label === 'positive' ? colors.positive : colors.negative}
              fillOpacity="0.8"
              stroke={point.label === 'positive' ? colors.positive : colors.negative}
              strokeWidth="2"
            />
            <text
              x={scaleX(point.x)}
              y={scaleY(point.y)}
              textAnchor="middle"
              dy="0.35em"
              fontSize="16"
              fill="white"
              fontWeight="bold"
            >
              {point.label === 'positive' ? '+' : '-'}
            </text>
          </g>
        ))}

        {/* Labels for points */}
        {points.slice(0, showPoints).map((point, index) => (
          <text
            key={`label-${index}`}
            x={scaleX(point.x)}
            y={scaleY(point.y) + (point.y > 0.5 ? -25 : 25)}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
            fontStyle="italic"
          >
            &quot;{point.text}&quot;
          </text>
        ))}

        {/* Axis labels */}
        <text x={size / 2} y={size - 10} textAnchor="middle" fontSize="12" fill={colors.text}>
          Has &quot;excellent&quot;
        </text>
        <text x={15} y={size / 2} textAnchor="middle" fontSize="12" fill={colors.text} transform={`rotate(-90, 15, ${size / 2})`}>
          Has &quot;terrible&quot;
        </text>

        {/* Corner labels */}
        <text x={padding - 5} y={size - padding + 5} textAnchor="end" fontSize="10" fill={colors.textSecondary}>0</text>
        <text x={size - padding + 5} y={size - padding + 5} textAnchor="start" fontSize="10" fill={colors.textSecondary}>1</text>
        <text x={padding - 5} y={padding - 5} textAnchor="end" fontSize="10" fill={colors.textSecondary}>1</text>
      </svg>

      {/* Status display */}
      {config.showFailedAttempts && showPoints === points.length && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: isDark ? 'rgba(23, 23, 23, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '0.5rem'
          }}>
            {isAnimating ? '🔄 Searching for a separating line...' : '❌ No single line can separate XOR'}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>Accuracy</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: accuracy === '100' ? colors.positive : colors.negative }}>
                {accuracy}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>Best Possible</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.line }}>
                50%
              </div>
            </div>
          </div>

          {!isAnimating && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              fontSize: '13px',
              color: colors.text,
              fontStyle: 'italic'
            }}>
              The XOR pattern requires at least two lines (or a curve) to separate correctly.
              This limitation led to the first AI winter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default XORProblem;