"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';

interface DimensionScalingVizProps {
  config?: {
    animationSpeed?: number;
    showCode?: boolean;
    autoPlay?: boolean;
  };
}

const DimensionScalingViz: React.FC<DimensionScalingVizProps> = ({
  config = {
    animationSpeed: 4000,
    showCode: true,
    autoPlay: true
  }
}) => {
  const { animationSpeed = 4000, autoPlay = true } = config;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [dataPoints, setDataPoints] = useState<Array<{x: number[], label: number}>>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const steps = [
    {
      dims: 2,
      title: "2D: Cat vs Dog",
      features: ["Hours of Sleep", "Running Speed"],
      example: "Line divides cats (sleepy, slow) from dogs (active, fast)",
      visualizable: true,
      dataSize: 20
    },
    {
      dims: 3,
      title: "3D: Add Bark Frequency",
      features: ["Sleep", "Speed", "Barks/day"],
      example: "Plane separates in 3D space - still visualizable!",
      visualizable: true,
      dataSize: 30
    },
    {
      dims: 10,
      title: "10D: Full Pet Profile",
      features: ["Sleep", "Speed", "Bark", "Weight", "Height", "Age", "..."],
      example: "9D hyperplane - we see its 2D shadow projection",
      visualizable: false,
      dataSize: 50
    },
    {
      dims: 784,
      title: "784D: Handwritten Digits",
      features: ["Pixel₁", "Pixel₂", "...", "Pixel₇₈₄"],
      example: "Each pixel is a dimension! Same algorithm still works",
      visualizable: false,
      dataSize: 100
    },
    {
      dims: 50000,
      title: "50,000D: Text Classification",
      features: ["Word₁ freq", "Word₂ freq", "..."],
      example: "Bag of words - perceptron handles it effortlessly",
      visualizable: false,
      dataSize: 200
    }
  ];

  // Auto-play through dimensions if enabled
  useEffect(() => {
    if (!autoPlay || !mounted) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, animationSpeed + 2000); // Add pause between transitions

    return () => clearInterval(interval);
  }, [autoPlay, mounted, animationSpeed, steps.length]);

  const colors = useMemo(() => {
    if (!mounted) return {};

    return isDark ? {
      bg: "#0a0a0a",
      textPrimary: "#f3f4f6",
      textSecondary: "#9ca3af",
      borderColor: "#404040",
      accentPrimary: "#a78bfa",
      accentSecondary: "#34d399",
      particleColor: "#8b5cf6",
      mathColor: "#60a5fa",
      shadowColor: "rgba(139, 92, 246, 0.3)"
    } : {
      bg: "#ffffff",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      borderColor: "#e2e8f0",
      accentPrimary: "#6366f1",
      accentSecondary: "#10b981",
      particleColor: "#6366f1",
      mathColor: "#3b82f6",
      shadowColor: "rgba(99, 102, 241, 0.2)"
    };
  }, [isDark, mounted]);

  // Generate synthetic data points for current dimension
  useEffect(() => {
    const step = steps[currentStep];
    if (!step) return;

    const points: Array<{x: number[], label: number}> = [];
    const numPoints = step.dataSize;

    // Generate two clusters
    for (let i = 0; i < numPoints; i++) {
      const label = i < numPoints / 2 ? 0 : 1;
      const features: number[] = [];

      // Generate features based on dimension
      for (let d = 0; d < Math.min(step.dims, 10); d++) {
        // Create separable clusters with some noise
        const base = label === 0 ? -0.3 : 0.3;
        const noise = (Math.random() - 0.5) * 0.5;
        features.push(base + noise);
      }

      points.push({ x: features, label });
    }

    setDataPoints(points);
  }, [currentStep]);

  // Main visualization
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    const step = steps[currentStep];
    if (!step) return;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (step.dims === 2) {
        // 2D visualization with actual perceptron learning

        // Draw data points
        dataPoints.forEach(point => {
          const x = centerX + point.x[0] * 150;
          const y = centerY - point.x[1] * 150;

          ctx.fillStyle = point.label === 0 ? (colors.accentSecondary || '#34d399') : (colors.accentPrimary || '#8b5cf6');
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw decision boundary (animated during training)
        if (isTraining) {
          const angle = trainingProgress * Math.PI - Math.PI/2;
          ctx.strokeStyle = colors.accentPrimary || '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(centerX - Math.sin(angle) * 200, centerY - Math.cos(angle) * 200);
          ctx.lineTo(centerX + Math.sin(angle) * 200, centerY + Math.cos(angle) * 200);
          ctx.stroke();
          ctx.setLineDash([]);
        }

      } else if (step.dims === 3) {
        // 3D visualization with rotation
        const rotation = frameCount * 0.01;

        // Project 3D points to 2D
        dataPoints.forEach(point => {
          const x3d = point.x[0];
          const y3d = point.x[1];
          const z3d = point.x[2] || 0;

          // Rotate around Y axis
          const xRot = x3d * Math.cos(rotation) - z3d * Math.sin(rotation);
          const zRot = x3d * Math.sin(rotation) + z3d * Math.cos(rotation);

          // Project to 2D
          const scale = 2 / (2 + zRot);
          const x2d = centerX + xRot * 150 * scale;
          const y2d = centerY - y3d * 150 * scale;

          ctx.fillStyle = point.label === 0 ? (colors.accentSecondary || '#34d399') : (colors.accentPrimary || '#8b5cf6');
          ctx.globalAlpha = 0.5 + scale * 0.5;
          ctx.beginPath();
          ctx.arc(x2d, y2d, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw rotating plane (decision boundary)
        if (isTraining || trainingProgress > 0) {
          ctx.strokeStyle = colors.accentPrimary + '40';
          ctx.fillStyle = colors.accentPrimary + '10';
          ctx.beginPath();

          // Draw a simple plane
          const planePoints = [
            [-1, -1], [1, -1], [1, 1], [-1, 1]
          ].map(([px, py]) => {
            const x3d = px;
            const y3d = py;
            const z3d = 0;

            const xRot = x3d * Math.cos(rotation) - z3d * Math.sin(rotation);
            const zRot = x3d * Math.sin(rotation) + z3d * Math.cos(rotation);
            const scale = 2 / (2 + zRot);

            return [
              centerX + xRot * 100 * scale,
              centerY - y3d * 100 * scale
            ];
          });

          ctx.moveTo(planePoints[0][0], planePoints[0][1]);
          planePoints.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

      } else {
        // Higher dimensions - show 2D projection
        if (showProjection) {
          // Draw projection explanation
          ctx.font = '14px system-ui';
          ctx.fillStyle = colors.textSecondary || '#9ca3af';
          ctx.textAlign = 'center';
          ctx.fillText('2D Projection of ' + step.dims + 'D space', centerX, 30);

          // Project high-dimensional data to 2D using first 2 principal components
          dataPoints.forEach(point => {
            // Simple projection: just use first 2 dimensions
            const x = centerX + (point.x[0] || 0) * 150;
            const y = centerY - (point.x[1] || 0) * 150;

            ctx.fillStyle = point.label === 0 ? colors.accentSecondary + '80' : colors.accentPrimary + '80';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Show that decision boundary still exists
          ctx.strokeStyle = colors.accentPrimary + '60';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(centerX - 150, centerY + 50);
          ctx.lineTo(centerX + 150, centerY - 50);
          ctx.stroke();
          ctx.setLineDash([]);

          // Indicate lost dimensions
          ctx.font = '12px system-ui';
          ctx.fillStyle = colors.textSecondary + '80';
          ctx.textAlign = 'left';
          ctx.fillText(`${step.dims - 2} dimensions hidden`, 20, canvas.height - 20);
        }

        // For very high dimensions, show abstract representation
        if (step.dims >= 784) {
          // Draw a grid representing pixel space for MNIST
          if (step.dims === 784) {
            const gridSize = 28;
            const cellSize = 8;
            const startX = centerX - (gridSize * cellSize) / 2;
            const startY = centerY - (gridSize * cellSize) / 2;

            // Draw fading grid
            for (let i = 0; i < gridSize; i++) {
              for (let j = 0; j < gridSize; j++) {
                const opacity = Math.random() * 0.3;
                ctx.fillStyle = colors.accentPrimary + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                ctx.fillRect(startX + i * cellSize, startY + j * cellSize, cellSize - 1, cellSize - 1);
              }
            }

            ctx.font = '16px system-ui';
            ctx.fillStyle = colors.textPrimary || '#f3f4f6';
            ctx.textAlign = 'center';
            ctx.fillText('28×28 = 784 dimensions', centerX, startY - 20);
          } else {
            // For 50,000D, show word cloud effect
            const words = ['the', 'and', 'is', 'to', 'of', 'a', 'in', 'that', 'for', 'it'];
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';

            words.forEach((word, i) => {
              const angle = (i / words.length) * Math.PI * 2;
              const radius = 80 + Math.sin(frameCount * 0.01 + i) * 20;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;

              ctx.fillStyle = colors.accentPrimary + Math.floor((0.3 + Math.random() * 0.7) * 255).toString(16).padStart(2, '0');
              ctx.fillText(word, x, y);
            });

            ctx.font = '16px system-ui';
            ctx.fillStyle = colors.textPrimary || '#f3f4f6';
            ctx.fillText('50,000 word dimensions', centerX, centerY);
          }
        }
      }

      frameCount++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, dataPoints, currentStep, colors, isTraining, trainingProgress, showProjection, steps]);

  const handleStepChange = (stepIndex: number) => {
    setIsAnimating(true);
    setCurrentStep(stepIndex);
    setTrainingProgress(0);
    setIsTraining(false);
    setShowProjection(false);

    // Auto-show projection for high dimensions
    if (steps[stepIndex].dims > 3) {
      setTimeout(() => setShowProjection(true), 500);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const simulateTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          setIsTraining(false);
          return 1;
        }
        return prev + 0.02;
      });
    }, animationSpeed / 80); // Use animationSpeed config
  };

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '16px',
        margin: '2rem 0',
        height: '500px',
        background: 'transparent'
      }} />
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: colors.bg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '16px',
      margin: '2rem 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: `0 10px 40px ${colors.shadowColor}`,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          One Algorithm, Any Dimension
        </h3>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.95rem',
          opacity: 0.9
        }}>
          The same perceptron learning rule works from 2D to 50,000D
        </p>
      </div>

      {/* Main Visualization Area */}
      <div style={{
        position: 'relative',
        height: '350px',
        marginBottom: '1.5rem',
        background: `radial-gradient(ellipse at center, ${colors.shadowColor}, transparent)`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* 3D Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={350}
          style={{
            width: '100%',
            height: '100%',
            opacity: isAnimating ? 0.3 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Current Step Info */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: colors.bg + 'ee',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px',
          padding: '1rem',
          maxWidth: '260px'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: colors.accentPrimary,
            marginBottom: '0.5rem'
          }}>
            {steps[currentStep]?.title}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: colors.textSecondary,
            marginBottom: '0.75rem'
          }}>
            {steps[currentStep]?.example}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: colors.textSecondary,
            marginBottom: '0.5rem'
          }}>
            Features: {steps[currentStep]?.features.slice(0, 3).join(', ')}
            {steps[currentStep]?.dims > 3 && '...'}
          </div>
          {steps[currentStep]?.dims <= 3 && (
            <button
              onClick={simulateTraining}
              disabled={isTraining}
              style={{
                padding: '0.4rem 0.8rem',
                background: isTraining ? colors.borderColor : colors.accentPrimary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: isTraining ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isTraining ? `Training... ${Math.round(trainingProgress * 100)}%` : '🧠 Train Perceptron'}
            </button>
          )}
        </div>

        {/* Math Panel */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: colors.bg + 'ee',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: colors.mathColor
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Same Update Rule:
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            if (wrong) {'{'}  <br />
            {'  '}w = w + y·x<br />
            {'}'}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: colors.textSecondary,
            marginTop: '0.5rem'
          }}>
            Works for {steps[currentStep]?.dims.toLocaleString()} dimensions!
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isVisualizable = step.visualizable;

          return (
            <div
              key={index}
              onClick={() => handleStepChange(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.6,
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Dot */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isActive
                  ? (isVisualizable ? colors.accentSecondary : colors.accentPrimary)
                  : colors.borderColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'white' : colors.textSecondary,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                border: `2px solid ${isActive ? 'transparent' : colors.borderColor}`,
                boxShadow: isActive ? `0 0 20px ${colors.shadowColor}` : 'none'
              }}>
                {step.dims}{step.dims > 999 ? 'k' : ''}
              </div>

              {/* Label */}
              <div style={{
                fontSize: '0.75rem',
                color: isActive ? colors.textPrimary : colors.textSecondary,
                textAlign: 'center',
                maxWidth: '80px'
              }}>
                {step.features[0]}
                {step.dims > 2 && '+'}
              </div>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  width: '60px',
                  height: '2px',
                  background: index < currentStep ? colors.accentPrimary : colors.borderColor,
                  left: '100%',
                  top: '20px',
                  marginLeft: '-10px',
                  zIndex: -1
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div style={{
        background: colors.bg,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h4 style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: '1rem'
        }}>
          💡 The Key Insight
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              opacity: currentStep === 0 ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}>📏</div>
            <div style={{
              fontSize: '0.85rem',
              color: colors.textPrimary,
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}>2D: Draw a line</div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>You can see it</div>
          </div>

          <div>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              opacity: currentStep === 1 ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}>🎨</div>
            <div style={{
              fontSize: '0.85rem',
              color: colors.textPrimary,
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}>3D: Find a plane</div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>Still visualizable</div>
          </div>

          <div>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              opacity: currentStep >= 2 ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}>🔮</div>
            <div style={{
              fontSize: '0.85rem',
              color: colors.textPrimary,
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}>10D+: Trust the math</div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>Same algorithm!</div>
          </div>

          <div>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              opacity: currentStep >= 3 ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}>🚀</div>
            <div style={{
              fontSize: '0.85rem',
              color: colors.textPrimary,
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}>50,000D: No problem</div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>Just more loops</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionScalingViz;