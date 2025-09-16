"use client";

import React, { useState, useEffect } from 'react';

interface NeuronAnimationProps {
  config?: {
    inputs?: number;
    showWeights?: boolean;
    fireThreshold?: number;
    animationMs?: number;
    description?: string;
  };
}

const NeuronAnimation: React.FC<NeuronAnimationProps> = ({ 
  config = {
    inputs: 5,
    showWeights: true,
    fireThreshold: 0.4,
    animationMs: 3000,
    description: "Watch signals arrive at different strengths (thickness = importance). When enough strong signals align, the neuron fires!"
  }
}) => {
  const [signals, setSignals] = useState<number[]>([]);
  const [isFiring, setIsFiring] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [terminalLit, setTerminalLit] = useState(false);

  const { inputs = 5, showWeights = true, fireThreshold = 0.4, animationMs = 3000, description } = config;
  const axonSegmentCount = 4;
  const axonSegmentSpacing = 82;
  const axonSegmentWidth = 48;
  const axonSegmentHeight = 20;
  const axonStartX = 240;
  const axonBaselineY = 160;
  const axonCurveAmplitude = 6;
  const firstSegmentY = axonBaselineY + Math.sin(0.9) * axonCurveAmplitude;
  const axonEndX = axonStartX + (axonSegmentCount - 1) * axonSegmentSpacing + axonSegmentWidth;
  const axonEndY = axonBaselineY + Math.sin(axonSegmentCount * 0.9) * axonCurveAmplitude;
  const axonTerminalX = 570;
  const terminalBaseY = axonBaselineY + Math.sin((axonSegmentCount + 1) * 0.9) * axonCurveAmplitude;
  const axonSignalPath = `M 210,${axonBaselineY} C ${axonStartX + 32},${axonBaselineY - 14} ${axonStartX + axonSegmentSpacing * 1.6},${axonBaselineY + 18} ${axonTerminalX},${terminalBaseY}`;

  // Generate random weights for each input (between 0.1 and 1)
  const weights = Array.from({ length: inputs }, (_, i) => {
    const weight = 0.2 + (Math.sin(i * 1.7) + 1) * 0.4;
    return Math.min(1, Math.max(0.1, weight));
  });
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

  useEffect(() => {
    const runAnimation = () => {
      setIsAnimating(true);
      setSignals([]);
      setCurrentSum(0);
      setIsFiring(false);
      setTerminalLit(false);

      // Stagger signal arrivals
      const signalValues: number[] = [];
      weights.forEach((weight, index) => {
        setTimeout(() => {
          const signalStrength = Math.random() > 0.3 ? weight : 0;
          signalValues[index] = signalStrength;
          
          setSignals([...signalValues]);
          
          const rawSum = signalValues.reduce((acc, val) => acc + (val || 0), 0);
          const normalizedSum = totalWeight ? rawSum / totalWeight : 0;
          setCurrentSum(normalizedSum);
          
          // Only fire if threshold is exceeded
          if (normalizedSum >= fireThreshold) {
            setTimeout(() => {
              setIsFiring(true);
              // Light up terminals after signal travels down axon
              setTimeout(() => setTerminalLit(true), 600);
            }, 100);
          }
        }, (index * animationMs) / (inputs * 2));
      });

      // Reset and loop
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(runAnimation, 1500);
      }, animationMs + 1000);
    };

    runAnimation();
  }, []);

  const neuronColor = isFiring ? '#4ade80' : '#60a5fa';
  const nucleusColor = isFiring ? '#16a34a' : '#2563eb';

  return (
    <div className="neuron-container" style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '12px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <svg
        width="100%"
        height="320"
        viewBox="0 0 700 320"
        style={{ maxWidth: '700px', margin: '0 auto', display: 'block' }}
      >
        <defs>
          <radialGradient id="somaGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={neuronColor} stopOpacity="1" />
            <stop offset="70%" stopColor={neuronColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={neuronColor} stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="terminalGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Dendrites - Branching tree structure on the left */}
        {weights.map((weight, index) => {
          const signal = signals[index] || 0;
          const isActive = signal > 0;
          
          const normalizedIndex = inputs > 1 ? index / (inputs - 1) : 0.5;
          const yBase = 60 + normalizedIndex * 220 + Math.sin(index * 1.1) * 10;
          const branchTargetY =
            150 + (index - (inputs - 1) / 2) * 22 + Math.cos(index * 0.9) * 8;
          const bend = Math.sin(index * 1.3) * 18;
          const outward = 42 + Math.cos(index * 1.7) * 12;
          const path1 = `M 15,${yBase} C ${35 + outward / 2},${yBase + bend} ${90 + outward},${branchTargetY - bend / 2} 148,${branchTargetY}`;
          const path2 = `M 28,${yBase + 14} C ${54 + outward / 2},${yBase + bend * 0.6} ${108 + outward},${branchTargetY + bend * 0.8} 155,${branchTargetY + 12}`;
          const twigPath = `M ${60 + outward / 4},${yBase - 6} Q ${66 + outward / 5},${yBase - 18} ${74 + outward / 4},${yBase - 2}`;
          
          return (
            <g key={`dendrite-${index}`}>
              {/* Main dendrite branches */}
              <path
                d={path1}
                stroke={isActive ? '#3b82f6' : '#475569'}
                strokeWidth={showWeights ? weight * 3.5 : 2.5}
                fill="none"
                opacity={isActive ? 1 : 0.35}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Secondary branches */}
              <path
                d={path2}
                stroke={isActive ? '#3b82f6' : '#475569'}
                strokeWidth={showWeights ? weight * 2 : 1.5}
                fill="none"
                opacity={isActive ? 0.8 : 0.25}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Small sub-branches for more organic look */}
              <path
                d={twigPath}
                stroke={isActive ? '#3b82f6' : '#475569'}
                strokeWidth={1}
                opacity={isActive ? 0.7 : 0.2}
                strokeLinecap="round"
              />
              
              {/* Signal pulse animation */}
              {isActive && isAnimating && (
                <circle
                  r="5"
                  fill="#60a5fa"
                  style={{
                    filter: 'blur(3px)',
                  }}
                >
                  <animateMotion
                    dur="0.6s"
                    repeatCount="1"
                    path={path1}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="0.6s"
                    repeatCount="1"
                  />
                </circle>
              )}
              
              {/* Weight label at dendrite start */}
              {showWeights && (
                <text
                  x="20"
                  y={yBase - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {weight.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Cell Body (Soma) - Organic irregular shape */}
        <g filter={isFiring ? "url(#glow)" : ""}>
          {/* Create organic shape with multiple overlapping circles */}
          <ellipse
            cx="170"
            cy="160"
            rx="42"
            ry="38"
            fill="url(#somaGradient)"
            transform="rotate(-5 170 160)"
          />
          <ellipse
            cx="155"
            cy="155"
            rx="35"
            ry="32"
            fill={neuronColor}
            opacity="0.7"
            transform="rotate(15 155 155)"
          />
          <ellipse
            cx="180"
            cy="165"
            rx="30"
            ry="35"
            fill={neuronColor}
            opacity="0.6"
            transform="rotate(-20 180 165)"
          />
          
          {/* Cell membrane */}
          <ellipse
            cx="170"
            cy="160"
            rx="42"
            ry="38"
            fill="none"
            stroke={isFiring ? '#22c55e' : '#3b82f6'}
            strokeWidth="2.5"
            opacity="0.8"
            transform="rotate(-5 170 160)"
          />
        </g>
        
        {/* Nucleus with nucleolus */}
        <ellipse
          cx="168"
          cy="158"
          rx="16"
          ry="14"
          fill={nucleusColor}
          opacity="0.9"
        />
        <circle
          cx="171"
          cy="156"
          r="5"
          fill="#1e40af"
          opacity="0.8"
        />
        
        {/* Sum display */}
        <text
          x="168"
          y="162"
          fill="white"
          fontSize="11"
          textAnchor="middle"
          fontWeight="bold"
        >
          {currentSum.toFixed(2)}
        </text>
        
        {/* Axon Hillock */}
        <path
          d={`M 210,${axonBaselineY} C 220,${axonBaselineY - 6} ${axonStartX - 24},${firstSegmentY - 6} ${axonStartX},${firstSegmentY}`}
          stroke={neuronColor}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Axon with Myelin Sheaths */}
        {Array.from({ length: axonSegmentCount }).map((_, i) => {
          const x = axonStartX + i * axonSegmentSpacing;
          const wave = Math.sin((i + 1) * 0.9) * axonCurveAmplitude;
          const segmentY = axonBaselineY + wave;
          const prevWave = Math.sin(i * 0.9) * axonCurveAmplitude;
          const prevSegmentY = axonBaselineY + prevWave;
          const connectorMidY = (prevSegmentY + segmentY) / 2 + Math.sin(i * 1.2) * 3;
          const prevSegmentX = axonStartX + (i - 1) * axonSegmentSpacing;
          const prevSegmentRight = prevSegmentX + axonSegmentWidth;
          const gap = x - prevSegmentRight;
          const connectorControlX = prevSegmentRight + gap / 2;
          return (
            <g key={`myelin-${i}`}>
              {/* Node of Ranvier (gap between myelin) */}
              {i > 0 && (
                <path
                  d={`M ${prevSegmentRight},${prevSegmentY} Q ${connectorControlX},${connectorMidY} ${x},${segmentY}`}
                  stroke={isFiring ? '#22c55e' : '#60a5fa'}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              
              {/* Myelin sheath segment */}
              <rect
                x={x}
                y={segmentY - axonSegmentHeight / 2}
                width={axonSegmentWidth}
                height={axonSegmentHeight}
                rx="10"
                fill={isFiring ? '#bbf7d0' : '#dbeafe'}
                stroke={isFiring ? '#22c55e' : '#3b82f6'}
                strokeWidth="1.5"
                opacity="0.9"
                transform={`rotate(${Math.sin((i + 1) * 0.6) * 2} ${x + axonSegmentWidth / 2} ${segmentY})`}
              />
              
              {/* Inner axon line visible through myelin */}
              <path
                d={`M ${x + 3},${segmentY} Q ${x + axonSegmentWidth / 2},${segmentY + Math.sin((i + 1) * 1.1)} ${x + axonSegmentWidth - 3},${segmentY}`}
                stroke={isFiring ? '#16a34a' : '#2563eb'}
                strokeWidth="2"
                opacity="0.4"
                fill="none"
              />
            </g>
          );
        })}

        {/* Link final myelin segment into terminal branches */}
        <path
          d={`M ${axonEndX},${axonEndY} Q ${(axonEndX + axonTerminalX) / 2},${(axonEndY + terminalBaseY) / 2 + Math.sin(axonSegmentCount * 1.3) * 3} ${axonTerminalX},${terminalBaseY}`}
          stroke={isFiring ? '#22c55e' : '#60a5fa'}
          strokeWidth="3"
          fill="none"
          opacity={0.85}
          strokeLinecap="round"
        />
        
        {/* Signal propagation along axon when firing */}
        {isFiring && (
          <circle
            r="8"
            fill="#22c55e"
            opacity="0"
          >
            <animateMotion
              dur="0.6s"
              repeatCount="1"
              path={axonSignalPath}
              begin="0.1s"
            />
            <animate
              attributeName="opacity"
              values="0;1;0.8;1;0.8;1;0"
              dur="0.6s"
              repeatCount="1"
              begin="0.1s"
            />
          </circle>
        )}
        
        {/* Axon Terminals */}
        {[-35, -15, 0, 15, 35].map((offset, i) => {
          const terminalY = terminalBaseY + offset;
          const isLit = terminalLit;
          
          return (
            <g key={`terminal-${i}`}>
              {/* Branch to terminal */}
              <path
                d={`M ${axonTerminalX},${terminalBaseY} Q 600,${terminalBaseY + offset * 0.3} 618,${terminalY}`}
                stroke={isLit ? '#22c55e' : '#60a5fa'}
                strokeWidth="2.5"
                fill="none"
                opacity={isLit ? 1 : 0.6}
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Terminal button */}
              <g filter={isLit ? "url(#terminalGlow)" : ""}>
                <ellipse
                  cx="625"
                  cy={terminalY}
                  rx="10"
                  ry="8"
                  fill={isLit ? '#22c55e' : '#60a5fa'}
                  opacity={isLit ? 1 : 0.7}
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
              </g>
              
              {/* Synaptic vesicles */}
              <circle
                cx="623"
                cy={terminalY - 2}
                r="2.5"
                fill={isLit ? '#16a34a' : '#2563eb'}
                opacity={isLit ? 1 : 0.5}
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              <circle
                cx="627"
                cy={terminalY + 2}
                r="2.5"
                fill={isLit ? '#16a34a' : '#2563eb'}
                opacity={isLit ? 1 : 0.5}
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Neurotransmitter release animation */}
              {isLit && (
                <>
                  <circle
                    cx="635"
                    cy={terminalY}
                    r="2"
                    fill="#22c55e"
                    opacity="0"
                  >
                    <animate
                      attributeName="cx"
                      from="635"
                      to="650"
                      dur="0.5s"
                      begin="0s"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur="0.5s"
                      begin="0s"
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
        
        {/* Threshold indicator line */}
        <line
          x1="140"
          y1="195"
          x2="200"
          y2="195"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
        <text
          x="170"
          y="210"
          fill="#ef4444"
          fontSize="9"
          textAnchor="middle"
          opacity="0.7"
        >
          threshold: {fireThreshold}
        </text>
        
        {/* Labels */}
        <text x="60" y="35" fill="#e2e8f0" fontSize="11" fontWeight="500">
          Dendrites
        </text>
        <text x="170" y="130" fill="#e2e8f0" fontSize="11" fontWeight="500">
          Cell Body
        </text>
        <text x="400" y="135" fill="#e2e8f0" fontSize="11" fontWeight="500">
          Axon
        </text>
        <text x="600" y="110" fill="#e2e8f0" fontSize="11" fontWeight="500">
          Terminals
        </text>
      </svg>
      
      {/* Status bar */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.75rem',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#e2e8f0'
      }}>
        <div>
          <span style={{ color: '#94a3b8' }}>Signal Strength: </span>
          <span style={{ 
            fontWeight: 'bold',
            color: currentSum >= fireThreshold ? '#22c55e' : '#f59e0b'
          }}>
            {currentSum.toFixed(3)}
          </span>
          <span style={{ color: '#64748b' }}> / {fireThreshold}</span>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          background: isFiring ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#374151',
          borderRadius: '4px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: isFiring ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none'
        }}>
          {isFiring ? '⚡ ACTION POTENTIAL!' : '💤 Below Threshold'}
        </div>
      </div>
      
      {/* Description */}
      {description && (
        <p style={{
          marginTop: '1rem',
          color: '#94a3b8',
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

export default NeuronAnimation;
