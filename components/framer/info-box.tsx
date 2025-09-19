"use client";

import * as React from "react";
import {
  AlertCircle,
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
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-300 dark:border-purple-700",
      iconColor: "text-purple-600 dark:text-purple-400",
      titleColor: "text-purple-900 dark:text-purple-100"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-300 dark:border-yellow-700",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-100"
    },
    advanced: {
      icon: Brain,
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-300 dark:border-indigo-700",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      titleColor: "text-indigo-900 dark:text-indigo-100"
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-300 dark:border-blue-700",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100"
    },
    tip: {
      icon: Zap,
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-300 dark:border-green-700",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-100"
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor } = config[type];

  return (
    <div className={`my-8 relative overflow-hidden rounded-lg border-2 ${borderColor} ${bgColor}`}>
      <div className="relative p-6">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="flex-1 space-y-2">
            <h4 className={`font-semibold text-lg ${titleColor}`}>
              {title}
            </h4>
            <div className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;