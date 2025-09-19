"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  x: number;
  y: number;
  label: 'cat' | 'dog';
  id: string;
}

interface PerceptronLineConnectionProps {
  config?: {
    mode?: 'split-screen' | 'unified';
    leftPanel?: 'geometric' | 'algebraic';
    rightPanel?: 'geometric' | 'algebraic';
    syncPanels?: boolean;
    showLearningSteps?: boolean;
    dataset?: string;
    animationSpeed?: number;
    showEquation?: boolean;
  };
}

const PerceptronLineConnection: React.FC<PerceptronLineConnectionProps> = ({
  config = {
    mode: 'split-screen',
    leftPanel: 'geometric',
    rightPanel: 'algebraic',
    syncPanels: true,
    showLearningSteps: true,
    dataset: 'cats_vs_dogs',
    animationSpeed: 500,
    showEquation: true
  }
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [weights, setWeights] = useState({ a: 0.5, b: -0.3, c: 2 });
  const [targetWeights] = useState({ a: 1.2, b: -0.8, c: -3.5 });
  const [history, setHistory] = useState<Array<{ a: number; b: number; c: number; error: number }>>([]);

  // Animation timing
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        catColor: "#e11d48",
        dogColor: "#3b82f6",
        lineColor: "#059669",
        weightA: "#8b5cf6",
        weightB: "#f59e0b",
        weightC: "#ec4899",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        borderColor: "#e2e8f0",
        gridColor: "#f1f5f9",
        panelBg: "rgba(255, 255, 255, 0.98)",
        highlightBg: "rgba(59, 130, 246, 0.1)"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      catColor: "#f43f5e",
      dogColor: "#60a5fa",
      lineColor: "#34d399",
      weightA: "#a78bfa",
      weightB: "#fbbf24",
      weightC: "#f472b6",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      borderColor: "#404040",
      gridColor: "#262626",
      panelBg: "rgba(10, 10, 10, 0.98)",
      highlightBg: "rgba(96, 165, 250, 0.15)"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      catColor: "#e11d48",
      dogColor: "#3b82f6",
      lineColor: "#059669",
      weightA: "#8b5cf6",
      weightB: "#f59e0b",
      weightC: "#ec4899",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      borderColor: "#e2e8f0",
      gridColor: "#f1f5f9",
      panelBg: "rgba(255, 255, 255, 0.98)",
      highlightBg: "rgba(59, 130, 246, 0.1)"
    };
  }, [isDark, mounted]);

  // Generate sample data points
  const dataPoints = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const seed = 42;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    // Generate cats (upper region)
    for (let i = 0; i < 15; i++) {
      points.push({
        x: 10 + seededRandom(i * 2) * 8,
        y: 15 + seededRandom(i * 2 + 1) * 10,
        label: 'cat',
        id: `cat-${i}`
      });
    }

    // Generate dogs (lower region)
    for (let i = 0; i < 15; i++) {
      points.push({
        x: 8 + seededRandom(i * 2 + 100) * 10,
        y: 5 + seededRandom(i * 2 + 101) * 8,
        label: 'dog',
        id: `dog-${i}`
      });
    }

    return points;
  }, []);

  // Start/stop training
  const toggleTraining = useCallback(() => {
    if (isTraining) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setIsTraining(false);
    } else {
      setIsTraining(true);
      setTrainingStep(0);
      setHistory([]);
      setWeights({ a: 0.5, b: -0.3, c: 2 });

      // Simulate training steps
      let step = 0;
      const maxSteps = 20;

      const runStep = () => {
        if (step >= maxSteps) {
          setIsTraining(false);
          return;
        }

        // Gradually move weights toward target
        setWeights(prev => {
          const progress = (step + 1) / maxSteps;
          const newWeights = {
            a: prev.a + (targetWeights.a - prev.a) * 0.15,
            b: prev.b + (targetWeights.b - prev.b) * 0.15,
            c: prev.c + (targetWeights.c - prev.c) * 0.15
          };

          // Calculate error (simulated)
          const error = Math.max(0, Math.floor((maxSteps - step) * 2));

          setHistory(h => [...h, { ...newWeights, error }]);
          setTrainingStep(step + 1);

          return newWeights;
        });

        step++;
        animationTimeoutRef.current = setTimeout(runStep, config.animationSpeed);
      };

      animationTimeoutRef.current = setTimeout(runStep, 500);
    }
  }, [isTraining, config.animationSpeed, targetWeights]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Calculate line position for given weights
  const getLinePoints = (w: { a: number; b: number; c: number }) => {
    const xMin = 6, xMax = 20, yMin = 0, yMax = 30;

    // Calculate y for x boundaries: y = -(ax + c) / b
    const y1 = -(w.a * xMin + w.c) / w.b;
    const y2 = -(w.a * xMax + w.c) / w.b;

    return {
      x1: xMin,
      y1: Math.max(yMin, Math.min(yMax, y1)),
      x2: xMax,
      y2: Math.max(yMin, Math.min(yMax, y2))
    };
  };

  // Geometric panel rendering
  const renderGeometricPanel = () => {
    const svgWidth = 300;
    const svgHeight = 280;
    const padding = 30;
    const innerWidth = svgWidth - 2 * padding;
    const innerHeight = svgHeight - 2 * padding;

    const xMin = 6, xMax = 20, yMin = 0, yMax = 30;
    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * innerWidth;
    const scaleY = (y: number) => svgHeight - padding - ((y - yMin) / (yMax - yMin)) * innerHeight;

    const linePoints = getLinePoints(weights);

    return (
      <div style={{
        flex: 1,
        padding: '1rem',
        background: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.borderColor}`
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '0.75rem'
        }}>
          📐 Geometric View
        </h3>

        <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: '100%' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.lineColor} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 5, 10, 15, 20, 25, 30].map(y => (
            <line
              key={`hgrid-${y}`}
              x1={padding}
              y1={scaleY(y)}
              x2={svgWidth - padding}
              y2={scaleY(y)}
              stroke={colors.gridColor}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {[6, 10, 14, 18].map(x => (
            <line
              key={`vgrid-${x}`}
              x1={scaleX(x)}
              y1={padding}
              x2={scaleX(x)}
              y2={svgHeight - padding}
              stroke={colors.gridColor}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Data points */}
          {dataPoints.map(point => (
            <circle
              key={point.id}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r="4"
              fill={point.label === 'cat' ? colors.catColor : colors.dogColor}
              opacity="0.6"
            />
          ))}

          {/* Decision boundary line */}
          <motion.line
            x1={scaleX(linePoints.x1)}
            y1={scaleY(linePoints.y1)}
            x2={scaleX(linePoints.x2)}
            y2={scaleY(linePoints.y2)}
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{
              x1: scaleX(linePoints.x1),
              y1: scaleY(linePoints.y1),
              x2: scaleX(linePoints.x2),
              y2: scaleY(linePoints.y2)
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Axis labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
          >
            Sleep Hours
          </text>

          <text
            x={10}
            y={svgHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
            transform={`rotate(-90, 10, ${svgHeight / 2})`}
          >
            Speed (mph)
          </text>
        </svg>

        {config.showEquation && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            background: colors.highlightBg,
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            textAlign: 'center',
            color: colors.textPrimary
          }}>
            {weights.a.toFixed(2)}x + {weights.b.toFixed(2)}y + {weights.c.toFixed(2)} = 0
          </div>
        )}
      </div>
    );
  };

  // Algebraic panel rendering
  const renderAlgebraicPanel = () => {
    const maxValue = 2;
    const getBarWidth = (value: number) => Math.abs(value / maxValue) * 100;

    return (
      <div style={{
        flex: 1,
        padding: '1rem',
        background: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.borderColor}`
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '0.75rem'
        }}>
          🔢 Algebraic View
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Weight A */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: colors.weightA, fontWeight: '600', fontSize: '13px' }}>
                A (x coefficient)
              </span>
              <motion.span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: colors.textPrimary,
                  fontWeight: '600'
                }}
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.3 }}
                key={weights.a}
              >
                {weights.a.toFixed(3)}
              </motion.span>
            </div>
            <div style={{
              height: '24px',
              background: colors.gridColor,
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  position: 'absolute',
                  left: weights.a >= 0 ? '50%' : 'auto',
                  right: weights.a < 0 ? '50%' : 'auto',
                  height: '100%',
                  background: colors.weightA,
                  borderRadius: '4px'
                }}
                animate={{ width: `${getBarWidth(weights.a)}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
            <div style={{
              fontSize: '11px',
              color: colors.textSecondary,
              marginTop: '0.25rem'
            }}>
              Controls line's vertical tilt
            </div>
          </div>

          {/* Weight B */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: colors.weightB, fontWeight: '600', fontSize: '13px' }}>
                B (y coefficient)
              </span>
              <motion.span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: colors.textPrimary,
                  fontWeight: '600'
                }}
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.3 }}
                key={weights.b}
              >
                {weights.b.toFixed(3)}
              </motion.span>
            </div>
            <div style={{
              height: '24px',
              background: colors.gridColor,
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  position: 'absolute',
                  left: weights.b >= 0 ? '50%' : 'auto',
                  right: weights.b < 0 ? '50%' : 'auto',
                  height: '100%',
                  background: colors.weightB,
                  borderRadius: '4px'
                }}
                animate={{ width: `${getBarWidth(weights.b)}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
            <div style={{
              fontSize: '11px',
              color: colors.textSecondary,
              marginTop: '0.25rem'
            }}>
              Controls line's horizontal tilt
            </div>
          </div>

          {/* Bias C */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: colors.weightC, fontWeight: '600', fontSize: '13px' }}>
                C (bias)
              </span>
              <motion.span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: colors.textPrimary,
                  fontWeight: '600'
                }}
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.3 }}
                key={weights.c}
              >
                {weights.c.toFixed(3)}
              </motion.span>
            </div>
            <div style={{
              height: '24px',
              background: colors.gridColor,
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  position: 'absolute',
                  left: weights.c >= 0 ? '50%' : 'auto',
                  right: weights.c < 0 ? '50%' : 'auto',
                  height: '100%',
                  background: colors.weightC,
                  borderRadius: '4px'
                }}
                animate={{ width: `${getBarWidth(weights.c * 0.5)}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
            <div style={{
              fontSize: '11px',
              color: colors.textSecondary,
              marginTop: '0.25rem'
            }}>
              Shifts line up/down or left/right
            </div>
          </div>

          {/* Learning info */}
          {config.showLearningSteps && isTraining && (
            <div style={{
              padding: '0.75rem',
              background: colors.highlightBg,
              borderRadius: '4px',
              fontSize: '12px',
              color: colors.textPrimary
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Training Step: {trainingStep}
              </div>
              <div style={{ color: colors.textSecondary }}>
                Error: {history[history.length - 1]?.error || 'Calculating...'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div style={{
        height: '400px',
        background: 'transparent',
        borderRadius: '12px',
        margin: '2rem 0'
      }} />
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: `linear-gradient(135deg, ${colors.bgGradient1} 0%, ${colors.bgGradient2} 100%)`,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          🔗 The Perceptron Connection: Geometry ↔ Algebra
        </h2>
        <p style={{
          fontSize: '13px',
          color: colors.textSecondary
        }}>
          Watch how changing the algebraic parameters (A, B, C) moves the geometric decision boundary
        </p>
      </div>

      {/* Main panels */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {config.mode === 'split-screen' && (
          <>
            {config.leftPanel === 'geometric' ? renderGeometricPanel() : renderAlgebraicPanel()}
            {config.rightPanel === 'algebraic' ? renderAlgebraicPanel() : renderGeometricPanel()}
          </>
        )}
      </div>

      {/* Connection visualization */}
      {config.syncPanels && (
        <div style={{
          padding: '1rem',
          background: colors.panelBg,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`,
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            fontSize: '14px',
            color: colors.textPrimary
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: colors.weightA, fontWeight: '600', marginBottom: '0.25rem' }}>
                A changes
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                ↕ Line rotates vertically
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: colors.weightB, fontWeight: '600', marginBottom: '0.25rem' }}>
                B changes
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                ↔ Line rotates horizontally
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: colors.weightC, fontWeight: '600', marginBottom: '0.25rem' }}>
                C changes
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                ⟷ Line shifts position
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={toggleTraining}
          style={{
            padding: '0.75rem 2rem',
            background: isTraining
              ? colors.catColor
              : `linear-gradient(135deg, ${colors.lineColor}, #10b981)`,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
        >
          {isTraining ? '⏸ Pause Training' : '▶ Start Training'}
        </button>

        <button
          onClick={() => {
            setWeights({ a: 0.5, b: -0.3, c: 2 });
            setHistory([]);
            setTrainingStep(0);
          }}
          disabled={isTraining}
          style={{
            padding: '0.75rem 1.5rem',
            background: isTraining ? colors.borderColor : colors.bgGradient1,
            color: isTraining ? colors.textSecondary : colors.textPrimary,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isTraining ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default PerceptronLineConnection;