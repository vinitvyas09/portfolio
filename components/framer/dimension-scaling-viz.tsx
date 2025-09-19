"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

interface DimensionScalingVizProps {
  config?: {
    animationSpeed?: number;
    autoPlay?: boolean;
    showCode?: boolean;
  };
}

type StagePoint = {
  coords: number[];
  label: number;
  projection: number;
  contributions: number[];
};

type ContributionRow = {
  index: number;
  name: string;
  value: number;
};

interface StageBlueprint {
  dims: number;
  title: string;
  subtitle: string;
  description: string;
  perceptronNote: string;
  featureNames: string[];
  labels: [string, string];
  pointCount: number;
  separation: number;
  noise: number;
  seed: number;
  deemphasizeVisibleDims?: boolean;
  pairOverrides?: Array<[number, number]>;
  exampleBreakdown: {
    label: string;
    projection: number;
    contributions: Array<{ name: string; value: number }>;
  };
}

interface StageData extends StageBlueprint {
  weight: number[];
  bias: number;
  points: StagePoint[];
  pairOptions: Array<[number, number]>;
  axisRange: { min: number; max: number };
  featureNames: string[];
}

const stageBlueprints: StageBlueprint[] = [
  {
    dims: 2,
    title: "2 features · You can still draw it",
    subtitle: "Sleep hours vs. running speed — the classic cat vs. dog toy problem",
    description:
      "With only two measurements the classes fall apart cleanly. You and the perceptron both see the same separating line.",
    perceptronNote:
      "Perceptron training here recovers the very line you would sketch by hand. Low dimensions match our intuition.",
    featureNames: ["Hours of sleep", "Running speed"],
    labels: ["Cat", "Dog"],
    pointCount: 64,
    separation: 1.35,
    noise: 0.28,
    seed: 11,
    pairOverrides: [[0, 1]],
    exampleBreakdown: {
      label: "Dog",
      projection: 0.78,
      contributions: [
        { name: "Running speed", value: 0.92 },
        { name: "Hours of sleep", value: -0.38 },
        { name: "Bias", value: 0.24 },
        { name: "Hidden dims", value: 0 },
        { name: "Noise floor", value: 0 }
      ]
    }
  },
  {
    dims: 6,
    title: "6 features · Human intuition fades",
    subtitle: "Add ear tilt, paw pressure, vocal pitch… the view from any two axes looks noisy",
    description:
      "Each 2D slice is now cluttered, even though the six-dimensional vectors are still perfectly linearly separable.",
    perceptronNote:
      "The perceptron lines its weight vector across all six features and carves a clean margin that our eyes cannot see.",
    featureNames: [
      "Hours of sleep",
      "Running speed",
      "Ear tilt",
      "Paw pressure",
      "Bark pitch",
      "Tail wag variance"
    ],
    labels: ["Cat", "Dog"],
    pointCount: 96,
    separation: 1.15,
    noise: 0.52,
    seed: 29,
    deemphasizeVisibleDims: true,
    pairOverrides: [
      [0, 1],
      [0, 3],
      [2, 4],
      [1, 5]
    ],
    exampleBreakdown: {
      label: "Dog",
      projection: 0.79,
      contributions: [
        { name: "Tail wag variance", value: 0.58 },
        { name: "Bark pitch", value: 0.44 },
        { name: "Running speed", value: 0.21 },
        { name: "Ear tilt", value: -0.38 },
        { name: "Bias", value: -0.06 }
      ]
    }
  },
  {
    dims: 50,
    title: "50 features · Text classification reality",
    subtitle: "Every dimension is a word frequency or embedding component",
    description:
      "No 2D projection carries the structure, yet the perceptron only needs the dot product with its weight vector to decide.",
    perceptronNote:
      "All 50 numbers collapse into one score w·x + b. The sign of that score separates ham from spam even when no single slice does.",
    featureNames: [
      'freq("refund")',
      'freq("urgent")',
      'freq("meeting")',
      'freq("coffee")',
      'freq("crypto")',
      'freq("invoice")',
      'freq("unsubscribe")',
      'freq("family")'
    ],
    labels: ["Ham", "Spam"],
    pointCount: 140,
    separation: 1.45,
    noise: 0.82,
    seed: 77,
    deemphasizeVisibleDims: true,
    pairOverrides: [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [10, 27],
      [5, 32]
    ],
    exampleBreakdown: {
      label: "Spam",
      projection: 1.04,
      contributions: [
        { name: 'freq("urgent")', value: 0.91 },
        { name: 'freq("refund")', value: 0.72 },
        { name: 'freq("unsubscribe")', value: -0.46 },
        { name: 'freq("family")', value: -0.31 },
        { name: "Bias", value: 0.18 }
      ]
    }
  }
];


