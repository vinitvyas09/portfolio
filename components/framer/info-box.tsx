"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  Zap,
  Brain,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type InfoBoxVariant = "insight" | "warning" | "advanced" | "info" | "tip";

type InfoBoxVisual = "none" | "hyperplane";

interface InfoBoxProps {
  type?: InfoBoxVariant;
  title: string;
  children: React.ReactNode;
  visual?: InfoBoxVisual;
}

interface AccentPalette {
  light: string;
  lightSoft: string;
  lightMuted: string;
  dark: string;
  darkSoft: string;
  darkMuted: string;
}

interface NeutralPalette {
  light: string;
  dark: string;
}

interface InfoBoxStyle {
  icon: LucideIcon;
  ring: string;
  iconColor: string;
  iconBg: string;
  titleColor: string;
  textColor: string;
  strongColor: string;
  bulletColor: string;
  codeBg: string;
  visualText: string;
  gradient: {
    light: [string, string];
    dark: [string, string];
  };
  accent: AccentPalette;
  neutral: NeutralPalette;
  gridColor: string;
  gridColorDark: string;
}

const CONFIG: Record<InfoBoxVariant, InfoBoxStyle> = {
  insight: {
    icon: Lightbulb,
    ring: "ring-1 ring-violet-200/70 dark:ring-violet-500/40",
    iconColor: "text-violet-600 dark:text-violet-300",
    iconBg:
      "bg-violet-100/80 dark:bg-violet-500/15 ring-1 ring-inset ring-violet-200/60 dark:ring-violet-500/30",
    titleColor: "text-violet-950 dark:text-violet-50",
    textColor: "text-black dark:text-slate-200",
    strongColor:
      "[&_strong]:text-violet-900 dark:[&_strong]:text-violet-100",
    bulletColor:
      "[&_li]:text-black dark:[&_li]:text-slate-200 [&_li::marker]:text-violet-400 dark:[&_li::marker]:text-violet-300",
    codeBg:
      "[&_code]:bg-violet-50/80 dark:[&_code]:bg-violet-500/25 [&_code]:!text-violet-900 dark:[&_code]:!text-violet-100 [&_code.hljs]:!text-violet-900 dark:[&_code.hljs]:!text-violet-100 [&_code_.hljs]:!text-violet-900 dark:[&_code_.hljs]:!text-violet-100",
    visualText: "text-slate-700 dark:text-slate-300",
    gradient: {
      light: ["rgba(237,233,254,0.92)", "rgba(221,214,254,0.55)"],
      dark: ["rgba(76,29,149,0.45)", "rgba(49,46,129,0.55)"],
    },
    accent: {
      light: "#7c3aed",
      lightSoft: "rgba(124,58,237,0.22)",
      lightMuted: "rgba(124,58,237,0.12)",
      dark: "#c4b5fd",
      darkSoft: "rgba(196,181,253,0.25)",
      darkMuted: "rgba(167,139,250,0.18)",
    },
    neutral: {
      light: "rgba(15,23,42,0.28)",
      dark: "rgba(148,163,184,0.32)",
    },
    gridColor: "rgba(124,58,237,0.12)",
    gridColorDark: "rgba(139,92,246,0.22)",
  },
  warning: {
    icon: AlertTriangle,
    ring: "ring-1 ring-amber-200/70 dark:ring-yellow-500/40",
    iconColor: "text-amber-600 dark:text-yellow-300",
    iconBg:
      "bg-amber-100/80 dark:bg-yellow-500/15 ring-1 ring-inset ring-amber-200/60 dark:ring-yellow-500/40",
    titleColor: "text-amber-950 dark:text-yellow-50",
    textColor: "text-black dark:text-slate-200",
    strongColor:
      "[&_strong]:text-amber-900 dark:[&_strong]:text-yellow-100",
    bulletColor:
      "[&_li]:text-black dark:[&_li]:text-slate-200 [&_li::marker]:text-amber-400 dark:[&_li::marker]:text-yellow-300",
    codeBg:
      "[&_code]:bg-amber-50/80 dark:[&_code]:bg-yellow-500/25 [&_code]:!text-amber-900 dark:[&_code]:!text-yellow-100 [&_code.hljs]:!text-amber-900 dark:[&_code.hljs]:!text-yellow-100 [&_code_.hljs]:!text-amber-900 dark:[&_code_.hljs]:!text-yellow-100",
    visualText: "text-slate-700 dark:text-slate-300",
    gradient: {
      light: ["rgba(254,243,199,0.9)", "rgba(253,230,138,0.55)"],
      dark: ["rgba(146,64,14,0.4)", "rgba(180,83,9,0.5)"],
    },
    accent: {
      light: "#d97706",
      lightSoft: "rgba(217,119,6,0.2)",
      lightMuted: "rgba(217,119,6,0.12)",
      dark: "#facc15",
      darkSoft: "rgba(234,179,8,0.25)",
      darkMuted: "rgba(202,138,4,0.18)",
    },
    neutral: {
      light: "rgba(15,23,42,0.28)",
      dark: "rgba(161,161,170,0.35)",
    },
    gridColor: "rgba(217,119,6,0.14)",
    gridColorDark: "rgba(234,179,8,0.24)",
  },
  advanced: {
    icon: Brain,
    ring: "ring-1 ring-indigo-200/70 dark:ring-indigo-500/40",
    iconColor: "text-indigo-600 dark:text-indigo-300",
    iconBg:
      "bg-indigo-100/80 dark:bg-indigo-500/15 ring-1 ring-inset ring-indigo-200/60 dark:ring-indigo-500/35",
    titleColor: "text-indigo-950 dark:text-indigo-50",
    textColor: "text-black dark:text-slate-200",
    strongColor:
      "[&_strong]:text-indigo-900 dark:[&_strong]:text-indigo-100",
    bulletColor:
      "[&_li]:text-black dark:[&_li]:text-slate-200 [&_li::marker]:text-indigo-400 dark:[&_li::marker]:text-indigo-300",
    codeBg:
      "[&_code]:bg-indigo-50/80 dark:[&_code]:bg-indigo-500/25 [&_code]:!text-indigo-900 dark:[&_code]:!text-indigo-100 [&_code.hljs]:!text-indigo-900 dark:[&_code.hljs]:!text-indigo-100 [&_code_.hljs]:!text-indigo-900 dark:[&_code_.hljs]:!text-indigo-100",
    visualText: "text-slate-700 dark:text-slate-300",
    gradient: {
      light: ["rgba(224,231,255,0.92)", "rgba(197,211,255,0.55)"],
      dark: ["rgba(49,46,129,0.45)", "rgba(30,27,75,0.55)"],
    },
    accent: {
      light: "#4338ca",
      lightSoft: "rgba(79,70,229,0.24)",
      lightMuted: "rgba(79,70,229,0.12)",
      dark: "#a5b4fc",
      darkSoft: "rgba(129,140,248,0.26)",
      darkMuted: "rgba(99,102,241,0.18)",
    },
    neutral: {
      light: "rgba(15,23,42,0.28)",
      dark: "rgba(148,163,184,0.32)",
    },
    gridColor: "rgba(79,70,229,0.12)",
    gridColorDark: "rgba(129,140,248,0.22)",
  },
  info: {
    icon: Info,
    ring: "ring-1 ring-sky-200/70 dark:ring-sky-500/40",
    iconColor: "text-sky-600 dark:text-sky-300",
    iconBg:
      "bg-sky-100/80 dark:bg-sky-500/15 ring-1 ring-inset ring-sky-200/60 dark:ring-sky-500/35",
    titleColor: "text-sky-950 dark:text-sky-50",
    textColor: "text-black dark:text-slate-200",
    strongColor: "[&_strong]:text-sky-900 dark:[&_strong]:text-sky-100",
    bulletColor:
      "[&_li]:text-black dark:[&_li]:text-slate-200 [&_li::marker]:text-sky-400 dark:[&_li::marker]:text-sky-300",
    codeBg:
      "[&_code]:bg-sky-50/80 dark:[&_code]:bg-sky-500/25 [&_code]:!text-sky-900 dark:[&_code]:!text-sky-100 [&_code.hljs]:!text-sky-900 dark:[&_code.hljs]:!text-sky-100 [&_code_.hljs]:!text-sky-900 dark:[&_code_.hljs]:!text-sky-100",
    visualText: "text-slate-700 dark:text-slate-300",
    gradient: {
      light: ["rgba(224,242,254,0.92)", "rgba(186,230,253,0.55)"],
      dark: ["rgba(7,89,133,0.45)", "rgba(12,74,110,0.55)"],
    },
    accent: {
      light: "#0284c7",
      lightSoft: "rgba(14,165,233,0.2)",
      lightMuted: "rgba(14,165,233,0.12)",
      dark: "#38bdf8",
      darkSoft: "rgba(56,189,248,0.25)",
      darkMuted: "rgba(14,165,233,0.18)",
    },
    neutral: {
      light: "rgba(15,23,42,0.28)",
      dark: "rgba(148,163,184,0.32)",
    },
    gridColor: "rgba(14,165,233,0.12)",
    gridColorDark: "rgba(56,189,248,0.22)",
  },
  tip: {
    icon: Zap,
    ring: "ring-1 ring-emerald-200/70 dark:ring-green-500/35",
    iconColor: "text-emerald-600 dark:text-green-300",
    iconBg:
      "bg-emerald-100/80 dark:bg-green-500/15 ring-1 ring-inset ring-emerald-200/60 dark:ring-green-500/30",
    titleColor: "text-emerald-950 dark:text-emerald-50",
    textColor: "text-black dark:text-slate-200",
    strongColor:
      "[&_strong]:text-emerald-900 dark:[&_strong]:text-green-100",
    bulletColor:
      "[&_li]:text-black dark:[&_li]:text-slate-200 [&_li::marker]:text-emerald-400 dark:[&_li::marker]:text-green-300",
    codeBg:
      "[&_code]:bg-emerald-50/80 dark:[&_code]:bg-green-500/25 [&_code]:!text-emerald-900 dark:[&_code]:!text-green-100 [&_code.hljs]:!text-emerald-900 dark:[&_code.hljs]:!text-green-100 [&_code_.hljs]:!text-emerald-900 dark:[&_code_.hljs]:!text-green-100",
    visualText: "text-slate-700 dark:text-slate-300",
    gradient: {
      light: ["rgba(209,250,229,0.92)", "rgba(167,243,208,0.55)"],
      dark: ["rgba(2,78,54,0.45)", "rgba(6,95,70,0.55)"],
    },
    accent: {
      light: "#059669",
      lightSoft: "rgba(5,150,105,0.2)",
      lightMuted: "rgba(5,150,105,0.12)",
      dark: "#4ade80",
      darkSoft: "rgba(74,222,128,0.25)",
      darkMuted: "rgba(34,197,94,0.18)",
    },
    neutral: {
      light: "rgba(15,23,42,0.28)",
      dark: "rgba(148,163,184,0.32)",
    },
    gridColor: "rgba(16,185,129,0.12)",
    gridColorDark: "rgba(74,222,128,0.22)",
  },
};

