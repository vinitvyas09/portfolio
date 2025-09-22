"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';

interface MathDetailsProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const MathDetails: React.FC<MathDetailsProps> = ({
  title = "🔍 See the Mathematical Proof",
  children,
  defaultOpen = false
}) => {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const colors = isDark ? {
    bg: 'rgba(168, 85, 247, 0.05)',
    border: '#8b5cf6',
    hoverBg: 'rgba(168, 85, 247, 0.08)',
    text: '#e9d5ff',
    secondaryText: '#c4b5fd',
    buttonBg: 'rgba(168, 85, 247, 0.15)',
    buttonHoverBg: 'rgba(168, 85, 247, 0.25)'
  } : {
    bg: 'rgba(168, 85, 247, 0.03)',
    border: '#a855f7',
    hoverBg: 'rgba(168, 85, 247, 0.05)',
    text: '#6b21a8',
    secondaryText: '#7c3aed',
    buttonBg: 'rgba(168, 85, 247, 0.08)',
    buttonHoverBg: 'rgba(168, 85, 247, 0.12)'
  };

  if (!mounted) {
    return (
      <div style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        minHeight: '60px'
      }} />
    );
  }

  return (
    <div
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: colors.buttonBg,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.2s ease',
          fontSize: '15px',
          fontWeight: '600',
          color: colors.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.buttonHoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.buttonBg;
        }}
        aria-expanded={isOpen}
        aria-controls="math-details-content"
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{
            fontSize: '18px',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block'
          }}>
            ▶
          </span>
          {title}
        </span>
        <span style={{
          fontSize: '13px',
          color: colors.secondaryText,
          fontWeight: '500',
          opacity: 0.9
        }}>
          {isOpen ? 'Click to hide' : 'Click to expand'}
        </span>
      </button>

      <div
        id="math-details-content"
        style={{
          maxHeight: isOpen ? '10000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease-in-out',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div style={{
          padding: '1.5rem',
          paddingTop: '0.5rem',
          fontSize: '15px',
          lineHeight: '1.7',
          color: isDark ? '#e2e8f0' : '#334155'
        }}>
          <div style={{
            padding: '1rem',
            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: colors.secondaryText,
            fontStyle: 'italic'
          }}>
            📚 <strong>Note for casual readers:</strong> You can skip this mathematical derivation and jump to "What This Really Means" below.
            The key insight is that the perceptron is guaranteed to converge on linearly separable data, and it happens quickly!
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MathDetails;