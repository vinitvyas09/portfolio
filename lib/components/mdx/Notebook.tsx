"use client"

import { useEffect, useState } from "react"
import { ExternalLink, FileCode, Loader2 } from "lucide-react"

interface NotebookProps {
  path?: string
  selectedCells?: number[]
  height?: number
}

export function Notebook({ path, selectedCells, height = 600 }: NotebookProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [cells, setCells] = useState<any[]>([])

  useEffect(() => {
    if (path && selectedCells) {
      // In a real implementation, this would fetch and parse the notebook
      // For now, we'll just simulate loading
      setTimeout(() => setIsLoading(false), 1000)
    } else if (path) {
      // Load full notebook in iframe
      setIsLoading(false)
    }
  }, [path, selectedCells])

  if (path && !selectedCells) {
    // Render as iframe for full notebook
    return (
      <div className="my-12">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Jupyter Notebook</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
              <a
                href={`https://colab.research.google.com/github/vinitvyas09/portfolio/blob/main/${path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
              >
                Open in Colab
              </a>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <iframe
              src={path}
              className="w-full"
              style={{ height: `${height}px` }}
              title="Notebook"
            />
          )}
        </div>
      </div>
    )
  }

  if (selectedCells) {
    // Render selected cells
    return (
      <div className="my-12 space-y-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Notebook Output (Cells {selectedCells.join(", ")})
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rendered cells would go here */}
              <div className="p-4 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-700">
                <pre className="text-sm">
                  <code>{"# Cell output would be rendered here"}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}