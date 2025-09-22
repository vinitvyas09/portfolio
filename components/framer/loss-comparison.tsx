"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
  const [margin, setMargin] = useState(0);
  const { losses = [], showGradientFlow = true, interactive = true } = config;

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

  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 0-1 Loss */}
        <div className="space-y-4">
          <h4 className="font-semibold text-center">{losses[0]?.name || "0-1 Loss"}</h4>
          <div className="relative h-64 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <svg viewBox="-2.5 -0.5 5 2.5" className="w-full h-full">
              {/* Axes */}
              <line x1="-2" y1="2" x2="2" y2="2" stroke="currentColor" strokeWidth="0.02" opacity="0.3"/>
              <line x1="0" y1="0" x2="0" y2="2" stroke="currentColor" strokeWidth="0.02" opacity="0.3"/>

              {/* Step function - fixed: loss=1 when m<0, loss=0 when m>=0 */}
              <path
                d={`M -2 1 L 0 1 L 0 2 L 2 2`}
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="0.04"
              />

              {/* Current point */}
              {interactive && (
                <circle
                  cx={margin}
                  cy={2 - currentStepLoss}
                  r="0.08"
                  fill="rgb(239, 68, 68)"
                />
              )}

              {/* Labels */}
              <text x="0" y="2.4" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Margin (m)
              </text>
              <text x="-1" y="0.8" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Wrong (1)
              </text>
              <text x="1" y="1.8" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Right (0)
              </text>

              {/* Gradient indicator */}
              {showGradientFlow && (
                <text x="0" y="0.5" fontSize="0.12" textAnchor="middle" fill="rgb(239, 68, 68)">
                  No gradient at boundary!
                </text>
              )}
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {losses[0]?.description || "Sudden jump = no gradient"}
          </p>
        </div>

        {/* Hinge Loss */}
        <div className="space-y-4">
          <h4 className="font-semibold text-center">{losses[1]?.name || "Hinge Loss"}</h4>
          <div className="relative h-64 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <svg viewBox="-2.5 -0.5 5 2.5" className="w-full h-full">
              {/* Axes */}
              <line x1="-2" y1="2" x2="2" y2="2" stroke="currentColor" strokeWidth="0.02" opacity="0.3"/>
              <line x1="0" y1="0" x2="0" y2="2" stroke="currentColor" strokeWidth="0.02" opacity="0.3"/>

              {/* Hinge function */}
              <path
                d={`M ${points.map(p => `${p.m},${2 - p.hinge}`).join(' L ')}`}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="0.04"
              />

              {/* Current point */}
              {interactive && (
                <circle
                  cx={margin}
                  cy={2 - currentHingeLoss}
                  r="0.08"
                  fill="rgb(34, 197, 94)"
                />
              )}

              {/* Gradient arrows */}
              {showGradientFlow && margin < 0 && (
                <motion.path
                  d={`M ${margin} ${2 - currentHingeLoss} L ${margin + 0.3} ${2 - currentHingeLoss + 0.3}`}
                  stroke="rgb(34, 197, 94)"
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
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgb(34, 197, 94)" />
                </marker>
              </defs>

              {/* Labels */}
              <text x="0" y="2.4" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Margin (m)
              </text>
              <text x="-1" y="0.8" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Wrong
              </text>
              <text x="-1" y="1.0" fontSize="0.12" textAnchor="middle" fill="currentColor">
                (proportional)
              </text>
              <text x="1" y="1.8" fontSize="0.15" textAnchor="middle" fill="currentColor">
                Right (0)
              </text>

              {showGradientFlow && (
                <text x="0" y="0.5" fontSize="0.12" textAnchor="middle" fill="rgb(34, 197, 94)">
                  Smooth gradient everywhere!
                </text>
              )}
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {losses[1]?.description || "Smooth ramp = gradient to follow"}
          </p>
        </div>
      </div>

      {/* Interactive slider */}
      {interactive && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Margin (m): {margin.toFixed(2)}</span>
            <span>0-1 Loss: {currentStepLoss.toFixed(2)} | Hinge Loss: {currentHingeLoss.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={margin}
            onChange={(e) => setMargin(parseFloat(e.target.value))}
            className="w-full accent-gray-600 dark:accent-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Drag to see how losses change with margin
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
        <strong>Key insight:</strong> The hinge loss approximates the 0-1 loss but gives us gradients to work with.
        When we're wrong (margin {"<"} 0), it tells us not just that we're wrong, but <em>how</em> wrong—and
        therefore which direction to move to improve.
      </div>
    </div>
  );
};

export default LossComparison;