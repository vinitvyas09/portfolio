"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface LossComparisonProps {
  config: {
    showBoth?: boolean;
    losses: Array<{
      name: string;
      type: 'step' | 'hinge';
      description: string;
    }>;
    showGradientFlow?: boolean;
    interactive?: boolean;
  };
}

const LossComparison: React.FC<LossComparisonProps> = ({ config }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [margin, setMargin] = useState(0);
  const { losses = [], showGradientFlow = true, interactive = true } = config;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Color palette matching order-matters-demo.tsx exactly
  const colors = isDark ? {
    bg: "#0a0a0a",
    bgSecondary: "#171717",
    text: "#f3f4f6",
    textSecondary: "#d1d5db",
    border: "#404040",
    grid: "#262626",
    accent: "#fbbf24",
    error: "#f87171",
    success: "#34d399",
    stepLoss: "#f87171",
    hingeLoss: "#34d399"
  } : {
    bg: "#ffffff",
    bgSecondary: "#f8f9fa",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    grid: "#f1f5f9",
    accent: "#f59e0b",
    error: "#ef4444",
    success: "#10b981",
    stepLoss: "#ef4444",
    hingeLoss: "#10b981"
  };

  const stepLoss = (m: number) => m < 0 ? 1 : 0;
  const hingeLoss = (m: number) => Math.max(0, -m);

  const generatePoints = () => {
    const points = [];
    for (let m = -2; m <= 2; m += 0.05) {
      points.push({ m, step: stepLoss(m), hinge: hingeLoss(m) });
    }
    return points;
  };

  const points = generatePoints();
  const currentStepLoss = stepLoss(margin);
  const currentHingeLoss = hingeLoss(margin);

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '16px',
        margin: '2rem 0',
        height: '400px',
        background: 'transparent',
      }} />
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      margin: '2rem 0',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* 0-1 Loss */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: '600', textAlign: 'center', color: colors.text, fontSize: '1.1rem', margin: 0 }}>
            {losses[0]?.name || "0-1 Loss"}
          </h4>
          <div style={{
            position: 'relative',
            height: '256px',
            background: colors.bg,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <svg viewBox="-2.5 -0.5 5 2.5" className="w-full h-full">
              {/* Axes */}
              <line x1="-2" y1="2" x2="2" y2="2" stroke={colors.textSecondary} strokeWidth="0.02" opacity="0.5"/>
              <line x1="0" y1="0" x2="0" y2="2" stroke={colors.textSecondary} strokeWidth="0.02" opacity="0.5"/>

              {/* Step function - fixed: loss=1 when m<0, loss=0 when m>=0 */}
              <path
                d={`M -2 1 L 0 1 L 0 2 L 2 2`}
                fill="none"
                stroke={colors.stepLoss}
                strokeWidth="0.04"
              />

              {/* Current point */}
              {interactive && (
                <circle
                  cx={margin}
                  cy={2 - currentStepLoss}
                  r="0.08"
                  fill={colors.stepLoss}
                />
              )}

              {/* Labels */}
              <text x="0" y="2.4" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Margin (m)
              </text>
              <text x="-1" y="0.8" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Wrong (1)
              </text>
              <text x="1" y="1.8" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Right (0)
              </text>

              {/* Gradient indicator */}
              {showGradientFlow && (
                <text x="0" y="0.5" fontSize="0.12" textAnchor="middle" fill={colors.stepLoss}>
                  No gradient at boundary!
                </text>
              )}
            </svg>
          </div>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, textAlign: 'center', margin: 0 }}>
            {losses[0]?.description || "Sudden jump = no gradient"}
          </p>
        </div>

        {/* Hinge Loss */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: '600', textAlign: 'center', color: colors.text, fontSize: '1.1rem', margin: 0 }}>
            {losses[1]?.name || "Hinge Loss"}
          </h4>
          <div style={{
            position: 'relative',
            height: '256px',
            background: colors.bg,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <svg viewBox="-2.5 -0.5 5 2.5" className="w-full h-full">
              {/* Axes */}
              <line x1="-2" y1="2" x2="2" y2="2" stroke={colors.textSecondary} strokeWidth="0.02" opacity="0.5"/>
              <line x1="0" y1="0" x2="0" y2="2" stroke={colors.textSecondary} strokeWidth="0.02" opacity="0.5"/>

              {/* Hinge function */}
              <path
                d={`M ${points.map(p => `${p.m},${2 - p.hinge}`).join(' L ')}`}
                fill="none"
                stroke={colors.hingeLoss}
                strokeWidth="0.04"
              />

              {/* Current point */}
              {interactive && (
                <circle
                  cx={margin}
                  cy={2 - currentHingeLoss}
                  r="0.08"
                  fill={colors.hingeLoss}
                />
              )}

              {/* Gradient arrows */}
              {showGradientFlow && margin < 0 && (
                <motion.path
                  d={`M ${margin} ${2 - currentHingeLoss} L ${margin + 0.3} ${2 - currentHingeLoss + 0.3}`}
                  stroke={colors.hingeLoss}
                  strokeWidth="0.04"
                  markerEnd="url(#arrowhead)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={colors.hingeLoss} />
                </marker>
              </defs>

              {/* Labels */}
              <text x="0" y="2.4" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Margin (m)
              </text>
              <text x="-1" y="0.8" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Wrong
              </text>
              <text x="-1" y="1.0" fontSize="0.12" textAnchor="middle" fill={colors.textSecondary}>
                (proportional)
              </text>
              <text x="1" y="1.8" fontSize="0.15" textAnchor="middle" fill={colors.textSecondary}>
                Right (0)
              </text>

              {showGradientFlow && (
                <text x="0" y="0.5" fontSize="0.12" textAnchor="middle" fill={colors.hingeLoss}>
                  Smooth gradient everywhere!
                </text>
              )}
            </svg>
          </div>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, textAlign: 'center', margin: 0 }}>
            {losses[1]?.description || "Smooth ramp = gradient to follow"}
          </p>
        </div>
      </div>

      {/* Interactive slider */}
      {interactive && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: colors.text,
            marginBottom: '0.75rem'
          }}>
            <span>Margin (m): {margin.toFixed(2)}</span>
            <span style={{ color: colors.textSecondary }}>
              0-1 Loss: <span style={{ color: colors.stepLoss, fontWeight: '600' }}>{currentStepLoss.toFixed(2)}</span> |
              Hinge Loss: <span style={{ color: colors.hingeLoss, fontWeight: '600' }}>{currentHingeLoss.toFixed(2)}</span>
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={margin}
            onChange={(e) => setMargin(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: colors.accent
            }}
          />
          <p style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: '0.5rem',
            margin: '0.5rem 0 0 0'
          }}>
            Drag to see how losses change with margin
          </p>
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${colors.accent}`,
        borderLeft: `3px solid ${colors.accent}`,
        fontSize: '0.875rem',
        color: colors.text
      }}>
        <strong style={{ color: colors.accent }}>Key insight:</strong> The hinge loss approximates the 0-1 loss but gives us gradients to work with.
        When we&apos;re wrong (margin {"<"} 0), it tells us not just that we&apos;re wrong, but <em>how</em> wrong—and
        therefore which direction to move to improve.
      </div>
    </div>
  );
};

export default LossComparison;