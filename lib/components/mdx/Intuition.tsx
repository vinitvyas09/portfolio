"use client"

import { ReactNode } from "react"
import { Lightbulb } from "lucide-react"

interface IntuitionProps {
  children: ReactNode
  title?: string
}

export function Intuition({ children, title = "Intuition" }: IntuitionProps) {
  return (
    <div className="my-12 rounded-xl bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 p-8 border border-yellow-200/50 dark:border-yellow-800/30">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
          <Lightbulb className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-4 text-yellow-900 dark:text-yellow-100">
            {title}
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}