const createRng = (seed: number) => {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const normalizeVector = (vector: number[]) => {
  const magnitude = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0));
  if (!magnitude) {
    return vector.map(() => 0);
  }
  return vector.map(value => value / magnitude);
};

const dotProduct = (a: number[], b: number[]) =>
  a.reduce((acc, value, index) => acc + value * (b[index] ?? 0), 0);

const createPairOptions = (
  dims: number,
  rng: () => number,
  overrides?: Array<[number, number]>
): Array<[number, number]> => {
  const seen = new Set<string>();
  const pairs: Array<[number, number]> = [];

  const addPair = (pair: [number, number]) => {
    const sorted: [number, number] = pair[0] <= pair[1] ? pair : [pair[1], pair[0]];
    if (sorted[0] === sorted[1]) {
      return;
    }
    const key = `${sorted[0]}-${sorted[1]}`;
    if (!seen.has(key) && sorted[0] >= 0 && sorted[1] < dims) {
      seen.add(key);
      pairs.push(sorted);
    }
  };

  overrides?.forEach(addPair);

  if (pairs.length === 0 && dims > 1) {
    addPair([0, 1]);
  }

  if (dims > 3) {
    addPair([1, 2]);
  }

  const maxPairs = Math.min(dims > 10 ? 6 : 4, Math.floor((dims * (dims - 1)) / 2));
  while (pairs.length < maxPairs) {
    const a = Math.floor(rng() * dims);
    const b = Math.floor(rng() * dims);
    if (a === b) continue;
    addPair([a, b]);
  }

  return pairs;
};

