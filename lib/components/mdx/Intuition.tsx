"use client"

import { ReactNode } from "react"
import { Lightbulb } from "lucide-react"

interface IntuitionProps {
  children: ReactNode
  title?: string
}

export function Intuition({ children, title = "Intuition" }: IntuitionProps) {
  return (
    <div className="my-12 rounded-xl p-8 border border-border bg-card">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full border border-border">
          <Lightbulb className="h-6 w-6 text-foreground/80" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-4">
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
