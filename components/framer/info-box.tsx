"use client";

import React from 'react';
import { useTheme } from 'next-themes';

interface InfoBoxProps {
  type: 'insight' | 'warning' | 'advanced';
  title: string;
  visual?: string;
  children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type, title, visual, children }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  // Type-specific configurations with sophisticated, muted colors
  const typeConfig = {
    insight: {
      lightColors: {
        bg: '#f8fafb',
        border: '#94a3b8',
        icon: '#64748b',
        titleColor: '#475569',
        textColor: '#64748b',
        accentGradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      },
      darkColors: {
        bg: 'rgba(148, 163, 184, 0.05)',
        border: '#475569',
        icon: '#64748b',
        titleColor: '#94a3b8',
        textColor: '#94a3b8',
        accentGradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    warning: {
      lightColors: {
        bg: '#fdfbf7',
        border: '#d4a574',
        icon: '#b08968',
        titleColor: '#8b6f47',
        textColor: '#7a5f3f',
        accentGradient: 'linear-gradient(135deg, #d4a574 0%, #b08968 100%)',
      },
      darkColors: {
        bg: 'rgba(212, 165, 116, 0.05)',
        border: '#8b6f47',
        icon: '#a08060',
        titleColor: '#d4a574',
        textColor: '#c9a876',
        accentGradient: 'linear-gradient(135deg, #8b6f47 0%, #6b5537 100%)',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    advanced: {
      lightColors: {
        bg: '#faf9fb',
        border: '#a393b8',
        icon: '#8b7aa0',
        titleColor: '#6b5b80',
        textColor: '#5d4e6d',
        accentGradient: 'linear-gradient(135deg, #a393b8 0%, #8b7aa0 100%)',
      },
      darkColors: {
        bg: 'rgba(163, 147, 184, 0.05)',
        border: '#6b5b80',
        icon: '#8b7aa0',
        titleColor: '#a393b8',
        textColor: '#b5a6c9',
        accentGradient: 'linear-gradient(135deg, #6b5b80 0%, #524360 100%)',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type];
  const colors = isDark ? config.darkColors : config.lightColors;

  // Visual element for hyperplane (optional)
  const renderVisual = () => {
    if (!visual) return null;

    if (visual === 'hyperplane') {
      return (
        <div className="mt-4 mb-3 flex justify-center">
          <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-75">
            <defs>
              <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.icon} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.icon} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* 2D to 3D visualization */}
            <g transform="translate(40, 20)">
              {/* 2D space */}
              <rect x="0" y="20" width="40" height="40"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />
              <line x1="5" y1="40" x2="35" y2="40"
                stroke={colors.icon}
                strokeWidth="2" />
              <text x="20" y="75"
                fill={colors.textColor}
                fontSize="11"
                textAnchor="middle"
                fontFamily="system-ui">
                2D to 1D line
              </text>
            </g>

            {/* 3D space */}
            <g transform="translate(120, 10)">
              {/* 3D cube wireframe */}
              <path d="M 0,30 L 40,30 L 50,10 L 10,10 Z"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />
              <path d="M 0,30 L 0,60 L 40,60 L 40,30"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />
              <path d="M 40,30 L 50,10 L 50,40 L 40,60"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />
              <path d="M 0,60 L 10,40 L 50,40"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />
              <path d="M 10,10 L 10,40"
                fill="none"
                stroke={colors.icon}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.5" />

              {/* 2D plane in 3D space */}
              <path d="M 5,35 L 45,35 L 35,20 L 5,20 Z"
                fill="url(#planeGradient)"
                stroke={colors.icon}
                strokeWidth="2" />

              <text x="25" y="85"
                fill={colors.textColor}
                fontSize="11"
                textAnchor="middle"
                fontFamily="system-ui">
                3D to 2D plane
              </text>
            </g>

            {/* Arrow */}
            <path d="M 85,40 L 105,40"
              stroke={colors.icon}
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10"
                refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={colors.icon} />
              </marker>
            </defs>
          </svg>
        </div>
      );
    }

    return null;
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div
      className="my-8 rounded-lg overflow-hidden"
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: colors.accentGradient,
        }}
      />

      {/* Content */}
      <div className="px-6 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{
              background: `${colors.icon}20`,
              color: colors.icon,
            }}
          >
            {config.icon}
          </div>
          <h4
            className="text-lg font-semibold tracking-tight"
            style={{ color: colors.titleColor }}
          >
            {title}
          </h4>
        </div>

        {/* Optional visual */}
        {renderVisual()}

        {/* Children content */}
        <div
          className="prose prose-sm max-w-none"
          style={{ color: colors.textColor }}
        >
          <div className="space-y-3 text-[15px] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;