const TWO_D_LEFT_POINTS: Array<[number, number]> = [
  [38, 80],
  [48, 64],
  [56, 92],
  [34, 60],
  [60, 76],
  [44, 50],
];

const TWO_D_RIGHT_POINTS: Array<[number, number]> = [
  [102, 34],
  [112, 50],
  [120, 64],
  [114, 80],
  [94, 56],
  [108, 40],
];

interface HyperplaneRenderColors {
  accent: string;
  accentSoft: string;
  accentMuted: string;
  neutral: string;
}

interface HyperplaneState {
  id: string;
  dimension: string;
  hyperplane: string;
  equation: { n: number; hyper: number };
  render: (colors: HyperplaneRenderColors) => React.ReactNode;
}

const hyperplaneStates: HyperplaneState[] = [
  {
    id: "2d",
    dimension: "2D space",
    hyperplane: "Hyperplane = 1D line",
    equation: { n: 2, hyper: 1 },
    render: ({ accent, accentSoft, accentMuted, neutral }) => (
      <motion.svg viewBox="0 0 160 120" className="h-full w-full" initial={false}>
        <rect
          x={18}
          y={18}
          width={124}
          height={84}
          rx={18}
          fill={accentMuted}
          stroke={accentSoft}
          strokeWidth={1.2}
          opacity={0.9}
        />
        {TWO_D_LEFT_POINTS.map(([x, y], idx) => (
          <motion.circle
            key={`left-${idx}`}
            cx={x}
            cy={y}
            r={4.2}
            fill={accentSoft}
            animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.9, 0.65] }}
            transition={{
              duration: 5.2 + idx * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 0.12,
            }}
          />
        ))}
        {TWO_D_RIGHT_POINTS.map(([x, y], idx) => (
          <motion.circle
            key={`right-${idx}`}
            cx={x}
            cy={y}
            r={4.2}
            fill={neutral}
            animate={{ scale: [1, 0.94, 1], opacity: [0.55, 0.75, 0.55] }}
            transition={{
              duration: 4.8 + idx * 0.08,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 0.1,
            }}
          />
        ))}
        <motion.line
          x1={42}
          y1={100}
          x2={126}
          y2={22}
          stroke={accent}
          strokeWidth={5}
          strokeLinecap="round"
          style={{ originX: 0.5, originY: 0.5 }}
          animate={{ rotate: [-7, 6, -7] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    ),
  },
  {
    id: "3d",
    dimension: "3D space",
    hyperplane: "Hyperplane = 2D plane",
    equation: { n: 3, hyper: 2 },
    render: ({ accent, accentSoft, accentMuted, neutral }) => (
      <motion.svg viewBox="0 0 160 120" className="h-full w-full" initial={false}>
        <g opacity={0.5} stroke={neutral} strokeWidth={1.2} fill="none">
          <path d="M46 42 L106 42 L106 102 L46 102 Z" />
          <path d="M66 24 L126 24 L126 84 L66 84 Z" />
          <line x1={66} y1={24} x2={46} y2={42} />
          <line x1={126} y1={24} x2={106} y2={42} />
          <line x1={126} y1={84} x2={106} y2={102} />
          <line x1={66} y1={84} x2={46} y2={102} />
        </g>
        <motion.polygon
          points="60,88 120,72 120,38 60,54"
          fill={accentMuted}
          stroke={accentSoft}
          strokeWidth={1.2}
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line
          x1={88}
          y1={64}
          x2={130}
          y2={24}
          stroke={accent}
          strokeWidth={3.2}
          strokeLinecap="round"
          animate={{
            x2: [128, 134, 128],
            y2: [24, 30, 24],
          }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={130}
          cy={24}
          r={4.5}
          fill={accent}
          animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.12, 1] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    ),
  },
  {
    id: "4d",
    dimension: "4D space",
    hyperplane: "Hyperplane = 3D volume",
    equation: { n: 4, hyper: 3 },
    render: ({ accent, accentSoft, accentMuted, neutral }) => (
      <motion.svg viewBox="0 0 160 120" className="h-full w-full" initial={false}>
        {[0, 1, 2, 3].map((layer) => (
          <rect
            key={`layer-${layer}`}
            x={26 + layer * 8}
            y={24 + layer * 9}
            width={108 - layer * 16}
            height={70}
            rx={14}
            fill="none"
            stroke={layer === 3 ? accentSoft : neutral}
            strokeOpacity={layer === 3 ? 0.9 : 0.4}
            strokeWidth={1.1}
          />
        ))}
        <motion.rect
          x={32}
          y={30}
          width={96}
          height={56}
          rx={12}
          fill={accentMuted}
          stroke={accentSoft}
          strokeWidth={1.2}
          animate={{
            x: [30, 44, 30],
            y: [28, 44, 28],
            opacity: [0.65, 0.9, 0.65],
          }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M32 30 L128 30"
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10 12"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx={128}
          cy={30}
          r={4.2}
          fill={accent}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    ),
  },
];

