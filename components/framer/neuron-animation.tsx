"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

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
  // Theme handling
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  
  const [signals, setSignals] = useState<number[]>([]);
  const [isFiring, setIsFiring] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [terminalLit, setTerminalLit] = useState(false);

  const { inputs = 5, fireThreshold = 0.4, animationMs = 3000, description } = config;
  
  // Sophisticated color palette
  const colors = useMemo(() => {
    // Default to light colors before mount to avoid hydration mismatch
    if (!mounted) {
      return {
        // Background gradients
        bgGradient1: "#fafafa",
        bgGradient2: "#f3f4f6",
        
        // Neuron colors
        neuronResting: "#6366f1",
        neuronActive: "#10b981",
        nucleusResting: "#4f46e5",
        nucleusActive: "#059669",
        
        // Dendrite colors
        dendriteActive: "#6366f1",
        dendriteInactive: "#cbd5e1",
        
        // Axon colors
        axonActive: "#10b981",
        axonInactive: "#6366f1",
        myelinActive: "#86efac",
        myelinInactive: "#c7d2fe",
        myelinStrokeActive: "#10b981",
        myelinStrokeInactive: "#6366f1",
        
        // Terminal colors
        terminalActive: "#10b981",
        terminalInactive: "#6366f1",
        vesicleActive: "#4ade80",
        vesicleInactive: "#818cf8",
        
        // UI colors
        textPrimary: "#1e293b",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",
        statusBarBg: "rgba(241, 245, 249, 0.95)",
        statusActiveGradient1: "#059669",
        statusActiveGradient2: "#10b981",
        statusInactiveBg: "#e2e8f0",
        progressBarBg: "rgba(148, 163, 184, 0.2)",
        progressBarFill1: "#10b981",
        progressBarFill2: "#4ade80",
        
        // Border colors
        borderColor: "#e2e8f0",
        borderColorHover: "#cbd5e1"
      };
    }
    
    return isDark ? {
      // Dark mode - sophisticated blacks and grays
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      
      // Neuron colors - subtle purple to green shift
      neuronResting: "#a78bfa",
      neuronActive: "#34d399",
      nucleusResting: "#8b5cf6",
      nucleusActive: "#10b981",
      
      // Dendrite colors
      dendriteActive: "#a78bfa",
      dendriteInactive: "#404040",
      
      // Axon colors
      axonActive: "#34d399",
      axonInactive: "#a78bfa",
      myelinActive: "#065f46",
      myelinInactive: "#312e81",
      myelinStrokeActive: "#34d399",
      myelinStrokeInactive: "#a78bfa",
      
      // Terminal colors
      terminalActive: "#34d399",
      terminalInactive: "#a78bfa",
      vesicleActive: "#4ade80",
      vesicleInactive: "#c4b5fd",
      
      // UI colors
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      statusBarBg: "rgba(23, 23, 23, 0.9)",
      statusActiveGradient1: "#065f46",
      statusActiveGradient2: "#34d399",
      statusInactiveBg: "#262626",
      progressBarBg: "rgba(64, 64, 64, 0.5)",
      progressBarFill1: "#34d399",
      progressBarFill2: "#4ade80",
      
      // Border colors
      borderColor: "#404040",
      borderColorHover: "#525252"
    } : {
      // Light mode - classy whites and subtle colors
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      
      // Neuron colors
      neuronResting: "#6366f1",
      neuronActive: "#10b981",
      nucleusResting: "#4f46e5",
      nucleusActive: "#059669",
      
      // Dendrite colors
      dendriteActive: "#6366f1",
      dendriteInactive: "#cbd5e1",
      
      // Axon colors
      axonActive: "#10b981",
      axonInactive: "#6366f1",
      myelinActive: "#d1fae5",
      myelinInactive: "#e0e7ff",
      myelinStrokeActive: "#10b981",
      myelinStrokeInactive: "#6366f1",
      
      // Terminal colors
      terminalActive: "#10b981",
      terminalInactive: "#6366f1",
      vesicleActive: "#4ade80",
      vesicleInactive: "#818cf8",
      
      // UI colors
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      statusBarBg: "rgba(248, 250, 252, 0.95)",
      statusActiveGradient1: "#059669",
      statusActiveGradient2: "#10b981",
      statusInactiveBg: "#e2e8f0",
      progressBarBg: "rgba(148, 163, 184, 0.2)",
      progressBarFill1: "#10b981",
      progressBarFill2: "#4ade80",
      
      // Border colors
      borderColor: "#e2e8f0",
      borderColorHover: "#cbd5e1"
    };
  }, [isDark, mounted]);
  
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

  // Generate deterministic weights for each input (between 0.1 and 1)
  // Using sine function for consistent but varied weights across inputs
  const weights = useMemo(() =>
    Array.from({ length: inputs }, (_, i) => {
      const weight = 0.2 + (Math.sin(i * 1.7) + 1) * 0.4;
      return Math.min(1, Math.max(0.1, weight));
    }), [inputs]);

  const totalWeight = useMemo(() =>
    weights.reduce((acc, weight) => acc + weight, 0), [weights]);
  
  // Threshold explanation:
  // fireThreshold is a value between 0-1 representing the percentage of total possible
  // signal strength needed to trigger the neuron. For example:
  // - 0.5 = 50% of total possible activation needed
  // - 0.7 = 70% of total possible activation needed

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    let animationStopped = false;

    const clearAllTimeouts = () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts = [];
    };

    const runAnimation = (currentCycle: number) => {
      if (animationStopped) return;

      setIsAnimating(true);
      setSignals([]);
      setCurrentSum(0);
      setIsFiring(false);
      setTerminalLit(false);

      // Stagger signal arrivals
      const signalValues: number[] = [];
      weights.forEach((weight, index) => {
        const timeout = setTimeout(() => {
          if (animationStopped) return;

          // Use currentCycle for randomness - this ensures each cycle is truly random
          const signalStrength = pseudoRandom(currentCycle * 1000 + index * 37) > 0.4 ? weight : 0;
          signalValues[index] = signalStrength;

          setSignals([...signalValues]);

          const rawSum = signalValues.reduce((acc, val) => acc + (val || 0), 0);
          const normalizedSum = totalWeight ? rawSum / totalWeight : 0;
          setCurrentSum(normalizedSum);

          // Only fire if threshold is exceeded
          if (normalizedSum >= fireThreshold) {
            const fireTimeout = setTimeout(() => {
              if (animationStopped) return;
              setIsFiring(true);
              // Light up terminals after signal travels down axon
              const terminalTimeout = setTimeout(() => {
                if (animationStopped) return;
                setTerminalLit(true);
              }, 600);
              timeouts.push(terminalTimeout);
            }, 100);
            timeouts.push(fireTimeout);
          }
        }, (index * animationMs) / (inputs * 2));
        timeouts.push(timeout);
      });

      // Reset and loop with incremented cycle
      const cycleTimeout = setTimeout(() => {
        if (animationStopped) return;
        setIsAnimating(false);
        const nextCycle = currentCycle + 1;

        const loopTimeout = setTimeout(() => {
          if (animationStopped) return;
          runAnimation(nextCycle);
        }, 1500);
        timeouts.push(loopTimeout);
      }, animationMs + 1000);
      timeouts.push(cycleTimeout);
    };

    // Start the animation loop
    const initialCycle = Date.now(); // Use timestamp for initial randomness
    runAnimation(initialCycle);

    // Cleanup function
    return () => {
      animationStopped = true;
      clearAllTimeouts();
    };
  }, [weights, totalWeight, fireThreshold, animationMs, inputs]); // Dependencies for animation parameters

  const neuronColor = isFiring ? colors.neuronActive : colors.neuronResting;
  const nucleusColor = isFiring ? colors.nucleusActive : colors.nucleusResting;
  
  // Placeholder to avoid SSR/CSR theme mismatch flash
  if (!mounted) {
    return (
      <div
        style={{
          padding: '2rem',
          borderRadius: '12px',
          margin: '2rem 0',
          height: '400px',
          background: 'transparent',
        }}
      />
    );
  }

  return (
    <div className="neuron-container" style={{
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
                      stroke={isBranchActive ? colors.dendriteActive : colors.dendriteInactive}
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
                              stroke={isActive ? colors.dendriteActive : colors.dendriteInactive}
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
                                  stroke={isActive ? colors.dendriteActive : colors.dendriteInactive}
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
                              fill={isActive ? colors.dendriteActive : colors.dendriteInactive}
                              opacity={isActive ? 0.4 : 0.15}
                            />
                            
                            {/* Signal animation for active inputs */}
                            {(() => {
                              const seed = branchIdx * 1000 + pIdx * 100 + sIdx * 10;
                              const shouldShowSignal = isActive && isAnimating && pseudoRandom(seed) > 0.5;
                              return shouldShowSignal;
                            })() && (
                              <circle
                                r="2.5"
                                fill={colors.dendriteActive}
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
                          stroke={isBranchActive ? colors.dendriteActive : colors.dendriteInactive}
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
                      stroke={isActive ? colors.dendriteActive : colors.dendriteInactive}
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
                        stroke={isActive ? colors.dendriteActive : colors.dendriteInactive}
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
            stroke={isFiring ? colors.neuronActive : colors.neuronResting}
            strokeWidth={isFiring ? "1.5" : "1"}
            opacity={isDark ? "0.8" : "0.9"}
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
            fill={nucleusColor}
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
            stroke={isFiring ? colors.axonActive : colors.axonInactive}
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
                  stroke={isFiring ? colors.axonActive : colors.axonInactive}
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
                fill={isFiring ? colors.myelinActive : colors.myelinInactive}
                stroke={isFiring ? colors.myelinStrokeActive : colors.myelinStrokeInactive}
                strokeWidth="1.5"
                opacity="0.9"
                transform={`rotate(${Math.sin((i + 1) * 0.6) * 2} ${x + axonSegmentWidth / 2} ${segmentY})`}
              />
              
              {/* Inner axon line visible through myelin */}
              <path
                d={`M ${x + 3},${segmentY} Q ${x + axonSegmentWidth / 2},${segmentY + Math.sin((i + 1) * 1.1)} ${x + axonSegmentWidth - 3},${segmentY}`}
                stroke={isFiring ? colors.nucleusActive : colors.nucleusResting}
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
          stroke={isFiring ? colors.axonActive : colors.axonInactive}
          strokeWidth="3"
          fill="none"
          opacity={0.85}
          strokeLinecap="round"
        />
        
        {/* Signal propagation along axon when firing */}
        {isFiring && (
          <circle
            r="8"
            fill={colors.axonActive}
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
        
        {/* Axon Terminals - Realistic branching tree with synaptic boutons */}
        {(() => {
          // Create a natural branching pattern for axon terminals
          interface TerminalBranch {
            mainBranch: { startX: number; startY: number; endX: number; endY: number; angle: number };
            secondaryBranch: { startX: number; startY: number; endX: number; endY: number };
            terminalBranch: { startX: number; startY: number; endX: number; endY: number };
            boutonX: number;
            boutonY: number;
            id: string;
          }
          const terminalBranches: TerminalBranch[] = [];
          
          // Primary branching point
          const primaryBranchX = axonTerminalX;
          const primaryBranchY = terminalBaseY;
          
          // Create 3 main branches that split further
          const mainBranchAngles = [-25, 0, 25]; // Spread angles
          
          mainBranchAngles.forEach((angle, mainIdx) => {
            // Main branch properties
            const mainLength = 25 + Math.sin(mainIdx * 1.7) * 5;
            const mainEndX = primaryBranchX + mainLength;
            const mainEndY = primaryBranchY + Math.sin(angle * Math.PI / 180) * mainLength;
            
            // Each main branch splits into 2-3 secondary branches
            const numSecondary = mainIdx === 1 ? 3 : 2; // Middle branch has 3
            
            for (let secIdx = 0; secIdx < numSecondary; secIdx++) {
              const secAngle = angle + (secIdx - (numSecondary - 1) / 2) * 15;
              const secLength = 20 + Math.sin((mainIdx + secIdx) * 2.1) * 5;
              const secStartX = mainEndX;
              const secStartY = mainEndY;
              const secEndX = secStartX + secLength;
              const secEndY = secStartY + Math.sin(secAngle * Math.PI / 180) * secLength * 1.2;
              
              // Each secondary branch ends in 1-2 terminal boutons
              const numBoutons = secIdx % 2 === 0 ? 2 : 1;
              
              for (let boutIdx = 0; boutIdx < numBoutons; boutIdx++) {
                const boutAngle = secAngle + (boutIdx - 0.5) * 20;
                const boutLength = 12 + Math.sin((secIdx + boutIdx) * 3.1) * 3;
                const boutStartX = secEndX;
                const boutStartY = secEndY;
                const boutEndX = boutStartX + boutLength;
                const boutEndY = boutStartY + Math.sin(boutAngle * Math.PI / 180) * boutLength;
                
                terminalBranches.push({
                  mainBranch: {
                    startX: primaryBranchX,
                    startY: primaryBranchY,
                    endX: mainEndX,
                    endY: mainEndY,
                    angle: angle
                  },
                  secondaryBranch: {
                    startX: secStartX,
                    startY: secStartY,
                    endX: secEndX,
                    endY: secEndY
                  },
                  terminalBranch: {
                    startX: boutStartX,
                    startY: boutStartY,
                    endX: boutEndX,
                    endY: boutEndY
                  },
                  boutonX: boutEndX,
                  boutonY: boutEndY,
                  id: `${mainIdx}-${secIdx}-${boutIdx}`
                });
              }
            }
          });
          
          const isLit = terminalLit;
          
          return (
            <g>
              {/* Main branching structure */}
              {mainBranchAngles.map((angle, idx) => {
                const mainLength = 25 + Math.sin(idx * 1.7) * 5;
                const mainEndX = primaryBranchX + mainLength;
                const mainEndY = primaryBranchY + Math.sin(angle * Math.PI / 180) * mainLength;
                
                return (
                  <path
                    key={`main-terminal-${idx}`}
                    d={`M ${primaryBranchX},${primaryBranchY}
                        Q ${primaryBranchX + 10},${primaryBranchY + Math.sin(angle * Math.PI / 180) * 5}
                          ${mainEndX},${mainEndY}`}
                    stroke={isLit ? colors.terminalActive : colors.terminalInactive}
                    strokeWidth="3"
                    fill="none"
                    opacity={isLit ? 0.9 : 0.6}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.3s ease',
                    }}
                  />
                );
              })}
              
              {/* Secondary and terminal branches with boutons */}
              {terminalBranches.map((branch) => {
                const boutonRadius = 6 + Math.sin(branch.boutonX * 0.1) * 1;
                
                return (
                  <g key={`terminal-${branch.id}`}>
                    {/* Secondary branch */}
                    <path
                      d={`M ${branch.secondaryBranch.startX},${branch.secondaryBranch.startY}
                          C ${branch.secondaryBranch.startX + 5},${branch.secondaryBranch.startY + 2}
                            ${(branch.secondaryBranch.startX + branch.secondaryBranch.endX) / 2},
                            ${(branch.secondaryBranch.startY + branch.secondaryBranch.endY) / 2}
                            ${branch.secondaryBranch.endX},${branch.secondaryBranch.endY}`}
                      stroke={isLit ? colors.terminalActive : colors.terminalInactive}
                      strokeWidth="2"
                      fill="none"
                      opacity={isLit ? 0.85 : 0.5}
                      strokeLinecap="round"
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    />
                    
                    {/* Terminal stalk to bouton */}
                    <path
                      d={`M ${branch.terminalBranch.startX},${branch.terminalBranch.startY}
                          L ${branch.terminalBranch.endX},${branch.terminalBranch.endY}`}
                      stroke={isLit ? colors.terminalActive : colors.terminalInactive}
                      strokeWidth="1.5"
                      fill="none"
                      opacity={isLit ? 0.8 : 0.45}
                      strokeLinecap="round"
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    />
                    
                    {/* Synaptic bouton (terminal knob) */}
                    <g filter={isLit ? "url(#terminalGlow)" : ""}>
                      {/* Bouton body - organic teardrop shape */}
                      <path
                        d={`M ${branch.boutonX},${branch.boutonY}
                            m -${boutonRadius},0
                            c 0,-${boutonRadius * 0.8} ${boutonRadius * 0.8},-${boutonRadius} ${boutonRadius},-${boutonRadius}
                            c ${boutonRadius * 0.2},0 ${boutonRadius},${boutonRadius * 0.2} ${boutonRadius},${boutonRadius}
                            c 0,${boutonRadius * 0.8} -${boutonRadius * 0.8},${boutonRadius} -${boutonRadius},${boutonRadius}
                            c -${boutonRadius * 0.2},0 -${boutonRadius},-${boutonRadius * 0.2} -${boutonRadius},-${boutonRadius}
                            Z`}
                        fill={isLit ? colors.terminalActive : colors.terminalInactive}
                        opacity={isLit ? 0.95 : 0.7}
                        style={{
                          transition: 'all 0.3s ease',
                        }}
                      />
                      
                      {/* Active zone (darker region where neurotransmitters release) */}
                      <ellipse
                        cx={branch.boutonX + boutonRadius * 0.3}
                        cy={branch.boutonY}
                        rx={boutonRadius * 0.4}
                        ry={boutonRadius * 0.5}
                        fill={isLit ? colors.nucleusActive : colors.nucleusResting}
                        opacity={isLit ? 0.8 : 0.5}
                      />
                    </g>
                    
                    {/* Synaptic vesicles inside bouton */}
                    <g>
                      {/* Cluster of vesicles */}
                      <circle
                        cx={branch.boutonX - 2}
                        cy={branch.boutonY - 1}
                        r="1.8"
                        fill={isLit ? colors.vesicleActive : colors.vesicleInactive}
                        opacity={isLit ? 0.9 : 0.4}
                      />
                      <circle
                        cx={branch.boutonX + 1}
                        cy={branch.boutonY + 1}
                        r="1.5"
                        fill={isLit ? colors.vesicleActive : colors.vesicleInactive}
                        opacity={isLit ? 0.85 : 0.35}
                      />
                      <circle
                        cx={branch.boutonX - 1}
                        cy={branch.boutonY + 2}
                        r="1.3"
                        fill={isLit ? colors.vesicleActive : colors.vesicleInactive}
                        opacity={isLit ? 0.8 : 0.3}
                      />
                      <circle
                        cx={branch.boutonX + 2}
                        cy={branch.boutonY - 2}
                        r="1.6"
                        fill={isLit ? colors.vesicleActive : colors.vesicleInactive}
                        opacity={isLit ? 0.85 : 0.35}
                      />
                    </g>
                    
                    {/* Neurotransmitter release animation */}
                    {isLit && (
                      <>
                        {/* Multiple neurotransmitter particles */}
                        {[0, 120, 240].map((delay, idx) => (
                          <circle
                            key={`nt-${idx}`}
                            cx={branch.boutonX + boutonRadius}
                            cy={branch.boutonY + (idx - 1) * 2}
                            r="1.5"
                            fill={colors.axonActive}
                            opacity="0"
                          >
                            <animate
                              attributeName="cx"
                              from={branch.boutonX + boutonRadius}
                              to={branch.boutonX + boutonRadius + 15}
                              dur="0.6s"
                              begin={`${delay}ms`}
                            />
                            <animate
                              attributeName="opacity"
                              values="0;0.8;0.6;0"
                              dur="0.6s"
                              begin={`${delay}ms`}
                            />
                            <animate
                              attributeName="r"
                              values="1.5;2;1.8;1"
                              dur="0.6s"
                              begin={`${delay}ms`}
                            />
                          </circle>
                        ))}
                      </>
                    )}
                  </g>
                );
              })}
              
              {/* Additional fine terminal branches for density */}
              {[-18, 18].map((angle, idx) => {
                const extraX = primaryBranchX + 20;
                const extraY = primaryBranchY + angle * 2;
                const extraEndX = extraX + 35;
                const extraEndY = extraY + angle * 1.5;
                
                return (
                  <g key={`extra-terminal-${idx}`}>
                    <path
                      d={`M ${primaryBranchX},${primaryBranchY}
                          Q ${extraX},${extraY}
                            ${extraEndX},${extraEndY}`}
                      stroke={isLit ? colors.terminalActive : colors.terminalInactive}
                      strokeWidth="1"
                      fill="none"
                      opacity={isLit ? 0.5 : 0.25}
                      strokeLinecap="round"
                    />
                    {/* Small bouton at the end */}
                    <circle
                      cx={extraEndX}
                      cy={extraEndY}
                      r="3.5"
                      fill={isLit ? colors.terminalActive : colors.terminalInactive}
                      opacity={isLit ? 0.7 : 0.4}
                    />
                  </g>
                );
              })}
            </g>
          );
        })()}
        
        {/* Labels */}
        <text x="50" y="50" fill={colors.textPrimary} fontSize="11" fontWeight="500">
          Dendrites
        </text>
        <text x="170" y="120" fill={colors.textPrimary} fontSize="11" fontWeight="500">
          Cell Body
        </text>
        <text x="400" y="135" fill={colors.textPrimary} fontSize="11" fontWeight="500">
          Axon
        </text>
        <text x="600" y="110" fill={colors.textPrimary} fontSize="11" fontWeight="500">
          Terminals
        </text>
      </svg>
      
        {/* Status bar */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: colors.statusBarBg,
          borderRadius: '8px',
          fontSize: '14px',
          color: colors.textPrimary
        }}>
          {/* Top row - Threshold explanation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div style={{ fontSize: '13px', color: colors.textMuted }}>
              <span>Firing threshold: </span>
              <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                {(fireThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{
              padding: '0.25rem 0.75rem',
              background: isFiring ? `linear-gradient(135deg, ${colors.statusActiveGradient1}, ${colors.statusActiveGradient2})` : colors.statusInactiveBg,
              borderRadius: '4px',
              fontWeight: '500',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              boxShadow: isFiring ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none'
            }}>
              {isFiring ? 'Neuron Firing!' : '💤 Inactive'}
            </div>
          </div>
          
          {/* Bottom row - Current signal strength */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: colors.textMuted, fontSize: '13px' }}>Current signal:</span>
            <div style={{
              flex: 1,
              height: '6px',
              background: colors.progressBarBg,
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(currentSum * 100, 100)}%`,
                background: `linear-gradient(90deg, ${colors.progressBarFill1}, ${colors.progressBarFill2})`,
                borderRadius: '3px',
                transition: 'all 0.3s ease'
              }} />
            </div>
            <span style={{ 
              fontWeight: 'bold',
              color: currentSum >= fireThreshold ? colors.terminalActive : colors.textSecondary,
              minWidth: '45px',
              textAlign: 'right'
            }}>
              {(currentSum * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      
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

export default NeuronAnimation;
