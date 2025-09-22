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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{
          fontSize: '16px',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          display: 'inline-block',
          marginTop: '3px'
        }}>
          ▶
        </span>
        <h2
          id={title.toLowerCase().replace(/\s+/g, '-')}
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            flex: 1,
            padding: '1rem 0',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {title}
        </h2>
      </div>

      <div
        id="math-details-content"
        className="math-details-content"
        style={{
          display: isOpen ? 'block' : 'none',
        }}
      >
        <div style={{
          fontSize: '13px',
          color: colors.secondaryText,
          fontStyle: 'italic',
          marginBottom: '1.5rem',
          marginTop: '1rem',
          display: isOpen ? 'block' : 'none',
        }}>
          Note: You can skip this derivation and jump to the next section below if you prefer the intuition over the mathematics.
        </div>
        <div className="math-details-children">
          {children}
        </div>
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          marginTop: '2rem',
          paddingTop: '0.5rem',
          fontSize: '12px',
          color: colors.secondaryText,
          fontStyle: 'italic',
          textAlign: 'center',
          display: isOpen ? 'block' : 'none',
        }}>
          End of mathematical proof
        </div>
      </div>
    </div>
  );
};

export default MathDetails;