interface HyperplaneAnimationProps extends HyperplaneRenderColors {
  textClass: string;
}

const HyperplaneAnimation: React.FC<HyperplaneAnimationProps> = ({
  accent,
  accentSoft,
  accentMuted,
  neutral,
  textClass,
}) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setIndex((prev) => (prev + 1) % hyperplaneStates.length),
      3600,
    );
    return () => window.clearInterval(id);
  }, []);

  const current = hyperplaneStates[index];

  return (
    <div className="relative mt-5 w-full max-w-xs overflow-hidden rounded-xl bg-gradient-to-br from-white/95 via-white/80 to-white/60 p-4 shadow-inner ring-1 ring-inset ring-slate-900/10 dark:from-white/10 dark:via-white/10 dark:to-transparent dark:ring-white/10 md:mt-0 md:ml-6 md:self-center">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${accentMuted} 1px, transparent 0)`,
          backgroundSize: "14px 14px",
          opacity: 0.45,
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <div className="mx-auto flex w-full max-w-[160px] flex-col items-center gap-3">
            <div className="relative h-32 w-full">
              {current.render({ accent, accentSoft, accentMuted, neutral })}
            </div>
            <div
              className={`text-center text-[10px] font-semibold uppercase tracking-[0.35em] ${textClass}`}
            >
              {current.dimension}
            </div>
            <motion.div
              className="text-center text-sm font-semibold"
              style={{ color: accent }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              {current.hyperplane}
            </motion.div>
            <motion.div
              className={`flex items-center justify-center gap-2 text-xs font-medium ${textClass}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.18 }}
            >
              <span className="rounded-md bg-black/5 px-2 py-0.5 dark:bg-white/10">
                n = {current.equation.n}
              </span>
              <motion.span
                aria-hidden
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-base"
                style={{ color: accent }}
              >
                →
              </motion.span>
              <span
                className="rounded-md px-2 py-0.5"
                style={{ backgroundColor: accentMuted, color: accent }}
              >
                n - 1 = {current.equation.hyper}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const InfoBox: React.FC<InfoBoxProps> = ({
  type = "info",
  title,
  children,
  visual = "none",
}) => {
  const scheme = CONFIG[type];
  const Icon = scheme.icon;

  const cssVars = React.useMemo(
    () =>
      ({
        "--info-accent-light": scheme.accent.light,
        "--info-accent-dark": scheme.accent.dark,
        "--info-accent-soft-light": scheme.accent.lightSoft,
        "--info-accent-soft-dark": scheme.accent.darkSoft,
        "--info-accent-muted-light": scheme.accent.lightMuted,
        "--info-accent-muted-dark": scheme.accent.darkMuted,
        "--info-neutral-light": scheme.neutral.light,
        "--info-neutral-dark": scheme.neutral.dark,
        "--info-gradient-start-light": scheme.gradient.light[0],
        "--info-gradient-end-light": scheme.gradient.light[1],
        "--info-gradient-start-dark": scheme.gradient.dark[0],
        "--info-gradient-end-dark": scheme.gradient.dark[1],
        "--info-grid-light": scheme.gridColor,
        "--info-grid-dark": scheme.gridColorDark,
        "--info-prose-body-light": "#000000",
        "--info-prose-body-dark": "rgba(226,232,240,0.95)",
        "--info-prose-code-light": "#000000",
        "--info-prose-code-dark": "rgba(226,232,240,0.95)",
        "--info-prose-pre-code-light": "#000000",
        "--info-prose-pre-code-dark": "rgba(226,232,240,0.95)",
      }) as React.CSSProperties,
    [scheme],
  );

  const accentVar = "var(--info-accent)";
  const accentSoftVar = "var(--info-accent-soft)";
  const accentMutedVar = "var(--info-accent-muted)";
  const neutralVar = "var(--info-neutral)";
  const gridVar = "var(--info-grid)";
  const gradientStartVar = "var(--info-gradient-start)";
  const gradientEndVar = "var(--info-gradient-end)";

  const proseStyle = {
    "--tw-prose-body": "var(--info-prose-body)",
    "--tw-prose-links": accentVar,
    "--tw-prose-code": "var(--info-prose-code)",
    "--tw-prose-pre-code": "var(--info-prose-pre-code)",
  } as React.CSSProperties;

  const proseClasses = [
    "prose prose-sm max-w-none leading-relaxed",
    scheme.textColor,
    "[&>p]:mb-3 [&>p:last-child]:mb-0",
    "[&_a]:font-semibold [&_a]:underline decoration-2 [&_a]:underline-offset-4",
    "[&_a:hover]:opacity-80",
    scheme.strongColor,
    scheme.codeBg,
    "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-sm [&_code]:font-medium",
    "[&_.hljs]:!bg-transparent",
    "[&_code_*]:!text-inherit",
    "[&_code_span]:!color-inherit",
    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
    scheme.bulletColor,
  ].join(" ");

  // Create a unique class name for this InfoBox instance
  const instanceId = React.useId();
  const codeColorClass = `infobox-code-${instanceId.replace(/:/g, '')}`;

  // Determine colors based on variant
  const codeColors = React.useMemo(() => {
    switch (type) {
      case "insight":
        return { light: "#5b21b6", dark: "#ddd6fe" };
      case "warning":
        return { light: "#92400e", dark: "#fef08a" };
      case "advanced":
        return { light: "#4338ca", dark: "#c7d2fe" };
      case "info":
        return { light: "#0284c7", dark: "#bae6fd" };
      default:
        return { light: "#059669", dark: "#a7f3d0" };
    }
  }, [type]);

  const styleContent = `
    .${codeColorClass} code,
    .${codeColorClass} code.hljs,
    .${codeColorClass} code *,
    .${codeColorClass} code.hljs *,
    .${codeColorClass} code .hljs,
    .${codeColorClass} code span,
    .${codeColorClass} code .hljs-keyword,
    .${codeColorClass} code .hljs-built_in,
    .${codeColorClass} code .hljs-type,
    .${codeColorClass} code .hljs-literal,
    .${codeColorClass} code .hljs-number,
    .${codeColorClass} code .hljs-operator,
    .${codeColorClass} code .hljs-punctuation,
    .${codeColorClass} code .hljs-property,
    .${codeColorClass} code .hljs-regexp,
    .${codeColorClass} code .hljs-string,
    .${codeColorClass} code .hljs-char,
    .${codeColorClass} code .hljs-symbol,
    .${codeColorClass} code .hljs-variable,
    .${codeColorClass} code .hljs-language,
    .${codeColorClass} code .hljs-meta,
    .${codeColorClass} code .hljs-comment,
    .${codeColorClass} code .hljs-atom,
    .${codeColorClass} code .hljs-tag,
    .${codeColorClass} code .hljs-attribute,
    .${codeColorClass} code .hljs-selector,
    .${codeColorClass} code .hljs-name {
      color: ${codeColors.light} !important;
    }

    @media (prefers-color-scheme: dark) {
      .dark .${codeColorClass} code,
      .dark .${codeColorClass} code.hljs,
      .dark .${codeColorClass} code *,
      .dark .${codeColorClass} code.hljs *,
      .dark .${codeColorClass} code .hljs,
      .dark .${codeColorClass} code span,
      .dark .${codeColorClass} code .hljs-keyword,
      .dark .${codeColorClass} code .hljs-built_in,
      .dark .${codeColorClass} code .hljs-type,
      .dark .${codeColorClass} code .hljs-literal,
      .dark .${codeColorClass} code .hljs-number,
      .dark .${codeColorClass} code .hljs-operator,
      .dark .${codeColorClass} code .hljs-punctuation,
      .dark .${codeColorClass} code .hljs-property,
      .dark .${codeColorClass} code .hljs-regexp,
      .dark .${codeColorClass} code .hljs-string,
      .dark .${codeColorClass} code .hljs-char,
      .dark .${codeColorClass} code .hljs-symbol,
      .dark .${codeColorClass} code .hljs-variable,
      .dark .${codeColorClass} code .hljs-language,
      .dark .${codeColorClass} code .hljs-meta,
      .dark .${codeColorClass} code .hljs-comment,
      .dark .${codeColorClass} code .hljs-atom,
      .dark .${codeColorClass} code .hljs-tag,
      .dark .${codeColorClass} code .hljs-attribute,
      .dark .${codeColorClass} code .hljs-selector,
      .dark .${codeColorClass} code .hljs-name {
        color: ${codeColors.dark} !important;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      <div
        className={`${codeColorClass} relative my-8 overflow-hidden rounded-2xl border border-transparent bg-white/90 shadow-lg backdrop-blur-md dark:bg-slate-950/45 dark:shadow-xl ${scheme.ring}
          [--info-accent:var(--info-accent-light)] dark:[--info-accent:var(--info-accent-dark)]
          [--info-accent-soft:var(--info-accent-soft-light)] dark:[--info-accent-soft:var(--info-accent-soft-dark)]
          [--info-accent-muted:var(--info-accent-muted-light)] dark:[--info-accent-muted:var(--info-accent-muted-dark)]
          [--info-neutral:var(--info-neutral-light)] dark:[--info-neutral:var(--info-neutral-dark)]
          [--info-gradient-start:var(--info-gradient-start-light)] dark:[--info-gradient-start:var(--info-gradient-start-dark)]
          [--info-gradient-end:var(--info-gradient-end-light)] dark:[--info-gradient-end:var(--info-gradient-end-dark)]
          [--info-grid:var(--info-grid-light)] dark:[--info-grid:var(--info-grid-dark)]
          [--info-prose-body:var(--info-prose-body-light)] dark:[--info-prose-body:var(--info-prose-body-dark)]
          [--info-prose-code:var(--info-prose-code-light)] dark:[--info-prose-code:var(--info-prose-code-dark)]
          [--info-prose-pre-code:var(--info-prose-pre-code-light)] dark:[--info-prose-pre-code:var(--info-prose-pre-code-dark)]
        `}
        style={cssVars}
      >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradientStartVar}, ${gradientEndVar}, transparent 80%)`,
          backgroundSize: "200% 200%",
          backgroundPosition: "0% 0%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${gridVar} 1px, transparent 0)`,
          backgroundSize: "18px 18px",
          opacity: 0.35,
        }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-x-12 top-0 h-1 rounded-b-full"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${accentVar} 40%, ${accentVar} 60%, transparent 100%)`,
        }}
        animate={{ opacity: [0.35, 0.85, 0.35] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 rounded-xl p-2.5 shadow-inner ${scheme.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${scheme.iconColor}`} strokeWidth={2.5} />
          </div>
          <div className="flex-1 space-y-3">
            <h4
              className={`text-base font-semibold tracking-tight ${scheme.titleColor}`}
            >
              {title}
            </h4>
            {visual === "hyperplane" ? (
              <>
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className={`${proseClasses} md:flex-1`} style={proseStyle}>
                    {React.Children.toArray(children).slice(0, 2)}
                  </div>
                  <HyperplaneAnimation
                    accent={accentVar}
                    accentSoft={accentSoftVar}
                    accentMuted={accentMutedVar}
                    neutral={neutralVar}
                    textClass={scheme.visualText}
                  />
                </div>
                <div className={proseClasses} style={proseStyle}>
                  {React.Children.toArray(children).slice(2)}
                </div>
              </>
            ) : (
              <div className={proseClasses} style={proseStyle}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InfoBox;
