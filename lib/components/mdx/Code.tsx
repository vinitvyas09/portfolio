"use client"

import { ReactNode, useState } from "react"
import { Copy, Check, Terminal } from "lucide-react"

interface CodeProps {
  children: ReactNode
  language?: string
  title?: string
  highlight?: string
  showLineNumbers?: boolean
}

export function Code({ 
  children, 
  language = "python", 
  title,
  highlight,
  showLineNumbers = true 
}: CodeProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const text = extractTextFromChildren(children)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const extractTextFromChildren = (node: ReactNode): string => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(extractTextFromChildren).join('')
    if (typeof node === 'object' && node !== null && 'props' in node) {
      return extractTextFromChildren((node as any).props.children)
    }
    return ''
  }

  const highlightLines = highlight?.split(',').map(range => {
    const [start, end] = range.split('-').map(Number)
    return end ? { start, end } : { start, end: start }
  }) || []

  return (
    <div className="my-8 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        <pre className={`p-4 pr-14 overflow-x-auto ${showLineNumbers ? 'line-numbers' : ''}`}>
          <code className={`language-${language}`}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}