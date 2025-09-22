/* eslint-disable @typescript-eslint/no-explicit-any */
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

  return (
    <div className="my-8 rounded-xl overflow-hidden bg-card ">
      {title && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-foreground/80" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <span className="text-xs text-muted-foreground">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 rounded-md  bg-background hover:bg-muted transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-foreground/80" />
          ) : (
            <Copy className="h-4 w-4 text-foreground/80" />
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
// end
