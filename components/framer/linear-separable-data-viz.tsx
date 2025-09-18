"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface Point {
  x: number;
  y: number;
  class: 0 | 1;
  id: string;
  animationDelay: number;
  actualX?: number; // For displaying real values
  actualY?: number;
}

type DatasetType = "cats_vs_dogs" | "email_spam" | "medical_diagnosis" | "custom";

interface DatasetConfig {
  name: string;
  class0Label: string;
  class1Label: string;
  xRange: [number, number];
  yRange: [number, number];
  class0Distribution: { xMean: number; yMean: number; xStd: number; yStd: number };
  class1Distribution: { xMean: number; yMean: number; xStd: number; yStd: number };
}

interface LinearSeparableDataVizProps {
  config?: {
    // Core visualization
    width?: number;
    height?: number;
    pointCount?: number;

    // Dataset configuration
    dataset?: DatasetType;
    xAxis?: string;
    yAxis?: string;

    // Separation line controls
    showSeparatingLine?: boolean;
    showLine?: boolean; // Legacy support
    animateLineDrawing?: boolean;
    lineAnimationMs?: number;

    // Data points
    animateDataPoints?: boolean;
    pointAppearanceMs?: number;

    // Regions and labels
    highlightRegions?: boolean;
    regionLabels?: [string, string];
    showLegend?: boolean;

    // Interactivity
    interactive?: boolean;
    autoSeparate?: boolean;
    animationSpeed?: number;

    // Legacy/additional
    description?: string;
  };
}

