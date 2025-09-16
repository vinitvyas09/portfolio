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
    const weight = 0.2 + (Math.sin(i * 1.7) + 1) * 0.4; // Deterministic "random" for consistency
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
          const signalStrength = Math.random() > 0.3 ? weight : 0; // 70% chance of signal
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

  const neuronColor = isFiring ? '#10b981' : '#6b7280';
  const neuronGlow = isFiring ? '0 0 30px rgba(16, 185, 129, 0.6)' : 'none';

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
        height="300"
        viewBox="0 0 600 300"
        style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
      >
        {/* Dendrites (input lines) */}
        {weights.map((weight, index) => {
          const yPos = 50 + (index * 200) / (inputs - 1);
          const signal = signals[index] || 0;
          const isActive = signal > 0;
          
          return (
            <g key={`dendrite-${index}`}>
              {/* Input node */}
              <circle
                cx="50"
                cy={yPos}
                r="8"
                fill={isActive ? '#3b82f6' : '#374151'}
                style={{
                  transition: 'fill 0.3s ease',
                }}
              />
              
              {/* Connection line */}
              <line
                x1="58"
                y1={yPos}
                x2="242"
                y2="150"
                stroke={isActive ? '#3b82f6' : '#4b5563'}
                strokeWidth={showWeights ? weight * 4 : 2}
                opacity={isActive ? 1 : 0.3}
                style={{
                  transition: 'all 0.3s ease',
                }}
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
                    path={`M 50,${yPos} L 250,150`}
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
                  x="30"
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {weight.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Cell body (soma) */}
        <circle
          cx="250"
          cy="150"
          r="35"
          fill={neuronColor}
          stroke={isFiring ? '#10b981' : '#4b5563'}
          strokeWidth="3"
          style={{
            filter: neuronGlow,
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Nucleus */}
        <circle
          cx="250"
          cy="150"
          r="12"
          fill={isFiring ? '#065f46' : '#1f2937'}
          opacity="0.8"
        />
        
        {/* Threshold indicator */}
        <text
          x="250"
          y="155"
          fill="white"
          fontSize="10"
          textAnchor="middle"
          fontWeight="bold"
        >
          {currentSum.toFixed(2)}
        </text>
        
        {/* Axon */}
        <line
          x1="285"
          y1="150"
          x2="450"
          y2="150"
          stroke={isFiring ? '#10b981' : '#4b5563'}
          strokeWidth="3"
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Axon terminals */}
        {[0, -30, 30].map((offset, i) => (
          <g key={`terminal-${i}`}>
            <line
              x1="450"
              y1="150"
              x2="520"
              y2={150 + offset}
              stroke={isFiring ? '#10b981' : '#4b5563'}
              strokeWidth="2"
              style={{
                transition: 'all 0.3s ease',
              }}
            />
            <circle
              cx="525"
              cy={150 + offset}
              r="5"
              fill={isFiring ? '#10b981' : '#374151'}
              style={{
                transition: 'all 0.3s ease',
              }}
            />
          </g>
        ))}
        
        {/* Output pulse when firing */}
        {isFiring && (
          <circle
            r="6"
            fill="#10b981"
            opacity="0"
          >
            <animateMotion
              dur="0.8s"
              repeatCount="1"
              path="M 285,150 L 525,150"
              begin="0.2s"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="0.8s"
              repeatCount="1"
              begin="0.2s"
            />
          </circle>
        )}
        
        {/* Labels */}
        <text x="50" y="25" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Inputs
        </text>
        <text x="230" y="105" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Cell Body
        </text>
        <text x="460" y="130" fill="#e2e8f0" fontSize="12" fontWeight="500">
          Output
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