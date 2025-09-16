"use client";

import React, { useState, useEffect } from 'react';

const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Helper function to ensure consistent floating point precision
const roundCoord = (num: number): number => {
  return Math.round(num * 1000) / 1000;
};

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
  const [animationCycle, setAnimationCycle] = useState(0);

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
      setAnimationCycle(prev => prev + 1);
      setIsAnimating(true);
      setSignals([]);
      setCurrentSum(0);
      setIsFiring(false);
      setTerminalLit(false);

      // Stagger signal arrivals
      const signalValues: number[] = [];
      weights.forEach((weight, index) => {
        setTimeout(() => {
          const signalStrength = pseudoRandom(animationCycle * 1000 + index) > 0.3 ? weight : 0;
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

        {/* Dendrites - Dense tree-like branching in all directions */}
        {(() => {
          // Create dendrites radiating in all directions from the soma
          const somaX = 170;
          const somaY = 160;
          const somaRadius = 35; // Define soma radius for proper connection
          
          // Create main dendrite trunks radiating outward
          // More branches for denser canopy, but only on left/top/bottom (not right where axon is)
          const mainBranches = [];
          const numMainBranches = 8; // More main branches for density
          
          for (let i = 0; i < numMainBranches; i++) {
            // Distribute branches around the left hemisphere (avoiding the right side where axon emerges)
            const baseAngle = 90 + (i / (numMainBranches - 1)) * 180; // From 90° (top) to 270° (bottom)
            const angleVariation = Math.sin(i * 2.7) * 12; // Natural variation
            const angle = baseAngle + angleVariation;
            
            // Start from soma edge, not center
            const startX = roundCoord(somaX + Math.cos(angle * Math.PI / 180) * somaRadius);
            const startY = roundCoord(somaY + Math.sin(angle * Math.PI / 180) * somaRadius);
            
            const length = 90 + Math.sin(i * 1.3) * 25; // DOUBLED the lengths for bigger dendrites
            const endX = roundCoord(somaX + Math.cos(angle * Math.PI / 180) * (length + somaRadius));
            const endY = roundCoord(somaY + Math.sin(angle * Math.PI / 180) * (length + somaRadius));
            
            mainBranches.push({
              startX,
              startY,
              endX,
              endY,
              angle,
              index: i
            });
          }
          
          // Map weights to branches
          const inputsPerBranch = Math.ceil(inputs / numMainBranches);
          
          return (
            <>
              {mainBranches.map((branch, branchIdx) => {
                const branchInputs = weights.slice(
                  branchIdx * inputsPerBranch,
                  Math.min((branchIdx + 1) * inputsPerBranch, inputs)
                ).map((weight, i) => ({
                  weight,
                  signal: signals[branchIdx * inputsPerBranch + i] || 0,
                  index: branchIdx * inputsPerBranch + i
                }));
                
                const isBranchActive = branchInputs.some(inp => inp.signal > 0);
                const avgWeight = branchInputs.length > 0 ? 
                  branchInputs.reduce((sum, inp) => sum + inp.weight, 0) / branchInputs.length : 0.5;
                
                // Calculate control points for natural curve
                const ctrl1X = roundCoord(branch.startX + (branch.endX - branch.startX) * 0.3 + Math.sin(branch.angle * 0.02) * 5);
                const ctrl1Y = roundCoord(branch.startY + (branch.endY - branch.startY) * 0.3 + Math.cos(branch.angle * 0.02) * 5);
                
                return (
                  <g key={`dendrite-tree-${branchIdx}`}>
                    {/* Main dendrite trunk */}
                    <path
                      d={`M ${branch.startX},${branch.startY}
                          Q ${ctrl1X},${ctrl1Y}
                            ${branch.endX},${branch.endY}`}
                      stroke={isBranchActive ? '#60a5fa' : '#475569'}
                      strokeWidth={3 + avgWeight * 2}
                      fill="none"
                      opacity={isBranchActive ? 0.6 : 0.25}
                      strokeLinecap="round"
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    />
                    
                    {/* Create secondary branches along the main trunk */}
                    {[0.4, 0.6, 0.8].map((progress, pIdx) => {
                      const trunkX = roundCoord(branch.startX + (branch.endX - branch.startX) * progress);
                      const trunkY = roundCoord(branch.startY + (branch.endY - branch.startY) * progress);
                      
                      // Create 2-3 sub-branches at each point
                      return [-30, 0, 30].map((angleOffset, sIdx) => {
                        const subAngle = branch.angle + angleOffset + Math.sin((pIdx + sIdx) * 2.1) * 10;
                        const subLength = 40 + Math.sin((pIdx + sIdx) * 1.7) * 15; // Doubled sub-branch lengths
                        const subEndX = roundCoord(trunkX + Math.cos(subAngle * Math.PI / 180) * subLength);
                        const subEndY = roundCoord(trunkY + Math.sin(subAngle * Math.PI / 180) * subLength);
                        
                        const inputIdx = pIdx * 3 + sIdx;
                        const input = branchInputs[inputIdx % branchInputs.length];
                        const isActive = input && input.signal > 0;
                        
                        return (
                          <g key={`sub-${branchIdx}-${pIdx}-${sIdx}`}>
                            {/* Secondary branch */}
                            <path
                              d={`M ${trunkX},${trunkY}
                                  C ${trunkX + 5},${trunkY + Math.sin(angleOffset) * 2}
                                    ${(trunkX + subEndX) / 2},${(trunkY + subEndY) / 2}
                                    ${subEndX},${subEndY}`}
                              stroke={isActive ? '#60a5fa' : '#475569'}
                              strokeWidth={1.5 + (input ? input.weight * 1.5 : 0.5)}
                              fill="none"
                              opacity={isActive ? 0.7 : 0.2}
                              strokeLinecap="round"
                              style={{
                                transition: 'all 0.3s ease',
                              }}
                            />
                            
                            {/* Tertiary spikes for dense canopy effect */}
                            {[-20, 20].map((tAngle, tIdx) => {
                              const spikeAngle = subAngle + tAngle;
                              const spikeLength = 15 + Math.sin((tIdx + sIdx) * 3.1) * 5; // Doubled spike lengths
                              const spikeEndX = roundCoord(subEndX + Math.cos(spikeAngle * Math.PI / 180) * spikeLength);
                              const spikeEndY = roundCoord(subEndY + Math.sin(spikeAngle * Math.PI / 180) * spikeLength);
                              
                              return (
                                <path
                                  key={`spike-${tIdx}`}
                                  d={`M ${subEndX},${subEndY} L ${spikeEndX},${spikeEndY}`}
                                  stroke={isActive ? '#60a5fa' : '#475569'}
                                  strokeWidth="0.8"
                                  opacity={isActive ? 0.5 : 0.15}
                                  strokeLinecap="round"
                                />
                              );
                            })}
                            
                            {/* Dendritic spine */}
                            <circle
                              cx={subEndX}
                              cy={subEndY}
                              r="1.2"
                              fill={isActive ? '#60a5fa' : '#475569'}
                              opacity={isActive ? 0.4 : 0.15}
                            />
                            
                            {/* Signal animation for active inputs */}
                            {(() => {
                              const seed = branchIdx * 1000 + pIdx * 100 + sIdx * 10 + animationCycle;
                              const shouldShowSignal = isActive && isAnimating && pseudoRandom(seed) > 0.5;
                              return shouldShowSignal;
                            })() && (
                              <circle
                                r="2.5"
                                fill="#60a5fa"
                                opacity="0"
                              >
                                <animateMotion
                                  dur="0.5s"
                                  repeatCount="1"
                                  path={`M ${subEndX},${subEndY} L ${trunkX},${trunkY}`}
                                />
                                <animate
                                  attributeName="opacity"
                                  values="0;0.8;0.8;0"
                                  dur="0.5s"
                                  repeatCount="1"
                                />
                              </circle>
                            )}
                          </g>
                        );
                      });
                    })}
                    
                    {/* Terminal branches at the end */}
                    {[-25, 0, 25].map((angleOffset, tIdx) => {
                      const termAngle = branch.angle + angleOffset;
                      const termLength = 24; // Doubled terminal lengths
                      const termEndX = roundCoord(branch.endX + Math.cos(termAngle * Math.PI / 180) * termLength);
                      const termEndY = roundCoord(branch.endY + Math.sin(termAngle * Math.PI / 180) * termLength);
                      
                      return (
                        <path
                          key={`term-${tIdx}`}
                          d={`M ${branch.endX},${branch.endY} L ${termEndX},${termEndY}`}
                          stroke={isBranchActive ? '#60a5fa' : '#475569'}
                          strokeWidth="1"
                          opacity={isBranchActive ? 0.4 : 0.12}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>
                );
              })}
              
              {/* Additional fine dendrites for extra density */}
              {[45, 135, 180, 225, 315].map((angle, idx) => {
                const length = 50 + Math.sin(idx * 2.3) * 20; // Doubled fine dendrite lengths
                const startX = roundCoord(somaX + Math.cos(angle * Math.PI / 180) * somaRadius);
                const startY = roundCoord(somaY + Math.sin(angle * Math.PI / 180) * somaRadius);
                const endX = roundCoord(somaX + Math.cos(angle * Math.PI / 180) * (length + somaRadius));
                const endY = roundCoord(somaY + Math.sin(angle * Math.PI / 180) * (length + somaRadius));
                const isActive = signals[idx % signals.length] > 0;
                
                return (
                  <g key={`extra-dendrite-${idx}`}>
                    <path
                      d={`M ${startX},${startY} L ${endX},${endY}`}
                      stroke={isActive ? '#60a5fa' : '#475569'}
                      strokeWidth="1.5"
                      opacity={isActive ? 0.4 : 0.1}
                      strokeLinecap="round"
                    />
                    {/* Small branches */}
                    {[-15, 15].map((offset, i) => (
                      <path
                        key={i}
                        d={`M ${endX},${endY} 
                            L ${roundCoord(endX + Math.cos((angle + offset) * Math.PI / 180) * 16)},
                              ${roundCoord(endY + Math.sin((angle + offset) * Math.PI / 180) * 16)}`}
                        stroke={isActive ? '#60a5fa' : '#475569'}
                        strokeWidth="0.6"
                        opacity={isActive ? 0.3 : 0.08}
                        strokeLinecap="round"
                      />
                    ))}
                  </g>
                );
              })}
            </>
          );
        })()}
        
        {/* Cell Body (Soma) - Organic integrated form with dendrite connection points */}
        <g filter={isFiring ? "url(#glow)" : ""}>
          {/* Main soma body - organic blob with dendrite protrusions */}
          <path
            d={(() => {
              // Generate organic soma shape with connection points for dendrites
              const points = [];
              const numPoints = 24; // More points for smoother shape
              const centerX = 170;
              const centerY = 160;
              
              for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const baseRadius = 32;
                
                // Add variation for organic shape
                // Make protrusions where dendrites connect
                let radius = baseRadius;
                const angleInDegrees = angle * 180 / Math.PI;
                
                // Create bulges where main dendrites connect (left side)
                if (angleInDegrees > 90 && angleInDegrees < 270) {
                  radius += Math.sin(angle * 4) * 5 + Math.cos(angle * 3) * 3;
                } else {
                  // Smoother on the right side where axon emerges
                  radius += Math.sin(angle * 2) * 2;
                }
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                points.push({ x, y, angle });
              }
              
              // Create smooth bezier path through points
              let path = `M ${points[0].x},${points[0].y}`;
              
              for (let i = 0; i < points.length; i++) {
                const current = points[i];
                const next = points[(i + 1) % points.length];
                const nextNext = points[(i + 2) % points.length];
                
                // Control points for smooth curves
                const cp1x = current.x + Math.cos(current.angle + Math.PI/2) * 8;
                const cp1y = current.y + Math.sin(current.angle + Math.PI/2) * 8;
                const cp2x = next.x + Math.cos(next.angle - Math.PI/2) * 8;
                const cp2y = next.y + Math.sin(next.angle - Math.PI/2) * 8;
                
                path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
              }
              
              path += ' Z';
              return path;
            })()}
            fill="url(#somaGradient)"
            opacity="0.85"
          />
          
          {/* Inner soma texture for depth */}
          <ellipse
            cx="168"
            cy="160"
            rx="26"
            ry="24"
            fill={neuronColor}
            opacity="0.3"
            transform="rotate(15 168 160)"
          />
          
          {/* Cytoplasm texture */}
          <ellipse
            cx="172"
            cy="158"
            rx="22"
            ry="20"
            fill={neuronColor}
            opacity="0.25"
            transform="rotate(-25 172 158)"
          />
          
          {/* Cell membrane - matching the main soma shape */}
          <path
            d={(() => {
              // Same shape generation for outline
              const points = [];
              const numPoints = 24;
              const centerX = 170;
              const centerY = 160;
              
              for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const baseRadius = 32;
                let radius = baseRadius;
                const angleInDegrees = angle * 180 / Math.PI;
                
                if (angleInDegrees > 90 && angleInDegrees < 270) {
                  radius += Math.sin(angle * 4) * 5 + Math.cos(angle * 3) * 3;
                } else {
                  radius += Math.sin(angle * 2) * 2;
                }
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                points.push({ x, y, angle });
              }
              
              let path = `M ${points[0].x},${points[0].y}`;
              
              for (let i = 0; i < points.length; i++) {
                const current = points[i];
                const next = points[(i + 1) % points.length];
                
                const cp1x = current.x + Math.cos(current.angle + Math.PI/2) * 8;
                const cp1y = current.y + Math.sin(current.angle + Math.PI/2) * 8;
                const cp2x = next.x + Math.cos(next.angle - Math.PI/2) * 8;
                const cp2y = next.y + Math.sin(next.angle - Math.PI/2) * 8;
                
                path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
              }
              
              path += ' Z';
              return path;
            })()}
            fill="none"
            stroke={isFiring ? '#22c55e' : '#3b82f6'}
            strokeWidth="2.5"
            opacity="0.9"
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
        <text x="50" y="50" fill="#e2e8f0" fontSize="11" fontWeight="500">
          Dendrites
        </text>
        <text x="170" y="120" fill="#e2e8f0" fontSize="11" fontWeight="500">
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