const DimensionScalingViz: React.FC<DimensionScalingVizProps> = ({
  config = {
    animationSpeed: 16000,
    autoPlay: true
  }
}) => {
  const { animationSpeed = 16000, autoPlay = true } = config;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const stageData = useMemo<StageData[]>(() => {
    return stageBlueprints.map(stage => {
      const rng = createRng(stage.seed);
      const features = [...stage.featureNames];
      while (features.length < stage.dims) {
        const index = features.length + 1;
        features.push(stage.dims > 12 ? `Feature ${index}` : `Feature ${index}`);
      }

      let weight = Array.from({ length: stage.dims }, () => rng() * 2 - 1);
      if (stage.deemphasizeVisibleDims) {
        if (stage.dims > 0) weight[0] *= 0.18;
        if (stage.dims > 1) weight[1] *= 0.18;
      }
      weight = normalizeVector(weight);
      const bias = 0;

      const points: StagePoint[] = [];
      for (let i = 0; i < stage.pointCount; i++) {
        const direction = rng() > 0.5 ? 1 : -1;
        const coords = Array.from({ length: stage.dims }, () => (rng() * 2 - 1) * stage.noise);
        for (let d = 0; d < stage.dims; d++) {
          coords[d] += weight[d] * direction * stage.separation;
        }
        const projection = dotProduct(coords, weight) + bias;
        const label = projection >= 0 ? 1 : 0;
        const contributions = coords.map((value, idx) => value * weight[idx]);
        points.push({ coords, label, projection, contributions });
      }

      const pairOptions = createPairOptions(stage.dims, rng, stage.pairOverrides);
      const projections = points.map(point => point.projection);
      const minProj = Math.min(...projections);
      const maxProj = Math.max(...projections);
      const padding = (maxProj - minProj) * 0.2 || 0.6;
      const axisRange = { min: minProj - padding, max: maxProj + padding };

      return {
        ...stage,
        featureNames: features,
        weight,
        bias,
        points,
        pairOptions,
        axisRange
      };
    });
  }, []);

  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || stageData.length <= 1) return;
    const id = setInterval(
      () => setActiveStageIndex(prev => (prev + 1) % stageData.length),
      animationSpeed
    );
    return () => clearInterval(id);
  }, [autoPlay, animationSpeed, stageData.length]);

  const colors = useMemo(() => {
    if (!mounted) {
      return {
        background: "#ffffff",
        surface: "#f8fafc",
        border: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        classA: "#14b8a6",
        classB: "#6366f1",
        axis: "#94a3b8",
        highlight: "#f59e0b",
        shadow: "rgba(99, 102, 241, 0.12)",
        track: "rgba(148, 163, 184, 0.22)"
      };
    }

    const isDark = resolvedTheme === "dark";
    return isDark
      ? {
          background: "#060b1a",
          surface: "rgba(15, 23, 42, 0.82)",
          border: "#1e293b",
          textPrimary: "#e2e8f0",
          textSecondary: "#94a3b8",
          classA: "#34d399",
          classB: "#a855f7",
          axis: "#475569",
          highlight: "#fbbf24",
          shadow: "rgba(168, 85, 247, 0.22)",
          track: "rgba(148, 163, 184, 0.25)"
        }
      : {
          background: "#ffffff",
          surface: "#f8fafc",
          border: "#e2e8f0",
          textPrimary: "#0f172a",
          textSecondary: "#475569",
          classA: "#14b8a6",
          classB: "#6366f1",
          axis: "#94a3b8",
          highlight: "#f59e0b",
          shadow: "rgba(99, 102, 241, 0.12)",
          track: "rgba(148, 163, 184, 0.18)"
        };
  }, [mounted, resolvedTheme]);

  const scatterRef = useRef<HTMLCanvasElement>(null);
  const projectionRef = useRef<HTMLCanvasElement>(null);

  const currentStage = stageData[activeStageIndex];
  const currentPair =
    currentStage?.pairOptions[0] ??
    (currentStage ? [0, Math.min(1, currentStage.dims - 1)] : [0, 1]);
  const highlightIndex =
    currentStage && currentStage.points.length > 0 ? 0 : -1;
  const example = currentStage?.exampleBreakdown;

  const drawScatter = useCallback(() => {
    const canvas = scatterRef.current;
    const stage = currentStage;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const [xIndex, yIndex] = currentPair;
    const xValues = stage.points.map(point => point.coords[xIndex] ?? 0);
    const yValues = stage.points.map(point => point.coords[yIndex] ?? 0);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const padX = (maxX - minX || 1) * 0.15;
    const padY = (maxY - minY || 1) * 0.15;
    const domainXMin = minX - padX;
    const domainXMax = maxX + padX;
    const domainYMin = minY - padY;
    const domainYMax = maxY + padY;
    const margin = 36;

    const scaleX = (value: number) =>
      margin +
      ((value - domainXMin) / (domainXMax - domainXMin || 1)) *
        (canvas.width - margin * 2);
    const scaleY = (value: number) =>
      canvas.height -
      (margin +
        ((value - domainYMin) / (domainYMax - domainYMin || 1)) *
          (canvas.height - margin * 2));

    ctx.strokeStyle = colors.track;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(margin, scaleY(0));
    ctx.lineTo(canvas.width - margin, scaleY(0));
    ctx.moveTo(scaleX(0), margin);
    ctx.lineTo(scaleX(0), canvas.height - margin);
    ctx.stroke();
    ctx.setLineDash([]);

    stage.points.forEach((point, index) => {
      const x = scaleX(point.coords[xIndex] ?? 0);
      const y = scaleY(point.coords[yIndex] ?? 0);
      const radius = highlightIndex >= 0 && index === highlightIndex ? 7 : 4;

      ctx.beginPath();
      ctx.globalAlpha = highlightIndex >= 0 && index === highlightIndex ? 1 : 0.75;
      ctx.fillStyle = point.label === 0 ? colors.classA : colors.classB;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (highlightIndex >= 0 && index === highlightIndex) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = colors.highlight;
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
  }, [
    colors.surface,
    colors.track,
    colors.classA,
    colors.classB,
    colors.highlight,
    currentStage,
    currentPair,
    highlightIndex
  ]);

  const drawPerceptron = useCallback(() => {
    const canvas = projectionRef.current;
    const stage = currentStage;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const marginX = 48;
    const axisTop = canvas.height * 0.32;
    const axisBottom = canvas.height * 0.68;
    const axisCenter = (axisTop + axisBottom) / 2;

    const scaleX = (value: number) =>
      marginX +
      ((value - stage.axisRange.min) / (stage.axisRange.max - stage.axisRange.min || 1)) *
        (canvas.width - marginX * 2);

    const boundaryX = scaleX(0);
    const zoneHeight = axisBottom - axisTop;
    ctx.fillStyle = `${colors.classA}33`;
    ctx.fillRect(marginX, axisTop, Math.max(boundaryX - marginX, 1), zoneHeight);
    ctx.fillStyle = `${colors.classB}33`;
    ctx.fillRect(boundaryX, axisTop, Math.max(canvas.width - marginX - boundaryX, 1), zoneHeight);

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginX, axisCenter);
    ctx.lineTo(canvas.width - marginX, axisCenter);
    ctx.stroke();

    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = colors.highlight;
    ctx.beginPath();
    ctx.moveTo(boundaryX, axisTop - 8);
    ctx.lineTo(boundaryX, axisBottom + 8);
    ctx.stroke();
    ctx.setLineDash([]);

    stage.points.forEach((point, index) => {
      const x = scaleX(point.projection);
      const y = point.label === 1 ? axisTop + zoneHeight * 0.25 : axisBottom - zoneHeight * 0.25;
      const isHighlight = highlightIndex >= 0 && index === highlightIndex;
      const radius = isHighlight ? 7 : 4.5;

      ctx.beginPath();
      ctx.globalAlpha = isHighlight ? 1 : 0.78;
      ctx.fillStyle = point.label === 0 ? colors.classA : colors.classB;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isHighlight) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = colors.highlight;
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
    ctx.font = "13px system-ui";
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";
    ctx.fillText(stage.labels[0], marginX, axisBottom + 20);
    ctx.fillText(stage.labels[1], marginX, axisTop - 10);
    ctx.textAlign = "right";
    ctx.fillText("w · x + b", canvas.width - marginX, axisTop - 10);
    ctx.textAlign = "left";
    ctx.fillText("decision boundary", boundaryX + 8, axisCenter - 12);
  }, [
    colors.surface,
    colors.classA,
    colors.classB,
    colors.axis,
    colors.highlight,
    colors.textSecondary,
    currentStage,
    highlightIndex
  ]);

  useEffect(() => {
    if (!mounted) return;
    drawScatter();
  }, [mounted, drawScatter]);

  useEffect(() => {
    if (!mounted) return;
    drawPerceptron();
  }, [mounted, drawPerceptron]);

  const contributionRows = useMemo<ContributionRow[]>(() => {
    if (!example) return [];
    return example.contributions.map((entry, index) => ({
      index,
      name: entry.name,
      value: entry.value
    }));
  }, [example]);

  const maxAbsContribution = useMemo(() => {
    if (!contributionRows.length) return 1;
    return Math.max(...contributionRows.map(row => Math.abs(row.value))) || 1;
  }, [contributionRows]);

  if (!mounted) {
    return (
      <div
        style={{
          padding: "2rem",
          borderRadius: "16px",
          margin: "2rem 0",
          height: "520px",
          background: "transparent"
        }}
      />
    );
  }

  const pairLabel =
    currentStage && currentPair
      ? `${currentStage.featureNames[currentPair[0]] ?? `Feature ${currentPair[0] + 1}`} vs ${
          currentStage.featureNames[currentPair[1]] ?? `Feature ${currentPair[1] + 1}`
        }`
      : "";

  const predictedLabel =
    example && currentStage
      ? example.projection >= 0
        ? currentStage.labels[1]
        : currentStage.labels[0]
      : undefined;
  const focusLabelColor =
    example && currentStage
      ? example.label === currentStage.labels[1]
        ? colors.classB
        : colors.classA
      : colors.textSecondary;
  const predictionColor =
    example ? (example.projection >= 0 ? colors.classB : colors.classA) : colors.textSecondary;

  return (
    <div
      style={{
        padding: "2rem",
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: "18px",
        margin: "2rem 0",
        boxShadow: `0 30px 90px ${colors.shadow}`,
        transition: "background 0.3s ease, border 0.3s ease"
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ flex: "1 1 260px", minWidth: "260px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.6rem",
              flexWrap: "wrap"
            }}
          >
            <span
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: colors.track,
                color: colors.textSecondary
              }}
            >
              Stage {activeStageIndex + 1} · {currentStage?.dims ?? 0} dimensions
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: colors.textSecondary
              }}
            >
              {currentStage?.labels[0]} vs {currentStage?.labels[1]}
            </span>
          </div>
          <h3
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: colors.textPrimary,
              letterSpacing: "-0.01em",
              marginBottom: "0.35rem"
            }}
          >
            {currentStage?.title}
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              color: colors.textSecondary,
              marginTop: 0,
              marginBottom: 0,
              lineHeight: 1.6
            }}
          >
            {currentStage?.subtitle}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          {stageData.map((stage, index) => {
            const isActive = index === activeStageIndex;
            return (
              <button
                key={stage.dims}
                onClick={() => setActiveStageIndex(index)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "10px",
                  border: `1px solid ${
                    isActive ? colors.classB : colors.border
                  }`,
                  background: isActive ? `${colors.classB}22` : colors.surface,
                  color: colors.textPrimary,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  minWidth: "110px",
                  transition: "all 0.2s ease"
                }}
              >
                <div>{stage.dims}D</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: colors.textSecondary,
                    fontWeight: 500
                  }}
                >
                  {stage.labels[0]} / {stage.labels[1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize: "0.95rem",
          color: colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: "1rem"
        }}
      >
        {currentStage?.description}
      </div>

      <div
        style={{
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          borderRadius: "12px",
          padding: "0.9rem 1rem",
          color: colors.textPrimary,
          fontSize: "0.85rem",
          lineHeight: 1.5,
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          marginBottom: "1.6rem"
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>🧭</span>
        <span>{currentStage?.perceptronNote}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem"
        }}
      >
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "14px",
            padding: "1.25rem",
            boxShadow: `0 18px 50px ${colors.shadow}`,
            transition: "background 0.3s ease, border 0.3s ease"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
              gap: "0.75rem"
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: colors.textPrimary,
                fontSize: "0.95rem"
              }}
            >
              What you can see (a 2D slice)
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textSecondary,
                textAlign: "right"
              }}
            >
              {pairLabel}
            </div>
          </div>

          <div
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              marginBottom: "0.75rem"
            }}
          >
            <canvas
              ref={scatterRef}
              width={520}
              height={300}
              style={{
                width: "100%",
                height: "240px",
                display: "block"
              }}
            />
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              color: colors.textSecondary,
              lineHeight: 1.5
            }}
          >
            We cycle through feature pairs from this {currentStage?.dims}D dataset. Above
            three dimensions every single slice looks noisy—even when the full vector is
            perfectly separable.
          </p>
        </div>

        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "14px",
            padding: "1.25rem",
            boxShadow: `0 18px 50px ${colors.shadow}`,
            transition: "background 0.3s ease, border 0.3s ease"
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: colors.textPrimary,
              fontSize: "0.95rem",
              marginBottom: "0.75rem"
            }}
          >
            What the perceptron sees (projection onto w)
          </div>

          <div
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              marginBottom: "0.75rem"
            }}
          >
            <canvas
              ref={projectionRef}
              width={520}
              height={240}
              style={{
                width: "100%",
                height: "200px",
                display: "block"
              }}
            />
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              color: colors.textSecondary,
              lineHeight: 1.5
            }}
          >
            Project every point onto the weight vector, take the sign of w·x + b, and the
            classes fall apart. The perceptron never needed to visualize the space—it only
            ever saw this one-dimensional story.
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "1.6rem",
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "14px",
          padding: "1.25rem",
          boxShadow: `0 18px 50px ${colors.shadow}`,
          transition: "background 0.3s ease, border 0.3s ease",
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: colors.textPrimary,
            fontSize: "0.95rem",
            marginBottom: "1rem"
          }}
        >
          Zoom into one example: which dimensions tipped the decision?
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.2rem"
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textSecondary,
                marginBottom: "0.2rem"
              }}
            >
              Focus sample
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: focusLabelColor
              }}
            >
              {example?.label ?? "—"}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textSecondary,
                marginBottom: "0.2rem"
              }}
            >
              w · x + b
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: colors.textPrimary
              }}
            >
              {example ? example.projection.toFixed(2) : "—"}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textSecondary,
                marginBottom: "0.2rem"
              }}
            >
              Predicted side
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: predictionColor
              }}
            >
              {predictedLabel ?? "—"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            flexGrow: 1
          }}
        >
          {contributionRows.map(row => {
            const magnitude = Math.abs(row.value);
            const ratio = Math.min(magnitude / maxAbsContribution, 1);
            const trackWidth = 160;
            const positiveWidth = row.value > 0 ? ratio * (trackWidth / 2) : 0;
            const negativeWidth = row.value < 0 ? ratio * (trackWidth / 2) : 0;

            return (
              <div
                key={`${row.name}-${row.index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.8rem",
                  color: colors.textSecondary
                }}
              >
                <div style={{ flex: "0 0 150px", color: colors.textPrimary }}>
                  {row.name}
                </div>
                <div
                  style={{
                    position: "relative",
                    width: `${trackWidth}px`,
                    height: "6px",
                    background: colors.track,
                    borderRadius: "999px"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "-4px",
                      width: "1px",
                      height: "14px",
                      background: colors.axis,
                      opacity: 0.7
                    }}
                  />
                  {negativeWidth > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        right: "50%",
                        width: `${negativeWidth}px`,
                        height: "100%",
                        background: `${colors.classA}DD`,
                        borderRadius: "999px"
                      }}
                    />
                  )}
                  {positiveWidth > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        width: `${positiveWidth}px`,
                        height: "100%",
                        background: `${colors.classB}DD`,
                        borderRadius: "999px"
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    width: "60px",
                    textAlign: "right",
                    color: colors.textPrimary
                  }}
                >
                  {row.value >= 0 ? "+" : ""}
                  {row.value.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            fontSize: "0.75rem",
            color: colors.textSecondary,
            marginTop: "0.9rem",
            lineHeight: 1.5
          }}
        >
          Add these contributions and you recover w·x + b. The perceptron only cares about
          this sum: if it is positive we emit the right-hand class, if it is negative we
          emit the left-hand class.
        </p>
      </div>
    </div>
  );
};

export default DimensionScalingViz;
