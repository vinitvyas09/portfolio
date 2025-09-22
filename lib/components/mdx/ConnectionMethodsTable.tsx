"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/ui/table";

interface MethodInfo {
  name: string;
  lossFunction: string;
  lossFormulaDisplay: string;
  keyProperty: string;
  color: string;
}

const ConnectionMethodsTable: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Color palette
  const colors = useMemo(() => {
    if (!mounted) {
      return {
        bg: "#ffffff",
        bgSecondary: "#f8f9fa",
        bgHover: "#f1f5f9",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        perceptron: "#3b82f6",
        svm: "#10b981",
        logistic: "#f59e0b",
        codeBg: "#f3f4f6",
        codeText: "#0f172a"
      };
    }

    return isDark ? {
      bg: "#0a0a0a",
      bgSecondary: "#171717",
      bgHover: "#262626",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#404040",
      perceptron: "#60a5fa",
      svm: "#34d399",
      logistic: "#fbbf24",
      codeBg: "#1f2937",
      codeText: "#e5e7eb"
    } : {
      bg: "#ffffff",
      bgSecondary: "#f8f9fa",
      bgHover: "#f1f5f9",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      perceptron: "#3b82f6",
      svm: "#10b981",
      logistic: "#f59e0b",
      codeBg: "#f3f4f6",
      codeText: "#0f172a"
    };
  }, [isDark, mounted]);

  const methods: MethodInfo[] = [
    {
      name: "Perceptron",
      lossFunction: "max(0, -yf)",
      lossFormulaDisplay: "max(0, -yf)",
      keyProperty: "Updates only on mistakes",
      color: colors.perceptron
    },
    {
      name: "SVM",
      lossFunction: "max(0, 1-yf)",
      lossFormulaDisplay: "max(0, 1-yf)",
      keyProperty: "Enforces unit margin",
      color: colors.svm
    },
    {
      name: "Logistic Regression",
      lossFunction: "log(1 + e^(-yf))",
      lossFormulaDisplay: "log(1 + e⁻ʸᶠ)",
      keyProperty: "Smooth, probabilistic",
      color: colors.logistic
    }
  ];

  if (!mounted) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        margin: '2rem 0',
        height: '300px',
        background: 'transparent',
      }} />
    );
  }

  return (
    <div style={{
      margin: '2rem 0',
      padding: '1.5rem',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark
        ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
    }}>
      {/* Table title */}
      <div style={{
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '0.5rem'
        }}>
          Connection to Other Methods
        </h3>
        <p style={{
          fontSize: '13px',
          color: colors.textSecondary,
          lineHeight: '1.6'
        }}>
          The optimization perspective reveals how different algorithms relate through their loss functions
        </p>
      </div>

      {/* Custom table with shadcn components */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`
      }}>
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <TableHead
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: '12px',
                  padding: '12px 16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Method
              </TableHead>
              <TableHead
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: '12px',
                  padding: '12px 16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Loss Function
              </TableHead>
              <TableHead
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: '12px',
                  padding: '12px 16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Key Property
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method, index) => (
              <TableRow
                key={method.name}
                style={{
                  borderBottom: index === methods.length - 1 ? 'none' : `1px solid ${colors.border}`,
                  background: colors.bg,
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.bgHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.bg;
                }}
              >
                <TableCell
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '24px',
                      background: method.color,
                      borderRadius: '2px'
                    }}
                  />
                  {method.name}
                </TableCell>
                <TableCell
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: colors.textSecondary
                  }}
                >
                  <code style={{
                    background: colors.codeBg,
                    color: method.color,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    fontWeight: '500'
                  }}>
                    {method.lossFormulaDisplay}
                  </code>
                </TableCell>
                <TableCell
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: colors.textSecondary
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: isDark ? `${method.color}20` : `${method.color}15`,
                    border: `1px solid ${method.color}40`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {method.keyProperty}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
        border: `1px solid ${colors.perceptron}40`,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.textSecondary,
          lineHeight: '1.6'
        }}>
          <strong style={{ color: colors.text }}>Note:</strong> Each method minimizes a different convex upper bound on the 0-1 loss.
          The perceptron's hinge loss creates a margin-based classifier, SVM enforces a fixed margin for better generalization,
          and logistic regression provides probabilistic outputs through its smooth loss function.
        </div>
      </div>
    </div>
  );
};

export default ConnectionMethodsTable;