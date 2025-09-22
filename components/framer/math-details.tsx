"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';

interface MathDetailsProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const MathDetails: React.FC<MathDetailsProps> = ({
  title = "See the Mathematical Proof",
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
    text: '#e2e8f0',
    secondaryText: '#94a3b8',
    border: '#334155',
    hoverText: '#f8fafc'
  } : {
    text: '#334155',
    secondaryText: '#64748b',
    border: '#e2e8f0',
    hoverText: '#0f172a'
  };

  if (!mounted) {
    return (
      <div style={{
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        minHeight: '40px'
      }} />
    );
  }

  return (
    <div
      style={{
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.75rem 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          marginBottom: isOpen ? '0.5rem' : '0',
          opacity: 0.9
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        aria-expanded={isOpen}
        aria-controls="math-details-content"
      >
        <span style={{
          fontSize: '14px',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          display: 'inline-block'
        }}>
          ▶
        </span>
        <span>
          {title}
        </span>
      </button>

      <div
        id="math-details-content"
        style={{
          display: isOpen ? 'block' : 'none',
        }}
      >
        {isOpen && (
          <>
            <div style={{
              fontSize: '13px',
              color: colors.secondaryText,
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              marginTop: '1rem'
            }}>
              Note: You can skip this derivation and jump to "What This Really Means" below if you prefer the intuition over the mathematics.
            </div>
            {children}
            <div style={{
              borderTop: `1px solid ${colors.border}`,
              marginTop: '2rem',
              paddingTop: '0.5rem',
              fontSize: '12px',
              color: colors.secondaryText,
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              End of mathematical proof
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MathDetails;