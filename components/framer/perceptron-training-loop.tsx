"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

// Nice number helpers for grid/tick generation
const niceNumber = (range: number, round: boolean) => {
  if (range === 0) return 0;
  const exponent = Math.floor(Math.log10(Math.abs(range)));
  const fraction = Math.abs(range) / Math.pow(10, exponent);
  let niceFraction;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return Math.sign(range) * niceFraction * Math.pow(10, exponent);
};

const generateTicks = (min: number, max: number, desiredCount = 5) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const span = max - min;
  const niceSpan = niceNumber(span, false);
  const step = niceNumber(niceSpan / Math.max(desiredCount - 1, 1), true) || 1;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];

  for (let tick = niceMin; tick <= niceMax + step / 2; tick += step) {
    ticks.push(parseFloat((Math.abs(tick) < 1e-6 ? 0 : tick).toFixed(5)));
  }

  return ticks;
};

const formatTick = (value: number) => {
  const abs = Math.abs(value);
  const decimals = abs < 10 ? 1 : abs < 100 ? 0 : 0;
  const rounded = Number(value.toFixed(decimals));
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(decimals);
};

interface DataPoint {
  x: number;
  y: number;
  label: 'cat' | 'dog';
  id: string;
}

interface PerceptronTrainingLoopProps {
  config?: {
    dataset?: string;
    showSteps?: boolean;
    animateLineAdjustment?: boolean;
    highlightCurrentPoint?: boolean;
    showErrorCount?: boolean;
    showErrorRate?: boolean;
    speed?: 'slow' | 'normal' | 'fast' | 'adjustable';
    showLineEvolution?: boolean;
    compareToModernMethods?: boolean;
  };
}

