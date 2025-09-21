"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface DataPoint {
  x: number;
  y: number;
  label: number; // 1 or -1
}

interface PerceptronVisualizationProps {
  title: string;
  description: string;
  dataset: 'linearly_separable' | 'xor';
  willConverge: boolean;
  onUpdateStats: (epochs: number, updates: number, converged: boolean) => void;
}

const PerceptronVisualization: React.FC<PerceptronVisualizationProps> = ({
  title,
  description,
  dataset,
  willConverge,
  onUpdateStats
}) => {
  const [weights, setWeights] = useState<{ w1: number; w2: number; b: number }>({ w1: 0, w2: 0, b: 0 });
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(0);
  const [updates, setUpdates] = useState(0);
  const [converged, setConverged] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const trainingRef = useRef<boolean>(false);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Generate dataset
  const dataPoints: DataPoint[] = React.useMemo(() => {
    if (dataset === 'linearly_separable') {
      // Create two clearly separated clusters
      return [
        // Cluster 1 (label: 1) - top right
        { x: 0.7, y: 0.7, label: 1 },
        { x: 0.8, y: 0.6, label: 1 },
        { x: 0.6, y: 0.8, label: 1 },
        { x: 0.9, y: 0.7, label: 1 },
        { x: 0.7, y: 0.9, label: 1 },
        { x: 0.8, y: 0.8, label: 1 },
        // Cluster 2 (label: -1) - bottom left
        { x: 0.2, y: 0.2, label: -1 },
        { x: 0.3, y: 0.1, label: -1 },
        { x: 0.1, y: 0.3, label: -1 },
        { x: 0.2, y: 0.3, label: -1 },
        { x: 0.3, y: 0.2, label: -1 },
        { x: 0.1, y: 0.1, label: -1 },
      ];
    } else {
      // XOR pattern - not linearly separable
      return [
        { x: 0.2, y: 0.2, label: 1 },
        { x: 0.3, y: 0.3, label: 1 },
        { x: 0.2, y: 0.3, label: 1 },
        { x: 0.8, y: 0.8, label: 1 },
        { x: 0.7, y: 0.7, label: 1 },
        { x: 0.8, y: 0.7, label: 1 },
        { x: 0.2, y: 0.8, label: -1 },
        { x: 0.3, y: 0.7, label: -1 },
        { x: 0.2, y: 0.7, label: -1 },
        { x: 0.8, y: 0.2, label: -1 },
        { x: 0.7, y: 0.3, label: -1 },
        { x: 0.8, y: 0.3, label: -1 },
      ];
    }
  }, [dataset]);

  // Color scheme
  const colors = React.useMemo(() => {
    return isDark ? {
      bg: '#171717',
      border: '#404040',
      grid: '#262626',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      positive: '#60a5fa',
      negative: '#f87171',
      line: '#fbbf24',
      converged: '#34d399'
    } : {
      bg: '#ffffff',
      border: '#e5e7eb',
      grid: '#f3f4f6',
      text: '#111827',
      textSecondary: '#6b7280',
      positive: '#3b82f6',
      negative: '#ef4444',
      line: '#f59e0b',
      converged: '#10b981'
    };
  }, [isDark]);

  // Convert data coordinates to SVG coordinates
  const size = 200;
  const padding = 20;
  const innerSize = size - 2 * padding;

  const toSVG = (val: number) => padding + val * innerSize;

  // Calculate line endpoints
  const getLinePoints = () => {
    // Handle edge cases to prevent NaN
    if (!weights || (weights.w1 === 0 && weights.w2 === 0)) {
      // Default line if weights are not initialized
      return {
        x1: padding,
        y1: padding,
        x2: size - padding,
        y2: size - padding
      };
    }

    if (Math.abs(weights.w2) < 0.001) {
      // Vertical line
      if (Math.abs(weights.w1) < 0.001) {
        // Both weights near zero, return diagonal
        return {
          x1: padding,
          y1: padding,
          x2: size - padding,
          y2: size - padding
        };
      }
      const x = -weights.b / weights.w1;
      return {
        x1: toSVG(Math.max(0, Math.min(1, x))),
        y1: padding,
        x2: toSVG(Math.max(0, Math.min(1, x))),
        y2: size - padding
      };
    }

    // Calculate y values at x=0 and x=1
    const y1 = -(weights.w1 * 0 + weights.b) / weights.w2;
    const y2 = -(weights.w1 * 1 + weights.b) / weights.w2;

    // Clamp values to prevent NaN and ensure they're within bounds
    return {
      x1: toSVG(0),
      y1: toSVG(Math.max(-1, Math.min(2, 1 - y1))), // Flip y axis for SVG
      x2: toSVG(1),
      y2: toSVG(Math.max(-1, Math.min(2, 1 - y2)))
    };
  };

  // Training function
  const train = React.useCallback(() => {
    if (!trainingRef.current) return;

    const localWeights = { ...weights };
    let localEpochs = 0;
    let localUpdates = 0;
    let hasConverged = false;

    const learningRate = 0.5;
    const maxEpochs = willConverge ? 50 : 100;

    const runEpoch = () => {
      if (!trainingRef.current || localEpochs >= maxEpochs) {
        setIsTraining(false);
        trainingRef.current = false;
        onUpdateStats(localEpochs, localUpdates, hasConverged);
        return;
      }

      let mistakes = 0;

      // Shuffle data for better training
      const shuffled = [...dataPoints].sort(() => Math.random() - 0.5);

      shuffled.forEach((point) => {
        const prediction = Math.sign(
          localWeights.w1 * point.x +
          localWeights.w2 * point.y +
          localWeights.b
        ) || 1;

        if (prediction !== point.label) {
          mistakes++;
          localUpdates++;

          // Update weights
          localWeights.w1 += learningRate * point.label * point.x;
          localWeights.w2 += learningRate * point.label * point.y;
          localWeights.b += learningRate * point.label;
        }
      });

      localEpochs++;
      setEpochs(localEpochs);
      setUpdates(localUpdates);
      setWeights({ ...localWeights });

      if (mistakes === 0 && willConverge) {
        hasConverged = true;
        setConverged(true);
        setIsTraining(false);
        trainingRef.current = false;
        onUpdateStats(localEpochs, localUpdates, true);
        return;
      }

      // Continue training
      const timeout = setTimeout(runEpoch, 200);
      timeoutsRef.current.push(timeout);
    };

    runEpoch();
  }, [dataPoints, weights, willConverge, onUpdateStats]);

  // Start training automatically
  useEffect(() => {
    // Random initialization
    setWeights({
      w1: (Math.random() - 0.5) * 2,
      w2: (Math.random() - 0.5) * 2,
      b: (Math.random() - 0.5) * 2
    });

    const startTimeout = setTimeout(() => {
      setIsTraining(true);
      trainingRef.current = true;
      train();
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      timeoutsRef.current.forEach(clearTimeout);
      trainingRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-restart for non-converging case
  useEffect(() => {
    if (!willConverge && epochs >= 100) {
      // Reset and restart
      const timeout = setTimeout(() => {
        setEpochs(0);
        setUpdates(0);
        setWeights({
          w1: (Math.random() - 0.5) * 2,
          w2: (Math.random() - 0.5) * 2,
          b: (Math.random() - 0.5) * 2
        });
        setIsTraining(true);
        trainingRef.current = true;
        train();
      }, 1000);

      timeoutsRef.current.push(timeout);
    }
  }, [epochs, willConverge, train]);

  const linePoints = getLinePoints();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center'
      }}>
        {title}
      </div>

      <svg
        width={size}
        height={size}
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px'
        }}
      >
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(val => (
          <React.Fragment key={val}>
            <line
              x1={toSVG(val)}
              y1={padding}
              x2={toSVG(val)}
              y2={size - padding}
              stroke={colors.grid}
              strokeWidth="0.5"
            />
            <line
              x1={padding}
              y1={toSVG(val)}
              x2={size - padding}
              y2={toSVG(val)}
              stroke={colors.grid}
              strokeWidth="0.5"
            />
          </React.Fragment>
        ))}

        {/* Decision boundary */}
        <line
          x1={linePoints.x1}
          y1={linePoints.y1}
          x2={linePoints.x2}
          y2={linePoints.y2}
          stroke={converged ? colors.converged : colors.line}
          strokeWidth="2"
          strokeDasharray={converged ? "0" : "5,5"}
          opacity={0.8}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={toSVG(point.x)}
            cy={toSVG(1 - point.y)} // Flip y for SVG
            r="5"
            fill={point.label > 0 ? colors.positive : colors.negative}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div style={{
        fontSize: '11px',
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        {description}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem',
        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.textSecondary }}>Epochs</div>
          <div style={{ fontWeight: '600', color: colors.text }}>{epochs}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.textSecondary }}>Updates</div>
          <div style={{ fontWeight: '600', color: colors.text }}>{updates}</div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: converged ? colors.converged : (isTraining ? colors.line : colors.textSecondary)
      }}>
        {converged ? '✓ Converged!' : (isTraining ? '⟳ Training...' : 'Initializing...')}
      </div>
    </div>
  );
};

const ConvergenceComparison: React.FC<{ config?: unknown }> = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: '400px' }} />;
  }

  const colors = isDark ? {
    bg: '#0a0a0a',
    border: '#404040',
    text: '#f3f4f6'
  } : {
    bg: '#fafafa',
    border: '#e5e7eb',
    text: '#111827'
  };

  return (
    <div style={{
      padding: '1.5rem',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      margin: '2rem 0'
    }}>
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <PerceptronVisualization
          title="Linearly Separable"
          description="Watch the perceptron find the line and stop"
          dataset="linearly_separable"
          willConverge={true}
          onUpdateStats={() => {}}
        />

        <PerceptronVisualization
          title="XOR Pattern"
          description="Watch it struggle forever"
          dataset="xor"
          willConverge={false}
          onUpdateStats={() => {}}
        />
      </div>
    </div>
  );
};

export default ConvergenceComparison;