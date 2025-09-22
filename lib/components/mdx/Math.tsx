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
    <div className={`${boxed ? 'rounded-xl p-6  bg-card' : ''} my-8`}>
      {title && (
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-5 w-5 text-foreground/80" />
          <h3 className="text-lg font-medium">
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
