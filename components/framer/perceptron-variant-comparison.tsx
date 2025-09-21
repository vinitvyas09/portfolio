"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface PerceptronVariantComparisonProps {
  config?: {
    dataset?: string;
    variants?: string[];
    metrics?: string[];
    showConvergence?: boolean;
  };
}

const PerceptronVariantComparison: React.FC<PerceptronVariantComparisonProps> = ({
  config = {
    dataset: "noisy_linear",
    variants: ["vanilla", "voted", "averaged"],
    metrics: ["training_error", "test_error", "storage_cost"],
    showConvergence: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        bgSecondary: "#f8fafc",
        vanilla: "#3b82f6",
        voted: "#10b981",
        averaged: "#f59e0b",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        borderColor: "#e2e8f0",
        gridColor: "#f1f5f9"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      vanilla: "#60a5fa",
      voted: "#34d399",
      averaged: "#fbbf24",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      borderColor: "#404040",
      gridColor: "#262626"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8fafc",
      vanilla: "#3b82f6",
      voted: "#10b981",
      averaged: "#f59e0b",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      borderColor: "#e2e8f0",
      gridColor: "#f1f5f9"
    };
  }, [isDark, mounted]);

  // Animation for bars
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, [mounted]);

  // Performance data (simulated but realistic)
  const performanceData = useMemo(() => {
    const progress = animationStep / 100;

    return {
      vanilla: {
        trainingError: Math.max(0, 0.15 - progress * 0.12),
        testError: Math.max(0.05, 0.25 - progress * 0.15),
        storageScale: 1,
        convergenceEpochs: 20
      },
      voted: {
        trainingError: Math.max(0, 0.12 - progress * 0.10),
        testError: Math.max(0.03, 0.20 - progress * 0.15),
        storageScale: animationStep < 50 ? animationStep / 5 : 10,
        convergenceEpochs: 15
      },
      averaged: {
        trainingError: Math.max(0, 0.13 - progress * 0.11),
        testError: Math.max(0.04, 0.22 - progress * 0.16),
        storageScale: 1.2,
        convergenceEpochs: 17
      }
    };
  }, [animationStep]);

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

  const variantColors = {
    vanilla: colors.vanilla,
    voted: colors.voted,
    averaged: colors.averaged
  };

  const variantLabels = {
    vanilla: 'Vanilla',
    voted: 'Voted',
    averaged: 'Averaged'
  };

  return (
    <div style={{
      padding: '2rem',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Title */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          Perceptron Variants Performance Comparison
        </h3>
        <p style={{
          fontSize: '14px',
          color: colors.textSecondary
        }}>
          Training on noisy linearly separable data
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '0.5rem' : '2rem',
        marginBottom: '2rem',
        paddingLeft: isMobile ? '1rem' : 0
      }}>
        {config.variants?.map(variant => (
          <div key={variant} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: variantColors[variant as keyof typeof variantColors]
            }} />
            <span style={{
              fontSize: '13px',
              color: colors.textPrimary,
              fontWeight: '500'
            }}>
              {variantLabels[variant as keyof typeof variantLabels]}
            </span>
          </div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? '0.5rem' : '2rem',
        marginBottom: '2rem'
      }}>
        {/* Training Error */}
        <div style={{
          padding: isMobile ? '0.5rem' : '1rem',
          background: colors.bg,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1
          }}>
            Training Error
          </h4>
          <div style={{ height: '120px', position: 'relative' }}>
            {config.variants?.map((variant, idx) => {
              const data = performanceData[variant as keyof typeof performanceData];
              const barHeight = (1 - data.trainingError) * 100;

              return (
                <div
                  key={variant}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${idx * (isMobile ? 32 : 33)}%`,
                    width: isMobile ? '22%' : '25%',
                    height: `${barHeight}%`,
                    background: variantColors[variant as keyof typeof variantColors],
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    opacity: 0.8
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '-18px' : '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: isMobile ? '9px' : '11px',
                    color: colors.textPrimary,
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {isMobile ? Math.round(data.trainingError * 100) : (data.trainingError * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: colors.borderColor
            }} />
          </div>
        </div>

        {/* Test Error */}
        <div style={{
          padding: isMobile ? '0.5rem' : '1rem',
          background: colors.bg,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1
          }}>
            Test Error
          </h4>
          <div style={{ height: '120px', position: 'relative', verticalAlign: 'bottom' }}>
            {config.variants?.map((variant, idx) => {
              const data = performanceData[variant as keyof typeof performanceData];
              const barHeight = (1 - data.testError) * 100;

              return (
                <div
                  key={variant}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${idx * (isMobile ? 32 : 33)}%`,
                    width: isMobile ? '22%' : '25%',
                    height: `${barHeight}%`,
                    background: variantColors[variant as keyof typeof variantColors],
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    opacity: 0.8
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '-18px' : '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: isMobile ? '9px' : '11px',
                    color: colors.textPrimary,
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {isMobile ? Math.round(data.testError * 100) : (data.testError * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: colors.borderColor
            }} />
          </div>
        </div>

        {/* Storage Cost */}
        <div style={{
          padding: isMobile ? '0.5rem' : '1rem',
          background: colors.bg,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1
          }}>
            Storage Cost
          </h4>
          <div style={{ height: '120px', position: 'relative' }}>
            {config.variants?.map((variant, idx) => {
              const data = performanceData[variant as keyof typeof performanceData];
              const maxStorage = 10;
              const barHeight = (data.storageScale / maxStorage) * 100;

              return (
                <div
                  key={variant}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${idx * (isMobile ? 32 : 33)}%`,
                    width: isMobile ? '22%' : '25%',
                    height: `${barHeight}%`,
                    background: variantColors[variant as keyof typeof variantColors],
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    opacity: 0.8
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '-18px' : '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: isMobile ? '9px' : '11px',
                    color: colors.textPrimary,
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {isMobile ? Math.round(data.storageScale) : data.storageScale.toFixed(1)}×
                  </div>
                </div>
              );
            })}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: colors.borderColor
            }} />
          </div>
        </div>
      </div>

      {/* Convergence Visualization */}
      {config.showConvergence && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: colors.bg,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '1rem'
          }}>
            Convergence Over Epochs
          </h4>
          <svg
            width="100%"
            height="200"
            viewBox="0 0 400 200"
            style={{ maxWidth: '100%', display: 'block' }}
          >
            {/* Grid lines */}
            {[0, 50, 100, 150].map(y => (
              <line
                key={y}
                x1="40"
                y1={y + 20}
                x2="380"
                y2={y + 20}
                stroke={colors.gridColor}
                strokeWidth="1"
                opacity="0.3"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((val, idx) => (
              <text
                key={val}
                x="30"
                y={170 - idx * 37.5 + 5}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="end"
              >
                {val}%
              </text>
            ))}

            {/* X-axis labels */}
            {[0, 10, 20, 30].map(epoch => (
              <text
                key={epoch}
                x={40 + epoch * 11.3}
                y="190"
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {epoch}
              </text>
            ))}

            {/* Convergence curves */}
            {config.variants?.map(variant => {
              const data = performanceData[variant as keyof typeof performanceData];
              const epochs = 30;
              const points: string[] = [];

              for (let i = 0; i <= Math.min(animationStep, epochs); i++) {
                const x = 40 + (i / epochs) * 340;
                const progress = i / data.convergenceEpochs;
                const error = Math.max(0, 100 - progress * 100);
                const y = 20 + (error / 100) * 150;
                points.push(`${x},${y}`);
              }

              return (
                <polyline
                  key={variant}
                  points={points.join(' ')}
                  stroke={variantColors[variant as keyof typeof variantColors]}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              );
            })}

            {/* Axis labels */}
            <text
              x="200"
              y="200"
              fontSize="11"
              fill={colors.textPrimary}
              textAnchor="middle"
            >
              Epochs
            </text>
            <text
              x="15"
              y="95"
              fontSize="11"
              fill={colors.textPrimary}
              textAnchor="middle"
              transform="rotate(-90, 15, 95)"
            >
              Error Rate
            </text>
          </svg>
        </div>
      )}

      {/* Summary */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: colors.bgSecondary,
        borderRadius: '8px',
        border: `1px solid ${colors.borderColor}`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '0.5rem' : '1rem',
          fontSize: '13px',
          color: colors.textPrimary
        }}>
          <div>
            <div style={{ fontWeight: '600', color: colors.vanilla }}>Vanilla</div>
            <div style={{ color: colors.textSecondary, marginTop: '0.25rem', fontSize: '12px' }}>
              Fast, simple, sensitive to order
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: colors.voted }}>Voted</div>
            <div style={{ color: colors.textSecondary, marginTop: '0.25rem', fontSize: '12px' }}>
              Best accuracy, high storage
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: colors.averaged }}>Averaged</div>
            <div style={{ color: colors.textSecondary, marginTop: '0.25rem', fontSize: '12px' }}>
              Good balance, practical choice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerceptronVariantComparison;