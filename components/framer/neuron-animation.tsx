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

        {/* Dendrites - Simplified conceptual branching structure */}
        {(() => {
          // Group inputs into 3 bunches
          const bunchSize = Math.ceil(inputs / 3);
          const bunches = [];
          
          for (let b = 0; b < 3; b++) {
            const startIdx = b * bunchSize;
            const endIdx = Math.min(startIdx + bunchSize, inputs);
            const bunchInputs = [];
            
            for (let i = startIdx; i < endIdx; i++) {
              bunchInputs.push({
                index: i,
                weight: weights[i],
                signal: signals[i] || 0
              });
            }
            
            if (bunchInputs.length > 0) {
              bunches.push({
                index: b,
                inputs: bunchInputs,
                // Deterministic positioning based on bunch index
                yPosition: 80 + b * 80,
                convergenceY: 145 + b * 20
              });
            }
          }
          
          return bunches.map((bunch) => {
            const bunchActive = bunch.inputs.some(inp => inp.signal > 0);
            const avgWeight = bunch.inputs.reduce((sum, inp) => sum + inp.weight, 0) / bunch.inputs.length;
            
            return (
              <g key={`bunch-${bunch.index}`}>
                {/* Individual dendrite terminals */}
                {bunch.inputs.map((input, localIdx) => {
                  const isActive = input.signal > 0;
                  const yOffset = localIdx * 25 - (bunch.inputs.length - 1) * 12.5;
                  const terminalY = bunch.yPosition + yOffset;
                  
                  // Simple curved path from terminal to convergence point
                  const dendritePath = `M 10,${terminalY} 
                    Q 35,${terminalY} 60,${bunch.yPosition}
                    T 90,${bunch.convergenceY}`;
                  
                  return (
                    <g key={`dendrite-${input.index}`}>
                      {/* Main dendrite branch */}
                      <path
                        d={dendritePath}
                        stroke={isActive ? '#3b82f6' : '#475569'}
                        strokeWidth={showWeights ? input.weight * 3 : 2}
                        fill="none"
                        opacity={isActive ? 0.9 : 0.3}
                        strokeLinecap="round"
                        style={{
                          transition: 'all 0.3s ease',
                        }}
                      />
                      
                      {/* Small branches for organic look */}
                      <path
                        d={`M 30,${terminalY - 5} L 35,${terminalY}`}
                        stroke={isActive ? '#3b82f6' : '#475569'}
                        strokeWidth="1"
                        opacity={isActive ? 0.7 : 0.2}
                        strokeLinecap="round"
                      />
                      <path
                        d={`M 30,${terminalY + 5} L 35,${terminalY}`}
                        stroke={isActive ? '#3b82f6' : '#475569'}
                        strokeWidth="1"
                        opacity={isActive ? 0.7 : 0.2}
                        strokeLinecap="round"
                      />
                      
                      {/* Signal pulse animation */}
                      {isActive && isAnimating && (
                        <circle
                          r="4"
                          fill="#60a5fa"
                          style={{
                            filter: 'blur(2px)',
                          }}
                        >
                          <animateMotion
                            dur="0.6s"
                            repeatCount="1"
                            path={dendritePath}
                          />
                          <animate
                            attributeName="opacity"
                            values="0;1;1;0"
                            dur="0.6s"
                            repeatCount="1"
                          />
                        </circle>
                      )}
                      
                      {/* Weight label */}
                      {showWeights && (
                        <text
                          x="10"
                          y={terminalY - 8}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {input.weight.toFixed(2)}
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Convergence trunk connecting to soma */}
                <path
                  d={`M 90,${bunch.convergenceY}
                    C 110,${bunch.convergenceY} 125,${bunch.convergenceY + 5} 145,${160}`}
                  stroke={bunchActive ? '#3b82f6' : '#475569'}
                  strokeWidth={avgWeight * 4}
                  fill="none"
                  opacity={bunchActive ? 0.9 : 0.4}
                  strokeLinecap="round"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
                
                {/* Junction point */}
                <circle
                  cx="90"
                  cy={bunch.convergenceY}
                  r="3"
                  fill={bunchActive ? '#3b82f6' : '#475569'}
                  opacity={bunchActive ? 0.7 : 0.3}
                />
              </g>
            );
          });
        })()}
        
        {/* Cell Body (Soma) - Simplified organic shape */}
        <g filter={isFiring ? "url(#glow)" : ""}>
          {/* Main cell body - slightly irregular circle */}
          <ellipse
            cx="170"
            cy="160"
            rx="38"
            ry="35"
            fill="url(#somaGradient)"
            transform="rotate(-8 170 160)"
          />
          
          {/* Subtle organic bumps for natural look */}
          <ellipse
            cx="158"
            cy="155"
            rx="32"
            ry="28"
            fill={neuronColor}
            opacity="0.5"
            transform="rotate(12 158 155)"
          />
          <ellipse
            cx="175"
            cy="165"
            rx="28"
            ry="30"
            fill={neuronColor}
            opacity="0.4"
            transform="rotate(-15 175 165)"
          />
          
          {/* Cell membrane */}
          <ellipse
            cx="170"
            cy="160"
            rx="38"
            ry="35"
            fill="none"
            stroke={isFiring ? '#22c55e' : '#3b82f6'}
            strokeWidth="2.5"
            opacity="0.9"
            transform="rotate(-8 170 160)"
          />
        </g>
        
        {/* Nucleus */}
        <g>
          {/* Main nucleus */}
          <ellipse
            cx="168"
            cy="158"
            rx="14"
            ry="12"
            fill={nucleusColor}
            opacity="0.85"
            transform="rotate(10 168 158)"
          />
          {/* Nucleolus */}
          <circle
            cx="170"
            cy="157"
            r="4"
            fill="#1e40af"
            opacity="0.9"
          />
        </g>
        
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
        
        {/* Axon Hillock - Simple cone transition */}
        <g>
          {/* Tapered cone shape */}
          <path
            d={`M 205,155 
                L ${axonStartX},${firstSegmentY - 3}
                L ${axonStartX},${firstSegmentY + 3}
                L 205,165 Z`}
            fill={neuronColor}
            opacity="0.6"
          />
          
          {/* Main axon initial segment */}
          <path
            d={`M 208,160 
                C 220,160 230,${firstSegmentY} ${axonStartX},${firstSegmentY}`}
            stroke={neuronColor}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>
        
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
