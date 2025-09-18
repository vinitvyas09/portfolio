"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface DataPoint {
  x: number;
  y: number;
  label: 'cat' | 'dog';
  id: string;
}

interface LinearSeparableDataVizProps {
  config?: {
    dataset?: string;
    xAxis?: string;
    yAxis?: string;
    showSeparatingLine?: boolean;
    animateDataPoints?: boolean;
    pointAppearanceMs?: number;
    showLegend?: boolean;
    interactive?: boolean;
    animateLineDrawing?: boolean;
    lineAnimationMs?: number;
    highlightRegions?: boolean;
    regionLabels?: string[];
  };
}

const LinearSeparableDataViz: React.FC<LinearSeparableDataVizProps> = ({
  config = {
    dataset: "cats_vs_dogs",
    xAxis: "Hours of Sleep (per day)",
    yAxis: "Running Speed (mph)",
    showSeparatingLine: false,
    animateDataPoints: true,
    pointAppearanceMs: 100,
    showLegend: true,
    interactive: false,
    animateLineDrawing: false,
    lineAnimationMs: 2000,
    highlightRegions: false,
    regionLabels: ["Team Dog 🐕", "Team Cat 🐈"]
  }
}) => {
  // Theme handling
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const {
    xAxis = "Hours of Sleep (per day)",
    yAxis = "Running Speed (mph)",
    showSeparatingLine = false,
    animateDataPoints = true,
    pointAppearanceMs = 100,
    showLegend = true,
    interactive = false,
    animateLineDrawing = false,
    lineAnimationMs = 2000,
    highlightRegions = false,
    regionLabels = ["Team Dog 🐕", "Team Cat 🐈"]
  } = config;

  // Animation states
  const [visiblePoints, setVisiblePoints] = useState<number>(0);
  const [showLine, setShowLine] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [dataGeneration, setDataGeneration] = useState(0);

  // Ref to store timeout IDs for cleanup
  const trainingTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);

  // Perceptron training state
  const [learnedWeights, setLearnedWeights] = useState<{ a: number; b: number; c: number } | null>(null);
  const [currentWeights, setCurrentWeights] = useState<{ a: number; b: number; c: number } | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<Array<{ a: number; b: number; c: number; error: number }>>([]);
  const [currentTrainingPoint, setCurrentTrainingPoint] = useState<number>(-1);

  // True separating line (ground truth) - changes when new data is generated
  const trueLine = useMemo(() => {
    // Create deterministic but varying line based on dataGeneration
    const variation = Math.sin(dataGeneration * 1.7) * 0.5;
    const a = 1.2 + variation;   // coefficient for x (sleep hours)
    const b = 1;                 // coefficient for y (running speed)
    const c = -30 + variation * 10; // constant term

    return { a, b, c };
  }, [dataGeneration]);

  // Generate linearly separable data based on the true line
  const dataPoints = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const { a, b, c } = trueLine;

    // Seed for consistent randomness per generation
    const seed = dataGeneration * 1000;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    const pointsPerClass = 25;

    for (let i = 0; i < pointsPerClass; i++) {
      // Generate cats (Ax + By + C >= margin region) - well above the line
      let catX, catY;
      let attempts = 0;
      const minMargin = 2; // Minimum distance from separating line
      do {
        catX = 12 + seededRandom(i * 2) * 6; // 12-18 hours sleep
        catY = 8 + seededRandom(i * 2 + 1) * 10;  // 8-18 mph speed
        attempts++;
      } while ((a * catX + b * catY + c < minMargin) && attempts < 100);

      // If we couldn't find a good point, force it into the correct region
      if (attempts >= 100) {
        catX = 15 + seededRandom(i * 2) * 3; // Safer range
        catY = 8 + seededRandom(i * 2 + 1) * 6;
        // Ensure it's well in the cat region
        while (a * catX + b * catY + c < minMargin) {
          catY += 0.5; // Move up to ensure it's in cat region
        }
      }

      points.push({
        x: catX,
        y: catY,
        label: 'cat',
        id: `cat-${i}-${dataGeneration}`
      });

      // Generate dogs (Ax + By + C <= -margin region) - well below the line
      let dogX, dogY;
      attempts = 0;
      do {
        dogX = 8 + seededRandom(i * 2 + 100) * 8;   // 8-16 hours sleep
        dogY = 15 + seededRandom(i * 2 + 101) * 12; // 15-27 mph speed
        attempts++;
      } while ((a * dogX + b * dogY + c > -minMargin) && attempts < 100);

      // If we couldn't find a good point, force it into the correct region
      if (attempts >= 100) {
        dogX = 10 + seededRandom(i * 2 + 100) * 4; // Safer range
        dogY = 18 + seededRandom(i * 2 + 101) * 8;
        // Ensure it's well in the dog region
        let safeguard = 0;
        while (a * dogX + b * dogY + c > -minMargin && safeguard < 200) {
          dogY -= 0.5; // Move deeper into the dog region (below the boundary)
          safeguard++;
        }
      }

      points.push({
        x: dogX,
        y: dogY,
        label: 'dog',
        id: `dog-${i}-${dataGeneration}`
      });
    }

    return points;
  }, [trueLine, dataGeneration]);

  // Generate new random data
  const generateNewData = useCallback(() => {
    // Clear any ongoing training timeouts
    trainingTimeoutsRef.current.forEach(clearTimeout);
    trainingTimeoutsRef.current = [];

    setDataGeneration(prev => prev + 1);
    setLearnedWeights(null);
    setCurrentWeights(null);
    setTrainingHistory([]);
    setIsTraining(false);
    setShowLine(false);
    setVisiblePoints(0);
    setCurrentTrainingPoint(-1);
  }, []);

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        catColor: "#e11d48",
        dogColor: "#3b82f6",
        lineColor: "#059669",
        regionCat: "rgba(225, 29, 72, 0.1)",
        regionDog: "rgba(59, 130, 246, 0.1)",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        borderColor: "#e2e8f0",
        gridColor: "#f1f5f9"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      catColor: "#f43f5e",
      dogColor: "#60a5fa",
      lineColor: "#34d399",
      regionCat: "rgba(244, 63, 94, 0.15)",
      regionDog: "rgba(96, 165, 250, 0.15)",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      borderColor: "#404040",
      gridColor: "#262626"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      catColor: "#e11d48",
      dogColor: "#3b82f6",
      lineColor: "#059669",
      regionCat: "rgba(225, 29, 72, 0.1)",
      regionDog: "rgba(59, 130, 246, 0.1)",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      borderColor: "#e2e8f0",
      gridColor: "#f1f5f9"
    };
  }, [isDark, mounted]);

  // Chart dimensions and scales
  const chartWidth = 600;
  const chartHeight = 400;
  const padding = 60;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;

  // Data bounds
  const xMin = 6, xMax = 20;
  const yMin = 5, yMax = 30;

  // Scale functions
  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * innerWidth;
  const scaleY = (y: number) => chartHeight - padding - ((y - yMin) / (yMax - yMin)) * innerHeight;

  // Animate points appearing
  useEffect(() => {
    if (!animateDataPoints) {
      setVisiblePoints(dataPoints.length);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i <= dataPoints.length; i++) {
      const timeout = setTimeout(() => {
        setVisiblePoints(i);
      }, i * pointAppearanceMs);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [dataPoints, animateDataPoints, pointAppearanceMs]);

  // Animate line drawing
  useEffect(() => {
    if (showSeparatingLine && animateLineDrawing) {
      setShowLine(false);
      const timeout = setTimeout(() => {
        setShowLine(true);
      }, 500);
      return () => clearTimeout(timeout);
    } else if (showSeparatingLine) {
      setShowLine(true);
    } else {
      setShowLine(false);
    }
  }, [showSeparatingLine, animateLineDrawing]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      trainingTimeoutsRef.current.forEach(clearTimeout);
      trainingTimeoutsRef.current = [];
    };
  }, []);

  // Perceptron training algorithm with real-time weight updates
  const startTraining = useCallback(() => {
    if (isTraining) return;

    trainingTimeoutsRef.current.forEach(clearTimeout);
    trainingTimeoutsRef.current = [];

    setIsTraining(true);
    setTrainingStep(0);
    setTrainingHistory([]);
    setCurrentTrainingPoint(-1);

    const currentDataPoints = dataPoints;
    if (currentDataPoints.length === 0) {
      setIsTraining(false);
      return;
    }

    const totals = currentDataPoints.reduce(
      (acc, point) => {
        acc.sumX += point.x;
        acc.sumY += point.y;
        acc.sumX2 += point.x * point.x;
        acc.sumY2 += point.y * point.y;
        return acc;
      },
      { sumX: 0, sumY: 0, sumX2: 0, sumY2: 0 }
    );

    const pointCount = currentDataPoints.length;
    const meanX = totals.sumX / pointCount;
    const meanY = totals.sumY / pointCount;
    const varianceX = Math.max(totals.sumX2 / pointCount - meanX * meanX, 1e-6);
    const varianceY = Math.max(totals.sumY2 / pointCount - meanY * meanY, 1e-6);
    const stdX = Math.sqrt(varianceX);
    const stdY = Math.sqrt(varianceY);

    // Normalize features so the perceptron sees a centred, unit-variance dataset (faster convergence).
    const trainingSet = currentDataPoints.map((point, index) => ({
      ...point,
      normalizedX: (point.x - meanX) / stdX,
      normalizedY: (point.y - meanY) / stdY,
      originalIndex: index
    }));

    // Convert normalized weights back to chart coordinates for rendering.
    const denormalizeWeights = (normalizedWeights: { a: number; b: number; c: number }) => {
      const actualA = normalizedWeights.a / stdX;
      const actualB = normalizedWeights.b / stdY;
      const actualC =
        normalizedWeights.c - (normalizedWeights.a * meanX) / stdX - (normalizedWeights.b * meanY) / stdY;
      return { a: actualA, b: actualB, c: actualC };
    };

    let weights = {
      a: Math.random() * 2 - 1,
      b: Math.random() * 2 - 1,
      c: Math.random() * 2 - 1
    };

    const learningRate = 0.1;
    const maxEpochs = 50;
    let epoch = 0;
    let converged = false;
    let pointIndex = 0;
    let lastEpochError = -1;

    const shuffledPoints = [...trainingSet].sort(() => Math.random() - 0.5);

    const finalizeTraining = () => {
      const finalWeights = denormalizeWeights(weights);
      trainingTimeoutsRef.current.forEach(clearTimeout);
      trainingTimeoutsRef.current = [];
      setIsTraining(false);
      setLearnedWeights(finalWeights);
      setCurrentWeights(finalWeights);
      setCurrentTrainingPoint(-1);
    };

    setCurrentWeights(denormalizeWeights(weights));

    const trainSinglePoint = () => {
      if (epoch >= maxEpochs || converged) {
        finalizeTraining();
        return;
      }

      if (pointIndex >= shuffledPoints.length) {
        pointIndex = 0;
        epoch++;

        if (lastEpochError === 0) {
          converged = true;
          finalizeTraining();
          return;
        }

        shuffledPoints.sort(() => Math.random() - 0.5);
        setTrainingStep(epoch);
      }

      const point = shuffledPoints[pointIndex];
      setCurrentTrainingPoint(point.originalIndex);

      const activation = weights.a * point.normalizedX + weights.b * point.normalizedY + weights.c;
      const prediction = activation >= 0 ? 1 : -1;
      const trueLabel = point.label === 'cat' ? 1 : -1;

      let weightChanged = false;
      if (prediction !== trueLabel) {
        weightChanged = true;
        weights.a += learningRate * trueLabel * point.normalizedX;
        weights.b += learningRate * trueLabel * point.normalizedY;
        weights.c += learningRate * trueLabel;

        setCurrentWeights(denormalizeWeights(weights));
      }

      if (pointIndex === shuffledPoints.length - 1) {
        let epochErrors = 0;
        for (const p of shuffledPoints) {
          const act = weights.a * p.normalizedX + weights.b * p.normalizedY + weights.c;
          const pred = act >= 0 ? 1 : -1;
          const labelVal = p.label === 'cat' ? 1 : -1;
          if (pred !== labelVal) epochErrors++;
        }

        const actualWeights = denormalizeWeights(weights);
        setTrainingHistory(prev => [...prev, { ...actualWeights, error: epochErrors }]);
        lastEpochError = epochErrors;

        if (epochErrors === 0) {
          converged = true;
        }
      }

      pointIndex++;

      const timeoutId = setTimeout(trainSinglePoint, weightChanged ? 400 : 150);
      trainingTimeoutsRef.current.push(timeoutId);
    };

    const initialTimeoutId = setTimeout(trainSinglePoint, 500);
    trainingTimeoutsRef.current.push(initialTimeoutId);
  }, [isTraining, dataPoints]);

  // Calculate line points for SVG with proper clipping
  const getLinePoints = (lineParams?: { a: number; b: number; c: number }) => {
    const line = lineParams || trueLine;
    const { a, b, c } = line;

    // From Ax + By + C = 0, solve for y: y = -(Ax + C)/B
    if (Math.abs(b) < 0.001) {
      // Nearly vertical line
      const x = -c / a;
      return {
        x1: scaleX(Math.max(xMin, Math.min(xMax, x))),
        y1: scaleY(yMin),
        x2: scaleX(Math.max(xMin, Math.min(xMax, x))),
        y2: scaleY(yMax)
      };
    }

    // Calculate potential intersection points with chart boundaries
    const intersections = [];

    // Left edge (x = xMin)
    const yAtXMin = -(a * xMin + c) / b;
    if (yAtXMin >= yMin && yAtXMin <= yMax) {
      intersections.push({ x: xMin, y: yAtXMin });
    }

    // Right edge (x = xMax)
    const yAtXMax = -(a * xMax + c) / b;
    if (yAtXMax >= yMin && yAtXMax <= yMax) {
      intersections.push({ x: xMax, y: yAtXMax });
    }

    // Top edge (y = yMax)
    const xAtYMax = -(b * yMax + c) / a;
    if (xAtYMax >= xMin && xAtYMax <= xMax) {
      intersections.push({ x: xAtYMax, y: yMax });
    }

    // Bottom edge (y = yMin)
    const xAtYMin = -(b * yMin + c) / a;
    if (xAtYMin >= xMin && xAtYMin <= xMax) {
      intersections.push({ x: xAtYMin, y: yMin });
    }

    // Use the first two valid intersections
    if (intersections.length >= 2) {
      return {
        x1: scaleX(intersections[0].x),
        y1: scaleY(intersections[0].y),
        x2: scaleX(intersections[1].x),
        y2: scaleY(intersections[1].y)
      };
    }

    // Fallback to simple calculation if intersection method fails
    const y1 = -(a * xMin + c) / b;
    const y2 = -(a * xMax + c) / b;

    return {
      x1: scaleX(xMin),
      y1: scaleY(Math.max(yMin, Math.min(yMax, y1))),
      x2: scaleX(xMax),
      y2: scaleY(Math.max(yMin, Math.min(yMax, y2)))
    };
  };

  // Placeholder to avoid SSR/CSR theme mismatch flash
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
      <svg
        width="100%"
        height={chartHeight + 100}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 100}`}
        style={{ maxWidth: '700px', margin: '0 auto', display: 'block' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="catGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.catColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.catColor} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="dogGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.dogColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.dogColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = xMin + (i * (xMax - xMin)) / 7;
          return (
            <line
              key={`vgrid-${i}`}
              x1={scaleX(x)}
              y1={padding}
              x2={scaleX(x)}
              y2={chartHeight - padding}
              stroke={colors.gridColor}
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {Array.from({ length: 6 }, (_, i) => {
          const y = yMin + (i * (yMax - yMin)) / 5;
          return (
            <line
              key={`hgrid-${i}`}
              x1={padding}
              y1={scaleY(y)}
              x2={chartWidth - padding}
              y2={scaleY(y)}
              stroke={colors.gridColor}
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* Chart borders */}
        <rect
          x={padding}
          y={padding}
          width={innerWidth}
          height={innerHeight}
          fill="none"
          stroke={colors.borderColor}
          strokeWidth="2"
        />

        {/* Region highlights (if enabled) */}
        {highlightRegions && (showLine || learnedWeights) && (
          <>
            <defs>
              <clipPath id="chartClip">
                <rect x={padding} y={padding} width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            <g clipPath="url(#chartClip)">
              {(() => {
                const lineToUse = learnedWeights || trueLine;
                const { x1, y1, x2, y2 } = getLinePoints(lineToUse);

                return (
                  <>
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${chartWidth - padding},${chartHeight - padding} ${padding},${chartHeight - padding}`}
                      fill={colors.regionDog}
                      opacity="0.3"
                    />
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${chartWidth - padding},${padding} ${padding},${padding}`}
                      fill={colors.regionCat}
                      opacity="0.3"
                    />
                  </>
                );
              })()}
            </g>
          </>
        )}

        {/* All lines clipped to chart area */}
        <g clipPath="url(#chartClip)">
          {/* True separating line (ground truth) */}
          {(showSeparatingLine || showLine) && !currentWeights && !learnedWeights && (
            <g>
              {(() => {
                const { x1, y1, x2, y2 } = getLinePoints(trueLine);
                return (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={colors.lineColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    opacity={animateLineDrawing ? 0 : 0.7}
                    strokeDasharray="5,5"
                  >
                    {animateLineDrawing && (
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="0.7"
                        dur={`${lineAnimationMs}ms`}
                        fill="freeze"
                      />
                    )}
                  </line>
                );
              })()}
            </g>
          )}

          {/* Current training line (real-time updates) */}
          {currentWeights && isTraining && (
            <g>
              {(() => {
                const { x1, y1, x2, y2 } = getLinePoints(currentWeights);
                return (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    opacity="0.9"
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })()}
            </g>
          )}

          {/* Final learned line (from perceptron training) */}
          {learnedWeights && !isTraining && (
            <g>
              {(() => {
                const { x1, y1, x2, y2 } = getLinePoints(learnedWeights);
                return (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={colors.lineColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    opacity="1"
                  />
                );
              })()}
            </g>
          )}
        </g>

        {/* Data points */}
        {dataPoints.slice(0, visiblePoints).map((point, index) => {
          const isCurrentTrainingPoint = isTraining && index === currentTrainingPoint;
          const color = point.label === 'cat' ? colors.catColor : colors.dogColor;
          const radius = isCurrentTrainingPoint ? 9 : 6;

          return (
            <g key={point.id}>
              {/* Point shadow */}
              <circle
                cx={scaleX(point.x) + 1}
                cy={scaleY(point.y) + 1}
                r={radius}
                fill="rgba(0,0,0,0.1)"
              />

              {/* Main point */}
              <circle
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r={radius}
                fill={point.label === 'cat' ? 'url(#catGradient)' : 'url(#dogGradient)'}
                stroke={color}
                strokeWidth="2"
                opacity={animateDataPoints ? 0 : 1}
                filter={isCurrentTrainingPoint ? "url(#glow)" : ""}
                style={{
                  cursor: interactive ? 'pointer' : 'default',
                  transition: 'all 0.3s ease'
                }}
              >
                {animateDataPoints && (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="500ms"
                    begin={`${index * pointAppearanceMs}ms`}
                    fill="freeze"
                  />
                )}

                {isCurrentTrainingPoint && (
                  <animate
                    attributeName="r"
                    values={`${radius};${radius + 3};${radius}`}
                    dur="400ms"
                    repeatCount="1"
                  />
                )}
              </circle>

              {/* Point emoji */}
              <text
                x={scaleX(point.x)}
                y={scaleY(point.y)}
                textAnchor="middle"
                dy="0.35em"
                fontSize="12"
                fill="white"
                fontWeight="bold"
                pointerEvents="none"
              >
                {point.label === 'cat' ? '🐱' : '🐕'}
              </text>
            </g>
          );
        })}

        {/* Region labels */}
        {highlightRegions && (showLine || learnedWeights) && regionLabels && (
          <>
            <text
              x={scaleX(10)}
              y={scaleY(27)}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill={colors.dogColor}
              opacity="0.8"
            >
              {regionLabels[0]}
            </text>
            <text
              x={scaleX(16)}
              y={scaleY(12)}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill={colors.catColor}
              opacity="0.8"
            >
              {regionLabels[1]}
            </text>
          </>
        )}

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.textPrimary}
        >
          {xAxis}
        </text>

        <text
          x={25}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.textPrimary}
          transform={`rotate(-90, 25, ${chartHeight / 2})`}
        >
          {yAxis}
        </text>

        {/* Axis tick labels */}
        {[8, 10, 12, 14, 16, 18].map(x => (
          <text
            key={`x-tick-${x}`}
            x={scaleX(x)}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            fontSize="12"
            fill={colors.textSecondary}
          >
            {x}
          </text>
        ))}

        {[10, 15, 20, 25].map(y => (
          <text
            key={`y-tick-${y}`}
            x={padding - 10}
            y={scaleY(y)}
            textAnchor="end"
            dy="0.35em"
            fontSize="12"
            fill={colors.textSecondary}
          >
            {y}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '1rem',
          padding: '1rem',
          background: colors.bgGradient1,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: colors.catColor,
              border: `2px solid ${colors.catColor}`
            }} />
            <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '500' }}>
              🐱 Cats (Sleepy & Slow)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: colors.dogColor,
              border: `2px solid ${colors.dogColor}`
            }} />
            <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '500' }}>
              🐕 Dogs (Active & Fast)
            </span>
          </div>
        </div>
      )}

      {/* Interactive controls */}
      {interactive && (
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={generateNewData}
              disabled={isTraining}
              style={{
                padding: '0.75rem 1.5rem',
                background: isTraining
                  ? colors.borderColor
                  : `linear-gradient(135deg, ${colors.dogColor}, #60a5fa)`,
                color: isTraining ? colors.textSecondary : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isTraining
                  ? 'none'
                  : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              🎲 New Data
            </button>

            <button
              onClick={startTraining}
              disabled={isTraining || dataPoints.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: isTraining || dataPoints.length === 0
                  ? colors.borderColor
                  : `linear-gradient(135deg, ${colors.lineColor}, #10b981)`,
                color: isTraining || dataPoints.length === 0 ? colors.textSecondary : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isTraining || dataPoints.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isTraining || dataPoints.length === 0
                  ? 'none'
                  : '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              {isTraining ? '🧠 Training...' : '🧠 Train Perceptron'}
            </button>
          </div>

          {/* Training progress */}
          {isTraining && (
            <div style={{
              color: colors.textSecondary,
              fontSize: '13px',
              textAlign: 'center'
            }}>
              <div>Epoch: {trainingStep} / 50</div>
              {currentWeights && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  background: colors.bgGradient1,
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: `1px solid ${colors.borderColor}`
                }}>
                  Current: {currentWeights.a.toFixed(2)}x + {currentWeights.b.toFixed(2)}y + {currentWeights.c.toFixed(2)} = 0
                </div>
              )}
              {currentTrainingPoint >= 0 && (
                <div style={{ marginTop: '0.25rem', fontSize: '11px' }}>
                  Training on point {currentTrainingPoint + 1} ({dataPoints[currentTrainingPoint]?.label})
                </div>
              )}
              {trainingHistory.length > 0 && (
                <div>Last epoch errors: {trainingHistory[trainingHistory.length - 1]?.error || 0}</div>
              )}
            </div>
          )}

          {/* Training results */}
          {learnedWeights && !isTraining && (
            <div style={{
              padding: '1rem',
              background: colors.bgGradient1,
              borderRadius: '8px',
              border: `1px solid ${colors.borderColor}`,
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <div style={{
                color: colors.textPrimary,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                ✅ Perceptron Converged!
              </div>
              <div style={{
                color: colors.textSecondary,
                fontSize: '12px',
                marginBottom: '0.5rem'
              }}>
                Learned equation: {learnedWeights.a.toFixed(2)}x + {learnedWeights.b.toFixed(2)}y + {learnedWeights.c.toFixed(2)} = 0
              </div>
              <div style={{
                color: colors.textSecondary,
                fontSize: '12px'
              }}>
                Converged in {trainingHistory.length} epochs
              </div>
            </div>
          )}

          {/* Legend for lines */}
          {(showSeparatingLine || learnedWeights || currentWeights) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '12px',
              color: colors.textSecondary,
              flexWrap: 'wrap'
            }}>
              {showSeparatingLine && !currentWeights && !learnedWeights && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '20px',
                    height: '2px',
                    background: colors.lineColor,
                    opacity: '0.7',
                    borderRadius: '1px',
                    border: `1px dashed ${colors.lineColor}`
                  }} />
                  <span>True boundary</span>
                </div>
              )}
              {currentWeights && isTraining && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '20px',
                    height: '3px',
                    background: '#f59e0b',
                    borderRadius: '1px'
                  }} />
                  <span>Learning...</span>
                </div>
              )}
              {learnedWeights && !isTraining && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '20px',
                    height: '3px',
                    background: colors.lineColor,
                    borderRadius: '1px'
                  }} />
                  <span>Learned boundary</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinearSeparableDataViz;
