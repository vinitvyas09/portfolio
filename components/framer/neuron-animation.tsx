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
    fireThreshold: 0.7,
    animationMs: 3000,
    description: "Watch signals arrive at different strengths (thickness = importance). When enough strong signals align, the neuron fires!"
  }
}) => {
  const [signals, setSignals] = useState<number[]>([]);
  const [isFiring, setIsFiring] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { inputs = 5, showWeights = true, fireThreshold = 0.7, animationMs = 3000, description } = config;

  // Generate random weights for each input (between 0.1 and 1)
  const weights = Array.from({ length: inputs }, (_, i) => {
    const weight = 0.2 + (Math.sin(i * 1.7) + 1) * 0.4;
    return Math.min(1, Math.max(0.1, weight));
  });

  useEffect(() => {
    const runAnimation = () => {
      setIsAnimating(true);
      setSignals([]);
      setCurrentSum(0);
      setIsFiring(false);

      // Stagger signal arrivals
      const signalValues: number[] = [];
      weights.forEach((weight, index) => {
        setTimeout(() => {
          const signalStrength = Math.random() > 0.3 ? weight : 0;
          signalValues[index] = signalStrength;
          
          setSignals([...signalValues]);
          
          const sum = signalValues.reduce((acc, val) => acc + (val || 0), 0) / inputs;
          setCurrentSum(sum);
          
          if (sum >= fireThreshold && !isFiring) {
            setTimeout(() => setIsFiring(true), 100);
          }
        }, (index * animationMs) / (inputs * 2));
      });

      // Reset and loop
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(runAnimation, 1000);
      }, animationMs);
    };

    runAnimation();
  }, []);

  const neuronColor = isFiring ? '#10b981' : '#64b5f6';
  const nucleusColor = isFiring ? '#065f46' : '#1565c0';

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
        height="400"
        viewBox="0 0 600 400"
        style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
      >
        <defs>
          <radialGradient id="somaGradient">
            <stop offset="0%" stopColor={neuronColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={neuronColor} stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Dendrites - Tree-like branching structure */}
        {weights.map((weight, index) => {
          const angle = (index * 120) / inputs - 60;
          const signal = signals[index] || 0;
          const isActive = signal > 0;
          
          // Main dendrite branch
          const startX = 300 + Math.cos((angle - 90) * Math.PI / 180) * 60;
          const startY = 120 + Math.sin((angle - 90) * Math.PI / 180) * 60;
          const midX = 300 + Math.cos((angle - 90) * Math.PI / 180) * 100;
          const midY = 120 + Math.sin((angle - 90) * Math.PI / 180) * 100;
          const endX = 300 + Math.cos((angle - 90) * Math.PI / 180) * 140;
          const endY = 70 + Math.sin((angle - 90) * Math.PI / 180) * 100;
          
          return (
            <g key={`dendrite-${index}`}>
              {/* Main dendrite branch */}
              <path
                d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
                stroke={isActive ? '#3b82f6' : '#4b5563'}
                strokeWidth={showWeights ? weight * 3 : 2}
                fill="none"
                opacity={isActive ? 1 : 0.4}
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Sub-branches */}
              <path
                d={`M ${midX},${midY} L ${midX - 15},${midY - 20}`}
                stroke={isActive ? '#3b82f6' : '#4b5563'}
                strokeWidth={1}
                opacity={isActive ? 0.8 : 0.3}
              />
              <path
                d={`M ${midX},${midY} L ${midX + 15},${midY - 20}`}
                stroke={isActive ? '#3b82f6' : '#4b5563'}
                strokeWidth={1}
                opacity={isActive ? 0.8 : 0.3}
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
                    dur="0.5s"
                    repeatCount="1"
                    path={`M ${endX},${endY} Q ${midX},${midY} ${startX},${startY}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="0.5s"
                    repeatCount="1"
                  />
                </circle>
              )}
              
              {/* Weight label */}
              {showWeights && (
                <text
                  x={endX}
                  y={endY - 5}
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
        
        {/* Cell Body (Soma) - Irregular shape like real neuron */}
        <g filter={isFiring ? "url(#glow)" : ""}>
          <ellipse
            cx="300"
            cy="120"
            rx="45"
            ry="40"
            fill="url(#somaGradient)"
            stroke={isFiring ? '#10b981' : '#2196f3'}
            strokeWidth="2"
            style={{
              transition: 'all 0.3s ease',
            }}
          />
          
          {/* Make it more organic with additional circles */}
          <circle
            cx="285"
            cy="115"
            r="35"
            fill={neuronColor}
            opacity="0.7"
          />
          <circle
            cx="315"
            cy="125"
            r="30"
            fill={neuronColor}
            opacity="0.7"
          />
        </g>
        
        {/* Nucleus */}
        <circle
          cx="300"
          cy="120"
          r="15"
          fill={nucleusColor}
          opacity="0.9"
        />
        <circle
          cx="303"
          cy="117"
          r="5"
          fill="#0d47a1"
          opacity="0.8"
        />
        
        {/* Sum display */}
        <text
          x="300"
          y="125"
          fill="white"
          fontSize="10"
          textAnchor="middle"
          fontWeight="bold"
        >
          {currentSum.toFixed(2)}
        </text>
        
        {/* Axon Hillock (connection to axon) */}
        <path
          d="M 300,160 L 295,175 L 305,175 Z"
          fill={neuronColor}
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Axon with Myelin Sheaths */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 185 + i * 35;
          return (
            <g key={`myelin-${i}`}>
              {/* Myelin sheath segment */}
              <rect
                x="292"
                y={y}
                width="16"
                height="25"
                rx="8"
                fill={isFiring ? '#bbf7d0' : '#e0f2fe'}
                stroke={isFiring ? '#10b981' : '#2196f3'}
                strokeWidth="1.5"
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              
              {/* Node of Ranvier (gap) */}
              <line
                x1="300"
                y1={y - 5}
                x2="300"
                y2={y}
                stroke={isFiring ? '#10b981' : '#64b5f6'}
                strokeWidth="3"
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
            </g>
          );
        })}
        
        {/* Axon line (visible in gaps) */}
        <line
          x1="300"
          y1="175"
          x2="300"
          y2="360"
          stroke={isFiring ? '#10b981' : '#64b5f6'}
          strokeWidth="3"
          strokeDasharray="0 35"
          strokeDashoffset="-5"
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Axon Terminals */}
        {[-30, 0, 30].map((offset, i) => (
          <g key={`terminal-${i}`}>
            <path
              d={`M 300,360 Q 300,370 ${300 + offset},380`}
              stroke={isFiring ? '#10b981' : '#64b5f6'}
              strokeWidth="2"
              fill="none"
              style={{
                transition: 'all 0.3s ease',
              }}
            />
            {/* Terminal buttons */}
            <circle
              cx={300 + offset}
              cy="380"
              r="6"
              fill={isFiring ? '#10b981' : '#64b5f6'}
              style={{
                transition: 'all 0.3s ease',
              }}
            />
            {/* Synaptic vesicles */}
            <circle
              cx={300 + offset - 2}
              cy="378"
              r="2"
              fill={isFiring ? '#065f46' : '#1565c0'}
              opacity="0.7"
            />
            <circle
              cx={300 + offset + 2}
              cy="381"
              r="2"
              fill={isFiring ? '#065f46' : '#1565c0'}
              opacity="0.7"
            />
          </g>
        ))}
        
        {/* Output pulse animation when firing */}
        {isFiring && (
          <>
            {/* Pulse down axon */}
            <circle
              r="6"
              fill="#10b981"
              opacity="0"
            >
              <animateMotion
                dur="0.8s"
                repeatCount="1"
                path="M 300,160 L 300,360"
                begin="0.2s"
              />
              <animate
                attributeName="opacity"
                values="0;1;0;1;0;1;0"
                dur="0.8s"
                repeatCount="1"
                begin="0.2s"
              />
            </circle>
            
            {/* Terminal release */}
            {[-30, 0, 30].map((offset, i) => (
              <circle
                key={`release-${i}`}
                cx={300 + offset}
                cy="385"
                r="3"
                fill="#10b981"
                opacity="0"
              >
                <animate
                  attributeName="cy"
                  from="385"
                  to="395"
                  dur="0.5s"
                  begin="1s"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="0.5s"
                  begin="1s"
                />
              </circle>
            ))}
          </>
        )}
        
        {/* Labels */}
        <text x="380" y="50" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Dendrites
        </text>
        <text x="355" y="120" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Cell Body
        </text>
        <text x="320" y="270" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Axon
        </text>
        <text x="340" y="380" fill="#e2e8f0" fontSize="12" fontWeight="500">
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
          <span style={{ color: '#94a3b8' }}>Sum: </span>
          <span style={{ 
            fontWeight: 'bold',
            color: currentSum >= fireThreshold ? '#10b981' : '#f59e0b'
          }}>
            {currentSum.toFixed(3)}
          </span>
          <span style={{ color: '#64748b' }}> / {fireThreshold}</span>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          background: isFiring ? '#10b981' : '#374151',
          borderRadius: '4px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: isFiring ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
        }}>
          {isFiring ? '🔥 FIRING!' : 'Resting'}
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