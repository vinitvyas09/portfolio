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
import { cn } from "@/lib/utils";

type InfoBoxVariant = "insight" | "warning" | "advanced" | "info" | "tip";

type InfoBoxVisual = "none" | "hyperplane";

interface InfoBoxProps {
  type?: InfoBoxVariant;
  title: string;
  children: React.ReactNode;
  visual?: InfoBoxVisual;
}

interface InfoBoxStyle {
  icon: LucideIcon;
  colors: {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
    title: string;
    text: string;
    accent: string;
  };
}

const CONFIG: Record<InfoBoxVariant, InfoBoxStyle> = {
  insight: {
    icon: Lightbulb,
    colors: {
      border: "border-violet-100 dark:border-violet-900/30",
      bg: "bg-violet-50/40 dark:bg-violet-950/20",
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      title: "text-gray-900 dark:text-gray-100",
      text: "text-gray-700 dark:text-gray-300",
      accent: "violet",
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      border: "border-orange-100 dark:border-orange-900/30",
      bg: "bg-orange-50/40 dark:bg-orange-950/20",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      title: "text-gray-900 dark:text-gray-100",
      text: "text-gray-700 dark:text-gray-300",
      accent: "orange",
    },
  },
  advanced: {
    icon: Brain,
    colors: {
      border: "border-indigo-100 dark:border-indigo-900/30",
      bg: "bg-indigo-50/40 dark:bg-indigo-950/20",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      title: "text-gray-900 dark:text-gray-100",
      text: "text-gray-700 dark:text-gray-300",
      accent: "indigo",
    },
  },
  info: {
    icon: Info,
    colors: {
      border: "border-sky-100 dark:border-sky-900/30",
      bg: "bg-sky-50/40 dark:bg-sky-950/20",
      iconBg: "bg-sky-100 dark:bg-sky-900/30",
      iconColor: "text-sky-600 dark:text-sky-400",
      title: "text-gray-900 dark:text-gray-100",
      text: "text-gray-700 dark:text-gray-300",
      accent: "sky",
    },
  },
  tip: {
    icon: Zap,
    colors: {
      border: "border-emerald-100 dark:border-emerald-900/30",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "text-gray-900 dark:text-gray-100",
      text: "text-gray-700 dark:text-gray-300",
      accent: "emerald",
    },
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

interface HyperplaneState {
  id: string;
  dimension: string;
  hyperplane: string;
  equation: { n: number; hyper: number };
  render: (accentColor: string) => React.ReactNode;
}

const getAccentColors = (accent: string) => {
  const colors: Record<string, { primary: string; secondary: string; muted: string; text: string }> = {
    violet: {
      primary: "rgb(109 40 217)", // violet-700
      secondary: "rgb(196 181 253)", // violet-300
      muted: "rgba(139 92 246 / 0.05)", // ultra subtle violet
      text: "rgb(124 58 237)", // violet-600
    },
    orange: {
      primary: "rgb(194 65 12)", // orange-700
      secondary: "rgb(253 186 116)", // orange-300
      muted: "rgba(251 146 60 / 0.05)", // ultra subtle orange
      text: "rgb(234 88 12)", // orange-600
    },
    indigo: {
      primary: "rgb(67 56 202)", // indigo-700
      secondary: "rgb(165 180 252)", // indigo-300
      muted: "rgba(99 102 241 / 0.05)", // ultra subtle indigo
      text: "rgb(79 70 229)", // indigo-600
    },
    sky: {
      primary: "rgb(3 105 161)", // sky-700
      secondary: "rgb(125 211 252)", // sky-300
      muted: "rgba(14 165 233 / 0.05)", // ultra subtle sky
      text: "rgb(2 132 199)", // sky-600
    },
    emerald: {
      primary: "rgb(4 120 87)", // emerald-700
      secondary: "rgb(110 231 183)", // emerald-300
      muted: "rgba(16 185 129 / 0.05)", // ultra subtle emerald
      text: "rgb(5 150 105)", // emerald-600
    },
  };
  return colors[accent] || colors.sky;
};

const hyperplaneStates: HyperplaneState[] = [
  {
    id: "2d",
    dimension: "2D space",
    hyperplane: "Hyperplane = 1D line",
    equation: { n: 2, hyper: 1 },
    render: (accentColor: string) => {
      const colors = getAccentColors(accentColor);
      return (
        <motion.svg viewBox="0 0 160 120" className="h-full w-full" initial={false}>
          <rect
            x={18}
            y={18}
            width={124}
            height={84}
            rx={12}
            fill={colors.muted}
            stroke={colors.secondary}
            strokeWidth={0.5}
            opacity={0.3}
          />
          {TWO_D_LEFT_POINTS.map(([x, y], idx) => (
            <motion.circle
              key={`left-${idx}`}
              cx={x}
              cy={y}
              r={3}
              fill={colors.secondary}
              animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.6, 0.4] }}
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
              r={3}
              fill="rgb(148 163 184)"
              animate={{ scale: [1, 0.98, 1], opacity: [0.3, 0.5, 0.3] }}
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
            stroke={colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      );
    },
  },
  {
    id: "3d",
    dimension: "3D space",
    hyperplane: "Hyperplane = 2D plane",
    equation: { n: 3, hyper: 2 },
    render: (accentColor: string) => {
      const colors = getAccentColors(accentColor);
      return (
        <motion.svg viewBox="0 0 160 120" className="h-full w-full" initial={false}>
          <g opacity={0.2} stroke="rgb(148 163 184)" strokeWidth={0.5} fill="none">
            <path d="M46 42 L106 42 L106 102 L46 102 Z" />
            <path d="M66 24 L126 24 L126 84 L66 84 Z" />
            <line x1={66} y1={24} x2={46} y2={42} />
            <line x1={126} y1={24} x2={106} y2={42} />
            <line x1={126} y1={84} x2={106} y2={102} />
            <line x1={66} y1={84} x2={46} y2={102} />
          </g>
          <motion.polygon
            points="60,88 120,72 120,38 60,54"
            fill={colors.muted}
            stroke={colors.secondary}
            strokeWidth={0.5}
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1={88}
            y1={64}
            x2={130}
            y2={24}
            stroke={colors.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={{
              x2: [128, 132, 128],
              y2: [24, 28, 24],
            }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx={130}
            cy={24}
            r={3}
            fill={colors.primary}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      );
    },
  },
  {
    id: "4d",
    dimension: "4D space",
    hyperplane: "Hyperplane = 3D volume",
    equation: { n: 4, hyper: 3 },
    render: (accentColor: string) => {
      const colors = getAccentColors(accentColor);
      return (
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
              stroke={layer === 3 ? colors.secondary : "rgb(148 163 184)"}
              strokeOpacity={layer === 3 ? 0.4 : 0.15}
              strokeWidth={0.5}
            />
          ))}
          <motion.rect
            x={32}
            y={30}
            width={96}
            height={56}
            rx={12}
            fill={colors.muted}
            stroke={colors.secondary}
            strokeWidth={0.5}
            animate={{
              x: [30, 36, 30],
              y: [28, 34, 28],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M32 30 L128 30"
            stroke={colors.primary}
            strokeWidth={1}
            strokeLinecap="round"
            strokeDasharray="6 8"
            animate={{ strokeDashoffset: [0, -40] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx={128}
            cy={30}
            r={2.5}
            fill={colors.primary}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      );
    },
  },
];

interface HyperplaneAnimationProps {
  accentColor: string;
}

const HyperplaneAnimation: React.FC<HyperplaneAnimationProps> = ({ accentColor }) => {
  const [index, setIndex] = React.useState(0);
  const colors = getAccentColors(accentColor);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setIndex((prev) => (prev + 1) % hyperplaneStates.length),
      3600,
    );
    return () => window.clearInterval(id);
  }, []);

  const current = hyperplaneStates[index];

  return (
    <div className="relative mt-5 w-full max-w-xs overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900 p-3 border-[0.5px] border-gray-200 dark:border-gray-800 md:mt-0 md:ml-6 md:self-center">
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
              {current.render(accentColor)}
            </div>
            <div className="text-center text-[9px] font-normal uppercase tracking-[0.25em] text-gray-500 dark:text-gray-500">
              {current.dimension}
            </div>
            <motion.div
              className="text-center text-[13px] font-normal text-gray-800 dark:text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              {current.hyperplane}
            </motion.div>
            <motion.div
              className="flex items-center justify-center gap-2 text-[11px] text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.18 }}
            >
              <span className="rounded-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-gray-700 dark:text-gray-300">
                n = {current.equation.n}
              </span>
              <motion.span
                aria-hidden
                animate={{ y: [-0.5, 0.5, -0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-[11px] text-gray-400 dark:text-gray-600"
              >
                →
              </motion.span>
              <span
                className="rounded-sm px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                (n-1) = {current.equation.hyper}
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

  // Get code color classes based on type
  const getCodeColorClass = () => {
    switch (type) {
      case "insight":
        return "[&_code]:text-violet-700 dark:[&_code]:text-violet-400";
      case "warning":
        return "[&_code]:text-orange-700 dark:[&_code]:text-orange-400";
      case "advanced":
        return "[&_code]:text-indigo-700 dark:[&_code]:text-indigo-400";
      case "info":
        return "[&_code]:text-sky-700 dark:[&_code]:text-sky-400";
      default:
        return "[&_code]:text-emerald-700 dark:[&_code]:text-emerald-400";
    }
  };

  const getCodeBgClass = () => {
    switch (type) {
      case "insight":
        return "[&_code]:bg-violet-50 dark:[&_code]:bg-violet-900/20";
      case "warning":
        return "[&_code]:bg-orange-50 dark:[&_code]:bg-orange-900/20";
      case "advanced":
        return "[&_code]:bg-indigo-50 dark:[&_code]:bg-indigo-900/20";
      case "info":
        return "[&_code]:bg-sky-50 dark:[&_code]:bg-sky-900/20";
      default:
        return "[&_code]:bg-emerald-50 dark:[&_code]:bg-emerald-900/20";
    }
  };

  const getStrongClass = () => {
    return "[&_strong]:font-medium [&_strong]:text-gray-900 dark:[&_strong]:text-gray-100";
  };

  return (
    <div
      className={cn(
        "relative my-8 overflow-hidden rounded-lg",
        "bg-white dark:bg-gray-950",
        "border-[0.5px]",
        scheme.colors.border,
        scheme.colors.bg,
      )}
    >
      <div className="p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex-shrink-0 rounded-md p-2",
              scheme.colors.iconBg,
            )}
          >
            <Icon className={cn("h-4 w-4", scheme.colors.iconColor)} strokeWidth={1.5} />
          </div>
          <div className="flex-1 space-y-3">
            <h4 className={cn("text-[15px] font-medium tracking-tight", scheme.colors.title)}>
              {title}
            </h4>
            {visual === "hyperplane" ? (
              <>
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div
                    className={cn(
                      "prose prose-sm max-w-none leading-relaxed md:flex-1",
                      "[&]:text-gray-700 dark:[&]:text-gray-300",
                      "[&>p]:text-gray-700 dark:[&>p]:text-gray-300",
                      "[&>p]:mb-3 [&>p:last-child]:mb-0",
                      "[&_a]:font-normal [&_a]:underline [&_a]:decoration-[0.5px] [&_a]:underline-offset-2 [&_a]:decoration-gray-300 dark:[&_a]:decoration-gray-700",
                      "[&_a:hover]:decoration-gray-500 dark:[&_a:hover]:decoration-gray-500 [&_a]:transition-colors",
                      getStrongClass(),
                      getCodeBgClass(),
                      getCodeColorClass(),
                      "[&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:font-mono [&_code]:text-[12px] [&_code]:font-normal",
                      "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
                      "[&_li]:text-gray-700 dark:[&_li]:text-gray-300",
                      "[&_ul]:marker:text-gray-400 dark:[&_ul]:marker:text-gray-600",
                    )}
                  >
                    {React.Children.toArray(children).slice(0, 2)}
                  </div>
                  <HyperplaneAnimation accentColor={scheme.colors.accent} />
                </div>
                <div
                  className={cn(
                    "prose prose-sm max-w-none leading-relaxed",
                    "[&]:text-gray-700 dark:[&]:text-gray-300",
                    "[&>p]:text-gray-700 dark:[&>p]:text-gray-300",
                    "[&>p]:mb-3 [&>p:last-child]:mb-0",
                    "[&_a]:font-medium [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2 [&_a]:decoration-slate-300 dark:[&_a]:decoration-slate-600",
                    "[&_a:hover]:opacity-75 [&_a]:transition-opacity",
                    getStrongClass(),
                    getCodeBgClass(),
                    getCodeColorClass(),
                    "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[13px]",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
                    "[&_li]:text-gray-700 dark:[&_li]:text-gray-300",
                    "[&_ul]:marker:text-gray-400 dark:[&_ul]:marker:text-gray-600",
                  )}
                >
                  {React.Children.toArray(children).slice(2)}
                </div>
              </>
            ) : (
              <div
                className={cn(
                  "prose prose-sm max-w-none leading-relaxed",
                  "[&]:text-gray-700 dark:[&]:text-gray-300",
                  "[&>p]:text-gray-700 dark:[&>p]:text-gray-300",
                  "[&>p]:mb-3 [&>p:last-child]:mb-0",
                  "[&_a]:font-medium [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2 [&_a]:decoration-slate-300 dark:[&_a]:decoration-slate-600",
                  "[&_a:hover]:opacity-75 [&_a]:transition-opacity",
                  getStrongClass(),
                  getCodeBgClass(),
                  getCodeColorClass(),
                  "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[13px]",
                  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
                  "[&_li]:text-gray-700 dark:[&_li]:text-gray-300",
                  "[&_ul]:marker:text-gray-400 dark:[&_ul]:marker:text-gray-600",
                )}
              >
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
