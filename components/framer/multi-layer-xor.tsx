"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface MultiLayerXORProps {
  config?: {
    showLayers?: boolean;
    animateSignalFlow?: boolean;
    showDecisionRegions?: boolean;
  };
}

const MultiLayerXOR: React.FC<MultiLayerXORProps> = ({
  config = {
    showLayers: true,
    animateSignalFlow: true,
    showDecisionRegions: true
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeInput, setActiveInput] = useState<{x: number, y: number} | null>(null);
  const [hiddenActivations, setHiddenActivations] = useState<[number, number]>([0, 0]);
  const [outputActivation, setOutputActivation] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Color scheme matching other components
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        positive: "#10b981",
        negative: "#ef4444",
        neuronActive: "#10b981",
        neuronInactive: "#6b7280",
        connection: "#94a3b8",
        connectionActive: "#3b82f6",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        gridBg: "#f8fafc"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      positive: "#34d399",
      negative: "#f87171",
      neuronActive: "#34d399",
      neuronInactive: "#525252",
      connection: "#404040",
      connectionActive: "#60a5fa",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#404040",
      gridBg: "#171717"
    } : {
      bg: "#ffffff",
      positive: "#10b981",
      negative: "#ef4444",
      neuronActive: "#10b981",
      neuronInactive: "#6b7280",
      connection: "#94a3b8",
      connectionActive: "#3b82f6",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      gridBg: "#f8fafc"
    };
  }, [isDark, mounted]);

  // XOR test points
  const testPoints = [
    { x: 0, y: 0, label: 'negative', expected: 0 },
    { x: 1, y: 0, label: 'positive', expected: 1 },
    { x: 0, y: 1, label: 'positive', expected: 1 },
    { x: 1, y: 1, label: 'negative', expected: 0 }
  ];

  // Hidden layer weights for XOR solution
  // Hidden neuron 1: OR gate (x + y > 0.5)
  // Hidden neuron 2: NAND gate (-(x + y) > -1.5)
  const weights = {
    hidden1: { w1: 1, w2: 1, bias: -0.5 },   // OR gate
    hidden2: { w1: -1, w2: -1, bias: 1.5 },  // NAND gate
    output: { w1: 1, w2: 1, bias: -1.5 }     // AND gate
  };

  // Step function activation
  const step = (x: number) => x > 0 ? 1 : 0;

  // Calculate network output
  const calculateNetwork = (x: number, y: number) => {
    // Hidden layer
    const h1 = step(weights.hidden1.w1 * x + weights.hidden1.w2 * y + weights.hidden1.bias);
    const h2 = step(weights.hidden2.w1 * x + weights.hidden2.w2 * y + weights.hidden2.bias);

    // Output layer
    const output = step(weights.output.w1 * h1 + weights.output.w2 * h2 + weights.output.bias);

    return { h1, h2, output };
  };

  // Animate signal flow through network
  const animateSignal = (x: number, y: number) => {
    setIsAnimating(true);
    setActiveInput({ x, y });

    // Step 1: Input activates
    setTimeout(() => {
      const result = calculateNetwork(x, y);
      // Step 2: Hidden layer activates
      setHiddenActivations([result.h1, result.h2]);

      setTimeout(() => {
        // Step 3: Output activates
        setOutputActivation(result.output);

        setTimeout(() => {
          // Reset after showing result
          setIsAnimating(false);
        }, 1500);
      }, 500);
    }, 500);
  };

  if (!mounted) {
    return <div style={{ height: '500px', background: 'transparent' }} />;
  }

  return (
    <div style={{
      padding: '0.75rem',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      margin: '1rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Left: XOR Grid */}
        <div style={{ flex: '1 1 280px', maxWidth: '350px', width: '100%' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '0.75rem', textAlign: 'center' }}>
            XOR Input Space
          </h3>
          <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
            <svg width="100%" height="280" viewBox="-40 -40 360 360" preserveAspectRatio="xMidYMid meet">
            {/* Background grid */}
            {config.showDecisionRegions && (
              <g>
                {/* Decision regions based on network output */}
                {[0, 1].map(x =>
                  [0, 1].map(y => {
                    const result = calculateNetwork(x, y);
                    const color = result.output === 1 ? colors.positive : colors.negative;
                    return (
                      <rect
                        key={`region-${x}-${y}`}
                        x={x * 140}
                        y={(1 - y) * 140}
                        width="140"
                        height="140"
                        fill={color}
                        opacity="0.1"
                      />
                    );
                  })
                )}
              </g>
            )}

            {/* Grid lines */}
            <line x1="140" y1="0" x2="140" y2="280" stroke={colors.border} strokeWidth="2" />
            <line x1="0" y1="140" x2="280" y2="140" stroke={colors.border} strokeWidth="2" />

            {/* Border */}
            <rect x="0" y="0" width="280" height="280" fill="none" stroke={colors.border} strokeWidth="2" />

            {/* XOR points */}
            {testPoints.map((point, i) => {
              const cx = point.x * 280;
              const cy = (1 - point.y) * 280;
              const isActive = activeInput && activeInput.x === point.x && activeInput.y === point.y;

              return (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="20"
                    fill={point.expected === 1 ? colors.positive : colors.negative}
                    opacity={isActive ? 1 : 0.7}
                    stroke={isActive ? colors.connectionActive : 'none'}
                    strokeWidth="3"
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => animateSignal(point.x, point.y)}
                  />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="24"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {point.expected}
                  </text>
                  <text
                    x={cx}
                    y={cy - 30}
                    textAnchor="middle"
                    fill={colors.textSecondary}
                    fontSize="11"
                  >
                    ({point.x},{point.y})
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x="140" y="305" textAnchor="middle" fontSize="12" fill={colors.text}>x₁</text>
            <text x="-20" y="145" textAnchor="middle" fontSize="12" fill={colors.text}>x₂</text>

            {/* Axis ticks */}
            <text x="0" y="295" textAnchor="middle" fontSize="10" fill={colors.textSecondary}>0</text>
            <text x="280" y="295" textAnchor="middle" fontSize="10" fill={colors.textSecondary}>1</text>
            <text x="-10" y="283" textAnchor="middle" fontSize="10" fill={colors.textSecondary}>0</text>
            <text x="-10" y="5" textAnchor="middle" fontSize="10" fill={colors.textSecondary}>1</text>
          </svg>
          </div>
        </div>

        {/* Right: Neural Network */}
        <div style={{ flex: '1 1 280px', maxWidth: '450px', width: '100%' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '0.75rem', textAlign: 'center' }}>
            2-Layer Neural Network
          </h3>
          <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ minWidth: '320px', maxWidth: '400px', margin: '0 auto' }}>
              <svg width="100%" height="300" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
            {/* Connections: Input to Hidden */}
            <line x1="80" y1="100" x2="180" y2="100"
              stroke={activeInput && activeInput.x === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={activeInput && activeInput.x === 1 ? "3" : "1.5"}
              opacity={activeInput && activeInput.x === 1 ? "1" : "0.4"}
            />
            <line x1="80" y1="100" x2="180" y2="200"
              stroke={activeInput && activeInput.x === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={activeInput && activeInput.x === 1 ? "3" : "1.5"}
              opacity={activeInput && activeInput.x === 1 ? "1" : "0.4"}
            />
            <line x1="80" y1="200" x2="180" y2="100"
              stroke={activeInput && activeInput.y === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={activeInput && activeInput.y === 1 ? "3" : "1.5"}
              opacity={activeInput && activeInput.y === 1 ? "1" : "0.4"}
            />
            <line x1="80" y1="200" x2="180" y2="200"
              stroke={activeInput && activeInput.y === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={activeInput && activeInput.y === 1 ? "3" : "1.5"}
              opacity={activeInput && activeInput.y === 1 ? "1" : "0.4"}
            />

            {/* Connections: Hidden to Output */}
            <line x1="180" y1="100" x2="300" y2="150"
              stroke={hiddenActivations[0] === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={hiddenActivations[0] === 1 ? "3" : "1.5"}
              opacity={hiddenActivations[0] === 1 ? "1" : "0.4"}
            />
            <line x1="180" y1="200" x2="300" y2="150"
              stroke={hiddenActivations[1] === 1 ? colors.connectionActive : colors.connection}
              strokeWidth={hiddenActivations[1] === 1 ? "3" : "1.5"}
              opacity={hiddenActivations[1] === 1 ? "1" : "0.4"}
            />

            {/* Input Layer */}
            <g>
              <circle cx="80" cy="100" r="25"
                fill={activeInput && activeInput.x === 1 ? colors.neuronActive : colors.neuronInactive}
                stroke={colors.border}
                strokeWidth="2"
              />
              <text x="80" y="105" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                {activeInput ? activeInput.x : 'x₁'}
              </text>
              <text x="80" y="140" textAnchor="middle" fill={colors.textSecondary} fontSize="11">
                Input 1
              </text>

              <circle cx="80" cy="200" r="25"
                fill={activeInput && activeInput.y === 1 ? colors.neuronActive : colors.neuronInactive}
                stroke={colors.border}
                strokeWidth="2"
              />
              <text x="80" y="205" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                {activeInput ? activeInput.y : 'x₂'}
              </text>
              <text x="80" y="240" textAnchor="middle" fill={colors.textSecondary} fontSize="11">
                Input 2
              </text>
            </g>

            {/* Hidden Layer */}
            <g>
              <circle cx="180" cy="100" r="25"
                fill={hiddenActivations[0] === 1 ? colors.neuronActive : colors.neuronInactive}
                stroke={colors.border}
                strokeWidth="2"
              />
              <text x="180" y="105" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                {hiddenActivations[0]}
              </text>
              <text x="180" y="75" textAnchor="middle" fill={colors.textSecondary} fontSize="10">
                x₁ OR x₂
              </text>

              <circle cx="180" cy="200" r="25"
                fill={hiddenActivations[1] === 1 ? colors.neuronActive : colors.neuronInactive}
                stroke={colors.border}
                strokeWidth="2"
              />
              <text x="180" y="205" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                {hiddenActivations[1]}
              </text>
              <text x="180" y="235" textAnchor="middle" fill={colors.textSecondary} fontSize="10">
                NOT (x₁ AND x₂)
              </text>
            </g>

            {/* Output Layer */}
            <g>
              <circle cx="300" cy="150" r="30"
                fill={outputActivation === 1 ? colors.positive : colors.negative}
                stroke={colors.border}
                strokeWidth="2"
              />
              <text x="300" y="155" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {outputActivation}
              </text>
              <text x="300" y="190" textAnchor="middle" fill={colors.textSecondary} fontSize="11">
                XOR Output
              </text>
            </g>

            {/* Layer labels */}
            <text x="80" y="20" textAnchor="middle" fill={colors.text} fontSize="12" fontWeight="600">
              Input Layer
            </text>
            <text x="180" y="20" textAnchor="middle" fill={colors.text} fontSize="12" fontWeight="600">
              Hidden Layer
            </text>
            <text x="300" y="20" textAnchor="middle" fill={colors.text} fontSize="12" fontWeight="600">
              Output Layer
            </text>

            {/* Weight annotations */}
            {isAnimating && (
              <g>
                <text x="130" y="95" fill={colors.connectionActive} fontSize="10">+1</text>
                <text x="130" y="145" fill={colors.connectionActive} fontSize="10">-1</text>
                <text x="130" y="155" fill={colors.connectionActive} fontSize="10">+1</text>
                <text x="130" y="205" fill={colors.connectionActive} fontSize="10">-1</text>
                <text x="240" y="120" fill={colors.connectionActive} fontSize="10">+1</text>
                <text x="240" y="180" fill={colors.connectionActive} fontSize="10">+1</text>
              </g>
            )}
          </svg>
            </div>
          </div>

          {/* Logic explanation */}
          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            fontSize: '11px',
            color: colors.textSecondary
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: colors.text, fontSize: '12px' }}>
              How it solves XOR:
            </div>
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontStyle: 'italic', textAlign: 'center' }}>
              Click any point to see signal flow
            </div>
            <div style={{ lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.25rem' }}>• Hidden 1: &quot;at least one input is 1&quot; (OR)</div>
              <div style={{ marginBottom: '0.25rem' }}>• Hidden 2: &quot;not both inputs are 1&quot; (NAND)</div>
              <div style={{ marginBottom: '0.25rem' }}>• Output: both hidden neurons active (AND)</div>
              <div>• Result: XOR (exactly one input is 1)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLayerXOR;