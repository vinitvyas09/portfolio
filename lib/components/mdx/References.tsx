"use client"

import { BookOpen, ExternalLink } from "lucide-react"

interface Reference {
  title: string
  url: string
  author?: string
  year?: number
  type?: 'paper' | 'book' | 'article' | 'video' | 'code'
}

interface ReferencesProps {
  items: Reference[]
}

export function References({ items }: ReferencesProps) {
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'paper':
        return '📄'
      case 'book':
        return '📚'
      case 'article':
        return '📝'
      case 'video':
        return '🎥'
      case 'code':
        return '💻'
      default:
        return '🔗'
    }
  }

  return (
    <div className="my-12 rounded-xl p-8 border border-border bg-card">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-foreground/80" />
        <h3 className="text-xl font-medium">
          Further Reading & References
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((ref, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{getTypeIcon(ref.type)}</span>
            <div className="flex-1">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="flex-1">
                  <span className="font-medium">{ref.title}</span>
                  {ref.author && (
                    <span className="text-sm text-muted-foreground">
                      {" "}— {ref.author}
                      {ref.year && ` (${ref.year})`}
                    </span>
                  )}
                </span>
                <ExternalLink className="h-4 w-4 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
