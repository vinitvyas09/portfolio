"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';

interface DimensionExample {
  dim: number;
  title: string;
  example: string;
  features: string[];
  equationTerms: string[];
  visualizable: boolean;
}

interface DimensionScalingVizProps {
  config?: {
    animationSpeed?: number;
    showCode?: boolean;
    autoPlay?: boolean;
  };
}

const DimensionScalingViz: React.FC<DimensionScalingVizProps> = ({
  config = {
    animationSpeed: 3000,
    showCode: true,
    autoPlay: false
  }
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const examples: DimensionExample[] = [
    {
      dim: 2,
      title: "2D: Cats vs Dogs",
      example: "Sleep hours, Running speed",
      features: ["sleep_hours", "running_speed"],
      equationTerms: ["w₁×sleep", "w₂×speed"],
      visualizable: true
    },
    {
      dim: 3,
      title: "3D: Add Bark Frequency",
      example: "Sleep, Speed, Bark frequency",
      features: ["sleep_hours", "running_speed", "bark_freq"],
      equationTerms: ["w₁×sleep", "w₂×speed", "w₃×bark"],
      visualizable: true
    },
    {
      dim: 10,
      title: "10D: Real Dog Features",
      example: "Weight, age, tail wag rate, ear position...",
      features: ["weight", "age", "tail_wag", "ear_pos", "fur_len", "bark_vol", "energy", "size", "treat_love", "fetch_skill"],
      equationTerms: ["w₁×weight", "w₂×age", "w₃×tail", "w₄×ear", "w₅×fur", "w₆×bark", "w₇×energy", "w₈×size", "w₉×treat", "w₁₀×fetch"],
      visualizable: false
    },
    {
      dim: 784,
      title: "784D: Handwritten Digits",
      example: "Each pixel in 28×28 image",
      features: Array.from({length: 784}, (_, i) => `pixel_${i+1}`),
      equationTerms: ["w₁×px₁", "w₂×px₂", "w₃×px₃", "...", "w₇₈₄×px₇₈₄"],
      visualizable: false
    },
    {
      dim: 50000,
      title: "50,000D: Text Classification",
      example: "Word frequencies in vocabulary",
      features: Array.from({length: 50000}, (_, i) => `word_${i+1}_freq`),
      equationTerms: ["w₁×freq₁", "w₂×freq₂", "...", "w₅₀₀₀₀×freq₅₀₀₀₀"],
      visualizable: false
    }
  ];

  const colors = useMemo(() => {
    if (!mounted) return {};

    return isDark ? {
      bgGradient1: "#0a0a0a",
      bgGradient2: "#171717",
      textPrimary: "#f3f4f6",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      borderColor: "#404040",
      accentPrimary: "#a78bfa",
      accentSecondary: "#34d399",
      codeBackground: "#1a1a1a",
      equationBg: "#262626",
      visualBg: "#374151",
      nonVisualBg: "#ef4444",
      loopColor: "#fbbf24",
      mathColor: "#60a5fa"
    } : {
      bgGradient1: "#ffffff",
      bgGradient2: "#fafafa",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      textMuted: "#94a3b8",
      borderColor: "#e2e8f0",
      accentPrimary: "#6366f1",
      accentSecondary: "#10b981",
      codeBackground: "#f8fafc",
      equationBg: "#f1f5f9",
      visualBg: "#dcfce7",
      nonVisualBg: "#fecaca",
      loopColor: "#f59e0b",
      mathColor: "#3b82f6"
    };
  }, [isDark, mounted]);

  const currentExample = examples[currentIndex];

  const nextExample = () => {
    if (currentIndex < examples.length - 1) {
      setIsAnimating(true);
      setProgress(0); // Reset progress on manual navigation
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const prevExample = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setProgress(0); // Reset progress on manual navigation
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setProgress(0); // Reset progress
    setIsAnimating(false);
  };

  // Auto-advance animation with progress bar
  useEffect(() => {
    if (!mounted) return;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(prevIndex => (prevIndex + 1) % examples.length);
          return 0; // Reset progress
        }
        return prev + (100 / (4000 / 100)); // 4 seconds = 4000ms, update every 100ms
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [mounted, examples.length]);

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        margin: '2rem 0',
        height: '600px',
        background: 'transparent'
      }} />
    );
  }

  return (
    <div style={{
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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          The Algorithm Doesn't Care About Dimensions
        </h3>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.9rem'
        }}>
          Same math, same code, same logic—whether it's 2 features or 50,000
        </p>
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: colors.textMuted
        }}>
          Auto-advancing in:
        </div>
        <div style={{
          width: '150px',
          height: '6px',
          background: colors.borderColor,
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: colors.accentPrimary,
            transition: 'width 0.1s ease',
            borderRadius: '3px'
          }} />
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: colors.textSecondary,
          minWidth: '30px'
        }}>
          {Math.ceil((100 - progress) / 25)}s
        </div>
      </div>

      {/* Main content area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Left: Visual/Concept */}
        <div style={{
          background: currentExample.visualizable ? colors.visualBg : colors.nonVisualBg,
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          position: 'relative',
          opacity: isAnimating ? 0.5 : 1,
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          height: '220px', // Fixed height for all boxes
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            {currentExample.visualizable ? '👁️' : '🤖'}
          </div>

          <h4 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: '0.5rem'
          }}>
            {currentExample.title}
          </h4>

          <p style={{
            color: colors.textSecondary,
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            {currentExample.example}
          </p>

          <div style={{
            background: currentExample.visualizable ? colors.accentSecondary : colors.nonVisualBg,
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '1.5rem' // Add more space below the badge
          }}>
            {currentExample.visualizable ? 'Human Visualizable' : 'Beyond Human Vision'}
          </div>
        </div>

        {/* Right: The Math */}
        <div style={{
          background: colors.equationBg,
          borderRadius: '8px',
          padding: '1.5rem',
          opacity: isAnimating ? 0.5 : 1,
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          height: '220px', // Fixed height to match left box
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            The Math (Always the Same!)
          </h4>

          <div style={{
            background: colors.codeBackground,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '6px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: colors.mathColor,
            lineHeight: '1.8',
            overflowX: 'auto',
            flex: 1, // Take remaining space
            overflow: 'auto' // Scroll if content is too long
          }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: colors.textPrimary }}>
              Activation =
            </div>

            {/* Show first few terms on separate lines */}
            {currentExample.equationTerms.slice(0, Math.min(4, currentExample.equationTerms.length - 1)).map((term, index) => (
              <div key={index} style={{ marginLeft: '1rem', color: colors.mathColor }}>
                {index === 0 ? '' : '+ '}{term}
              </div>
            ))}

            {/* Show ellipsis if there are many terms */}
            {currentExample.equationTerms.length > 5 && (
              <div style={{ marginLeft: '1rem', color: colors.textMuted, fontStyle: 'italic' }}>
                + ... ({currentExample.dim - 4} more terms)
              </div>
            )}

            {/* Show last term if there are many, otherwise show bias */}
            {currentExample.equationTerms.length > 5 && (
              <div style={{ marginLeft: '1rem', color: colors.mathColor }}>
                + {currentExample.equationTerms[currentExample.equationTerms.length - 2]}
              </div>
            )}

            <div style={{ marginLeft: '1rem', color: colors.mathColor }}>
              + bias
            </div>

            <div style={{ color: colors.textMuted, fontSize: '0.65rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
              = Σ(wᵢ × xᵢ) + b  for i = 1 to {currentExample.dim}
            </div>
          </div>

        </div>
      </div>

      {/* Dimension indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: colors.accentPrimary,
          textAlign: 'center'
        }}>
          {currentExample.dim}D
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: colors.textMuted,
          maxWidth: '200px',
          height: '3.6rem', // Fixed height for 3 lines of text
          lineHeight: '1.2',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          {currentExample.dim <= 3 ?
            "You can visualize this!" :
            `${currentExample.dim.toLocaleString()} dimensions - impossible to visualize, but math doesn't care!`
          }
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setProgress(0); // Reset progress on manual navigation
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentIndex ? colors.accentPrimary : colors.borderColor,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={prevExample}
          disabled={currentIndex === 0}
          style={{
            padding: '0.5rem 1rem',
            background: currentIndex === 0 ? colors.borderColor : colors.accentPrimary,
            color: currentIndex === 0 ? colors.textMuted : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          ← Previous
        </button>


        <button
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            background: colors.codeBackground,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          🔄 Reset
        </button>

        <button
          onClick={nextExample}
          disabled={currentIndex === examples.length - 1}
          style={{
            padding: '0.5rem 1rem',
            background: currentIndex === examples.length - 1 ? colors.borderColor : colors.accentPrimary,
            color: currentIndex === examples.length - 1 ? colors.textMuted : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentIndex === examples.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Next →
        </button>
      </div>

      {/* Key insight */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: colors.accentPrimary,
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.9rem',
          fontWeight: '500',
          margin: '0'
        }}>
          💡 Key Insight: The perceptron algorithm is <strong>dimension-agnostic</strong>.
          The same `sum(w * x)` operation works whether you have 2 features or 50,000!
        </p>
      </div>
    </div>
  );
};

export default DimensionScalingViz;