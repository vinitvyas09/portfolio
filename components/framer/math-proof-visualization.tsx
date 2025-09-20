"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface MathProofVisualizationProps {
  config?: {
    mode?: 'step-by-step' | 'automatic';
    showExample?: boolean;
    point?: [number, number];
    trueLabel?: number;
    oldActivation?: number;
    animateImprovement?: boolean;
  };
}

const MathProofVisualization: React.FC<MathProofVisualizationProps> = ({
  config = {
    mode: 'step-by-step',
    showExample: true,
    point: [2, 3],
    trueLabel: 1,
    oldActivation: -0.5,
    animateImprovement: true
  }
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  // Calculate values for the example
  const x1 = config.point![0];
  const x2 = config.point![1];
  const oldAct = config.oldActivation!;
  const improvement = x1 * x1 + x2 * x2 + 1;
  const newAct = oldAct + improvement;

  const steps = [
    {
      title: "Initial State: Misclassified",
      subtitle: `Point (${x1}, ${x2}) should be positive, but activation = ${oldAct}`,
    },
    {
      title: "Update Rule Applied",
      subtitle: "Add the input values to weights when wrong",
    },
    {
      title: "New Activation Calculation",
      subtitle: "Substitute the updated weights",
    },
    {
      title: "Mathematical Expansion",
      subtitle: "Expand and simplify the expression",
    },
    {
      title: "Guaranteed Improvement",
      subtitle: `Always positive: ${improvement.toFixed(1)} > 0`,
    },
    {
      title: "Result: Line Moved Correctly",
      subtitle: "The decision boundary adjusted toward the misclassified point",
    }
  ];

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length]);

  const colors = {
    bg: isDark ? '#0a0a0a' : '#ffffff',
    cardBg: isDark ? '#111111' : '#fafafa',
    border: isDark ? '#1f1f1f' : '#e5e7eb',
    text: isDark ? '#f3f4f6' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    textFaint: isDark ? '#6b7280' : '#9ca3af',
    positive: isDark ? '#22c55e' : '#16a34a',
    negative: isDark ? '#ef4444' : '#dc2626',
    neutral: isDark ? '#3f3f46' : '#d4d4d8',
    improvement: isDark ? '#a78bfa' : '#8b5cf6',
    mathBg: isDark ? '#050505' : '#f9fafb',
    highlight: isDark ? '#fbbf24' : '#f59e0b',
    activeBg: isDark ? 'rgba(251, 191, 36, 0.05)' : 'rgba(245, 158, 11, 0.05)',
  };

  const renderStepVisualization = (stepIndex: number) => {
    const width = 600;
    const height = 300;
    const padding = 60;

    switch (stepIndex) {
      case 0: // Initial misclassification
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Coordinate system */}
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2}
                  stroke={colors.neutral} strokeWidth="1" opacity="0.3"/>
            <line x1={width/2} y1={padding} x2={width/2} y2={height-padding}
                  stroke={colors.neutral} strokeWidth="1" opacity="0.3"/>

            {/* Decision boundary (wrong position) */}
            <line x1={100} y1={220} x2={500} y2={80}
                  stroke={colors.negative} strokeWidth="2" strokeDasharray="8,4" opacity="0.7"/>

            {/* Point */}
            <circle cx={width/2 + x1 * 30} cy={height/2 - x2 * 25} r="10"
                    fill={colors.positive} stroke={colors.bg} strokeWidth="2"/>

            {/* Labels */}
            <text x={width/2 + x1 * 30 + 20} y={height/2 - x2 * 25 + 5}
                  fill={colors.text} fontSize="14" fontFamily="monospace">
              ({x1}, {x2})
            </text>

            <text x={width/2} y={height - 20} fill={colors.negative} fontSize="13"
                  textAnchor="middle" fontFamily="system-ui">
              Wrong side of boundary
            </text>

            {/* Activation value */}
            <rect x={width - 140} y={20} width={120} height={40}
                  fill={colors.negative} fillOpacity="0.1"
                  stroke={colors.negative} strokeWidth="1" rx="6"/>
            <text x={width - 80} y={45} fill={colors.negative} fontSize="14"
                  textAnchor="middle" fontFamily="monospace">
              a = {oldAct}
            </text>
          </svg>
        );

      case 1: // Update rule
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Update equations */}
            <text x={width/2} y={80} fill={colors.text} fontSize="16"
                  textAnchor="middle" fontFamily="monospace">
              w₁_new = w₁_old + y·x₁
            </text>
            <text x={width/2} y={120} fill={colors.text} fontSize="16"
                  textAnchor="middle" fontFamily="monospace">
              w₂_new = w₂_old + y·x₂
            </text>
            <text x={width/2} y={160} fill={colors.text} fontSize="16"
                  textAnchor="middle" fontFamily="monospace">
              b_new = b_old + y
            </text>

            {/* Actual values */}
            <text x={width/2} y={220} fill={colors.improvement} fontSize="15"
                  textAnchor="middle" fontFamily="monospace">
              Since y = +1 and point = ({x1}, {x2})
            </text>
          </svg>
        );

      case 2: // New activation
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <text x={width/2} y={60} fill={colors.textMuted} fontSize="14"
                  textAnchor="middle" fontFamily="system-ui">
              New activation when seeing same point:
            </text>

            <text x={width/2} y={110} fill={colors.text} fontSize="16"
                  textAnchor="middle" fontFamily="monospace">
              a_new = (w₁ + x₁)·x₁ + (w₂ + x₂)·x₂ + (b + 1)
            </text>

            <line x1={100} y1={140} x2={500} y2={140}
                  stroke={colors.neutral} strokeWidth="1" opacity="0.3"/>

            <text x={width/2} y={190} fill={colors.text} fontSize="16"
                  textAnchor="middle" fontFamily="monospace">
              = w₁·x₁ + w₂·x₂ + b + x₁² + x₂² + 1
            </text>

            <text x={width/2} y={240} fill={colors.improvement} fontSize="15"
                  textAnchor="middle" fontFamily="monospace">
              = a_old + (x₁² + x₂² + 1)
            </text>
          </svg>
        );

      case 3: // Expansion
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Components breakdown */}
            <rect x={50} y={100} width={150} height={80}
                  fill={colors.negative} fillOpacity="0.05"
                  stroke={colors.negative} strokeWidth="1" rx="8"/>
            <text x={125} y={130} fill={colors.text} fontSize="14"
                  textAnchor="middle" fontFamily="system-ui">
              Old activation
            </text>
            <text x={125} y={160} fill={colors.negative} fontSize="20"
                  textAnchor="middle" fontFamily="monospace">
              {oldAct}
            </text>

            <text x={width/2} y={145} fill={colors.text} fontSize="24"
                  textAnchor="middle">+</text>

            <rect x={width - 200} y={100} width={150} height={80}
                  fill={colors.improvement} fillOpacity="0.05"
                  stroke={colors.improvement} strokeWidth="1" rx="8"/>
            <text x={width - 125} y={130} fill={colors.text} fontSize="14"
                  textAnchor="middle" fontFamily="system-ui">
              Improvement term
            </text>
            <text x={width - 125} y={160} fill={colors.improvement} fontSize="20"
                  textAnchor="middle" fontFamily="monospace">
              {improvement.toFixed(1)}
            </text>

            <text x={width/2} y={230} fill={colors.textMuted} fontSize="13"
                  textAnchor="middle" fontFamily="monospace">
              = {x1}² + {x2}² + 1 = {improvement.toFixed(1)}
            </text>
          </svg>
        );

      case 4: // Final improvement
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Number line */}
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2}
                  stroke={colors.text} strokeWidth="2" opacity="0.3"/>

            {/* Zero mark */}
            <line x1={width/2} y1={height/2 - 15} x2={width/2} y2={height/2 + 15}
                  stroke={colors.text} strokeWidth="2" opacity="0.5"/>
            <text x={width/2} y={height/2 + 35} fill={colors.text} fontSize="14"
                  textAnchor="middle" fontFamily="monospace">0</text>

            {/* Old position */}
            <circle cx={width/2 + oldAct * 80} cy={height/2} r="8"
                    fill={colors.negative}/>
            <text x={width/2 + oldAct * 80} y={height/2 - 20}
                  fill={colors.negative} fontSize="13" textAnchor="middle">
              old: {oldAct}
            </text>

            {/* New position */}
            <circle cx={width/2 + newAct * 80} cy={height/2} r="8"
                    fill={colors.positive}/>
            <text x={width/2 + newAct * 80} y={height/2 + 35}
                  fill={colors.positive} fontSize="13" textAnchor="middle">
              new: {newAct.toFixed(1)}
            </text>

            {/* Improvement arrow */}
            <path d={`M ${width/2 + oldAct * 80 + 10} ${height/2 - 5}
                      Q ${width/2} ${height/2 - 40}
                      ${width/2 + newAct * 80 - 10} ${height/2 - 5}`}
                  stroke={colors.improvement} strokeWidth="2" fill="none"
                  markerEnd="url(#arrowhead)"/>

            <text x={width/2} y={height/2 - 50} fill={colors.improvement}
                  fontSize="14" textAnchor="middle" fontWeight="600">
              +{improvement.toFixed(1)}
            </text>

            {/* Result box */}
            <rect x={width/2 - 100} y={height - 70} width={200} height={40}
                  fill={colors.positive} fillOpacity="0.1"
                  stroke={colors.positive} strokeWidth="1" rx="6"/>
            <text x={width/2} y={height - 45} fill={colors.positive} fontSize="14"
                  textAnchor="middle" fontWeight="600" fontFamily="system-ui">
              Always improves! ✓
            </text>

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10"
                      refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={colors.improvement}/>
              </marker>
            </defs>
          </svg>
        );

      case 5: // Visual proof: line moved
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Coordinate system */}
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2}
                  stroke={colors.neutral} strokeWidth="1" opacity="0.3"/>
            <line x1={width/2} y1={padding} x2={width/2} y2={height-padding}
                  stroke={colors.neutral} strokeWidth="1" opacity="0.3"/>

            {/* Old decision boundary (wrong) */}
            <line x1={100} y1={220} x2={500} y2={80}
                  stroke={colors.negative} strokeWidth="1.5" strokeDasharray="8,4" opacity="0.4"/>

            {/* New decision boundary (improved) */}
            <line x1={140} y1={240} x2={460} y2={60}
                  stroke={colors.positive} strokeWidth="2.5" opacity="0.8"/>

            {/* Point (now on correct side) */}
            <circle cx={width/2 + x1 * 30} cy={height/2 - x2 * 25} r="10"
                    fill={colors.positive} stroke={colors.bg} strokeWidth="2"/>

            {/* Labels */}
            <text x={width/2 + x1 * 30 + 20} y={height/2 - x2 * 25 + 5}
                  fill={colors.text} fontSize="14" fontFamily="monospace">
              ({x1}, {x2})
            </text>

            {/* Legend */}
            <g transform={`translate(${width - 160}, 20)`}>
              <line x1={0} y1={10} x2={30} y2={10}
                    stroke={colors.negative} strokeWidth="1.5" strokeDasharray="8,4" opacity="0.4"/>
              <text x={35} y={14} fill={colors.textMuted} fontSize="12">Old line</text>

              <line x1={0} y1={30} x2={30} y2={30}
                    stroke={colors.positive} strokeWidth="2.5" opacity="0.8"/>
              <text x={35} y={34} fill={colors.text} fontSize="12">New line</text>
            </g>

            {/* Success message */}
            <text x={width/2} y={height - 20} fill={colors.positive} fontSize="14"
                  textAnchor="middle" fontFamily="system-ui" fontWeight="600">
              Line moved toward the misclassified point!
            </text>

            {/* Improvement indicator */}
            <g transform={`translate(${width/2 - 50}, ${height - 80})`}>
              <rect x={0} y={0} width={100} height={30}
                    fill={colors.positive} fillOpacity="0.1"
                    stroke={colors.positive} strokeWidth="1" rx="4"/>
              <text x={50} y={20} fill={colors.positive} fontSize="13"
                    textAnchor="middle" fontFamily="system-ui">
                Converging ✓
              </text>
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  if (!mounted) {
    return <div className="h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg animate-pulse" />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${colors.border}`,
            background: isDark ? '#080808' : '#fbfbfb'
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                Perceptron Update Proof
              </h3>
              <p style={{
                color: colors.textMuted,
                fontSize: '0.875rem'
              }}>
                Why updates always move in the right direction
              </p>
            </div>
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  setCurrentStep(0);
                  setIsPlaying(true);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                background: isDark ? '#18181b' : '#f4f4f5',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#27272a' : '#e4e4e7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#18181b' : '#f4f4f5';
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{
          display: 'flex',
          padding: '1rem 1.5rem',
          gap: '0.5rem',
          background: isDark ? '#050505' : '#fcfcfc'
        }}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '3px',
                background: idx <= currentStep ? colors.highlight : colors.neutral,
                borderRadius: '3px',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Current step info */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <h4 style={{
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Step {currentStep + 1}: {steps[currentStep].title}
          </h4>
          <p style={{
            color: colors.textMuted,
            fontSize: '0.875rem'
          }}>
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* Visualization area */}
        <div style={{
          padding: '2rem',
          background: colors.mathBg,
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {renderStepVisualization(currentStep)}
        </div>

        {/* Controls */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.border}`,
          background: isDark ? '#080808' : '#fbfbfb'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '0.5rem 1.25rem',
              background: currentStep === 0 ? colors.neutral : (isDark ? '#18181b' : '#f4f4f5'),
              color: currentStep === 0 ? colors.textFaint : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            ← Previous
          </button>

          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: idx === currentStep ? `2px solid ${colors.highlight}` : `1px solid ${colors.border}`,
                  background: idx === currentStep ? colors.activeBg : 'transparent',
                  color: idx === currentStep ? colors.highlight : colors.textMuted,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            style={{
              padding: '0.5rem 1.25rem',
              background: currentStep === steps.length - 1 ? colors.neutral : (isDark ? '#18181b' : '#f4f4f5'),
              color: currentStep === steps.length - 1 ? colors.textFaint : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === steps.length - 1 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathProofVisualization;