"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface DimensionScalingFinalProps {
  config?: {
    examples?: Array<{
      dims: number | string;
      use_case: string;
    }>;
    emphasize?: string;
  };
}

const DimensionScalingFinal: React.FC<DimensionScalingFinalProps> = ({
  config = {
    examples: [
      { dims: 2, use_case: "Cats vs dogs (weight, vocalization freq)" },
      { dims: 3, use_case: "Add bark frequency" },
      { dims: 784, use_case: "Handwritten digits (28×28 pixels)" },
      { dims: 50000, use_case: "Text classification (word vectors)" },
      { dims: "∞", use_case: "The math doesn't care!" }
    ],
    emphasize: "Same algorithm, just more loops"
  }
}) => {
  const { examples = [], emphasize } = config;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  const colors = React.useMemo(() => {
    if (!mounted) {
      return {
        background: "#ffffff",
        surface: "#f8fafc",
        border: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        accent: "#6366f1",
        accentLight: "#818cf8",
        success: "#10b981",
        warning: "#f59e0b",
        info: "#3b82f6"
      };
    }

    const isDark = resolvedTheme === "dark";
    return isDark
      ? {
          background: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          textPrimary: "#e2e8f0",
          textSecondary: "#94a3b8",
          accent: "#818cf8",
          accentLight: "#a5b4fc",
          success: "#34d399",
          warning: "#fbbf24",
          info: "#60a5fa"
        }
      : {
          background: "#ffffff",
          surface: "#f8fafc",
          border: "#e2e8f0",
          textPrimary: "#0f172a",
          textSecondary: "#475569",
          accent: "#6366f1",
          accentLight: "#818cf8",
          success: "#10b981",
          warning: "#f59e0b",
          info: "#3b82f6"
        };
  }, [mounted, resolvedTheme]);

  if (!mounted) {
    return (
      <div
        style={{
          padding: "2rem",
          borderRadius: "16px",
          margin: "2rem 0",
          height: "400px",
          background: "transparent"
        }}
      />
    );
  }

  const getColorForDimension = (dims: number | string, index: number) => {
    if (dims === "∞") return colors.warning;
    const dimNum = Number(dims);
    if (dimNum <= 3) return colors.success;
    if (dimNum <= 1000) return colors.info;
    return colors.accent;
  };

  const getScaleForDimension = (dims: number | string) => {
    if (dims === "∞") return 1;
    const dimNum = Number(dims);
    // Logarithmic scale for visual representation
    return Math.min(Math.log10(dimNum + 1) / 5, 1);
  };

  const formatDimension = (dims: number | string) => {
    if (dims === "∞") return "∞";
    const dimNum = Number(dims);
    if (dimNum >= 10000) return `${(dimNum / 1000).toFixed(0)}K`;
    if (dimNum >= 1000) return dimNum.toLocaleString();
    return dimNum.toString();
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: "16px",
        margin: "2rem 0",
        transition: "all 0.3s ease"
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: "0.5rem",
            textAlign: "center"
          }}
        >
          The Perceptron Scales Effortlessly
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: colors.textSecondary,
            textAlign: "center",
            margin: 0
          }}
        >
          From 2D toy problems to million-dimensional real applications
        </p>
      </div>

      {/* Dimension Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}
      >
        {examples.map((example, index) => {
          const color = getColorForDimension(example.dims, index);
          const scale = getScaleForDimension(example.dims);
          const isHovered = hoveredIndex === index;
          const isInfinity = example.dims === "∞";

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                background: colors.surface,
                border: `1px solid ${isHovered ? color : colors.border}`,
                borderRadius: "12px",
                padding: "1.25rem 1rem",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHovered
                  ? `0 8px 16px ${color}15, 0 0 0 1px ${color}30`
                  : "none",
                cursor: "default",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Dimension visual representation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "1rem",
                  height: "80px",
                  position: "relative"
                }}
              >
                {/* Base circle */}
                <div
                  style={{
                    width: `${40 + scale * 40}px`,
                    height: `${40 + scale * 40}px`,
                    borderRadius: "50%",
                    background: `${color}20`,
                    border: `2px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "all 0.3s ease"
                  }}
                >
                  {/* Inner circles for depth effect */}
                  {!isInfinity && scale > 0.3 && (
                    <div
                      style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        borderRadius: "50%",
                        background: `${color}15`,
                        border: `1px solid ${color}40`
                      }}
                    />
                  )}
                  {!isInfinity && scale > 0.6 && (
                    <div
                      style={{
                        position: "absolute",
                        width: "40%",
                        height: "40%",
                        borderRadius: "50%",
                        background: `${color}10`,
                        border: `1px solid ${color}30`
                      }}
                    />
                  )}

                  {/* Dimension number */}
                  <span
                    style={{
                      fontSize: isInfinity ? "1.8rem" : "1.2rem",
                      fontWeight: 700,
                      color: color,
                      zIndex: 1
                    }}
                  >
                    {formatDimension(example.dims)}
                  </span>
                </div>

                {/* Radial lines for high dimensions */}
                {(scale > 0.5 || isInfinity) && (
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isHovered ? 0.8 : 0.3,
                      transition: "opacity 0.3s ease"
                    }}
                  >
                    {[...Array(isInfinity ? 12 : Math.min(8, Math.floor(scale * 10)))].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          width: "1px",
                          height: `${20 + scale * 30}px`,
                          background: `linear-gradient(to bottom, transparent, ${color}40, transparent)`,
                          transform: `rotate(${i * (360 / (isInfinity ? 12 : Math.min(8, Math.floor(scale * 10))))}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Dimension label */}
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: color,
                  textAlign: "center",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                {example.dims === "∞" ? "Infinite" : `${formatDimension(example.dims)}D`}
              </div>

              {/* Use case */}
              <div
                style={{
                  fontSize: "0.8rem",
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 1.4
                }}
              >
                {example.use_case}
              </div>
            </div>
          );
        })}
      </div>

      {/* Algorithm visualization */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem"
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            fontFamily: "monospace",
            color: colors.textPrimary,
            lineHeight: 1.8,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div>
            <div>
              <span style={{ color: colors.textSecondary }}>{"def "}</span>
              <span style={{ color: colors.accent }}>perceptron</span>
              <span style={{ color: colors.textSecondary }}>(inputs, weights, bias):</span>
            </div>
            <div style={{ paddingLeft: "2rem" }}>
              <span style={{ color: colors.textSecondary }}>{"# Works for "}</span>
              <span style={{ color: colors.warning, fontWeight: 600 }}>ANY</span>
              <span style={{ color: colors.textSecondary }}>{" number of dimensions"}</span>
            </div>
            <div style={{ paddingLeft: "2rem" }}>
              <span>activation = </span>
              <span style={{ color: colors.info }}>sum</span>
              <span>(w * x </span>
              <span style={{ color: colors.accent }}>for</span>
              <span> w, x </span>
              <span style={{ color: colors.accent }}>in</span>
              <span> zip(weights, inputs)) + bias</span>
            </div>
            <div style={{ paddingLeft: "2rem" }}>
              <span style={{ color: colors.accent }}>return</span>
              <span> </span>
              <span style={{ color: colors.success }}>1</span>
              <span> </span>
              <span style={{ color: colors.accent }}>if</span>
              <span> activation {">"} </span>
              <span style={{ color: colors.success }}>0</span>
              <span> </span>
              <span style={{ color: colors.accent }}>else</span>
              <span> </span>
              <span style={{ color: colors.success }}>0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emphasis message */}
      {emphasize && (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            background: `${colors.accent}10`,
            border: `1px solid ${colors.accent}30`,
            borderRadius: "8px",
            marginTop: "1rem"
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              color: colors.accent,
              fontWeight: 600
            }}
          >
            💡 {emphasize}
          </span>
        </div>
      )}
    </div>
  );
};

export default DimensionScalingFinal;