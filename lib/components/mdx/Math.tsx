"use client"

import { ReactNode, useState } from "react"
import { ChevronDown, ChevronUp, Calculator } from "lucide-react"

interface MathProps {
  children: ReactNode
  title?: string
  collapsible?: boolean
  boxed?: boolean
}

export function Math({ children, title, collapsible = false, boxed = false }: MathProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsible)

  const content = (
    <div className={`${boxed ? 'bg-blue-50/30 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/30' : ''} my-8`}>
      {title && (
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
            {title}
          </h3>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto p-1 rounded hover:bg-muted transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
      {!isCollapsed && (
        <div className="math-display overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  )

  return content
}