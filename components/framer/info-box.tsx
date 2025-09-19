"use client";

import * as React from "react";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  Zap,
  Brain
} from "lucide-react";

interface InfoBoxProps {
  type?: "insight" | "warning" | "advanced" | "info" | "tip";
  title: string;
  children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type = "info", title, children }) => {
  const config = {
    insight: {
      icon: Lightbulb,
      bgColor: "bg-purple-50/80 dark:bg-purple-950/30",
      borderColor: "border-purple-400 dark:border-purple-600",
      iconColor: "text-purple-600 dark:text-purple-400",
      titleColor: "text-purple-900 dark:text-purple-100",
      textColor: "text-black dark:text-gray-300",
      accentBg: "bg-purple-200/30 dark:bg-purple-800/20"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-amber-50/80 dark:bg-yellow-950/30",
      borderColor: "border-amber-400 dark:border-yellow-600",
      iconColor: "text-amber-600 dark:text-yellow-400",
      titleColor: "text-amber-900 dark:text-yellow-100",
      textColor: "text-black dark:text-gray-300",
      accentBg: "bg-amber-200/30 dark:bg-yellow-800/20"
    },
    advanced: {
      icon: Brain,
      bgColor: "bg-indigo-50/80 dark:bg-indigo-950/30",
      borderColor: "border-indigo-400 dark:border-indigo-600",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      titleColor: "text-indigo-900 dark:text-indigo-100",
      textColor: "text-black dark:text-gray-300",
      accentBg: "bg-indigo-200/30 dark:bg-indigo-800/20"
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50/80 dark:bg-blue-950/30",
      borderColor: "border-blue-400 dark:border-blue-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100",
      textColor: "text-black dark:text-gray-300",
      accentBg: "bg-blue-200/30 dark:bg-blue-800/20"
    },
    tip: {
      icon: Zap,
      bgColor: "bg-emerald-50/80 dark:bg-green-950/30",
      borderColor: "border-emerald-400 dark:border-green-600",
      iconColor: "text-emerald-600 dark:text-green-400",
      titleColor: "text-emerald-900 dark:text-green-100",
      textColor: "text-black dark:text-gray-300",
      accentBg: "bg-emerald-200/30 dark:bg-green-800/20"
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, textColor, accentBg } = config[type];

  return (
    <div className={`my-8 relative overflow-hidden rounded-xl border ${borderColor} ${bgColor} shadow-lg backdrop-blur-sm`}>
      {/* Decorative accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${borderColor.replace('border-', 'bg-')}`} />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon container with subtle background */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${accentBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2.5} />
          </div>

          <div className="flex-1 space-y-2">
            <h4 className={`font-bold text-base tracking-tight ${titleColor}`}>
              {title}
            </h4>
            <div className={`prose prose-sm max-w-none ${textColor}
              [&>p]:leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0
              [&_strong]:font-semibold [&_strong]:${titleColor.replace('text-', 'text-')}
              [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800
              [&_code]:text-sm [&_code]:font-mono [&_code]:text-gray-800 dark:[&_code]:text-gray-200
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
              [&_li]:${textColor}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;