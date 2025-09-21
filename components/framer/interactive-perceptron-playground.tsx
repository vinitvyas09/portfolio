"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface InteractivePerceptronPlaygroundProps {
  config?: {
    numInputs?: number;
    initialWeights?: number[];
    initialInputs?: number[];
    threshold?: number;
    learningRate?: number;
    showMath?: boolean;
    activationFunction?: 'step' | 'sigmoid' | 'relu';
  };
}

const InteractivePerceptronPlayground: React.FC<InteractivePerceptronPlaygroundProps> = ({
  config = {
    numInputs: 3,
    threshold: 0,
    learningRate: 0.1,
    showMath: true,
    activationFunction: 'step'
  }
}) => {
  // Theme handling
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const {
    numInputs = 3,
    threshold = 0,
    learningRate = 0.1,
    showMath = true,
    activationFunction = 'step'
  } = config;

  // State
  const [inputs, setInputs] = useState<number[]>(
    config.initialInputs || Array(numInputs).fill(0.5)
  );
  const [weights, setWeights] = useState<number[]>(
    config.initialWeights || Array(numInputs).fill(0.5)
  );
  const [bias, setBias] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sophisticated color palette matching neuron animation
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bgGradient1: "#ffffff",
        bgGradient2: "#fafafa",
        primary: "#6366f1",
        secondary: "#10b981",
        accent: "#f59e0b",
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        cardBg: "rgba(248, 250, 252, 0.95)",
        borderColor: "#e2e8f0",
        sliderTrack: "#e2e8f0",
        sliderThumb: "#6366f1",
        inputLine: "#6366f1",
        weightLine: "#10b981",
        neuronInactive: "#6366f1",
        neuronActive: "#10b981",
        outputPositive: "#10b981",
        outputNegative: "#ef4444"
      };
    }

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      primary: "#a78bfa",
      secondary: "#34d399",
      accent: "#fbbf24",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      cardBg: "rgba(23, 23, 23, 0.9)",
      borderColor: "#404040",
      sliderTrack: "#404040",
      sliderThumb: "#a78bfa",
      inputLine: "#a78bfa",
      weightLine: "#34d399",
      neuronInactive: "#a78bfa",
      neuronActive: "#34d399",
      outputPositive: "#34d399",
      outputNegative: "#f87171"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      primary: "#6366f1",
      secondary: "#10b981",
      accent: "#f59e0b",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      cardBg: "rgba(248, 250, 252, 0.95)",
      borderColor: "#e2e8f0",
      sliderTrack: "#e2e8f0",
      sliderThumb: "#6366f1",
      inputLine: "#6366f1",
      weightLine: "#10b981",
      neuronInactive: "#6366f1",
      neuronActive: "#10b981",
      outputPositive: "#10b981",
      outputNegative: "#ef4444"
    };
  }, [isDark, mounted]);

  // Mathematical calculations
  const weightedSum = useMemo(() => {
    return inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias;
  }, [inputs, weights, bias]);

  const activationOutput = useMemo(() => {
    switch (activationFunction) {
      case 'step':
        return weightedSum >= threshold ? 1 : 0;
      case 'sigmoid':
        return 1 / (1 + Math.exp(-weightedSum));
      case 'relu':
        return Math.max(0, weightedSum);
      default:
        return weightedSum >= threshold ? 1 : 0;
    }
  }, [weightedSum, threshold, activationFunction]);

  const isNeuronActive = activationOutput > 0.5;

  // Handle window resize for responsive layout
  useEffect(() => {
    // Set initial value on mount
    setIsMobile(window.innerWidth <= 768);

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150); // Debounce resize events
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Animation trigger
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [weightedSum]);

  // Show activation animation
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setShowActivation(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShowActivation(false);
    }
  }, [isAnimating]);

  // Input/Weight update handlers
  const updateInput = useCallback((index: number, value: number) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  const updateWeight = useCallback((index: number, value: number) => {
    setWeights(prev => {
      const newWeights = [...prev];
      newWeights[index] = value;
      return newWeights;
    });
  }, []);

  // Random example generator
  const generateRandomExample = useCallback(() => {
    setInputs(Array(numInputs).fill(0).map(() => Math.random()));
    setWeights(Array(numInputs).fill(0).map(() => Math.random() * 2 - 1)); // -1 to 1
    setBias(Math.random() * 2 - 1);
  }, [numInputs]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setInputs(Array(numInputs).fill(0.5));
    setWeights(Array(numInputs).fill(0.5));
    setBias(0);
  }, [numInputs]);

  if (!mounted) {
    return (
      <div
        style={{
          padding: '2rem',
          borderRadius: '12px',
          margin: '2rem 0',
          height: '600px',
          background: 'transparent',
        }}
      />
    );
  }

  return (
    <div style={{
      padding: isMobile ? '1rem' : '2rem',
      background: `linear-gradient(135deg, ${colors.bgGradient1} 0%, ${colors.bgGradient2} 100%)`,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      margin: isMobile ? '1rem 0' : '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '1rem' : '2rem',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? '0.5rem' : '0'
      }}>
        <h3 style={{
          margin: 0,
          color: colors.textPrimary,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          fontWeight: '600',
          width: isMobile ? '100%' : 'auto'
        }}>
          Interactive Perceptron
        </h3>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          width: isMobile ? '100%' : 'auto'
        }}>
          <button
            onClick={generateRandomExample}
            style={{
              padding: '0.5rem 1rem',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: isMobile ? '1' : 'auto'
            }}
          >
            🎲 Random
          </button>
          <button
            onClick={resetToDefaults}
            style={{
              padding: '0.5rem 1rem',
              background: colors.textMuted,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: isMobile ? '1' : 'auto'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Controls Panel */}
        <div style={{
          flex: isMobile ? '1' : '0 0 300px',
          width: isMobile ? '100%' : 'auto',
          background: colors.cardBg,
          padding: '1.5rem',
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            color: colors.textPrimary,
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Controls
          </h4>

          {/* Inputs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{
              margin: '0 0 0.75rem 0',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Inputs (x)
            </h5>
            {inputs.map((input, i) => (
              <div key={`input-${i}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  color: colors.textMuted,
                  fontSize: '0.75rem',
                  minWidth: '20px'
                }}>
                  x{i + 1}:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={input}
                  onChange={(e) => updateInput(i, parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    height: '4px',
                    background: colors.sliderTrack,
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  color: colors.textPrimary,
                  fontSize: '0.75rem',
                  minWidth: '35px',
                  textAlign: 'right',
                  fontWeight: '500'
                }}>
                  {input.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Weights */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{
              margin: '0 0 0.75rem 0',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Weights (w)
            </h5>
            {weights.map((weight, i) => (
              <div key={`weight-${i}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  color: colors.textMuted,
                  fontSize: '0.75rem',
                  minWidth: '20px'
                }}>
                  w{i + 1}:
                </span>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.01"
                  value={weight}
                  onChange={(e) => updateWeight(i, parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    height: '4px',
                    background: colors.sliderTrack,
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  color: colors.textPrimary,
                  fontSize: '0.75rem',
                  minWidth: '35px',
                  textAlign: 'right',
                  fontWeight: '500'
                }}>
                  {weight.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Bias */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{
              margin: '0 0 0.75rem 0',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Bias (b)
            </h5>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: colors.textMuted,
                fontSize: '0.75rem',
                minWidth: '20px'
              }}>
                b:
              </span>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={bias}
                onChange={(e) => setBias(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  background: colors.sliderTrack,
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                color: colors.textPrimary,
                fontSize: '0.75rem',
                minWidth: '35px',
                textAlign: 'right',
                fontWeight: '500'
              }}>
                {bias.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Math Display */}
          {showMath && (
            <div style={{
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              <div style={{ color: colors.textMuted, marginBottom: '0.5rem' }}>
                Calculation:
              </div>
              <div style={{ color: colors.textPrimary, marginBottom: '0.25rem' }}>
                sum = {inputs.map((input, i) => `${input.toFixed(2)}×${weights[i].toFixed(2)}`).join(' + ')}
                {bias !== 0 && ` + ${bias.toFixed(2)}`}
              </div>
              <div style={{ color: colors.textPrimary, marginBottom: '0.25rem' }}>
                sum = {weightedSum.toFixed(3)}
              </div>
              <div style={{ color: colors.textPrimary }}>
                output = {activationFunction}({weightedSum.toFixed(3)}) = {activationOutput.toFixed(3)}
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div style={{
          flex: 1,
          width: isMobile ? '100%' : 'auto'
        }}>
          <svg
            width="100%"
            height={isMobile ? "350" : "400"}
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid meet"
            style={{
              maxWidth: isMobile ? '100%' : '600px',
              margin: '0 auto',
              display: 'block'
            }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="activeGlow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Input nodes and connections */}
            {inputs.map((input, i) => {
              const inputY = 80 + (i * 240 / Math.max(1, numInputs - 1));
              const weight = weights[i];
              const lineOpacity = Math.abs(weight) * 0.8 + 0.2;
              const lineWidth = Math.abs(weight) * 4 + 1;
              const isPositiveWeight = weight >= 0;

              return (
                <g key={`input-${i}`}>
                  {/* Connection line */}
                  <path
                    d={`M 120,${inputY} Q 200,${inputY + (200 - inputY) * 0.3} 280,200`}
                    stroke={isPositiveWeight ? colors.weightLine : colors.outputNegative}
                    strokeWidth={lineWidth}
                    fill="none"
                    opacity={lineOpacity}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Input node */}
                  <circle
                    cx="80"
                    cy={inputY}
                    r="20"
                    fill={colors.inputLine}
                    opacity={0.1 + input * 0.7}
                    stroke={colors.inputLine}
                    strokeWidth="2"
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Input value display */}
                  <text
                    x="80"
                    y={inputY + 5}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {input.toFixed(2)}
                  </text>

                  {/* Input label */}
                  <text
                    x="50"
                    y={inputY + 5}
                    fill={colors.textPrimary}
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    x{i + 1}
                  </text>

                  {/* Weight label */}
                  <text
                    x="200"
                    y={inputY + (200 - inputY) * 0.5}
                    fill={colors.textSecondary}
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    w{i + 1}={weight.toFixed(2)}
                  </text>

                  {/* Signal flow animation */}
                  {isAnimating && input > 0.1 && (
                    <circle
                      r="4"
                      fill={colors.inputLine}
                      opacity="0"
                    >
                      <animateMotion
                        dur="0.8s"
                        repeatCount="1"
                        path={`M 120,${inputY} Q 200,${inputY + (200 - inputY) * 0.3} 280,200`}
                      />
                      <animate
                        attributeName="opacity"
                        values="0;0.9;0.9;0"
                        dur="0.8s"
                        repeatCount="1"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Bias connection */}
            <g>
              <circle
                cx="80"
                cy="350"
                r="15"
                fill={colors.accent}
                opacity={0.3 + Math.abs(bias) * 0.5}
                stroke={colors.accent}
                strokeWidth="2"
              />
              <text
                x="80"
                y="355"
                fill="white"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                {bias.toFixed(1)}
              </text>
              <text
                x="50"
                y="355"
                fill={colors.textPrimary}
                fontSize="11"
                textAnchor="middle"
                fontWeight="500"
              >
                bias
              </text>

              {/* Bias connection line */}
              <path
                d="M 95,350 Q 180,320 280,200"
                stroke={bias >= 0 ? colors.weightLine : colors.outputNegative}
                strokeWidth={Math.abs(bias) * 2 + 1}
                fill="none"
                opacity={0.2 + Math.abs(bias) * 0.6}
                strokeLinecap="round"
                style={{ transition: 'all 0.3s ease' }}
              />
            </g>

            {/* Perceptron neuron */}
            <g filter={isNeuronActive ? "url(#activeGlow)" : "url(#glow)"}>
              <circle
                cx="300"
                cy="200"
                r="40"
                fill={isNeuronActive ? colors.neuronActive : colors.neuronInactive}
                opacity={0.8}
                stroke={isNeuronActive ? colors.neuronActive : colors.neuronInactive}
                strokeWidth="2"
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Inner details */}
              <circle
                cx="300"
                cy="200"
                r="25"
                fill={isNeuronActive ? colors.neuronActive : colors.neuronInactive}
                opacity="0.3"
              />

              {/* Activation display */}
              <text
                x="300"
                y="205"
                fill="white"
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                {activationOutput.toFixed(2)}
              </text>
            </g>

            {/* Output connection */}
            <path
              d="M 340,200 L 480,200"
              stroke={isNeuronActive ? colors.outputPositive : colors.textMuted}
              strokeWidth="4"
              opacity={isNeuronActive ? 0.9 : 0.3}
              strokeLinecap="round"
              style={{ transition: 'all 0.3s ease' }}
            />

            {/* Output node */}
            <circle
              cx="520"
              cy="200"
              r="25"
              fill={isNeuronActive ? colors.outputPositive : colors.textMuted}
              opacity={isNeuronActive ? 0.9 : 0.3}
              stroke={isNeuronActive ? colors.outputPositive : colors.textMuted}
              strokeWidth="2"
              style={{ transition: 'all 0.3s ease' }}
            />

            <text
              x="520"
              y="205"
              fill="white"
              fontSize="11"
              textAnchor="middle"
              fontWeight="bold"
            >
              {activationOutput.toFixed(2)}
            </text>

            {/* Labels */}
            <text x="80" y="30" fill={colors.textPrimary} fontSize="14" fontWeight="600" textAnchor="middle">
              Inputs
            </text>
            <text x="300" y="130" fill={colors.textPrimary} fontSize="14" fontWeight="600" textAnchor="middle">
              Perceptron
            </text>
            <text x="520" y="130" fill={colors.textPrimary} fontSize="14" fontWeight="600" textAnchor="middle">
              Output
            </text>

            {/* Activation function indicator */}
            <text x="300" y="280" fill={colors.textSecondary} fontSize="11" textAnchor="middle">
              {activationFunction}({weightedSum.toFixed(2)})
            </text>

            {/* Output signal animation */}
            {showActivation && isNeuronActive && (
              <circle
                r="6"
                fill={colors.outputPositive}
                opacity="0"
              >
                <animateMotion
                  dur="0.5s"
                  repeatCount="1"
                  path="M 340,200 L 480,200"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="0.5s"
                  repeatCount="1"
                />
              </circle>
            )}
          </svg>

          {/* Status Display */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: colors.cardBg,
            borderRadius: '8px',
            border: `1px solid ${colors.borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '0.875rem',
                color: colors.textMuted,
                marginBottom: '0.25rem'
              }}>
                Weighted Sum: <span style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {weightedSum.toFixed(3)}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: colors.textMuted
              }}>
                Activation: <span style={{
                  color: isNeuronActive ? colors.outputPositive : colors.outputNegative,
                  fontWeight: '600'
                }}>
                  {activationOutput.toFixed(3)}
                </span>
              </div>
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              background: isNeuronActive ? colors.outputPositive : colors.textMuted,
              color: 'white',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.3s ease'
            }}>
              {isNeuronActive ? '🔥 ACTIVE' : '💤 INACTIVE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePerceptronPlayground;