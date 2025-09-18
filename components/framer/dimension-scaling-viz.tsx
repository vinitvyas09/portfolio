"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface FeatureConfig {
  dim: number;
  labels: string[];
  visual: "2d-plane" | "3d-space" | "tesseract-hint" | "abstract" | "matrix-rain";
}

interface DimensionScalingVizProps {
  config?: {
    startDimension?: number;
    endDimension?: number;
    features?: FeatureConfig[];
    animationMs?: number;
    showHumanLimit?: boolean;
  };
}

const DimensionScalingViz: React.FC<DimensionScalingVizProps> = ({
  config = {
    startDimension: 2,
    endDimension: 100,
    features: [
      { dim: 2, labels: ["Sleep hours", "Speed"], visual: "2d-plane" },
      { dim: 3, labels: ["Sleep hours", "Speed", "Bark frequency"], visual: "3d-space" },
      { dim: 4, labels: ["+ Tail wag rate"], visual: "tesseract-hint" },
      { dim: 10, labels: ["+ 6 more features..."], visual: "abstract" },
      { dim: 100, labels: ["+ 96 more features..."], visual: "matrix-rain" }
    ],
    animationMs: 4000,
    showHumanLimit: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const { features = [], showHumanLimit = true } = config;

  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#fafafa",
        bgGradient2: "#f3f4f6",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        borderColor: "#e2e8f0",
        accentPrimary: "#6366f1",
        accentSecondary: "#10b981",
        humanLimitBg: "#fef3c7",
        humanLimitBorder: "#f59e0b",
        dimensionBg: "rgba(99, 102, 241, 0.1)",
        progressBarBg: "rgba(148, 163, 184, 0.2)",
        progressBarFill: "#6366f1",
        matrixGreen: "#10b981",
        warningRed: "#ef4444"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      borderColor: "#404040",
      accentPrimary: "#a78bfa",
      accentSecondary: "#34d399",
      humanLimitBg: "#451a03",
      humanLimitBorder: "#f59e0b",
      dimensionBg: "rgba(167, 139, 250, 0.2)",
      progressBarBg: "rgba(64, 64, 64, 0.5)",
      progressBarFill: "#a78bfa",
      matrixGreen: "#34d399",
      warningRed: "#f87171"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      borderColor: "#e2e8f0",
      accentPrimary: "#6366f1",
      accentSecondary: "#10b981",
      humanLimitBg: "#fef3c7",
      humanLimitBorder: "#f59e0b",
      dimensionBg: "rgba(99, 102, 241, 0.1)",
      progressBarBg: "rgba(148, 163, 184, 0.2)",
      progressBarFill: "#6366f1",
      matrixGreen: "#10b981",
      warningRed: "#ef4444"
    };
  }, [isDark, mounted]);

  const resetVisualization = () => {
    setCurrentFeatureIndex(0);
  };

  const currentFeature = features[currentFeatureIndex] || features[0];
  const isHumanLimit = currentFeature.dim <= 3;

  const renderVisualization = (feature: FeatureConfig) => {
    const baseOpacity = 1;

    switch (feature.visual) {
      case "2d-plane":
        return (
          <svg width="300" height="200" viewBox="0 0 300 200">
            <defs>
              <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.accentPrimary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.accentSecondary} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i} opacity={baseOpacity * 0.3}>
                <line x1={i * 25} y1="0" x2={i * 25} y2="200" stroke={colors.borderColor} strokeWidth="0.5" />
                <line x1="0" y1={i * 20} x2="300" y2={i * 20} stroke={colors.borderColor} strokeWidth="0.5" />
              </g>
            ))}

            {/* Data points */}
            {[
              { x: 60, y: 160, color: colors.accentSecondary, label: "🐱" },
              { x: 90, y: 150, color: colors.accentSecondary, label: "🐱" },
              { x: 75, y: 140, color: colors.accentSecondary, label: "🐱" },
              { x: 210, y: 60, color: colors.accentPrimary, label: "🐕" },
              { x: 240, y: 70, color: colors.accentPrimary, label: "🐕" },
              { x: 225, y: 50, color: colors.accentPrimary, label: "🐕" },
            ].map((point, i) => (
              <g key={i} opacity={baseOpacity}>
                <circle cx={point.x} cy={point.y} r="6" fill={point.color} />
                <text x={point.x} y={point.y + 2} textAnchor="middle" fontSize="8" fill="white">
                  {point.label}
                </text>
              </g>
            ))}

            {/* Separating line */}
            <line
              x1="120" y1="30" x2="180" y2="170"
              stroke={colors.warningRed}
              strokeWidth="2"
              opacity={baseOpacity}
              strokeDasharray="5,5"
            />

            {/* Axes labels */}
            <text x="150" y="190" textAnchor="middle" fontSize="10" fill={colors.textMuted} opacity={baseOpacity}>
              X₁ (Sleep)
            </text>
            <text x="15" y="100" textAnchor="middle" fontSize="10" fill={colors.textMuted} transform="rotate(-90 15 100)" opacity={baseOpacity}>
              X₂ (Speed)
            </text>
          </svg>
        );

      case "3d-space":
        return (
          <svg width="300" height="200" viewBox="0 0 300 200">
            <defs>
              <linearGradient id="planeGradient3d" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.accentPrimary} stopOpacity="0.4" />
                <stop offset="100%" stopColor={colors.accentSecondary} stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* 3D cube wireframe */}
            <g opacity={baseOpacity * 0.4} stroke={colors.borderColor} strokeWidth="1" fill="none">
              {/* Back face */}
              <rect x="90" y="60" width="120" height="80" />
              {/* Front face */}
              <rect x="110" y="80" width="120" height="80" />
              {/* Connecting lines */}
              <line x1="90" y1="60" x2="110" y2="80" />
              <line x1="210" y1="60" x2="230" y2="80" />
              <line x1="210" y1="140" x2="230" y2="160" />
              <line x1="90" y1="140" x2="110" y2="160" />
            </g>

            {/* 3D data points */}
            {[
              { x: 100, y: 150, z: 0.3, color: colors.accentSecondary, label: "🐱" },
              { x: 110, y: 145, z: 0.6, color: colors.accentSecondary, label: "🐱" },
              { x: 200, y: 110, z: 0.2, color: colors.accentPrimary, label: "🐕" },
              { x: 210, y: 115, z: 0.8, color: colors.accentPrimary, label: "🐕" },
            ].map((point, i) => {
              const zOffset = point.z * 20;
              return (
                <g key={i} opacity={baseOpacity}>
                  <circle
                    cx={point.x + zOffset}
                    cy={point.y - zOffset}
                    r={4 + point.z * 2}
                    fill={point.color}
                  />
                  <text
                    x={point.x + zOffset}
                    y={point.y - zOffset + 2}
                    textAnchor="middle"
                    fontSize="6"
                    fill="white"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}

            {/* Separating plane */}
            <polygon
              points="120,80 160,75 180,135 140,140"
              fill="url(#planeGradient3d)"
              stroke={colors.warningRed}
              strokeWidth="1"
              opacity={baseOpacity}
            />

            {/* 3D Axes labels */}
            <text x="150" y="190" textAnchor="middle" fontSize="9" fill={colors.textMuted} opacity={baseOpacity}>
              X₁, X₂, X₃
            </text>
          </svg>
        );

      case "tesseract-hint":
        return (
          <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Tesseract wireframe approximation */}
            <g opacity={baseOpacity * 0.6} stroke={colors.accentPrimary} strokeWidth="1" fill="none">
              {/* Inner cube */}
              <rect x="110" y="70" width="60" height="60" />
              {/* Outer cube */}
              <rect x="130" y="50" width="60" height="60" />
              {/* Connecting lines */}
              <line x1="110" y1="70" x2="130" y2="50" />
              <line x1="170" y1="70" x2="190" y2="50" />
              <line x1="170" y1="130" x2="190" y2="110" />
              <line x1="110" y1="130" x2="130" y2="110" />

              {/* Additional 4D hints */}
              <circle cx="125" cy="85" r="20" strokeDasharray="3,3" opacity="0.5" />
              <circle cx="175" cy="65" r="20" strokeDasharray="3,3" opacity="0.5" />
            </g>

            {/* Abstract data points */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const radius = 40 + (i % 2) * 25;
              const x = 150 + Math.cos(angle) * radius;
              const y = 100 + Math.sin(angle) * radius;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={i % 2 === 0 ? colors.accentSecondary : colors.accentPrimary}
                  opacity={baseOpacity}
                />
              );
            })}

            <text x="150" y="190" textAnchor="middle" fontSize="9" fill={colors.textMuted} opacity={baseOpacity}>
              4D Hyperplane
            </text>
          </svg>
        );

      case "abstract":
        return (
          <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Network-like visualization */}
            <g opacity={baseOpacity}>
              {Array.from({ length: 20 }).map((_, i) => {
                const x = 40 + (i % 5) * 50;
                const y = 40 + Math.floor(i / 5) * 35;
                const connected = Math.random() > 0.4;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="2"
                      fill={connected ? colors.accentPrimary : colors.accentSecondary}
                    />
                    {connected && i < 15 && (
                      <line
                        x1={x}
                        y1={y}
                        x2={x + 50}
                        y2={y + (Math.random() - 0.5) * 25}
                        stroke={colors.borderColor}
                        strokeWidth="0.5"
                        opacity="0.6"
                      />
                    )}
                  </g>
                );
              })}
            </g>

            <text x="150" y="190" textAnchor="middle" fontSize="9" fill={colors.textMuted} opacity={baseOpacity}>
              High-Dimensional Space
            </text>
          </svg>
        );

      case "matrix-rain":
        return (
          <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Matrix-style falling numbers */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g opacity={baseOpacity} filter="url(#glow)">
              {Array.from({ length: 20 }).map((_, col) =>
                Array.from({ length: 10 }).map((_, row) => {
                  const x = col * 15;
                  const y = row * 20;
                  const char = Math.random() > 0.7 ? String(Math.floor(Math.random() * 10)) : '';
                  const opacity = Math.random() * 0.8 + 0.2;

                  return char ? (
                    <text
                      key={`${col}-${row}`}
                      x={x}
                      y={y}
                      fontSize="8"
                      fill={colors.matrixGreen}
                      opacity={opacity}
                      fontFamily="monospace"
                    >
                      {char}
                    </text>
                  ) : null;
                })
              )}
            </g>

            {/* Floating hyperplane symbol */}
            <text x="150" y="120" textAnchor="middle" fontSize="20" fill={colors.warningRed} opacity={baseOpacity}>
              ∥
            </text>

            <text x="150" y="190" textAnchor="middle" fontSize="9" fill={colors.textMuted} opacity={baseOpacity}>
              100+ Dimensions
            </text>
          </svg>
        );

      default:
        return <div>Unknown visualization type</div>;
    }
  };

  if (!mounted) {
    return (
      <div
        style={{
          padding: '2rem',
          borderRadius: '12px',
          margin: '2rem 0',
          height: '500px',
          background: 'transparent',
        }}
      />
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: `linear-gradient(135deg, ${colors.bgGradient1} 0%, ${colors.bgGradient2} 100%)`,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          Scaling to Higher Dimensions
        </h3>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.9rem'
        }}>
          Watch classification complexity grow from simple 2D to impossible-to-visualize 100D
        </p>
      </div>

      {/* Main visualization area */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '280px',
        background: colors.dimensionBg,
        borderRadius: '8px',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Current dimension display */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: isHumanLimit ? colors.humanLimitBg : colors.bgGradient1,
          border: `2px solid ${isHumanLimit ? colors.humanLimitBorder : colors.borderColor}`,
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: isHumanLimit ? colors.humanLimitBorder : colors.textPrimary
        }}>
          {currentFeature.dim}D
          {showHumanLimit && isHumanLimit && (
            <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>👁️</span>
          )}
        </div>

        {/* Human limit indicator */}
        {showHumanLimit && currentFeature.dim > 3 && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: colors.warningRed,
            color: 'white',
            borderRadius: '6px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            Beyond Human Vision 🚫👁️
          </div>
        )}

        {/* Visualization */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {renderVisualization(currentFeature)}

          {/* Feature labels */}
          <div style={{
            textAlign: 'center',
            maxWidth: '250px'
          }}>
            {currentFeature.labels.map((label, index) => (
              <div
                key={index}
                style={{
                  fontSize: '0.85rem',
                  color: colors.textSecondary,
                  marginBottom: '0.25rem'
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Dimension stepper */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeatureIndex(index)}
            style={{
              padding: '0.5rem 1rem',
              background: index === currentFeatureIndex ? colors.accentPrimary : colors.bgGradient1,
              color: index === currentFeatureIndex ? 'white' : colors.textPrimary,
              border: `1px solid ${colors.borderColor}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {feature.dim}D
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={resetVisualization}
          style={{
            padding: '0.75rem 1.5rem',
            background: colors.bgGradient1,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          🔄 Reset to 2D
        </button>
      </div>

      {/* Footer explanation */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: colors.bgGradient1,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{
          color: colors.textMuted,
          fontSize: '0.8rem',
          lineHeight: '1.4',
          margin: '0'
        }}>
          {isHumanLimit ? (
            "👁️ Humans can visualize up to 3D. The perceptron doesn't care about dimensions!"
          ) : (
            "🤖 The perceptron algorithm works identically whether you have 2 features or 2,000!"
          )}
        </p>
      </div>
    </div>
  );
};

export default DimensionScalingViz;