const PerceptronTrainingLoop: React.FC<PerceptronTrainingLoopProps> = ({
  config = {
    dataset: "cats_vs_dogs",
    showSteps: true,
    animateLineAdjustment: true,
    highlightCurrentPoint: true,
    showErrorCount: true,
    showErrorRate: false,
    speed: "adjustable",
    showLineEvolution: false,
    compareToModernMethods: false
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Animation states
  const [visiblePoints, setVisiblePoints] = useState<number>(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [dataGeneration, setDataGeneration] = useState(0);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(
    config.speed === 'adjustable' ? 'normal' : (config.speed as 'slow' | 'normal' | 'fast') || 'normal'
  );
  const [isPaused, setIsPaused] = useState(false);
  const [autoRestart, setAutoRestart] = useState(true);
  const [epochCount, setEpochCount] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);

  // Refs for cleanup
  const trainingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Perceptron state
  const [currentWeights, setCurrentWeights] = useState<{ a: number; b: number; c: number } | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<Array<{ a: number; b: number; c: number; error: number; errorRate: number }>>([]);
  const [currentTrainingPoint, setCurrentTrainingPoint] = useState<number>(-1);
  const [currentError, setCurrentError] = useState<number>(0);
  const [currentErrorRate, setCurrentErrorRate] = useState<number>(1);

  // Speed multipliers
  const speedMultipliers: Record<'slow' | 'normal' | 'fast', number> = {
    slow: 1.5,
    normal: 1,
    fast: 0.3
  };

  const currentSpeedMultiplier = speedMultipliers[speed];

  // Stable SVG ids per component instance to avoid DOM collisions between multiple visualizations
  const idBaseRef = useRef<string | undefined>(undefined);
  if (!idBaseRef.current) {
    const globalCrypto = typeof globalThis !== 'undefined' && 'crypto' in globalThis
      ? (globalThis as typeof globalThis & { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
    const randomId = globalCrypto && typeof globalCrypto.randomUUID === 'function'
      ? globalCrypto.randomUUID()
      : Math.random().toString(36).slice(2);
    idBaseRef.current = `ptl-${randomId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  }

  const svgIds = useMemo(() => ({
    glow: `${idBaseRef.current}-glow`,
    catGradient: `${idBaseRef.current}-catGradient`,
    dogGradient: `${idBaseRef.current}-dogGradient`,
    clipPath: `${idBaseRef.current}-chartClip`
  }), []);

  // True separating line
  const trueLine = useMemo(() => {
    const variation = Math.sin(dataGeneration * 1.7) * 0.2;
    // Adjust line equation to ensure better data positioning
    const a = 25 + variation * 5;  // Slightly less steep
    const b = 1;
    const c = -800 + variation * 50;  // Shift line to ensure positive y values
    return { a, b, c };
  }, [dataGeneration]);

  // Generate linearly separable data
  const dataPoints = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const { a, b, c } = trueLine;

    if (Math.abs(b) < 1e-6) return points;

    const seed = dataGeneration * 1000;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    const pointsPerClass = 20; // Slightly fewer points for cleaner visualization
    const minMargin = 50;
    const catXRange = { min: 3, max: 7 };    // cats: 3-7 kg
    const dogXRange = { min: 15, max: 35 };  // dogs: 15-35 kg
    const catYOffsetRange = 200;  // Reduced range for more realistic clustering
    const dogYOffsetRange = 150;  // Smaller range to keep dogs above minimum

    for (let i = 0; i < pointsPerClass; i++) {
      // Generate cat data (lighter weight, higher frequency)
      const catX = catXRange.min + seededRandom(i * 4) * (catXRange.max - catXRange.min);
      const boundaryCatY = -(a * catX + c) / b;
      // Cats: typically 700-1500 Hz meows, ensure they're above the line
      const catY = Math.min(1500, boundaryCatY + minMargin + seededRandom(i * 4 + 2) * catYOffsetRange + 200);

      points.push({
        x: catX,
        y: Math.max(700, catY),  // Ensure minimum cat frequency
        label: 'cat',
        id: `cat-${i}-${dataGeneration}`
      });

      // Generate dog data (heavier weight, lower frequency)
      const dogX = dogXRange.min + seededRandom(i * 4 + 100) * (dogXRange.max - dogXRange.min);
      const boundaryDogY = -(a * dogX + c) / b;
      // Dogs: typically 100-500 Hz barks, ensure they're below the line
      const dogY = Math.max(100, Math.min(500, boundaryDogY - minMargin - seededRandom(i * 4 + 102) * dogYOffsetRange));

      points.push({
        x: dogX,
        y: dogY,
        label: 'dog',
        id: `dog-${i}-${dataGeneration}`
      });
    }

    return points;
  }, [trueLine, dataGeneration]);

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        catColor: "#e11d48",
        dogColor: "#3b82f6",
        lineColor: "#059669",
        trainingLineColor: "#f59e0b",
        regionCat: "rgba(225, 29, 72, 0.1)",
        regionDog: "rgba(59, 130, 246, 0.1)",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        borderColor: "#e2e8f0",
        gridColor: "#f1f5f9",
        accent: "#f59e0b",
        errorColor: "#ef4444"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      catColor: "#f43f5e",
      dogColor: "#60a5fa",
      lineColor: "#34d399",
      trainingLineColor: "#fbbf24",
      regionCat: "rgba(244, 63, 94, 0.15)",
      regionDog: "rgba(96, 165, 250, 0.15)",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      borderColor: "#404040",
      gridColor: "#262626",
      accent: "#fbbf24",
      errorColor: "#f87171"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      catColor: "#e11d48",
      dogColor: "#3b82f6",
      lineColor: "#059669",
      trainingLineColor: "#f59e0b",
      regionCat: "rgba(225, 29, 72, 0.1)",
      regionDog: "rgba(59, 130, 246, 0.1)",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      borderColor: "#e2e8f0",
      gridColor: "#f1f5f9",
      accent: "#f59e0b",
      errorColor: "#ef4444"
    };
  }, [isDark, mounted]);

  // Chart dimensions and scales
  const chartWidth = 600;
  const chartHeight = 360;
  const padding = 40;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    if (!dataPoints.length) {
      return { xMin: 0, xMax: 45, yMin: 0, yMax: 1600 };
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (const point of dataPoints) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const paddingFactor = 0.15;

    return {
      xMin: minX - rangeX * paddingFactor,
      xMax: maxX + rangeX * paddingFactor,
      yMin: Math.max(0, minY - rangeY * paddingFactor),
      yMax: maxY + rangeY * paddingFactor
    };
  }, [dataPoints]);

  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * innerWidth;
  const scaleY = (y: number) => chartHeight - padding - ((y - yMin) / (yMax - yMin)) * innerHeight;

  const xTicks = useMemo(() => generateTicks(xMin, xMax, 6), [xMin, xMax]);
  const yTicks = useMemo(() => generateTicks(yMin, yMax, 6), [yMin, yMax]);

  // Animate points appearing
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    for (let i = 0; i <= dataPoints.length; i++) {
      const timeout = setTimeout(() => {
        setVisiblePoints(i);
      }, i * 20);
      timeouts.push(timeout);
    }
    return () => timeouts.forEach(clearTimeout);
  }, [dataPoints]);

  // Stop training function
  const stopTraining = useCallback(() => {
    trainingTimeoutsRef.current.forEach(clearTimeout);
    trainingTimeoutsRef.current = [];
    setIsTraining(false);
    setCurrentTrainingPoint(-1);
    setIsPaused(false);
  }, []);

  // Training algorithm
  const startTraining = useCallback(() => {
    if (isTraining || visiblePoints < dataPoints.length) return;

    trainingTimeoutsRef.current.forEach(clearTimeout);
    trainingTimeoutsRef.current = [];

    setIsTraining(true);
    setTrainingStep(0);
    setTrainingHistory([]);
    setCurrentTrainingPoint(-1);
    setEpochCount(0);
    setTotalIterations(0);
    setCurrentError(dataPoints.length);
    setCurrentErrorRate(1);

    const totals = dataPoints.reduce(
      (acc, point) => {
        acc.sumX += point.x;
        acc.sumY += point.y;
        acc.sumX2 += point.x * point.x;
        acc.sumY2 += point.y * point.y;
        return acc;
      },
      { sumX: 0, sumY: 0, sumX2: 0, sumY2: 0 }
    );

    const pointCount = dataPoints.length;
    const meanX = totals.sumX / pointCount;
    const meanY = totals.sumY / pointCount;
    const stdX = Math.sqrt(Math.max(totals.sumX2 / pointCount - meanX * meanX, 1));
    const stdY = Math.sqrt(Math.max(totals.sumY2 / pointCount - meanY * meanY, 1));

    const trainingSet = dataPoints.map((point, index) => ({
      ...point,
      normalizedX: (point.x - meanX) / stdX,
      normalizedY: (point.y - meanY) / stdY,
      originalIndex: index
    }));

    const denormalizeWeights = (normalizedWeights: { a: number; b: number; c: number }) => {
      const safeStdX = Math.max(stdX, 0.1);
      const safeStdY = Math.max(stdY, 10);
      const actualA = normalizedWeights.a / safeStdX;
      const actualB = normalizedWeights.b / safeStdY;
      const actualC = normalizedWeights.c - (normalizedWeights.a * meanX) / safeStdX - (normalizedWeights.b * meanY) / safeStdY;

      if (!Number.isFinite(actualA) || !Number.isFinite(actualB) || !Number.isFinite(actualC) ||
          Math.abs(actualA) > 1000 || Math.abs(actualB) > 1000 || Math.abs(actualC) > 10000) {
        const variation = (Math.random() - 0.5) * 0.2;
        return {
          a: trueLine.a * (1 + variation),
          b: trueLine.b,
          c: trueLine.c * (1 + variation)
        };
      }

      return { a: actualA, b: actualB, c: actualC };
    };

    const weights = {
      a: Math.random() * 2 - 1,
      b: Math.random() * 2 - 1,
      c: Math.random() * 2 - 1
    };

    const learningRate = 0.1;
    const maxEpochs = 30;
    let epoch = 0;
    let converged = false;
    let pointIndex = 0;
    let lastEpochError = -1;

    const shuffledPoints = [...trainingSet].sort(() => Math.random() - 0.5);

    setCurrentWeights(denormalizeWeights(weights));

    const trainSinglePoint = () => {
      if (isPaused) {
        const timeoutId = setTimeout(trainSinglePoint, 100);
        trainingTimeoutsRef.current.push(timeoutId);
        return;
      }

      if (epoch >= maxEpochs || converged) {
        const finalWeights = denormalizeWeights(weights);
        setCurrentWeights(finalWeights);
        setIsTraining(false);
        setCurrentTrainingPoint(-1);

        if (autoRestart && !converged) {
          // Restart training with new random weights after a delay
          setTimeout(() => {
            if (autoRestart) {
              startTraining();
            }
          }, 2000 * currentSpeedMultiplier);
        } else if (autoRestart && converged) {
          // Generate new data and restart after a delay
          setTimeout(() => {
            if (autoRestart) {
              setDataGeneration(prev => prev + 1);
              setCurrentWeights(null);
              setTrainingHistory([]);
              setVisiblePoints(0);
            }
          }, 3000 * currentSpeedMultiplier);
        }
        return;
      }

      if (pointIndex >= shuffledPoints.length) {
        pointIndex = 0;
        epoch++;
        setEpochCount(epoch);

        if (lastEpochError === 0) {
          converged = true;
          trainSinglePoint();
          return;
        }

        shuffledPoints.sort(() => Math.random() - 0.5);
        setTrainingStep(epoch);
      }

      const point = shuffledPoints[pointIndex];
      setCurrentTrainingPoint(point.originalIndex);
      setTotalIterations(prev => prev + 1);

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

        const errorRate = dataPoints.length > 0 ? epochErrors / dataPoints.length : 0;
        setCurrentError(epochErrors);
        setCurrentErrorRate(errorRate);
        const actualWeights = denormalizeWeights(weights);
        setTrainingHistory(prev => [...prev, { ...actualWeights, error: epochErrors, errorRate }]);
        lastEpochError = epochErrors;

        if (epochErrors === 0) {
          converged = true;
        }
      }

      pointIndex++;

      const delay = weightChanged ? 300 * currentSpeedMultiplier : 100 * currentSpeedMultiplier;
      const timeoutId = setTimeout(trainSinglePoint, delay);
      trainingTimeoutsRef.current.push(timeoutId);
    };

    const initialTimeoutId = setTimeout(trainSinglePoint, 500);
    trainingTimeoutsRef.current.push(initialTimeoutId);
  }, [isTraining, dataPoints, visiblePoints, currentSpeedMultiplier, autoRestart, isPaused, trueLine]);

  // Auto-start training when data is ready
  useEffect(() => {
    if (visiblePoints === dataPoints.length && dataPoints.length > 0 && !isTraining && !currentWeights && autoRestart) {
      const timeout = setTimeout(() => {
        startTraining();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [visiblePoints, dataPoints, isTraining, currentWeights, startTraining, autoRestart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      trainingTimeoutsRef.current.forEach(clearTimeout);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Get line points for SVG with robust clipping (handles corner intersections)
  const getLinePoints = (lineParams: { a: number; b: number; c: number }) => {
    const { a, b, c } = lineParams;

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      return {
        x1: scaleX(xMin),
        y1: scaleY((yMin + yMax) / 2),
        x2: scaleX(xMax),
        y2: scaleY((yMin + yMax) / 2)
      };
    }

    if (Math.abs(b) < 0.001) {
      const x = -c / a;
      const clampedX = Math.max(xMin, Math.min(xMax, x));
      return {
        x1: scaleX(clampedX),
        y1: scaleY(yMin),
        x2: scaleX(clampedX),
        y2: scaleY(yMax)
      };
    }

    const intersections: Array<{ x: number; y: number }> = [];
    const addPoint = (pt: { x: number; y: number }) => {
      const eps = 1e-6;
      for (const p of intersections) {
        if (Math.abs(p.x - pt.x) < eps && Math.abs(p.y - pt.y) < eps) return;
      }
      intersections.push(pt);
    };

    const yAtXMin = -(a * xMin + c) / b;
    if (Number.isFinite(yAtXMin) && yAtXMin >= yMin && yAtXMin <= yMax) addPoint({ x: xMin, y: yAtXMin });

    const yAtXMax = -(a * xMax + c) / b;
    if (Number.isFinite(yAtXMax) && yAtXMax >= yMin && yAtXMax <= yMax) addPoint({ x: xMax, y: yAtXMax });

    if (Math.abs(a) > 0.001) {
      const xAtYMin = -(b * yMin + c) / a;
      if (Number.isFinite(xAtYMin) && xAtYMin >= xMin && xAtYMin <= xMax) addPoint({ x: xAtYMin, y: yMin });

      const xAtYMax = -(b * yMax + c) / a;
      if (Number.isFinite(xAtYMax) && xAtYMax >= xMin && xAtYMax <= xMax) addPoint({ x: xAtYMax, y: yMax });
    }

    if (intersections.length >= 2) {
      // Choose the farthest two points to avoid near-zero-length segments
      let p1 = intersections[0];
      let p2 = intersections[1];
      let maxD = -1;
      for (let i = 0; i < intersections.length; i++) {
        for (let j = i + 1; j < intersections.length; j++) {
          const dx = intersections[i].x - intersections[j].x;
          const dy = intersections[i].y - intersections[j].y;
          const d = dx * dx + dy * dy;
          if (d > maxD) { maxD = d; p1 = intersections[i]; p2 = intersections[j]; }
        }
      }
      return {
        x1: scaleX(p1.x),
        y1: scaleY(p1.y),
        x2: scaleX(p2.x),
        y2: scaleY(p2.y)
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

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        margin: '2rem 0',
        height: '500px',
        background: 'transparent',
      }} />
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: `linear-gradient(135deg, ${colors.bgGradient1} 0%, ${colors.bgGradient2} 100%)`,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    }}>
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ maxWidth: '700px', margin: '0 auto', display: 'block' }}
      >
        <defs>
          <filter id={svgIds.glow}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={svgIds.catGradient} cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.catColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.catColor} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={svgIds.dogGradient} cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.dogColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.dogColor} stopOpacity="0.4" />
          </linearGradient>
          <clipPath id={svgIds.clipPath}>
            <rect x={padding} y={padding} width={innerWidth} height={innerHeight} />
          </clipPath>
        </defs>

        {/* Grid */}
        {xTicks.filter(tick => tick >= xMin && tick <= xMax).map(tick => (
          <line
            key={`vgrid-${tick}`}
            x1={scaleX(tick)}
            y1={padding}
            x2={scaleX(tick)}
            y2={chartHeight - padding}
            stroke={colors.gridColor}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {yTicks.filter(tick => tick >= yMin && tick <= yMax).map(tick => (
          <line
            key={`hgrid-${tick}`}
            x1={padding}
            y1={scaleY(tick)}
            x2={chartWidth - padding}
            y2={scaleY(tick)}
            stroke={colors.gridColor}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        <rect
          x={padding}
          y={padding}
          width={innerWidth}
          height={innerHeight}
          fill="none"
          stroke={colors.borderColor}
          strokeWidth="2"
        />

        <g clipPath={`url(#${svgIds.clipPath})`}>
          {currentWeights && (
            <g>
              {(() => {
                const { x1, y1, x2, y2 } = getLinePoints(currentWeights);
                return (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isTraining ? colors.trainingLineColor : colors.lineColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter={`url(#${svgIds.glow})`}
                    opacity="0.9"
                    style={{
                      transition: config.animateLineAdjustment ? 'all 0.2s ease' : 'none'
                    }}
                  />
                );
              })()}
            </g>
          )}

          {/* Data points - MUST be inside clipPath to prevent bleeding */}
          {dataPoints.slice(0, visiblePoints).map((point, index) => {
          const isCurrentPoint = config.highlightCurrentPoint && isTraining && index === currentTrainingPoint;
          const color = point.label === 'cat' ? colors.catColor : colors.dogColor;
          const radius = isCurrentPoint ? 10 : 6;

          return (
            <g key={point.id}>
              <circle
                cx={scaleX(point.x) + 1}
                cy={scaleY(point.y) + 1}
                r={radius}
                fill="rgba(0,0,0,0.1)"
              />

              <circle
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r={radius}
                fill={point.label === 'cat' ? `url(#${svgIds.catGradient})` : `url(#${svgIds.dogGradient})`}
                stroke={isCurrentPoint ? colors.accent : color}
                strokeWidth={isCurrentPoint ? "3" : "2"}
                filter={isCurrentPoint ? `url(#${svgIds.glow})` : ""}
                style={{
                  transition: 'all 0.2s ease'
                }}
              >
                {isCurrentPoint && (
                  <animate
                    attributeName="r"
                    values={`${radius};${radius + 4};${radius}`}
                    dur="400ms"
                    repeatCount="1"
                  />
                )}
              </circle>

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
        </g>

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 5}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill={colors.textPrimary}
        >
          Body weight (kg)
        </text>

        <text
          x={15}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill={colors.textPrimary}
          transform={`rotate(-90, 15, ${chartHeight / 2})`}
        >
          Vocalization (Hz)
        </text>

        {/* Tick labels */}
        {xTicks.filter(tick => tick >= xMin && tick <= xMax).map(tick => (
          <text
            key={`x-tick-${tick}`}
            x={scaleX(tick)}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            fontSize="11"
            fill={colors.textSecondary}
          >
            {formatTick(tick)}
          </text>
        ))}

        {yTicks.filter(tick => tick >= yMin && tick <= yMax).map(tick => (
          <text
            key={`y-tick-${tick}`}
            x={padding - 10}
            y={scaleY(tick)}
            textAnchor="end"
            dy="0.35em"
            fontSize="11"
            fill={colors.textSecondary}
          >
            {formatTick(tick)}
          </text>
        ))}
      </svg>

      {/* Status display */}
      {config.showSteps && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: isDark ? 'rgba(23, 23, 23, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${colors.borderColor}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {isTraining ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.trainingLineColor,
                    animation: 'pulse 1s infinite'
                  }} />
                  Training in Progress
                </>
              ) : currentWeights ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.lineColor
                  }} />
                  Converged!
                </>
              ) : (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.textSecondary
                  }} />
                  Initializing...
                </>
              )}
            </div>

            {/* Speed controls */}
            {config.speed === 'adjustable' && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>Speed:</span>
                {(['slow', 'normal', 'fast'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: speed === s ? colors.accent : 'transparent',
                      color: speed === s ? 'white' : colors.textPrimary,
                      border: `1px solid ${speed === s ? colors.accent : colors.borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metrics display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: config.showErrorRate ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                Epoch
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary }}>
                {epochCount}
              </div>
            </div>

            {config.showErrorCount && (
              <div>
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                  Errors
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: currentError === 0 ? colors.lineColor : colors.errorColor
                }}>
                  {currentError}
                </div>
              </div>
            )}

            {config.showErrorRate && (
              <div>
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                  Error Rate
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: currentErrorRate === 0 ? colors.lineColor : colors.errorColor
                }}>
                  {(currentErrorRate * 100).toFixed(1)}%
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                Iterations
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary }}>
                {totalIterations}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                Accuracy
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.textPrimary
              }}>
                {dataPoints.length ? Math.round(((dataPoints.length - currentError) / dataPoints.length) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Current weights */}
          {currentWeights && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: colors.textPrimary,
              textAlign: 'center'
            }}>
              {currentWeights.a.toFixed(2)}x + {currentWeights.b.toFixed(2)}y + {currentWeights.c.toFixed(2)} = 0
            </div>
          )}

          {/* Control buttons */}
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {isTraining && (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: colors.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>

                <button
                  onClick={stopTraining}
                  style={{
                    padding: '0.5rem 1rem',
                    background: colors.errorColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ⏹️ Stop
                </button>
              </>
            )}

            {!isTraining && (
              <button
                onClick={startTraining}
                disabled={dataPoints.length === 0 || visiblePoints < dataPoints.length}
                style={{
                  padding: '0.5rem 1rem',
                  background: dataPoints.length === 0 || visiblePoints < dataPoints.length
                    ? colors.borderColor
                    : colors.lineColor,
                  color: dataPoints.length === 0 || visiblePoints < dataPoints.length
                    ? colors.textSecondary
                    : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: dataPoints.length === 0 || visiblePoints < dataPoints.length
                    ? 'not-allowed'
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ▶️ Start Training
              </button>
            )}

            <button
              onClick={() => {
                setAutoRestart(!autoRestart);
                if (!autoRestart && !isTraining && currentWeights) {
                  startTraining();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                background: autoRestart ? colors.lineColor : colors.borderColor,
                color: autoRestart ? 'white' : colors.textPrimary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {autoRestart ? '🔁 Auto-loop ON' : '🔁 Auto-loop OFF'}
            </button>

            <button
              onClick={() => {
                trainingTimeoutsRef.current.forEach(clearTimeout);
                setDataGeneration(prev => prev + 1);
                setCurrentWeights(null);
                setTrainingHistory([]);
                setIsTraining(false);
                setVisiblePoints(0);
                setCurrentTrainingPoint(-1);
                setEpochCount(0);
                setTotalIterations(0);
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: colors.textPrimary,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🎲 New Data
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default PerceptronTrainingLoop;
