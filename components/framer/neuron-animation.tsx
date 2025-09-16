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

        {/* Dendrites - Natural tree-like branching structure */}
        {(() => {
          // Create natural tree-like branching structure
          const branches = [];
          
          // Main dendrite trunks (2-3 main branches)
          const mainBranchCount = 3;
          for (let b = 0; b < mainBranchCount; b++) {
            const branchAngle = -60 + b * 40; // Spread branches naturally
            const branchLength = 80 + Math.sin(b * 1.7) * 15;
            const startX = 145;
            const startY = 160;
            
            // Calculate main branch endpoint with natural curve
            const endX = startX - Math.cos(branchAngle * Math.PI / 180) * branchLength;
            const endY = startY - Math.sin(branchAngle * Math.PI / 180) * branchLength;
            
            branches.push({
              type: 'main',
              index: b,
              startX,
              startY,
              endX,
              endY,
              angle: branchAngle
            });
          }
          
          // Distribute inputs across branches
          const inputsPerBranch = Math.ceil(inputs / mainBranchCount);
          
          return branches.map((branch, branchIdx) => {
            const branchInputs = weights.slice(
              branchIdx * inputsPerBranch,
              Math.min((branchIdx + 1) * inputsPerBranch, inputs)
            ).map((weight, i) => ({
              weight,
              signal: signals[branchIdx * inputsPerBranch + i] || 0,
              index: branchIdx * inputsPerBranch + i
            }));
            
            const isBranchActive = branchInputs.some(inp => inp.signal > 0);
            
            return (
              <g key={`dendrite-branch-${branchIdx}`}>
                {/* Main branch trunk with organic curve */}
                <path
                  d={`M ${branch.startX},${branch.startY}
                      C ${branch.startX - 20},${branch.startY + (branch.angle > 0 ? -5 : 5)}
                        ${branch.endX + 15},${branch.endY}
                        ${branch.endX},${branch.endY}`}
                  stroke={isBranchActive ? '#60a5fa' : '#475569'}
                  strokeWidth={4.5 - branchIdx * 0.3}
                  fill="none"
                  opacity={isBranchActive ? 0.7 : 0.3}
                  strokeLinecap="round"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
                
                {/* Secondary branches */}
                {branchInputs.map((input, inputIdx) => {
                  const progress = 0.3 + (inputIdx / branchInputs.length) * 0.6;
                  const baseX = branch.startX + (branch.endX - branch.startX) * progress;
                  const baseY = branch.startY + (branch.endY - branch.startY) * progress;
                  
                  // Add natural variation to each sub-branch
                  const subAngle = branch.angle + (inputIdx % 2 === 0 ? -25 : 25) + Math.sin(inputIdx * 2.3) * 10;
                  const subLength = 35 + Math.sin(inputIdx * 1.7) * 10;
                  
                  const midX = baseX - Math.cos(subAngle * Math.PI / 180) * (subLength * 0.5);
                  const midY = baseY - Math.sin(subAngle * Math.PI / 180) * (subLength * 0.5);
                  const endX = baseX - Math.cos(subAngle * Math.PI / 180) * subLength;
                  const endY = baseY - Math.sin(subAngle * Math.PI / 180) * subLength;
                  
                  const isActive = input.signal > 0;
                  
                  // Create more tertiary branches for terminal points
                  const tertiaryBranches = [];
                  for (let t = 0; t < 2; t++) {
                    const tAngle = subAngle + (t === 0 ? -20 : 20) + Math.sin(t * 3.1) * 5;
                    const tLength = 15 + Math.sin((inputIdx + t) * 2.1) * 5;
                    const tStartX = endX;
                    const tStartY = endY;
                    const tEndX = tStartX - Math.cos(tAngle * Math.PI / 180) * tLength;
                    const tEndY = tStartY - Math.sin(tAngle * Math.PI / 180) * tLength;
                    
                    tertiaryBranches.push({
                      startX: tStartX,
                      startY: tStartY,
                      endX: tEndX,
                      endY: tEndY
                    });
                  }
                  
                  const dendritePath = `M ${baseX},${baseY}
                    C ${baseX - 5},${baseY + Math.sin(inputIdx) * 3}
                      ${midX},${midY}
                      ${endX},${endY}`;
                  
                  return (
                    <g key={`sub-dendrite-${input.index}`}>
                      {/* Secondary branch */}
                      <path
                        d={dendritePath}
                        stroke={isActive ? '#60a5fa' : '#475569'}
                        strokeWidth={showWeights ? 1.5 + input.weight * 2 : 2}
                        fill="none"
                        opacity={isActive ? 0.8 : 0.25}
                        strokeLinecap="round"
                        style={{
                          transition: 'all 0.3s ease',
                        }}
                      />
                      
                      {/* Tertiary branches (fine dendrite terminals) */}
                      {tertiaryBranches.map((tbranch, tIdx) => (
                        <path
                          key={`tertiary-${input.index}-${tIdx}`}
                          d={`M ${tbranch.startX},${tbranch.startY}
                              C ${tbranch.startX - 3},${tbranch.startY + 2}
                                ${(tbranch.startX + tbranch.endX) / 2},${(tbranch.startY + tbranch.endY) / 2}
                                ${tbranch.endX},${tbranch.endY}`}
                          stroke={isActive ? '#60a5fa' : '#475569'}
                          strokeWidth={showWeights ? 0.5 + input.weight : 1}
                          fill="none"
                          opacity={isActive ? 0.6 : 0.15}
                          strokeLinecap="round"
                        />
                      ))}
                      
                      {/* Dendritic spines (small protrusions) */}
                      <circle
                        cx={endX - 2}
                        cy={endY}
                        r="1.5"
                        fill={isActive ? '#60a5fa' : '#475569'}
                        opacity={isActive ? 0.5 : 0.2}
                      />
                      <circle
                        cx={midX}
                        cy={midY + 2}
                        r="1"
                        fill={isActive ? '#60a5fa' : '#475569'}
                        opacity={isActive ? 0.4 : 0.15}
                      />
                      
                      {/* Signal pulse animation */}
                      {isActive && isAnimating && (
                        <circle
                          r="3"
                          fill="#60a5fa"
                          opacity="0"
                        >
                          <animateMotion
                            dur="0.6s"
                            repeatCount="1"
                            path={dendritePath}
                          />
                          <animate
                            attributeName="opacity"
                            values="0;0.8;1;0.8;0"
                            dur="0.6s"
                            repeatCount="1"
                          />
                        </circle>
                      )}
                      
                      {/* Weight label at terminal */}
                      {showWeights && (
                        <text
                          x={tertiaryBranches[0].endX}
                          y={tertiaryBranches[0].endY - 3}
                          fill="#94a3b8"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          {input.weight.toFixed(2)}
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Additional organic details - small branches */}
                <path
                  d={`M ${branch.endX + 10},${branch.endY - 5}
                      L ${branch.endX + 5},${branch.endY}`}
                  stroke={isBranchActive ? '#60a5fa' : '#475569'}
                  strokeWidth="0.8"
                  opacity="0.2"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${branch.endX + 8},${branch.endY + 5}
                      L ${branch.endX + 3},${branch.endY + 2}`}
                  stroke={isBranchActive ? '#60a5fa' : '#475569'}
                  strokeWidth="0.8"
                  opacity="0.2"
                  strokeLinecap="round"
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
        
        {/* Axon Hillock - Organic transition from soma to axon */}
        <g>
          {/* Smooth organic transition shape */}
          <path
            d={`M 203,153
                C 210,151 218,151 225,152
                C 232,153 237,155 ${axonStartX},${firstSegmentY - 2}
                L ${axonStartX},${firstSegmentY + 2}
                C 237,165 232,167 225,168
                C 218,169 210,169 203,167
                C 201,164 201,156 203,153 Z`}
            fill={neuronColor}
            opacity="0.5"
          />
          
          {/* Natural taper with slight curves */}
          <path
            d={`M 206,156
                Q 215,155 225,${155 + Math.sin(0.5) * 2}
                T ${axonStartX - 5},${firstSegmentY - 1}`}
            stroke={neuronColor}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            d={`M 206,164
                Q 215,165 225,${165 + Math.sin(0.5) * 2}
                T ${axonStartX - 5},${firstSegmentY + 1}`}
            stroke={neuronColor}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          
          {/* Central core of initial segment */}
          <path
            d={`M 208,160 
                C 218,160 228,${160 + Math.sin(0.8) * 3} ${axonStartX},${firstSegmentY}`}
            stroke={isFiring ? '#22c55e' : '#3b82f6'}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          
          {/* Small details for organic texture */}
          <ellipse
            cx="215"
            cy="160"
            rx="8"
            ry="6"
            fill={neuronColor}
            opacity="0.3"
            transform="rotate(-5 215 160)"
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
