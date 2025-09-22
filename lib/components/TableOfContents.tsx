"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronRight } from "lucide-react"

interface Heading {
  id: string
  text: string
  level: number
  children?: Heading[]
}

interface FlatHeading {
  id: string
  text: string
  level: number
}

function buildNestedHeadings(headings: FlatHeading[]): Heading[] {
  const nested: Heading[] = []
  const stack: Heading[] = []

  headings.forEach(heading => {
    const item: Heading = { ...heading, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      nested.push(item)
    } else {
      const parent = stack[stack.length - 1]
      if (!parent.children) parent.children = []
      parent.children.push(item)
    }

    stack.push(item)
  })

  return nested
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const scanAndObserveHeadings = useCallback(() => {
    const elements = document.querySelectorAll("article h1, article h2, article h3, article h4, article h5, .math-details-content h1, .math-details-content h2, .math-details-content h3, .math-details-content h4, .math-details-content h5")
    const flatHeadings: FlatHeading[] = Array.from(elements)
      .filter((elem) => !elem.closest('header')) // Exclude headings inside header (like blog title)
      .filter((elem) => {
        // Exclude headings inside interactive components with animations
        const hasAnimatedParent = elem.closest('[class*="animate-"]') ||
                                  elem.closest('.framer-motion') ||
                                  elem.closest('[data-framer]') ||
                                  elem.closest('svg')
        if (hasAnimatedParent) return false

        // Exclude headings that are inside code blocks or interactive galleries
        const isInCodeBlock = elem.closest('pre') || elem.closest('code')
        const isInGallery = elem.closest('[class*="gallery"]') ||
                            elem.closest('[class*="Gallery"]')
        if (isInCodeBlock || isInGallery) return false

        // Include all headings that have an id or can generate one
        return elem.id || elem.textContent?.trim()
      })
      .map((elem) => ({
        id: elem.id || elem.textContent?.toLowerCase().replace(/\s+/g, "-") || "",
        text: elem.textContent || "",
        level: parseInt(elem.tagName.substring(1)),
      }))

    const nestedHeadings = buildNestedHeadings(flatHeadings)
    setHeadings(nestedHeadings)

    const allHeadingIds = new Set(flatHeadings.map(h => h.id))
    setExpandedSections(allHeadingIds)

    // Update heading elements reference
    headingElementsRef.current.clear()
    Array.from(elements)
      .filter((elem) => !elem.closest('header'))
      .forEach(elem => {
        if (elem.id) {
          headingElementsRef.current.set(elem.id, elem as HTMLElement)
        }
      })

    // Re-observe elements with IntersectionObserver
    if (observerRef.current) {
      observerRef.current.disconnect()
      Array.from(elements)
        .filter((elem) => !elem.closest('header'))
        .forEach(elem => {
          if (elem.id) observerRef.current?.observe(elem)
        })
    }

    return { elements, flatHeadings }
  }, [])

  useEffect(() => {
    const { elements } = scanAndObserveHeadings()

    headingElementsRef.current.clear()
    Array.from(elements)
      .filter((elem) => !elem.closest('header'))
      .forEach(elem => {
        if (elem.id) {
          headingElementsRef.current.set(elem.id, elem as HTMLElement)
        }
      })

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observerOptions = {
      rootMargin: "-80px 0px -70% 0px",
      threshold: [0, 1]
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const visibleIds = new Set<string>()

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleIds.add(entry.target.id)
        }
      })

      if (visibleIds.size > 0) {
        setActiveIds(visibleIds)
      } else {
        const scrollPosition = window.scrollY + 100
        let closestId = ""
        let closestDistance = Infinity

        headingElementsRef.current.forEach((elem, id) => {
          const distance = Math.abs(elem.offsetTop - scrollPosition)
          if (distance < closestDistance) {
            closestDistance = distance
            closestId = id
          }
        })

        if (closestId) {
          setActiveIds(new Set([closestId]))
        }
      }
    }, observerOptions)

    Array.from(elements)
      .filter((elem) => !elem.closest('header'))
      .forEach(elem => {
        if (elem.id) observerRef.current?.observe(elem)
      })

    // Set up MutationObserver to detect DOM changes
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect()
    }

    mutationObserverRef.current = new MutationObserver((mutations) => {
      // Check if any mutations affected headings
      const hasHeadingChanges = mutations.some(mutation => {
        if (mutation.type === 'childList') {
          const hasNewHeadings = Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const elem = node as HTMLElement
              return /^H[1-5]$/.test(elem.tagName) || elem.querySelector('h1, h2, h3, h4, h5')
            }
            return false
          })
          if (hasNewHeadings) return true
        }
        return false
      })

      if (hasHeadingChanges) {
        scanAndObserveHeadings()
      }
    })

    const article = document.querySelector('article')
    if (article) {
      mutationObserverRef.current.observe(article, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      observerRef.current?.disconnect()
      mutationObserverRef.current?.disconnect()
    }
  }, [scanAndObserveHeadings])

  const scrollToHeading = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }, [])

  const toggleSection = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const renderHeading = (heading: Heading, depth: number = 0) => {
    const hasChildren = heading.children && heading.children.length > 0
    const isExpanded = expandedSections.has(heading.id)
    const isActive = activeIds.has(heading.id)
    const isChildActive = heading.children?.some(child =>
      activeIds.has(child.id) || child.children?.some(gc => activeIds.has(gc.id))
    )

    return (
      <li key={heading.id} className="relative">
        <div className={cn(
          "relative flex items-center group",
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px]",
          "before:transition-all before:duration-300 before:ease-out",
          isActive && "before:bg-gradient-to-b before:from-blue-500/70 before:to-blue-500/30 before:shadow-[0_0_8px_rgba(59,130,246,0.5)]",
          !isActive && "before:bg-transparent"
        )}>
          {hasChildren && (
            <button
              onClick={(e) => toggleSection(heading.id, e)}
              className={cn(
                "relative z-10 p-1 mr-1.5 rounded-md",
                "transition-all duration-200 ease-out",
                "hover:bg-gradient-to-br hover:from-muted/50 hover:to-muted/30",
                "text-muted-foreground/60 hover:text-foreground",
                isActive && "text-blue-500/80",
                depth === 0 ? "ml-0" : "ml-0.5"
              )}
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 transition-all duration-300 ease-out",
                  isExpanded && "rotate-90 scale-110"
                )}
              />
            </button>
          )}
          <a
            href={`#${heading.id}`}
            onClick={(e) => scrollToHeading(heading.id, e)}
            className={cn(
              "toc-item relative flex-1 py-0.5 px-1.5 -mx-1 rounded-md",
              "leading-snug transition-colors duration-200 ease-out",
              "hover:bg-gradient-to-r hover:from-muted/20 hover:to-transparent",
              !hasChildren && depth === 0 && "ml-4",
              !hasChildren && depth > 0 && "ml-0.5",
              heading.level === 1 && "text-[13px] font-semibold tracking-tight",
              heading.level === 2 && "text-[12px] font-medium",
              heading.level === 3 && "text-[11px]",
              heading.level >= 4 && "text-[10px] opacity-90",
              isActive ? [
                "text-blue-600 dark:text-blue-400 font-semibold",
                "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent",
                "shadow-[inset_0_1px_0_rgba(59,130,246,0.1)]"
              ].join(" ") : "text-muted-foreground/80 hover:text-foreground",
              (isChildActive && !isActive) && "text-muted-foreground"
            )}
          >
            <span className="relative z-10 block">
              {heading.text}
              {isActive && (
                <>
                  <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                  <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500/50 rounded-full animate-ping" />
                </>
              )}
            </span>
          </a>
        </div>

        {hasChildren && isExpanded && (
          <ul className={cn(
            "relative mt-0",
            depth === 0 ? "ml-2.5" : "ml-3"
          )}>
            {heading.children!.map((child, index) => (
              <li key={child.id} className="relative">
                {/* Connector line */}
                <div className={cn(
                  "absolute left-[6px] w-[1px] pointer-events-none",
                  "bg-gradient-to-b from-border/40 via-border/20 to-transparent",
                  index === 0 ? "top-0" : "-top-0.5",
                  index === heading.children!.length - 1 ? "h-3" : "h-full"
                )} />
                {/* Horizontal branch */}
                <div className="absolute left-[6px] top-3 w-2.5 h-[1px] bg-border/30 pointer-events-none" />
                <div className="pl-4">
                  {renderHeading(child, depth + 1)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden">
      <div className="relative p-2 rounded-lg bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm border border-border/10">
        <ul className="space-y-0">
          {headings.map(heading => renderHeading(heading))}
        </ul>
      </div>

      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 4px;
        }

        nav::-webkit-scrollbar-track {
          background: transparent;
        }

        nav::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, hsl(var(--border) / 0.3), hsl(var(--border) / 0.5));
          border-radius: 2px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, hsl(var(--border) / 0.5), hsl(var(--border) / 0.7));
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </nav>
  )
}