const LinearSeparableDataViz: React.FC<LinearSeparableDataVizProps> = ({
  config = {}
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const {
    width = 600,
    height = 400,
    pointCount = 30,
    dataset = "cats_vs_dogs",
    xAxis,
    yAxis,
    showSeparatingLine,
    showLine, // Legacy support
    animateLineDrawing = false,
    lineAnimationMs = 2000,
    animateDataPoints = true,
    pointAppearanceMs = 100,
    highlightRegions = false,
    regionLabels,
    showLegend = true,
    interactive = true,
    autoSeparate = false,
    animationSpeed = 2000,
    description
  } = config;

  // Determine if we should show the line (support both new and legacy props)
  const shouldShowLine = showSeparatingLine ?? showLine ?? true;

  const [points, setPoints] = useState<Point[]>([]);
  const [separationLine, setSeparationLine] = useState({ slope: -0.5, intercept: 0.3 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedPoint, setHighlightedPoint] = useState<string | null>(null);
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(shouldShowLine);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [lineAnimationProgress, setLineAnimationProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<Array<{weights: number[], bias: number, error: boolean}>>([]);

  // Dataset configurations
  const datasetConfigs = useMemo<Record<DatasetType, DatasetConfig>>(() => ({
    cats_vs_dogs: {
      name: "Cats vs Dogs",
      class0Label: "🐈 Cat",
      class1Label: "🐕 Dog",
      xRange: [10, 18],
      yRange: [5, 35],
      class0Distribution: { xMean: 15, yMean: 12, xStd: 1.5, yStd: 3 }, // Cats: more sleep, slower
      class1Distribution: { xMean: 12, yMean: 25, xStd: 1.5, yStd: 4 }  // Dogs: less sleep, faster
    },
    email_spam: {
      name: "Email Classification",
      class0Label: "📧 Legitimate",
      class1Label: "🚫 Spam",
      xRange: [0, 100],
      yRange: [0, 50],
      class0Distribution: { xMean: 20, yMean: 35, xStd: 15, yStd: 8 },
      class1Distribution: { xMean: 70, yMean: 15, xStd: 20, yStd: 10 }
    },
    medical_diagnosis: {
      name: "Medical Diagnosis",
      class0Label: "✅ Healthy",
      class1Label: "⚠️ At Risk",
      xRange: [20, 80],
      yRange: [60, 200],
      class0Distribution: { xMean: 35, yMean: 120, xStd: 8, yStd: 20 },
      class1Distribution: { xMean: 60, yMean: 160, xStd: 12, yStd: 25 }
    },
    custom: {
      name: "Custom Dataset",
      class0Label: "Class 0",
      class1Label: "Class 1",
      xRange: [0, 100],
      yRange: [0, 100],
      class0Distribution: { xMean: 30, yMean: 70, xStd: 15, yStd: 15 },
      class1Distribution: { xMean: 70, yMean: 30, xStd: 15, yStd: 15 }
    }
  }), []);

  const currentDataset = useMemo(() => datasetConfigs[dataset], [datasetConfigs, dataset]);
  const xAxisLabel = xAxis || (dataset === "cats_vs_dogs" ? "Hours of Sleep (per day)" :
                               dataset === "email_spam" ? "Promotional Content %" :
                               dataset === "medical_diagnosis" ? "Age" : "Feature 1");
  const yAxisLabel = yAxis || (dataset === "cats_vs_dogs" ? "Running Speed (mph)" :
                               dataset === "email_spam" ? "Personal Details Count" :
                               dataset === "medical_diagnosis" ? "Blood Pressure" : "Feature 2");

  const finalRegionLabels = regionLabels || [currentDataset.class0Label, currentDataset.class1Label];

  // Color palette matching the neuron animation quality
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        class0: "#ef4444",
        class1: "#3b82f6",
        class0Glow: "rgba(239, 68, 68, 0.3)",
        class1Glow: "rgba(59, 130, 246, 0.3)",
        separationLine: "#10b981",
        separationLineGlow: "rgba(16, 185, 129, 0.4)",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        borderColor: "#e2e8f0",
        controlBg: "rgba(248, 250, 252, 0.95)",
        controlBorder: "#cbd5e1",
        gridLine: "rgba(148, 163, 184, 0.2)",
        correctRegion: "rgba(16, 185, 129, 0.05)",
        incorrectRegion: "rgba(239, 68, 68, 0.05)"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      class0: "#f87171",
      class1: "#60a5fa",
      class0Glow: "rgba(248, 113, 113, 0.4)",
      class1Glow: "rgba(96, 165, 250, 0.4)",
      separationLine: "#34d399",
      separationLineGlow: "rgba(52, 211, 153, 0.5)",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      borderColor: "#404040",
      controlBg: "rgba(23, 23, 23, 0.9)",
      controlBorder: "#525252",
      gridLine: "rgba(64, 64, 64, 0.3)",
      correctRegion: "rgba(52, 211, 153, 0.08)",
      incorrectRegion: "rgba(248, 113, 113, 0.08)"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      class0: "#ef4444",
      class1: "#3b82f6",
      class0Glow: "rgba(239, 68, 68, 0.3)",
      class1Glow: "rgba(59, 130, 246, 0.3)",
      separationLine: "#10b981",
      separationLineGlow: "rgba(16, 185, 129, 0.4)",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      borderColor: "#e2e8f0",
      controlBg: "rgba(248, 250, 252, 0.95)",
      controlBorder: "#cbd5e1",
      gridLine: "rgba(148, 163, 184, 0.2)",
      correctRegion: "rgba(16, 185, 129, 0.05)",
      incorrectRegion: "rgba(239, 68, 68, 0.05)"
    };
  }, [isDark, mounted]);

  // Helper function for normal distribution
  const normalRandom = (mean: number, std: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std + mean;
  };

  // Generate linearly separable data using an explicit half-plane test
  const generateDataset = useCallback(() => {
    const newPoints: Point[] = [];
    const margin = 40;
    const effectiveWidth = width - 2 * margin;
    const effectiveHeight = height - 2 * margin;

    const { xRange, yRange, class0Distribution, class1Distribution } = currentDataset;

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    // Build a separating line using dataset statistics.
    const mean0 = { x: class0Distribution.xMean, y: class0Distribution.yMean };
    const mean1 = { x: class1Distribution.xMean, y: class1Distribution.yMean };
    const midpoint = { x: (mean0.x + mean1.x) / 2, y: (mean0.y + mean1.y) / 2 };

    let angle = Math.random() * Math.PI * 2;
    let A = Math.cos(angle);
    let B = Math.sin(angle);
    let attempts = 0;
    while (Math.abs(B) < 0.25 && attempts < 8) {
      angle = Math.random() * Math.PI * 2;
      A = Math.cos(angle);
      B = Math.sin(angle);
      attempts++;
    }

    let C = -(A * midpoint.x + B * midpoint.y);

    if (A * mean1.x + B * mean1.y + C <= 0) {
      A *= -1;
      B *= -1;
      C *= -1;
    }

    const evaluateLineEquation = (actualX: number, actualY: number) => A * actualX + B * actualY + C;
    const lineNorm = Math.sqrt(A * A + B * B) || 1;
    const rangeDiagonal = Math.sqrt(
      Math.pow(xRange[1] - xRange[0], 2) + Math.pow(yRange[1] - yRange[0], 2)
    );
    const marginDistance = rangeDiagonal * 0.05; // keep a comfortable gap from the boundary
    const requiredValue = marginDistance * lineNorm;

    const ensureSide = (x: number, y: number, shouldBePositive: boolean) => {
      const desiredValue = shouldBePositive ? requiredValue : -requiredValue;
      let px = x;
      let py = y;
      let evaluation = evaluateLineEquation(px, py);

      let attempts = 0;
      while (
        attempts < 3 &&
        (shouldBePositive ? evaluation < desiredValue : evaluation > desiredValue)
      ) {
        const adjustment = (desiredValue - evaluation) / (lineNorm * lineNorm);
        px = clamp(px + A * adjustment, xRange[0], xRange[1]);
        py = clamp(py + B * adjustment, yRange[0], yRange[1]);
        evaluation = evaluateLineEquation(px, py);
        attempts++;
      }

      if (shouldBePositive ? evaluation < desiredValue : evaluation > desiredValue) {
        const base = shouldBePositive ? mean1 : mean0;
        const baseEvaluation = evaluateLineEquation(base.x, base.y);
        const adjustment = (desiredValue - baseEvaluation) / (lineNorm * lineNorm);
        px = clamp(base.x + A * adjustment, xRange[0], xRange[1]);
        py = clamp(base.y + B * adjustment, yRange[0], yRange[1]);
        evaluation = evaluateLineEquation(px, py);
      }

      if (shouldBePositive ? evaluation <= 0 : evaluation >= 0) {
        const finalAdjustment = (desiredValue - evaluation) / (lineNorm * lineNorm);
        px = clamp(px + A * finalAdjustment, xRange[0], xRange[1]);
        py = clamp(py + B * finalAdjustment, yRange[0], yRange[1]);
      }

      return { x: px, y: py };
    };

    const samplePoint = (
      distribution: { xMean: number; yMean: number; xStd: number; yStd: number },
      shouldBePositive: boolean,
      index: number,
      classLabel: 0 | 1
    ) => {
      let px = clamp(normalRandom(distribution.xMean, distribution.xStd), xRange[0], xRange[1]);
      let py = clamp(normalRandom(distribution.yMean, distribution.yStd), yRange[0], yRange[1]);

      let tries = 0;
      while (tries < 25) {
        const value = evaluateLineEquation(px, py);
        if (shouldBePositive ? value >= requiredValue : value <= -requiredValue) {
          break;
        }
        px = clamp(normalRandom(distribution.xMean, distribution.xStd), xRange[0], xRange[1]);
        py = clamp(normalRandom(distribution.yMean, distribution.yStd), yRange[0], yRange[1]);
        tries++;
      }

      const enforced = ensureSide(px, py, shouldBePositive);

      const screenX = margin + ((enforced.x - xRange[0]) / (xRange[1] - xRange[0])) * effectiveWidth;
      const screenY =
        margin +
        effectiveHeight -
        ((enforced.y - yRange[0]) / (yRange[1] - yRange[0])) * effectiveHeight;

      newPoints.push({
        x: screenX,
        y: screenY,
        class: classLabel,
        id: `point-${index}`,
        animationDelay: animateDataPoints ? index * pointAppearanceMs : 0,
        actualX: enforced.x,
        actualY: enforced.y
      });
    };

    const pointsPerClass = Math.floor(pointCount / 2);

    for (let i = 0; i < pointsPerClass; i++) {
      samplePoint(class0Distribution, false, i, 0);
    }

    for (let i = 0; i < pointCount - pointsPerClass; i++) {
      samplePoint(class1Distribution, true, pointsPerClass + i, 1);
    }

    for (let i = newPoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPoints[i], newPoints[j]] = [newPoints[j], newPoints[i]];
      newPoints[i].animationDelay = animateDataPoints ? i * pointAppearanceMs : 0;
      newPoints[j].animationDelay = animateDataPoints ? j * pointAppearanceMs : 0;
    }

    const deltaX = xRange[1] - xRange[0];
    const deltaY = yRange[1] - yRange[0];
    const normalizedSlope = (A * deltaX) / (B * deltaY);
    const normalizedIntercept = (A * xRange[0] + B * yRange[1] + C) / (B * deltaY);

    return {
      points: newPoints,
      normalizedLine: {
        slope: normalizedSlope,
        intercept: normalizedIntercept
      }
    };
  }, [width, height, pointCount, animateDataPoints, pointAppearanceMs, currentDataset]);

  // Initialize points only once when mounted
  useEffect(() => {
    if (mounted) {
      const generated = generateDataset();
      setPoints(generated.points);
      setSeparationLine(generated.normalizedLine);
    }
  }, [mounted, generateDataset]);

  // Auto-separation animation
  useEffect(() => {
    if (!autoSeparate || !mounted) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);

      // Adjust separation line gradually
      setSeparationLine(prev => ({
        slope: -0.5 + Math.sin(Date.now() * 0.001) * 0.3,
        intercept: 0.3 + Math.cos(Date.now() * 0.0008) * 0.2
      }));
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [autoSeparate, animationSpeed, mounted]);

  // Line drawing animation
  useEffect(() => {
    if (!animateLineDrawing || !shouldShowLine || !mounted) return;

    setLineAnimationProgress(0);
    const startTime = Date.now();

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / lineAnimationMs, 1);

      setLineAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animateFrame);
    }, points.length * pointAppearanceMs + 500); // Start after points finish animating

    return () => clearTimeout(timeout);
  }, [animateLineDrawing, shouldShowLine, mounted, lineAnimationMs, points.length, pointAppearanceMs]);

  // Calculate if a point is correctly classified
  const isPointCorrectlyClassified = useCallback((point: Point) => {
    const normalizedX = (point.x - 40) / (width - 80);
    const normalizedY = (point.y - 40) / (height - 80);
    const lineY = separationLine.slope * normalizedX + separationLine.intercept;

    const aboveLine = normalizedY < lineY;
    return (point.class === 0 && aboveLine) || (point.class === 1 && !aboveLine);
  }, [separationLine, width, height]);

  // Generate separation line path
  const separationLinePath = useMemo(() => {
    const startX = 40;
    const endX = width - 40;
    const startY = 40 + (height - 80) * (separationLine.slope * 0 + separationLine.intercept);
    const endY = 40 + (height - 80) * (separationLine.slope * 1 + separationLine.intercept);

    return `M ${startX} ${Math.max(40, Math.min(height - 40, startY))} L ${endX} ${Math.max(40, Math.min(height - 40, endY))}`;
  }, [separationLine, width, height]);

  // Handle point click
  const handlePointClick = useCallback((pointId: string) => {
    if (interactive) {
      setHighlightedPoint(prev => prev === pointId ? null : pointId);
    }
  }, [interactive]);

  // Handle regenerate data
  const handleRegenerateData = useCallback(() => {
    setIsAnimating(true);
    const generated = generateDataset();
    setPoints(generated.points);
    setSeparationLine(generated.normalizedLine);
    setTrainingHistory([]);
    setTrainingStep(0);
    setTimeout(() => setIsAnimating(false), 1000);
  }, [generateDataset]);

  // Perceptron training logic
  const trainPerceptron = useCallback(() => {
    if (points.length === 0 || isTraining) return;

    setIsTraining(true);
    setTrainingHistory([]);
    setTrainingStep(0);

    // Initialize random weights and bias
    let weights = [Math.random() * 2 - 1, Math.random() * 2 - 1]; // Random between -1 and 1
    let bias = Math.random() * 2 - 1;
    const learningRate = 0.1;
    const maxIterations = 50;

    const history: Array<{weights: number[], bias: number, error: boolean}> = [];

    // Convert screen coordinates back to normalized coordinates for training
    const normalizedPoints = points.map(point => ({
      x: (point.x - 40) / (width - 80),
      y: 1 - (point.y - 40) / (height - 80), // Flip Y axis
      label: point.class === 0 ? -1 : 1 // Convert to -1/1 labels
    }));

    let iteration = 0;
    let converged = false;

    const trainingStep = () => {
      if (iteration >= maxIterations || converged) {
        setIsTraining(false);
        return;
      }

      let errors = 0;

      // One pass through all points
      for (const point of normalizedPoints) {
        const activation = weights[0] * point.x + weights[1] * point.y + bias;
        const prediction = activation > 0 ? 1 : -1;

        if (prediction !== point.label) {
          errors++;
          // Update weights using perceptron learning rule
          weights[0] += learningRate * point.label * point.x;
          weights[1] += learningRate * point.label * point.y;
          bias += learningRate * point.label;
        }
      }

      history.push({
        weights: [...weights],
        bias: bias,
        error: errors > 0
      });

      // Update the actual separation line for visualization
      // Convert back to line equation: Ax + By + C = 0
      // From weights[0] * x + weights[1] * y + bias = 0
      setSeparationLine({
        slope: weights[1] !== 0 ? -weights[0] / weights[1] : 0,
        intercept: weights[1] !== 0 ? -bias / weights[1] : 0
      });

      setTrainingHistory([...history]);
      setTrainingStep(iteration + 1);

      if (errors === 0) {
        converged = true;
        setIsTraining(false);
      } else {
        iteration++;
        setTimeout(trainingStep, 500); // 500ms delay between steps
      }
    };

    // Start training with a small delay
    setTimeout(trainingStep, 300);
  }, [points, width, height, isTraining]);

  if (!mounted) {
    return (
      <div
        style={{
          padding: '2rem',
          borderRadius: '12px',
          margin: '2rem 0',
          height: `${height + 200}px`,
          background: 'transparent',
        }}
      />
    );
  }

  const correctlyClassified = points.filter(isPointCorrectlyClassified).length;
  const accuracy = points.length > 0 ? (correctlyClassified / points.length) * 100 : 0;

  return (
    <div className="linear-separable-viz" style={{
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

      {/* Controls - only show if interactive */}
      {interactive && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: colors.controlBg,
          borderRadius: '8px',
          border: `1px solid ${colors.controlBorder}`
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
              style={{
                padding: '0.5rem 1rem',
                background: showDecisionBoundary ? colors.separationLine : 'transparent',
                color: showDecisionBoundary ? 'white' : colors.textPrimary,
                border: `1px solid ${colors.separationLine}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              {showDecisionBoundary ? 'Hide' : 'Show'} Boundary
            </button>

            <button
              onClick={handleRegenerateData}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: colors.textPrimary,
                border: `1px solid ${colors.controlBorder}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              🎲 New Data
            </button>

            {shouldShowLine && (
              <button
                onClick={trainPerceptron}
                disabled={isTraining || points.length === 0}
                style={{
                  padding: '0.5rem 1rem',
                  background: isTraining ? colors.textMuted : colors.separationLine,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isTraining ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  opacity: isTraining ? 0.6 : 1
                }}
              >
                {isTraining ? '🧠 Learning...' : '🧠 Train Perceptron'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              padding: '0.5rem 1rem',
              background: accuracy > 85 ? colors.correctRegion : colors.incorrectRegion,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              color: colors.textPrimary
            }}>
              Accuracy: {accuracy.toFixed(1)}%
            </div>

            {(isTraining || trainingHistory.length > 0) && (
              <div style={{
                padding: '0.5rem 1rem',
                background: colors.controlBg,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: colors.textPrimary,
                border: `1px solid ${colors.controlBorder}`
              }}>
                {isTraining ? `Step ${trainingStep}` : `Converged in ${trainingStep} steps`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: `${width}px`, margin: '0 auto', display: 'block', cursor: 'crosshair' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="pointGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <radialGradient id="class0Gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.class0} stopOpacity="1" />
            <stop offset="70%" stopColor={colors.class0} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.class0} stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="class1Gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.class1} stopOpacity="1" />
            <stop offset="70%" stopColor={colors.class1} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.class1} stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <g opacity="0.3">
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={40 + i * (width - 80) / 9}
                y1={40}
                x2={40 + i * (width - 80) / 9}
                y2={height - 40}
                stroke={colors.gridLine}
                strokeWidth="0.5"
              />
              <line
                x1={40}
                y1={40 + i * (height - 80) / 9}
                x2={width - 40}
                y2={40 + i * (height - 80) / 9}
                stroke={colors.gridLine}
                strokeWidth="0.5"
              />
            </g>
          ))}
        </g>

        {/* Separation regions */}
        {showDecisionBoundary && highlightRegions && (
          <g>
            {/* Region visualization */}
            <path
              d={`${separationLinePath} L ${width - 40} 40 L 40 40 Z`}
              fill={colors.class0Glow}
              opacity="0.15"
            />
            <path
              d={`${separationLinePath} L ${width - 40} ${height - 40} L 40 ${height - 40} Z`}
              fill={colors.class1Glow}
              opacity="0.15"
            />

            {/* Region labels */}
            <text
              x={width * 0.25}
              y={height * 0.25}
              fill={colors.class0}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              opacity="0.8"
            >
              {finalRegionLabels[0]}
            </text>
            <text
              x={width * 0.75}
              y={height * 0.75}
              fill={colors.class1}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              opacity="0.8"
            >
              {finalRegionLabels[1]}
            </text>
          </g>
        )}

        {/* Decision boundary line */}
        {showDecisionBoundary && (
          <g filter="url(#glow)">
            {animateLineDrawing ? (
              <path
                d={separationLinePath}
                stroke={colors.separationLine}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
                strokeDasharray={`${lineAnimationProgress * 1000} ${1000}`}
                strokeDashoffset="0"
              />
            ) : (
              <path
                d={separationLinePath}
                stroke={colors.separationLine}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
              >
                {autoSeparate && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 10;10 0;0 10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            )}

            {/* Equation display */}
            {interactive && (
              <text
                x={width - 80}
                y={60}
                fill={colors.separationLine}
                fontSize="12"
                fontWeight="bold"
                textAnchor="end"
              >
                y = {separationLine.slope.toFixed(2)}x + {separationLine.intercept.toFixed(2)}
              </text>
            )}
          </g>
        )}

        {/* Data points */}
        <g>
          {points.map((point, index) => {
            const isCorrect = isPointCorrectlyClassified(point);
            const isHighlighted = highlightedPoint === point.id;
            const pointColor = point.class === 0 ? colors.class0 : colors.class1;
            const pointGradient = point.class === 0 ? "url(#class0Gradient)" : "url(#class1Gradient)";

            return (
              <g
                key={point.id}
                transform={`translate(${point.x}, ${point.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handlePointClick(point.id)}
              >
                {/* Point glow effect */}
                {isHighlighted && (
                  <circle
                    r="15"
                    fill={pointColor}
                    opacity="0.3"
                    filter="url(#pointGlow)"
                  >
                    <animate
                      attributeName="r"
                      values="15;20;15"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Correctness indicator ring */}
                <circle
                  r="10"
                  fill="none"
                  stroke={isCorrect ? colors.separationLine : colors.class0}
                  strokeWidth={isCorrect ? "2" : "3"}
                  opacity={isCorrect ? "0.6" : "0.8"}
                  strokeDasharray={isCorrect ? "none" : "5,5"}
                >
                  {!isCorrect && (
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;10"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>

                {/* Main point */}
                <circle
                  r="6"
                  fill={pointGradient}
                  stroke="white"
                  strokeWidth="1.5"
                  opacity={isAnimating ? "0" : "1"}
                >
                  <animate
                    attributeName="opacity"
                    values="0;1"
                    dur="0.5s"
                    begin={`${point.animationDelay}ms`}
                    fill="freeze"
                  />

                  {isHighlighted && (
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="1;1.3;1"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>

                {/* Class label */}
                <text
                  y="1"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {point.class}
                </text>

                {/* Tooltip on hover */}
                {isHighlighted && interactive && (
                  <g transform="translate(15, -15)">
                    <rect
                      x="-35"
                      y="-25"
                      width="70"
                      height="40"
                      rx="4"
                      fill={colors.controlBg}
                      stroke={colors.controlBorder}
                      strokeWidth="1"
                    />
                    <text
                      y="-12"
                      fill={colors.textPrimary}
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {currentDataset.class0Label.split(' ')[1] || currentDataset.class1Label.split(' ')[1]
                        ? (point.class === 0 ? currentDataset.class0Label : currentDataset.class1Label)
                        : `Class ${point.class}`}
                    </text>
                    <text
                      y="-2"
                      fill={colors.textSecondary}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {xAxisLabel.split(' ')[0]}: {point.actualX?.toFixed(1)}
                    </text>
                    <text
                      y="8"
                      fill={colors.textSecondary}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {yAxisLabel.split(' ')[0]}: {point.actualY?.toFixed(1)}
                    </text>
                    <text
                      y="20"
                      fill={isCorrect ? colors.separationLine : colors.class0}
                      fontSize="8"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {isCorrect ? "✓ Correct" : "✗ Wrong"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Axes labels */}
        <text x={width / 2} y={height - 10} fill={colors.textMuted} fontSize="12" textAnchor="middle">
          {xAxisLabel} →
        </text>
        <text x={15} y={height / 2} fill={colors.textMuted} fontSize="12" textAnchor="middle" transform={`rotate(-90 15 ${height / 2})`}>
          ← {yAxisLabel}
        </text>

        {/* Scale indicators */}
        <text x={50} y={height - 25} fill={colors.textMuted} fontSize="10">
          {currentDataset.xRange[0]}
        </text>
        <text x={width - 50} y={height - 25} fill={colors.textMuted} fontSize="10">
          {currentDataset.xRange[1]}
        </text>
        <text x={25} y={height - 50} fill={colors.textMuted} fontSize="10" transform={`rotate(-90 25 ${height - 50})`}>
          {currentDataset.yRange[0]}
        </text>
        <text x={25} y={60} fill={colors.textMuted} fontSize="10" transform={`rotate(-90 25 60)`}>
          {currentDataset.yRange[1]}
        </text>

        {/* Legend */}
        {showLegend && (
          <g transform="translate(50, 50)">
            <rect x="-10" y="-5" width="140" height="60" rx="4" fill={colors.controlBg} stroke={colors.controlBorder} strokeWidth="1" opacity="0.95"/>

            <circle cx="10" cy="8" r="4" fill={colors.class0} />
            <text x="20" y="12" fill={colors.textPrimary} fontSize="11">{currentDataset.class0Label}</text>

            <circle cx="10" cy="25" r="4" fill={colors.class1} />
            <text x="20" y="29" fill={colors.textPrimary} fontSize="11">{currentDataset.class1Label}</text>

            {shouldShowLine && (
              <>
                <line x1="10" y1="42" x2="30" y2="42" stroke={colors.separationLine} strokeWidth="2"/>
                <text x="35" y="46" fill={colors.textPrimary} fontSize="9">Decision Boundary</text>
              </>
            )}
          </g>
        )}
      </svg>

      {/* Status Information - only show if interactive or showLine is true */}
      {(interactive || shouldShowLine) && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: colors.controlBg,
          borderRadius: '8px',
          border: `1px solid ${colors.controlBorder}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.separationLine }}>
              {correctlyClassified}/{points.length}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              Correctly Classified
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary }}>
              {accuracy.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              Classification Accuracy
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary }}>
              {accuracy > 95 ? "Perfect!" : accuracy > 85 ? "Great!" : accuracy > 70 ? "Good" : "Improving"}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              Separation Quality
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p style={{
          marginTop: '1rem',
          color: colors.textMuted,
          fontSize: '13px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default LinearSeparableDataViz;
