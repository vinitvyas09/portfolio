"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';

interface TrainingMetrics {
  epoch: number;
  trainError: number;
  testError: number;
  trainAccuracy: number;
  testAccuracy: number;
}

interface DataPoint {
  x: number;
  y: number;
  label: 'A' | 'B';
  isTest?: boolean;
}

interface EpochGoldilocksZoneProps {
  config?: {
    showThreeScenarios?: boolean;
    scenarios?: Array<{
      name: string;
      epochs: number;
      analogy: string;
      trainError: string;
      testError: string;
    }>;
    animateComparison?: boolean;
  };
}

const EpochGoldilocksZone: React.FC<EpochGoldilocksZoneProps> = ({
  config = {
    showThreeScenarios: true,
    scenarios: [
      {
        name: "Too Few (Underfitting)",
        epochs: 1,
        analogy: "Reading a textbook once before the exam",
        trainError: "High",
        testError: "High"
      },
      {
        name: "Just Right",
        epochs: 10,
        analogy: "Understanding the concepts",
        trainError: "Low",
        testError: "Low"
      },
      {
        name: "Too Many (Overfitting)",
        epochs: 100,
        analogy: "Memorizing page numbers instead of learning",
        trainError: "Near zero",
        testError: "High"
      }
    ],
    animateComparison: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Animation states
  const [isRunning, setIsRunning] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [scenario1Metrics, setScenario1Metrics] = useState<TrainingMetrics[]>([]);
  const [scenario2Metrics, setScenario2Metrics] = useState<TrainingMetrics[]>([]);
  const [scenario3Metrics, setScenario3Metrics] = useState<TrainingMetrics[]>([]);

  // Refs for cleanup
  const animationRef = useRef<NodeJS.Timeout[]>([]);

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
        underfitColor: "#f59e0b",
        optimalColor: "#10b981",
        overfitColor: "#ef4444"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#404040",
      grid: "#262626",
      trainLine: "#60a5fa",
      testLine: "#f87171",
      underfitColor: "#fbbf24",
      optimalColor: "#34d399",
      overfitColor: "#f87171"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9",
      trainLine: "#3b82f6",
      testLine: "#ef4444",
      underfitColor: "#f59e0b",
      optimalColor: "#10b981",
      overfitColor: "#ef4444"
    };
  }, [isDark, mounted]);

  // Generate synthetic training and test data
  const { trainData, testData } = useMemo(() => {
    const generateData = (count: number, noise: number = 0.1) => {
      const points: DataPoint[] = [];

      // Create two slightly overlapping clusters with noise
      for (let i = 0; i < count / 2; i++) {
        // Class A - centered at (0.3, 0.3)
        points.push({
          x: 0.3 + (Math.random() - 0.5) * 0.4 + (Math.random() - 0.5) * noise,
          y: 0.3 + (Math.random() - 0.5) * 0.4 + (Math.random() - 0.5) * noise,
          label: 'A'
        });

        // Class B - centered at (0.7, 0.7)
        points.push({
          x: 0.7 + (Math.random() - 0.5) * 0.4 + (Math.random() - 0.5) * noise,
          y: 0.7 + (Math.random() - 0.5) * 0.4 + (Math.random() - 0.5) * noise,
          label: 'B'
        });
      }

      return points;
    };

    return {
      trainData: generateData(20, 0.15),
      testData: generateData(20, 0.2).map(p => ({ ...p, isTest: true }))
    };
  }, []);

  // Simulate training for different epoch counts
  const simulateTraining = (maxEpochs: number): TrainingMetrics[] => {
    const metrics: TrainingMetrics[] = [];

    for (let epoch = 0; epoch <= maxEpochs; epoch++) {
      // Simulate error rates
      // Training error decreases with epochs
      const trainError = Math.max(0, 40 * Math.exp(-epoch / 5) + (Math.random() - 0.5) * 2);

      // Test error decreases initially, then increases for overfitting
      let testError;
      if (epoch < 10) {
        // Learning phase - test error decreases
        testError = Math.max(5, 40 * Math.exp(-epoch / 7) + (Math.random() - 0.5) * 3);
      } else {
        // Overfitting phase - test error increases
        const overfittingFactor = (epoch - 10) / 50;
        testError = Math.min(40, 5 + overfittingFactor * 30 + (Math.random() - 0.5) * 3);
      }

      metrics.push({
        epoch,
        trainError,
        testError,
        trainAccuracy: 100 - trainError,
        testAccuracy: 100 - testError
      });
    }

    return metrics;
  };

  // Run animation
  const runAnimation = () => {
    if (isRunning) return;

    setIsRunning(true);
    setCurrentEpoch(0);
    setScenario1Metrics([]);
    setScenario2Metrics([]);
    setScenario3Metrics([]);

    // Generate full metrics for all scenarios
    const metrics1 = simulateTraining(1);
    const metrics2 = simulateTraining(10);
    const metrics3 = simulateTraining(100);

    let epoch = 0;
    const maxEpoch = 100;

    const animate = () => {
      if (epoch <= maxEpoch) {
        setCurrentEpoch(epoch);

        // Update metrics for each scenario
        if (epoch <= 1) {
          setScenario1Metrics(metrics1.slice(0, epoch + 1));
        }
        if (epoch <= 10) {
          setScenario2Metrics(metrics2.slice(0, epoch + 1));
        }
        if (epoch <= 100) {
          setScenario3Metrics(metrics3.slice(0, epoch + 1));
        }

        epoch++;
        const timeoutId = setTimeout(animate, 50);
        animationRef.current.push(timeoutId);
      } else {
        setIsRunning(false);
      }
    };

    const startTimeout = setTimeout(animate, 500);
    animationRef.current.push(startTimeout);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      animationRef.current.forEach(clearTimeout);
    };
  }, []);

  // Chart dimensions - wider for vertical layout
  const chartWidth = 400;
  const chartHeight = 150;
  const padding = 25;

  // Scale functions
  const scaleX = (epoch: number, maxEpoch: number) =>
    padding + (epoch / maxEpoch) * (chartWidth - 2 * padding);
  const scaleY = (error: number) =>
    padding + (error / 40) * (chartHeight - 2 * padding);

  // Render error curve chart
  const renderChart = (
    metrics: TrainingMetrics[],
    maxEpochs: number,
    title: string,
    statusColor: string,
    status: string
  ) => {
    const lastMetric = metrics[metrics.length - 1];

    return (
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem'
      }}>
        <div style={{ flex: '1' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '0.1rem',
            textAlign: 'left'
          }}>
            {title}
          </div>

          <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ display: 'block', background: colors.bg, borderRadius: '8px' }}
        >
          {/* Grid lines */}
          {[0, maxEpochs / 2, maxEpochs].map(epoch => (
            <line
              key={`vgrid-${epoch}`}
              x1={scaleX(epoch, maxEpochs)}
              y1={padding}
              x2={scaleX(epoch, maxEpochs)}
              y2={chartHeight - padding}
              stroke={colors.grid}
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {[0, 20, 40].map(error => (
            <line
              key={`hgrid-${error}`}
              x1={padding}
              y1={scaleY(error)}
              x2={chartWidth - padding}
              y2={scaleY(error)}
              stroke={colors.grid}
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Chart border */}
          <rect
            x={padding}
            y={padding}
            width={chartWidth - 2 * padding}
            height={chartHeight - 2 * padding}
            fill="none"
            stroke={colors.border}
            strokeWidth="1"
          />

          {/* Training error line */}
          {metrics.length > 1 && (
            <polyline
              points={metrics.map((m, i) =>
                `${scaleX(m.epoch, maxEpochs)},${scaleY(m.trainError)}`
              ).join(' ')}
              fill="none"
              stroke={colors.trainLine}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Test error line */}
          {metrics.length > 1 && (
            <polyline
              points={metrics.map((m, i) =>
                `${scaleX(m.epoch, maxEpochs)},${scaleY(m.testError)}`
              ).join(' ')}
              fill="none"
              stroke={colors.testLine}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Current point indicators */}
          {lastMetric && (
            <>
              <circle
                cx={scaleX(lastMetric.epoch, maxEpochs)}
                cy={scaleY(lastMetric.trainError)}
                r="3"
                fill={colors.trainLine}
              />
              <circle
                cx={scaleX(lastMetric.epoch, maxEpochs)}
                cy={scaleY(lastMetric.testError)}
                r="3"
                fill={colors.testLine}
              />
            </>
          )}

          {/* Axis labels */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            fontSize="10"
            fill={colors.textSecondary}
          >
            Epochs
          </text>

          <text
            x={10}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="10"
            fill={colors.textSecondary}
            transform={`rotate(-90, 10, ${chartHeight / 2})`}
          >
            Error %
          </text>
        </svg>
        </div>

        {/* Status box - now on the right */}
        <div style={{
          width: '160px',
          padding: '0.4rem',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '6px',
          borderLeft: `3px solid ${statusColor}`,
          alignSelf: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: statusColor,
            marginBottom: '0.15rem'
          }}>
            {status}
          </div>
          {lastMetric && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.25rem',
              fontSize: '10px',
              color: colors.textSecondary
            }}>
              <div>
                <span style={{ color: colors.trainLine }}>Train: </span>
                {lastMetric.trainError.toFixed(1)}%
              </div>
              <div>
                <span style={{ color: colors.testLine }}>Test: </span>
                {lastMetric.testError.toFixed(1)}%
              </div>
            </div>
          )}
          <div style={{
            fontSize: '9px',
            color: colors.textSecondary,
            marginTop: '0.15rem',
            fontStyle: 'italic'
          }}>
            {config.scenarios?.[
              title.includes('Too Few') ? 0 :
              title.includes('Just Right') ? 1 : 2
            ]?.analogy}
          </div>
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
      padding: '1rem',
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
        fontSize: '16px',
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: '0.75rem'
      }}>
        🎯 Finding the Training Sweet Spot
      </div>

      {/* Three scenarios - stacked vertically */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginBottom: '0.5rem'
      }}>
        {renderChart(
          scenario1Metrics,
          1,
          "Too Few (1 epoch)",
          colors.underfitColor,
          "Underfitting"
        )}

        {renderChart(
          scenario2Metrics,
          10,
          "Just Right (10 epochs)",
          colors.optimalColor,
          "Optimal"
        )}

        {renderChart(
          scenario3Metrics,
          100,
          "Too Many (100 epochs)",
          colors.overfitColor,
          "Overfitting"
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '0.5rem',
        padding: '0.5rem',
        background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '2px',
            background: colors.trainLine
          }} />
          <span style={{ fontSize: '12px', color: colors.text }}>Training Error</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '2px',
            background: colors.testLine
          }} />
          <span style={{ fontSize: '12px', color: colors.text }}>Test Error</span>
        </div>
      </div>

      {/* Progress indicator */}
      {isRunning && (
        <div style={{
          marginBottom: '0.5rem',
          padding: '0.4rem',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            Training Epoch: {currentEpoch} / 100
          </div>
          <div style={{
            marginTop: '0.5rem',
            height: '4px',
            background: colors.grid,
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentEpoch / 100) * 100}%`,
              height: '100%',
              background: colors.optimalColor,
              transition: 'width 0.1s ease'
            }} />
          </div>
        </div>
      )}

      {/* Control button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            if (isRunning) {
              animationRef.current.forEach(clearTimeout);
              animationRef.current = [];
              setIsRunning(false);
            } else {
              runAnimation();
            }
          }}
          style={{
            padding: '0.75rem 2rem',
            background: isRunning ? colors.overfitColor : colors.optimalColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏸ Stop' : '▶️ Run Training'}
        </button>
      </div>

      {/* Key insight */}
      <div style={{
        marginTop: '0.75rem',
        padding: '0.75rem',
        background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
        border: `1px solid ${colors.optimalColor}`,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: colors.optimalColor,
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>💡</span> The Goldilocks Principle
        </div>
        <div style={{
          fontSize: '11px',
          color: colors.text,
          lineHeight: '1.6'
        }}>
          <strong>Too few epochs:</strong> Model hasn&apos;t learned the patterns (both errors high)<br/>
          <strong>Just right:</strong> Model generalizes well (both errors low)<br/>
          <strong>Too many epochs:</strong> Model memorizes training data (train error → 0, test error ↑)
        </div>
      </div>
    </div>
  );
};

export default EpochGoldilocksZone;