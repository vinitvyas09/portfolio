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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentDimension, setCurrentDimension] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [particles, setParticles] = useState<Array<{x: number, y: number, z: number, opacity: number}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  // Initialize showMath to true after a short delay
  useEffect(() => {
    if (mounted) {
      setTimeout(() => setShowMath(true), 500);
    }
  }, [mounted]);

  const dimensions = [
    { value: 2, label: "2D", description: "A simple line separates cats from dogs", visual: "line" },
    { value: 3, label: "3D", description: "A plane cuts through 3D space", visual: "plane" },
    { value: 10, label: "10D", description: "A 9D hyperplane in 10D space", visual: "hypercube" },
    { value: 784, label: "784D", description: "Each pixel in a 28×28 image", visual: "pixels" },
    { value: 50000, label: "50K D", description: "Word frequencies in text", visual: "network" }
  ];

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

  // Initialize particles based on dimension
  useEffect(() => {
    const numParticles = Math.min(currentDimension * 2, 100);
    const newParticles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setParticles(newParticles);
  }, [currentDimension]);

  // Canvas animation for particles
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Auto-rotate
      const autoRotationY = frameCount * 0.005;
      const autoRotationX = Math.sin(frameCount * 0.003) * 0.2;

      // Draw particles with 3D projection
      particles.forEach((particle, i) => {
        // Apply rotation
        const rotatedX = particle.x * Math.cos(autoRotationY) - particle.z * Math.sin(autoRotationY);
        const rotatedZ = particle.x * Math.sin(autoRotationY) + particle.z * Math.cos(autoRotationY);
        const rotatedY = particle.y * Math.cos(autoRotationX) - rotatedZ * Math.sin(autoRotationX);

        // Simple 3D to 2D projection
        const scale = 2 / (2 + rotatedZ);
        const projectedX = rotatedX * scale * 100 + canvas.width / 2;
        const projectedY = rotatedY * scale * 100 + canvas.height / 2;
        const size = scale * (currentDimension > 100 ? 2 : 4);

        // Draw particle
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
        ctx.fillStyle = colors.particleColor + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw connections for low dimensions
        if (currentDimension <= 10 && i < particles.length - 1) {
          ctx.beginPath();
          const nextParticle = particles[i + 1];
          const nextRotatedX = nextParticle.x * Math.cos(autoRotationY) - nextParticle.z * Math.sin(autoRotationY);
          const nextRotatedZ = nextParticle.x * Math.sin(autoRotationY) + nextParticle.z * Math.cos(autoRotationY);
          const nextRotatedY = nextParticle.y * Math.cos(autoRotationX) - nextRotatedZ * Math.sin(autoRotationX);
          const nextScale = 2 / (2 + nextRotatedZ);
          const nextProjectedX = nextRotatedX * nextScale * 100 + canvas.width / 2;
          const nextProjectedY = nextRotatedY * nextScale * 100 + canvas.height / 2;

          ctx.moveTo(projectedX, projectedY);
          ctx.lineTo(nextProjectedX, nextProjectedY);
          ctx.strokeStyle = colors.particleColor + '20';
          ctx.lineWidth = scale;
          ctx.stroke();
        }
      });

      // Draw dimension indicator
      if (currentDimension > 3) {
        ctx.font = `bold ${Math.min(60, 300 / Math.log10(currentDimension + 1))}px system-ui`;
        ctx.fillStyle = colors.particleColor + '40';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${currentDimension}D`, canvas.width / 2, canvas.height / 2);
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
  }, [mounted, particles, currentDimension, colors]);

  const transitionToDimension = (newDim: number) => {
    setIsAnimating(true);
    setShowMath(false);

    setTimeout(() => {
      setCurrentDimension(newDim);
      setTimeout(() => {
        setIsAnimating(false);
        setShowMath(true);
      }, 500);
    }, 300);
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
          Scaling to Higher Dimensions
        </h3>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.95rem',
          opacity: 0.9
        }}>
          Watch how the perceptron effortlessly handles any number of dimensions
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

        {/* Floating Info Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: colors.bg + 'ee',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px',
          padding: '1rem',
          maxWidth: '220px',
          opacity: showMath ? 1 : 0,
          transform: showMath ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.5s ease 0.2s'
        }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: colors.accentPrimary,
            marginBottom: '0.5rem'
          }}>
            {currentDimension.toLocaleString()}D
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: colors.textSecondary,
            marginBottom: '0.5rem'
          }}>
            {dimensions.find(d => d.value === currentDimension)?.description || 'High-dimensional space'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            opacity: 0.8,
            fontStyle: 'italic'
          }}>
            {currentDimension <= 3 ? '✨ Human visualizable' : '🤖 Beyond human perception'}
          </div>
        </div>

        {/* Equation Panel */}
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
          fontSize: '0.8rem',
          color: colors.mathColor,
          opacity: showMath ? 1 : 0,
          transform: showMath ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease 0.4s'
        }}>
          <div style={{ marginBottom: '0.25rem' }}>
            y = sign(
            {currentDimension <= 3 ? (
              <span>w₁x₁ + w₂x₂{currentDimension === 3 ? ' + w₃x₃' : ''} + b</span>
            ) : (
              <span>Σ(wᵢxᵢ) + b</span>
            )}
            )
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: colors.textSecondary,
            opacity: 0.7
          }}>
            {currentDimension <= 10 ? `${currentDimension} weights` : `${currentDimension.toLocaleString()} weights to learn!`}
          </div>
        </div>
      </div>

      {/* Dimension Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {dimensions.map((dim) => (
          <button
            key={dim.value}
            onClick={() => transitionToDimension(dim.value)}
            style={{
              padding: '0.6rem 1.2rem',
              background: currentDimension === dim.value ? colors.accentPrimary : colors.bg,
              color: currentDimension === dim.value ? 'white' : colors.textPrimary,
              border: `2px solid ${currentDimension === dim.value ? colors.accentPrimary : colors.borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: currentDimension === dim.value ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
              transform: currentDimension === dim.value ? 'scale(1.05)' : 'scale(1)',
              boxShadow: currentDimension === dim.value ? `0 4px 12px ${colors.shadowColor}` : 'none'
            }}
          >
            <div>{dim.label}</div>
            {dim.value > 100 && (
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                marginTop: '2px'
              }}>
                {dim.visual}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Insight */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: colors.bg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>
            📊
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: '0.25rem'
          }}>
            Same Algorithm
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: colors.textSecondary
          }}>
            One update rule for all dimensions
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: colors.bg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>
            ⚡
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: '0.25rem'
          }}>
            Linear Scaling
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: colors.textSecondary
          }}>
            O(n) complexity for n dimensions
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: colors.bg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>
            🎯
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: '0.25rem'
          }}>
            Convergence Guaranteed
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: colors.textSecondary
          }}>
            If linearly separable
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionScalingViz;