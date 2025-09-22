"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

// Nice number helpers for grid/tick generation on dynamic scales.
const niceNumber = (range: number, round: boolean) => {
  if (range === 0) return 0;

  const exponent = Math.floor(Math.log10(Math.abs(range)));
  const fraction = Math.abs(range) / Math.pow(10, exponent);
  let niceFraction;

  if (round) {
    if (fraction < 1.5) {
      niceFraction = 1;
    } else if (fraction < 3) {
      niceFraction = 2;
    } else if (fraction < 7) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
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
    xAxis?: string;
    yAxis?: string;
    showSeparatingLine?: boolean;
    showTrueLine?: boolean;
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

const PerceptronTrainingLoop: React.FC<PerceptronTrainingLoopProps> = ({
  config = {
    dataset: "cats_vs_dogs",
    xAxis: "Body weight (kg)",
    yAxis: "Vocalization frequency (Hz)",
    showSeparatingLine: false,
    showTrueLine: false,
    animateDataPoints: true,
    pointAppearanceMs: 25,  // 4x faster (was 100ms)
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
    xAxis = "Body weight (kg)",
    yAxis = "Vocalization frequency (Hz)",
    showSeparatingLine = false,
    showTrueLine = false,
    animateDataPoints = true,
    pointAppearanceMs = 25,  // 4x faster
    showLegend = true,
    interactive = false,
    animateLineDrawing = false,
    highlightRegions = false,
    regionLabels = ["Team Dog 🐕", "Team Cat 🐈"]
  } = config;

  const dogRegionLabel = regionLabels?.[0] ?? "Dogs (Heavier, bark low)";
  const catRegionLabel = regionLabels?.[1] ?? "Cats (Lighter, meow high)";

  // Animation states
  const [visiblePoints, setVisiblePoints] = useState<number>(0);
  const [showLine, setShowLine] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [dataGeneration, setDataGeneration] = useState(0);
  const [hasTrainedForCurrentData, setHasTrainedForCurrentData] = useState(false);

  // Ref to store timeout IDs for cleanup
  const trainingTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);

  // Perceptron training state - initialize with random weights
  const [currentWeights, setCurrentWeights] = useState<{ a: number; b: number; c: number } | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<Array<{ a: number; b: number; c: number; error: number }>>([]);
  const [currentTrainingPoint, setCurrentTrainingPoint] = useState<number>(-1);

  // Stable SVG ids per component instance to avoid DOM collisions between multiple visualizations.
  const idBaseRef = useRef<string | undefined>(undefined);
  if (!idBaseRef.current) {
    const globalCrypto = typeof globalThis !== 'undefined' && 'crypto' in globalThis
      ? (globalThis as typeof globalThis & { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
    const randomId = globalCrypto && typeof globalCrypto.randomUUID === 'function'
      ? globalCrypto.randomUUID()
      : Math.random().toString(36).slice(2);
    idBaseRef.current = `lsdv-${randomId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  }

  const svgIds = useMemo(() => ({
    glow: `${idBaseRef.current}-glow`,
    catGradient: `${idBaseRef.current}-catGradient`,
    dogGradient: `${idBaseRef.current}-dogGradient`,
    clipPath: `${idBaseRef.current}-chartClip`
  }), []);

  // True separating line (ground truth) - changes when new data is generated
  const trueLine = useMemo(() => {
    // Create deterministic but varying line based on dataGeneration
    const variation = Math.sin(dataGeneration * 1.7) * 0.2;
    // Line equation: 30x + y - 600 = 0
    // This gives y = -30x + 600, so cats (light, high freq) are above, dogs (heavy, low freq) are below
    const a = 30 + variation * 5;    // coefficient for x (body weight)
    const b = 1;                     // coefficient for y (vocalization freq)
    const c = -600 + variation * 50; // constant term adjusted for scale

    return { a, b, c };
  }, [dataGeneration]);

  // Initialize with random weights that are visible but wrong
  const getRandomInitialWeights = useCallback(() => {
    // Start with random perturbation of the true line
    // This ensures the line is visible but clearly incorrect
    const angleVariation = (Math.random() - 0.5) * 30;  // Rotate the line ±15 degrees worth
    const positionVariation = (Math.random() - 0.5) * 600;  // Move the line up/down

    // Apply rotation-like effect by varying both a and b
    const randomA = trueLine.a + angleVariation;
    const randomB = trueLine.b + (Math.random() - 0.5) * 2;  // More variation for angle change
    const randomC = trueLine.c + positionVariation;

    return { a: randomA, b: randomB, c: randomC };
  }, [trueLine]);

  // Generate linearly separable data based on the true line
  const dataPoints = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const { a, b, c } = trueLine;

    if (Math.abs(b) < 1e-6) {
      return points;
    }

    const seed = dataGeneration * 1000;
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    const pointsPerClass = 25;
    const minMargin = 50;
    const catXRange = { min: 3, max: 7 };    // cats typically 3-7 kg
    const dogXRange = { min: 15, max: 35 };  // dogs typically 15-35 kg
    const catYOffsetRange = 300;  // meows higher frequency
    const dogYOffsetRange = 300;  // barks lower frequency

    for (let i = 0; i < pointsPerClass; i++) {
      // Cats: lighter weight (3-7 kg), higher frequency meows (700-1500 Hz)
      const catX = catXRange.min + seededRandom(i * 4) * (catXRange.max - catXRange.min);
      const boundaryCatY = -(a * catX + c) / b;  // Line at this x position
      // Cats should be ABOVE the line (higher frequency)
      const catY = boundaryCatY + minMargin + seededRandom(i * 4 + 2) * catYOffsetRange + 400;

      points.push({
        x: catX,
        y: catY,
        label: 'cat',
        id: `cat-${i}-${dataGeneration}`
      });

      // Dogs: heavier weight (15-35 kg), lower frequency barks (100-500 Hz)
      const dogX = dogXRange.min + seededRandom(i * 4 + 100) * (dogXRange.max - dogXRange.min);
      const boundaryDogY = -(a * dogX + c) / b;  // Line at this x position
      // Dogs should be BELOW the line (lower frequency)
      const dogY = boundaryDogY - minMargin - seededRandom(i * 4 + 102) * dogYOffsetRange;

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
    // Don't set to null - generate new random weights instead
    // This will be set after trueLine updates
    setTrainingHistory([]);
    setIsTraining(false);
    setVisiblePoints(0);
    setCurrentTrainingPoint(-1);
    setHasTrainedForCurrentData(false);  // Reset training flag for new data
    // Don't reset lastLineRef here - keep it as fallback
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
        gridColor: "#f1f5f9",
        accent: "#f59e0b"
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
      gridColor: "#262626",
      accent: "#fbbf24"
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
      gridColor: "#f1f5f9",
      accent: "#f59e0b"
    };
  }, [isDark, mounted]);

  // Chart dimensions and scales
  const chartWidth = 600;
  const chartHeight = 360;
  const padding = 40;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;

  const defaultBounds = useMemo(
    () => ({ xMin: 0, xMax: 45, yMin: 0, yMax: 1600 }),
    []
  );

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    if (!dataPoints.length) {
      return defaultBounds;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const point of dataPoints) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const paddingFactor = 0.15;
    const padX = rangeX * paddingFactor;
    const padY = rangeY * paddingFactor;

    const computedMinX = minX - padX;
    const computedMaxX = maxX + padX;
    const computedMinY = minY >= 0 ? Math.max(0, minY - padY) : minY - padY;
    const computedMaxY = maxY + padY;

    return {
      xMin: Number.isFinite(computedMinX) ? computedMinX : defaultBounds.xMin,
      xMax: Number.isFinite(computedMaxX) ? computedMaxX : defaultBounds.xMax,
      yMin: Number.isFinite(computedMinY) ? computedMinY : defaultBounds.yMin,
      yMax: Number.isFinite(computedMaxY) ? computedMaxY : defaultBounds.yMax
    };
  }, [dataPoints, defaultBounds]);

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  // Scale functions with safety checks
  const scaleX = (x: number) => {
    if (!Number.isFinite(x)) return padding;
    const result = padding + ((x - xMin) / xRange) * innerWidth;
    return Number.isFinite(result) ? result : padding;
  };
  const scaleY = (y: number) => {
    if (!Number.isFinite(y)) return chartHeight - padding;
    const result = chartHeight - padding - ((y - yMin) / yRange) * innerHeight;
    return Number.isFinite(result) ? result : chartHeight - padding;
  };

  const xTicks = useMemo(() => generateTicks(xMin, xMax, 6), [xMin, xMax]);
  const yTicks = useMemo(() => generateTicks(yMin, yMax, 6), [yMin, yMax]);


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
    if (interactive) {
      setShowLine(false);
      return;
    }

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
  }, [showSeparatingLine, animateLineDrawing, interactive]);

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

    // Ensure all points are visible before training
    if (visiblePoints < dataPoints.length) {
      return;
    }

    trainingTimeoutsRef.current.forEach(clearTimeout);
    trainingTimeoutsRef.current = [];

    setIsTraining(true);
    setTrainingStep(0);
    setTrainingHistory([]);
    setCurrentTrainingPoint(-1);

    if (dataPoints.length === 0) {
      setIsTraining(false);
      return;
    }

    // Use the current weights as starting point (they're already random)
    // Clone the weights so we can modify them
    const weights = currentWeights ? { ...currentWeights } : getRandomInitialWeights();

    // Use a very small learning rate since we're working with raw values
    const learningRate = 0.01;  // Even smaller for better stability
    const maxEpochs = 100;
    let epoch = 0;
    const converged = false;
    let pointIndex = 0;

    const shuffledPoints = [...dataPoints].sort(() => Math.random() - 0.5);

    const finalizeTraining = () => {
      trainingTimeoutsRef.current.forEach(clearTimeout);
      trainingTimeoutsRef.current = [];
      setIsTraining(false);
      setHasTrainedForCurrentData(true);  // Mark that we've completed training for this data
      // Don't change weights at all - just change the color by setting isTraining to false
      setCurrentTrainingPoint(-1);
    };

    // Set initial weights immediately to ensure line is visible
    setCurrentWeights(weights);

    // Store as fallback
    const linePoints = getLinePoints(weights);
    if (linePoints && Number.isFinite(linePoints.x1)) {
      lastLineRef.current = linePoints;
    }

    const trainSinglePoint = () => {
      if (epoch >= maxEpochs || converged) {
        finalizeTraining();
        return;
      }

      if (pointIndex >= shuffledPoints.length) {
        pointIndex = 0;
        epoch++;

        // Ensure display is synced at epoch boundary
        setCurrentWeights({ ...weights });

        // Convergence is now checked at the end of each epoch
        // No need to check lastEpochError here

        shuffledPoints.sort(() => Math.random() - 0.5);
        setTrainingStep(epoch);
      }

      const point = shuffledPoints[pointIndex];
      setCurrentTrainingPoint(pointIndex);

      // Use raw values directly
      const activation = weights.a * point.x + weights.b * point.y + weights.c;
      const prediction = activation >= 0 ? 1 : -1;

      // Cats (high freq) should be positive side, dogs (low freq) negative
      // Based on the true line, if a*x + b*y + c > 0, it's above the line (cat)
      const trueLabel = point.label === 'cat' ? 1 : -1;

      let weightChanged = false;
      if (prediction !== trueLabel) {
        weightChanged = true;

        // Scale the update by the learning rate
        weights.a += learningRate * trueLabel * point.x;
        weights.b += learningRate * trueLabel * point.y;
        weights.c += learningRate * trueLabel;

        // Update display when weights change
        setCurrentWeights({ ...weights });
      }

      if (pointIndex === shuffledPoints.length - 1) {
        let epochErrors = 0;
        for (const p of shuffledPoints) {
          const act = weights.a * p.x + weights.b * p.y + weights.c;
          const pred = act >= 0 ? 1 : -1;
          const labelVal = p.label === 'cat' ? 1 : -1;
          if (pred !== labelVal) epochErrors++;
        }

        setTrainingHistory(prev => [...prev, { ...weights, error: epochErrors }]);

        if (epochErrors === 0) {
          // We've converged! Sync weights and stop immediately
          setCurrentWeights({ ...weights });
          // Call finalize immediately instead of waiting for next iteration
          setTimeout(() => finalizeTraining(), 100);
          return;  // Stop processing
        }
      }

      pointIndex++;

      const timeoutId = setTimeout(trainSinglePoint, weightChanged ? 200 : 50);
      trainingTimeoutsRef.current.push(timeoutId);
    };

    const initialTimeoutId = setTimeout(trainSinglePoint, 500);
    trainingTimeoutsRef.current.push(initialTimeoutId);
  }, [isTraining, dataPoints, visiblePoints, trueLine]);

  // Calculate line points for SVG with robust clipping (handles corner cases)
  const getLinePoints = (lineParams?: { a: number; b: number; c: number }) => {
    const line = lineParams || trueLine;
    const { a, b, c } = line;

    // Validate coefficients to prevent NaN/Infinity
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      // Return a default horizontal line in the middle if coefficients are invalid
      return {
        x1: scaleX(xMin),
        y1: scaleY((yMin + yMax) / 2),
        x2: scaleX(xMax),
        y2: scaleY((yMin + yMax) / 2)
      };
    }

    // From Ax + By + C = 0, solve for y: y = -(Ax + C)/B
    if (Math.abs(b) < 0.001) {
      // Nearly vertical line
      const x = -c / a;
      const clampedX = Math.max(xMin, Math.min(xMax, x));
      return {
        x1: scaleX(clampedX),
        y1: scaleY(yMin),
        x2: scaleX(clampedX),
        y2: scaleY(yMax)
      };
    }

    // Calculate intersections with all four boundaries and dedupe
    const intersections: Array<{ x: number; y: number }> = [];
    const addPoint = (pt: { x: number; y: number }) => {
      const eps = 1e-6;
      for (const p of intersections) {
        if (Math.abs(p.x - pt.x) < eps && Math.abs(p.y - pt.y) < eps) return; // duplicate (corner)
      }
      intersections.push(pt);
    };

    // Left edge (x = xMin)
    const yAtXMin = -(a * xMin + c) / b;
    if (Number.isFinite(yAtXMin) && yAtXMin >= yMin && yAtXMin <= yMax) {
      addPoint({ x: xMin, y: yAtXMin });
    }

    // Right edge (x = xMax)
    const yAtXMax = -(a * xMax + c) / b;
    if (Number.isFinite(yAtXMax) && yAtXMax >= yMin && yAtXMax <= yMax) {
      addPoint({ x: xMax, y: yAtXMax });
    }

    // Bottom edge (y = yMin)
    if (Math.abs(a) > 0.001) {
      const xAtYMin = -(b * yMin + c) / a;
      if (Number.isFinite(xAtYMin) && xAtYMin >= xMin && xAtYMin <= xMax) {
        addPoint({ x: xAtYMin, y: yMin });
      }
    }

    // Top edge (y = yMax)
    if (Math.abs(a) > 0.001) {
      const xAtYMax = -(b * yMax + c) / a;
      if (Number.isFinite(xAtYMax) && xAtYMax >= xMin && xAtYMax <= xMax) {
        addPoint({ x: xAtYMax, y: yMax });
      }
    }

    // We need two distinct points; if more, pick the farthest pair
    if (intersections.length >= 2) {
      let p1 = intersections[0];
      let p2 = intersections[1];
      let maxD = -1;
      for (let i = 0; i < intersections.length; i++) {
        for (let j = i + 1; j < intersections.length; j++) {
          const dx = intersections[i].x - intersections[j].x;
          const dy = intersections[i].y - intersections[j].y;
          const d = dx * dx + dy * dy;
          if (d > maxD) {
            maxD = d; p1 = intersections[i]; p2 = intersections[j];
          }
        }
      }
      return {
        x1: scaleX(p1.x),
        y1: scaleY(p1.y),
        x2: scaleX(p2.x),
        y2: scaleY(p2.y)
      };
    }

    // Fallback: just draw from left to right edges
    const y1 = -(a * xMin + c) / b;
    const y2 = -(a * xMax + c) / b;

    // Clamp y values to visible range
    const clampedY1 = Math.max(yMin, Math.min(yMax, y1));
    const clampedY2 = Math.max(yMin, Math.min(yMax, y2));

    return {
      x1: scaleX(xMin),
      y1: scaleY(clampedY1),
      x2: scaleX(xMax),
      y2: scaleY(clampedY2)
    };
  };

  // Keep last valid line segment to avoid zero-length/degenerate frames
  const lastLineRef = React.useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Initialize lastLineRef with trueLine on first render
  useEffect(() => {
    if (!lastLineRef.current && dataPoints.length > 0) {
      const initialLine = getLinePoints(trueLine);
      if (initialLine && Number.isFinite(initialLine.x1)) {
        lastLineRef.current = initialLine;
      }
    }
  }, [trueLine, dataPoints.length]);

  // Initialize or update random weights when data changes
  useEffect(() => {
    if (dataPoints.length > 0 && !isTraining && !hasTrainedForCurrentData) {
      // Generate new random initial weights only for new untrained data
      const newRandomWeights = getRandomInitialWeights();
      setCurrentWeights(newRandomWeights);
    }
  }, [dataPoints, isTraining, hasTrainedForCurrentData, getRandomInitialWeights]);

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
        height={chartHeight + 40}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
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

        {/* Grid lines */}
        {xTicks
          .filter((tick) => tick >= xMin - 1e-6 && tick <= xMax + 1e-6)
          .map((tick) => (
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

        {yTicks
          .filter((tick) => tick >= yMin - 1e-6 && tick <= yMax + 1e-6)
          .map((tick) => (
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
        {highlightRegions && (showLine || currentWeights) && (
          <g clipPath={`url(#${svgIds.clipPath})`}>
            {(() => {
              const lineToUse = currentWeights || trueLine;
              let { x1, y1, x2, y2 } = getLinePoints(lineToUse);

              // Use fallback if line points are invalid
              const segLen = Math.hypot(x2 - x1, y2 - y1);
              if (!Number.isFinite(segLen) || segLen < 2) {
                const fallback = lastLineRef.current || getLinePoints(trueLine);
                x1 = fallback.x1;
                y1 = fallback.y1;
                x2 = fallback.x2;
                y2 = fallback.y2;
              }

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
        )}

        {/* Lines (do not clip to avoid edge-case rendering issues) */}
        <g>
          {/* Render the true line if enabled */}
          {showTrueLine && (() => {
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
                opacity="0.8"
                strokeDasharray="8,4"
                filter={`url(#${svgIds.glow})`}
                style={{
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })()}

          {/* Render the perceptron line */}
          {(() => {
            // Don't show any line if showSeparatingLine is false and we're not interactive/training
            if (!showSeparatingLine && !interactive && !isTraining && !hasTrainedForCurrentData) {
              return null;
            }

            // Always show currentWeights (which are initialized randomly) when interactive or training
            // Only fall back to trueLine if somehow we have no weights
            const lineToRender = currentWeights || trueLine;
            const { x1, y1, x2, y2 } = getLinePoints(lineToRender);

            // Determine style based on state
            // Since we always have currentWeights now, adjust styling
            const strokeColor = isTraining ? "#f59e0b" : colors.lineColor;
            const strokeWidth = isTraining ? "3" : "3";
            const opacity = isTraining ? "0.9" : "0.8";
            const strokeDasharray = "none";  // No dashes since we're showing actual weights

            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                opacity={opacity}
                filter={`url(#${svgIds.glow})`}
                style={{
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })()}
        </g>

        {/* Data points */}
        {dataPoints.slice(0, visiblePoints).map((point, index) => {
          // Skip points with invalid coordinates
          if (point.x === undefined || point.y === undefined ||
              !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
            return null;
          }

          const isCurrentTrainingPoint = isTraining && index === currentTrainingPoint;
          const color = point.label === 'cat' ? colors.catColor : colors.dogColor;
          const radius = isCurrentTrainingPoint ? 9 : 6;

          // Ensure scaled values are valid
          const scaledX = scaleX(point.x);
          const scaledY = scaleY(point.y);

          if (scaledX === undefined || scaledY === undefined ||
              !Number.isFinite(scaledX) || !Number.isFinite(scaledY)) {
            return null;
          }

          return (
            <g key={point.id}>
              {/* Point shadow */}
              <circle
                cx={scaledX + 1}
                cy={scaledY + 1}
                r={radius}
                fill="rgba(0,0,0,0.1)"
              />

              {/* Main point */}
              <circle
                cx={scaledX}
                cy={scaledY}
                r={radius}
                fill={point.label === 'cat' ? `url(#${svgIds.catGradient})` : `url(#${svgIds.dogGradient})`}
                stroke={color}
                strokeWidth="2"
                opacity={animateDataPoints ? 0 : 1}
                filter={isCurrentTrainingPoint ? `url(#${svgIds.glow})` : ""}
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
                x={scaledX}
                y={scaledY}
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
        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight + 5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.textPrimary}
        >
          {xAxis}
        </text>

        <text
          x={20}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill={colors.textPrimary}
          transform={`rotate(-90, 20, ${chartHeight / 2})`}
        >
          {yAxis}
        </text>

        {/* Axis tick labels */}
        {xTicks
          .filter((tick) => tick >= xMin - 1e-6 && tick <= xMax + 1e-6)
          .map((tick) => (
            <text
              key={`x-tick-${tick}`}
              x={scaleX(tick)}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill={colors.textSecondary}
            >
              {formatTick(tick)}
            </text>
          ))}

        {yTicks
          .filter((tick) => tick >= yMin - 1e-6 && tick <= yMax + 1e-6)
          .map((tick) => (
            <text
              key={`y-tick-${tick}`}
              x={padding - 10}
              y={scaleY(tick)}
              textAnchor="end"
              dy="0.35em"
              fontSize="12"
              fill={colors.textSecondary}
            >
              {formatTick(tick)}
            </text>
          ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          marginTop: '1rem',
          padding: '1rem 1.5rem',
          background: isDark
            ? 'rgba(23, 23, 23, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${colors.borderColor}`,
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.catColor}, ${isDark ? '#f87171' : '#dc2626'})`,
              boxShadow: `0 2px 4px ${colors.catColor}40`
            }} />
            <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600', letterSpacing: '0.01em' }}>
              🐱 {catRegionLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.dogColor}, ${isDark ? '#93c5fd' : '#2563eb'})`,
              boxShadow: `0 2px 4px ${colors.dogColor}40`
            }} />
            <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600', letterSpacing: '0.01em' }}>
              🐕 {dogRegionLabel}
            </span>
          </div>
        </div>
      )}

      {/* Interactive controls */}
      {interactive && (
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
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
                padding: '0.875rem 2rem',
                background: isTraining
                  ? colors.borderColor
                  : `linear-gradient(135deg, ${colors.dogColor}, ${isDark ? '#93c5fd' : '#60a5fa'})`,
                color: isTraining ? colors.textSecondary : 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.025em',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                boxShadow: isTraining
                  ? 'none'
                  : `0 4px 14px ${colors.dogColor}33, inset 0 1px 0 rgba(255,255,255,0.2)`
              }}
              onMouseEnter={(e) => {
                if (!isTraining) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${colors.dogColor}44, inset 0 1px 0 rgba(255,255,255,0.2)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isTraining
                  ? 'none'
                  : `0 4px 14px ${colors.dogColor}33, inset 0 1px 0 rgba(255,255,255,0.2)`;
              }}
            >
              🎲 New Data
            </button>

            <button
              onClick={startTraining}
              disabled={isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length}
              style={{
                padding: '0.875rem 2rem',
                background: isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length
                  ? colors.borderColor
                  : `linear-gradient(135deg, ${colors.lineColor}, ${isDark ? '#34d399' : '#10b981'})`,
                color: isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length ? colors.textSecondary : 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.025em',
                cursor: isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                boxShadow: isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length
                  ? 'none'
                  : `0 4px 14px ${colors.lineColor}33, inset 0 1px 0 rgba(255,255,255,0.2)`
              }}
              onMouseEnter={(e) => {
                if (!isTraining && dataPoints.length > 0 && visiblePoints >= dataPoints.length) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${colors.lineColor}44, inset 0 1px 0 rgba(255,255,255,0.2)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isTraining || dataPoints.length === 0 || visiblePoints < dataPoints.length
                  ? 'none'
                  : `0 4px 14px ${colors.lineColor}33, inset 0 1px 0 rgba(255,255,255,0.2)`;
              }}
            >
              {isTraining ? '🧠 Training...' : visiblePoints < dataPoints.length ? '⏳ Loading data...' : '🧠 Train Perceptron'}
            </button>
          </div>

          {/* Combined Training/Results box - Always visible for consistent height */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: hasTrainedForCurrentData && !isTraining
              ? `linear-gradient(135deg,
                ${isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'},
                ${isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.02)'})`
              : isTraining
                ? isDark
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(245, 158, 11, 0.05)'
                : isDark
                  ? 'rgba(23, 23, 23, 0.4)'
                  : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            border: hasTrainedForCurrentData && !isTraining
              ? `2px solid ${colors.lineColor}`
              : isTraining
                ? `2px solid ${colors.accent}`
                : `1px solid ${colors.borderColor}`,
            textAlign: 'center',
            maxWidth: '450px',
            margin: '1.5rem auto 0',
            boxShadow: hasTrainedForCurrentData && !isTraining
              ? `0 8px 32px ${colors.lineColor}15`
              : isTraining
                ? `0 8px 32px ${colors.accent}15`
                : 'none',
            height: '240px',  // Fixed height instead of minHeight
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'  // Prevent content from expanding the box
          }}>
            {isTraining ? (
              // Training in progress
              <>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.accent,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  🔄 Training in Progress
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                      Epoch
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary }}>
                      {trainingStep}
                      <span style={{ fontSize: '14px', fontWeight: '400', color: colors.textSecondary }}>/100</span>
                    </div>
                  </div>

                  {trainingHistory.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                        Errors
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: colors.accent }}>
                        {trainingHistory[trainingHistory.length - 1]?.error || 0}
                      </div>
                    </div>
                  )}
                </div>

                {currentWeights && (
                  <div style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    background: isDark
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(0, 0, 0, 0.05)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: colors.textPrimary,
                    fontWeight: '500'
                  }}>
                    {currentWeights.a.toFixed(2)}x + {currentWeights.b.toFixed(2)}y + {currentWeights.c.toFixed(2)} = 0
                  </div>
                )}

                {currentTrainingPoint >= 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '0',
                    right: '0',
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    Processing: Point {currentTrainingPoint + 1} ({dataPoints[currentTrainingPoint]?.label})
                  </div>
                )}
              </>
            ) : hasTrainedForCurrentData ? (
              // Training completed
              <>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.lineColor,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '20px' }}>✨</span>
                  Perceptron Converged!
                  <span style={{ fontSize: '20px' }}>✨</span>
                </div>

                <div style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  background: isDark
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.7)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  color: colors.textPrimary,
                  fontWeight: '600',
                  letterSpacing: '0.025em'
                }}>
                  {currentWeights ? `${currentWeights.a.toFixed(2)}x + ${currentWeights.b.toFixed(2)}y + ${currentWeights.c.toFixed(2)} = 0` : 'Calculating...'}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                      Epochs
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary }}>
                      {trainingHistory.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                      Accuracy
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: colors.lineColor }}>
                      100%
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Ready to train
              <>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: '0.75rem'
                }}>
                  🧠 Ready to Train
                </div>

                <div style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  background: isDark
                    ? 'rgba(0, 0, 0, 0.2)'
                    : 'rgba(0, 0, 0, 0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Decision boundary equation will appear here
                </div>

                <div style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  lineHeight: '1.5'
                }}>
                  Click &quot;Train Perceptron&quot; to find the optimal<br />
                  decision boundary for this dataset
                </div>
              </>
            )}
          </div>

          {/* Legend for lines */}
          {(showSeparatingLine || currentWeights || showTrueLine) && (
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              padding: '0.75rem 1.25rem',
              background: isDark
                ? 'rgba(23, 23, 23, 0.4)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              fontSize: '13px',
              flexWrap: 'wrap',
              maxWidth: 'fit-content',
              margin: '1rem auto 0'
            }}>
              {showTrueLine && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '24px',
                    height: '3px',
                    background: `linear-gradient(90deg, transparent, ${colors.lineColor}, transparent)`,
                    borderRadius: '2px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      border: `1px dashed ${colors.lineColor}`,
                      borderRadius: '2px'
                    }} />
                  </div>
                  <span style={{ color: colors.textPrimary, fontWeight: '500' }}>True boundary</span>
                </div>
              )}
              {currentWeights && isTraining && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '24px',
                    height: '3px',
                    background: `linear-gradient(90deg, #f59e0b, #fbbf24)`,
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                  }} />
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>Learning...</span>
                </div>
              )}
              {currentWeights && !isTraining && showSeparatingLine && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '24px',
                    height: '3px',
                    background: `linear-gradient(90deg, ${colors.lineColor}, ${isDark ? '#10b981' : '#059669'})`,
                    borderRadius: '2px',
                    boxShadow: `0 2px 4px ${colors.lineColor}33`
                  }} />
                  <span style={{ color: colors.lineColor, fontWeight: '600' }}>Learned boundary</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerceptronTrainingLoop;
