"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

interface DataPoint {
  x: number;
  y: number;
  label: 'cat' | 'dog';
  id: string;
  order?: number; // For showing the order in fixed sequence
}

interface TrainingMetrics {
  epoch: number;
  errors: number;
  accuracy: number;
  currentIndex: number;
  totalSeen: number;
  learningEvents: number;
  currentPhase?: 'cats' | 'dogs' | 'mixed';
}

interface OrderMattersDemoProps {
  config?: {
    scenarios?: Array<{
      name: string;
      order: string;
      description: string;
    }>;
    showConvergenceRate?: boolean;
    animateTraining?: boolean;
  };
}

const OrderMattersDemo: React.FC<OrderMattersDemoProps> = ({
  config = {
    scenarios: [
      {
        name: "Fixed Order Disaster",
        order: "500 cats, then 500 dogs",
        description: "Watch the perceptron get stuck"
      },
      {
        name: "Shuffled Success",
        order: "Random mix",
        description: "Same data, different order, instant learning"
      }
    ],
    showConvergenceRate: true,
    animateTraining: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Animation states
  const [isRunning, setIsRunning] = useState(false);
  const [fixedOrderMetrics, setFixedOrderMetrics] = useState<TrainingMetrics>({
    epoch: 0,
    errors: 20,
    accuracy: 0,
    currentIndex: 0,
    totalSeen: 0,
    learningEvents: 0,
    currentPhase: 'cats'
  });
  const [shuffledMetrics, setShuffledMetrics] = useState<TrainingMetrics>({
    epoch: 0,
    errors: 20,
    accuracy: 0,
    currentIndex: 0,
    totalSeen: 0,
    learningEvents: 0,
    currentPhase: 'mixed'
  });

  // Weights for visualization
  const [fixedWeights, setFixedWeights] = useState<{ a: number; b: number; c: number } | null>(null);
  const [shuffledWeights, setShuffledWeights] = useState<{ a: number; b: number; c: number } | null>(null);

  // Current training point highlight
  const [fixedCurrentPoint, setFixedCurrentPoint] = useState<number>(-1);
  const [shuffledCurrentPoint, setShuffledCurrentPoint] = useState<number>(-1);

  // Refs for cleanup
  const animationRef = useRef<NodeJS.Timeout[]>([]);

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8f9fa",
        cat: "#e11d48",
        dog: "#3b82f6",
        fixedLine: "#ef4444",
        shuffledLine: "#10b981",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        grid: "#f1f5f9",
        accent: "#f59e0b",
        error: "#ef4444",
        success: "#10b981"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      cat: "#f43f5e",
      dog: "#60a5fa",
      fixedLine: "#f87171",
      shuffledLine: "#34d399",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#404040",
      grid: "#262626",
      accent: "#fbbf24",
      error: "#f87171",
      success: "#34d399"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      cat: "#e11d48",
      dog: "#3b82f6",
      fixedLine: "#ef4444",
      shuffledLine: "#10b981",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      grid: "#f1f5f9",
      accent: "#f59e0b",
      error: "#ef4444",
      success: "#10b981"
    };
  }, [isDark, mounted]);

  // Generate data points - more points to show the effect clearly
  const dataPoints = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const catsPerBatch = 15; // 15 cats
    const dogsPerBatch = 15; // 15 dogs

    // Generate cats (lighter, higher frequency) - clearly separated
    for (let i = 0; i < catsPerBatch; i++) {
      points.push({
        x: 2 + Math.random() * 6,  // 2-8 kg
        y: 800 + Math.random() * 600, // 800-1400 Hz
        label: 'cat',
        id: `cat-${i}`,
        order: i
      });
    }

    // Generate dogs (heavier, lower frequency) - clearly separated
    for (let i = 0; i < dogsPerBatch; i++) {
      points.push({
        x: 18 + Math.random() * 17, // 18-35 kg
        y: 100 + Math.random() * 400, // 100-500 Hz
        label: 'dog',
        id: `dog-${i}`,
        order: catsPerBatch + i
      });
    }

    return points;
  }, []);

  // Create fixed order dataset (all cats, then all dogs)
  const fixedOrderData = useMemo(() => {
    const cats = dataPoints.filter(p => p.label === 'cat');
    const dogs = dataPoints.filter(p => p.label === 'dog');
    return [...cats, ...dogs];
  }, [dataPoints]);

  // Create shuffled dataset
  const shuffledData = useMemo(() => {
    return [...dataPoints].sort(() => Math.random() - 0.5);
  }, [dataPoints]);

  // Chart dimensions (responsive)
  const chartWidth = useMemo(() => {
    if (!mounted) return 280;
    return isMobile ? Math.min(window.innerWidth - 80, 320) : 280;
  }, [isMobile, mounted]);

  const chartHeight = isMobile ? 180 : 200;
  const padding = isMobile ? 25 : 30;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;

  // Scales
  const xMin = 0;
  const xMax = 40;
  const yMin = 0;
  const yMax = 1400;

  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * innerWidth;
  const scaleY = (y: number) => chartHeight - padding - ((y - yMin) / (yMax - yMin)) * innerHeight;

  // Training simulation
  const runTraining = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setFixedOrderMetrics({
      epoch: 0,
      errors: 30,
      accuracy: 0,
      currentIndex: 0,
      totalSeen: 0,
      learningEvents: 0,
      currentPhase: 'cats'
    });
    setShuffledMetrics({
      epoch: 0,
      errors: 30,
      accuracy: 0,
      currentIndex: 0,
      totalSeen: 0,
      learningEvents: 0,
      currentPhase: 'mixed'
    });

    // Initialize weights in the middle (bad for both classes)
    const initialW = { a: 20, b: 1, c: -400 }; // Starts with a bad line
    const fixedW = { ...initialW };
    const shuffledW = { ...initialW };

    setFixedWeights(fixedW);
    setShuffledWeights(shuffledW);

    let fixedIdx = 0;
    let shuffledIdx = 0;
    let fixedEpoch = 0;
    let shuffledEpoch = 0;
    let fixedLearningEvents = 0;
    let shuffledLearningEvents = 0;
    let shuffledConverged = false;

    const learningRate = 0.5; // Higher learning rate to show the effect more dramatically
    const maxEpochs = 20;
    const totalPoints = dataPoints.length;

    const trainStep = () => {
      // Train fixed order perceptron (all cats, then all dogs)
      if (fixedEpoch < maxEpochs) {
        const point = fixedOrderData[fixedIdx];
        setFixedCurrentPoint(fixedIdx);

        // Determine current phase
        const currentPhase = fixedIdx < 15 ? 'cats' : 'dogs';

        const activation = fixedW.a * point.x + fixedW.b * point.y + fixedW.c;
        const prediction = activation >= 0 ? 1 : -1;
        const trueLabel = point.label === 'cat' ? 1 : -1;

        if (prediction !== trueLabel) {
          // Update weights - this will cause dramatic swings
          fixedW.a += learningRate * trueLabel * point.x;
          fixedW.b += learningRate * trueLabel * point.y;
          fixedW.c += learningRate * trueLabel;
          setFixedWeights({ ...fixedW });
          fixedLearningEvents++;
        }

        fixedIdx++;

        if (fixedIdx >= fixedOrderData.length) {
          fixedIdx = 0;
          fixedEpoch++;
        }

        // Calculate errors on ALL data
        let errors = 0;
        for (const p of dataPoints) {
          const act = fixedW.a * p.x + fixedW.b * p.y + fixedW.c;
          const pred = act >= 0 ? 1 : -1;
          const label = p.label === 'cat' ? 1 : -1;
          if (pred !== label) errors++;
        }

        setFixedOrderMetrics({
          epoch: fixedEpoch,
          errors,
          accuracy: ((totalPoints - errors) / totalPoints) * 100,
          currentIndex: fixedIdx,
          totalSeen: fixedEpoch * totalPoints + fixedIdx,
          learningEvents: fixedLearningEvents,
          currentPhase
        });
      }

      // Train shuffled perceptron
      if (shuffledEpoch < maxEpochs && !shuffledConverged) {
        const point = shuffledData[shuffledIdx];
        const originalIdx = dataPoints.findIndex(p => p.id === point.id);
        setShuffledCurrentPoint(originalIdx);

        const activation = shuffledW.a * point.x + shuffledW.b * point.y + shuffledW.c;
        const prediction = activation >= 0 ? 1 : -1;
        const trueLabel = point.label === 'cat' ? 1 : -1;

        if (prediction !== trueLabel) {
          // Update weights
          shuffledW.a += learningRate * 0.1 * trueLabel * point.x; // Smaller learning rate for stability
          shuffledW.b += learningRate * 0.1 * trueLabel * point.y;
          shuffledW.c += learningRate * 0.1 * trueLabel;
          setShuffledWeights({ ...shuffledW });
          shuffledLearningEvents++;
        }

        shuffledIdx++;

        if (shuffledIdx >= shuffledData.length) {
          shuffledIdx = 0;
          shuffledEpoch++;

          // Reshuffle for next epoch
          shuffledData.sort(() => Math.random() - 0.5);
        }

        // Calculate errors
        let errors = 0;
        for (const p of dataPoints) {
          const act = shuffledW.a * p.x + shuffledW.b * p.y + shuffledW.c;
          const pred = act >= 0 ? 1 : -1;
          const label = p.label === 'cat' ? 1 : -1;
          if (pred !== label) errors++;
        }

        // Check for convergence
        if (errors === 0) {
          shuffledConverged = true;
        }

        setShuffledMetrics({
          epoch: shuffledEpoch,
          errors,
          accuracy: ((totalPoints - errors) / totalPoints) * 100,
          currentIndex: shuffledIdx,
          totalSeen: shuffledEpoch * totalPoints + shuffledIdx,
          learningEvents: shuffledLearningEvents,
          currentPhase: 'mixed'
        });
      }

      // Continue or stop
      if (fixedEpoch < maxEpochs || (shuffledEpoch < maxEpochs && !shuffledConverged)) {
        const timeoutId = setTimeout(trainStep, 50); // Faster animation
        animationRef.current.push(timeoutId);
      } else {
        setIsRunning(false);
        setFixedCurrentPoint(-1);
        setShuffledCurrentPoint(-1);
      }
    };

    // Start training after a brief delay
    const startTimeout = setTimeout(trainStep, 500);
    animationRef.current.push(startTimeout);
  }, [isRunning, fixedOrderData, shuffledData, dataPoints]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      animationRef.current.forEach(clearTimeout);
    };
  }, []);

  // Get line points for visualization
  const getLinePoints = (weights: { a: number; b: number; c: number }) => {
    const { a, b, c } = weights;

    if (Math.abs(b) < 0.001) {
      const x = -c / a;
      return {
        x1: scaleX(x),
        y1: scaleY(yMin),
        x2: scaleX(x),
        y2: scaleY(yMax)
      };
    }

    const y1 = -(a * xMin + c) / b;
    const y2 = -(a * xMax + c) / b;

    return {
      x1: scaleX(xMin),
      y1: scaleY(Math.max(yMin, Math.min(yMax, y1))),
      x2: scaleX(xMax),
      y2: scaleY(Math.max(yMin, Math.min(yMax, y2)))
    };
  };

  const renderChart = (
    data: DataPoint[],
    weights: { a: number; b: number; c: number } | null,
    currentPoint: number,
    lineColor: string,
    title: string,
    idSuffix: string
  ) => (
    <svg
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`clip-${idSuffix}`}>
          <rect x={padding} y={padding} width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect x={padding} y={padding} width={innerWidth} height={innerHeight} fill={colors.bg} />

      {/* Grid lines */}
      {[0, 10, 20, 30, 40].map(x => (
        <line
          key={`vgrid-${x}`}
          x1={scaleX(x)}
          y1={padding}
          x2={scaleX(x)}
          y2={chartHeight - padding}
          stroke={colors.grid}
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}

      {[0, 500, 1000].map(y => (
        <line
          key={`hgrid-${y}`}
          x1={padding}
          y1={scaleY(y)}
          x2={chartWidth - padding}
          y2={scaleY(y)}
          stroke={colors.grid}
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}

      {/* Border */}
      <rect
        x={padding}
        y={padding}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={colors.border}
        strokeWidth="1.5"
      />

      <g clipPath={`url(#clip-${idSuffix})`}>
        {/* Decision boundary */}
        {weights && (
          <line
            {...getLinePoints(weights)}
            stroke={lineColor}
            strokeWidth="2"
            opacity="0.8"
            strokeDasharray={title.includes("Fixed") ? "5,5" : "none"}
          />
        )}

        {/* Data points */}
        {data.map((point, idx) => {
          const isHighlighted = idx === currentPoint;

          return (
            <circle
              key={point.id}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={isHighlighted ? 6 : 4}
              fill={point.label === 'cat' ? colors.cat : colors.dog}
              stroke={isHighlighted ? colors.accent : 'white'}
              strokeWidth={isHighlighted ? 2 : 1}
              opacity={isHighlighted ? 1 : 0.8}
            />
          );
        })}
      </g>

      {/* Title */}
      <text
        x={chartWidth / 2}
        y={12}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill={colors.text}
      >
        {title}
      </text>
    </svg>
  );

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
      padding: '1.5rem',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
    }}>
      {/* Main comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Fixed order side */}
        <div>
          {renderChart(
            fixedOrderData,
            fixedWeights,
            fixedCurrentPoint,
            colors.fixedLine,
            "Fixed: First 15 🐱, then 15 🐕",
            "fixed"
          )}

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            border: `1px solid ${colors.error}`,
            borderLeft: `3px solid ${colors.error}`
          }}>
            <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Fixed Order Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '10px', color: colors.textSecondary }}>Accuracy</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.error }}>
                  {fixedOrderMetrics.accuracy.toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: colors.textSecondary }}>Updates Made</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>
                  {fixedOrderMetrics.learningEvents}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '10px',
              color: colors.textSecondary,
              fontStyle: 'italic'
            }}>
              {fixedOrderMetrics.currentPhase === 'cats'
                ? "📚 Seeing only cats → \"Everything must be a cat!\""
                : "🐕 Seeing only dogs → \"Everything must be a dog!\""}
            </div>
          </div>
        </div>

        {/* Shuffled side */}
        <div>
          {renderChart(
            dataPoints,
            shuffledWeights,
            shuffledCurrentPoint,
            colors.shuffledLine,
            "Shuffled: Mixed 🐱 and 🐕",
            "shuffled"
          )}

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            border: `1px solid ${colors.success}`,
            borderLeft: `3px solid ${colors.success}`
          }}>
            <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Shuffled Order Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '10px', color: colors.textSecondary }}>Accuracy</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: shuffledMetrics.accuracy === 100 ? colors.success : colors.accent }}>
                  {shuffledMetrics.accuracy.toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: colors.textSecondary }}>Updates Made</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>
                  {shuffledMetrics.learningEvents}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '10px',
              color: colors.textSecondary,
              fontStyle: 'italic'
            }}>
              {shuffledMetrics.accuracy === 100
                ? "✨ Converged! Found the perfect boundary"
                : shuffledMetrics.accuracy > 90
                ? "🎯 Almost there, fine-tuning..."
                : "🔄 Learning from mixed examples"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar comparison */}
      {config.showConvergenceRate && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.75rem' }}>
            Training Progress (Epoch {Math.max(fixedOrderMetrics.epoch, shuffledMetrics.epoch)} / 20)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '10px', color: colors.textSecondary }}>Fixed Order</span>
                <span style={{ fontSize: '10px', color: colors.error, fontWeight: '600' }}>
                  {fixedOrderMetrics.errors} errors
                </span>
              </div>
              <div style={{
                height: '8px',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(fixedOrderMetrics.epoch / 20) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.cat} 0%, ${colors.cat} ${(fixedOrderMetrics.currentIndex / 30) * 100}%, ${colors.dog} ${(fixedOrderMetrics.currentIndex / 30) * 100}%, ${colors.dog} 100%)`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '10px', color: colors.textSecondary }}>Shuffled</span>
                <span style={{ fontSize: '10px', color: colors.success, fontWeight: '600' }}>
                  {shuffledMetrics.errors} errors
                </span>
              </div>
              <div style={{
                height: '8px',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(shuffledMetrics.epoch / 20) * 100}%`,
                  height: '100%',
                  background: colors.shuffledLine,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => {
            if (isRunning) {
              animationRef.current.forEach(clearTimeout);
              animationRef.current = [];
              setIsRunning(false);
              setFixedCurrentPoint(-1);
              setShuffledCurrentPoint(-1);
            } else {
              runTraining();
            }
          }}
          disabled={isRunning && false}
          style={{
            padding: '0.75rem 2rem',
            background: isRunning ? colors.error : colors.accent,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isRunning ? 0.8 : 1
          }}
        >
          {isRunning ? '⏸ Stop' : '▶️ Run Comparison'}
        </button>
      </div>

      {/* Key insight */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
        border: `1px solid ${colors.accent}`,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: colors.accent,
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>💡</span> Key Insight
        </div>
        <div style={{
          fontSize: '12px',
          color: colors.text,
          lineHeight: '1.6'
        }}>
          <strong>Fixed order fails because:</strong> When seeing all cats, it learns &ldquo;everything is a cat&rdquo; (line moves far right).
          Then seeing all dogs, it learns &ldquo;everything is a dog&rdquo; (line moves far left). It never finds the middle ground!
          <br /><br />
          <strong>Shuffling works because:</strong> Each update is balanced by seeing both classes, gradually finding the true boundary.
        </div>
      </div>
    </div>
  );
};

export default OrderMattersDemo;