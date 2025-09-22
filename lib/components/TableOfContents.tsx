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
        <div className="flex items-center group">
          {hasChildren && (
            <button
              onClick={(e) => toggleSection(heading.id, e)}
              className={cn(
                "p-0.5 mr-0.5 rounded-sm hover:bg-muted/30 transition-all",
                "text-muted-foreground/60 hover:text-muted-foreground",
                depth === 0 ? "-ml-0.5" : ""
              )}
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              <ChevronRight
                className={cn(
                  "h-2.5 w-2.5 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
          <a
            href={`#${heading.id}`}
            onClick={(e) => scrollToHeading(heading.id, e)}
            className={cn(
              "toc-item flex-1 py-0.5 leading-snug transition-all duration-200",
              "hover:text-foreground",
              !hasChildren && "ml-4",
              heading.level === 1 && "text-[13px] font-medium",
              heading.level === 2 && "text-xs",
              heading.level === 3 && "text-[11px]",
              heading.level >= 4 && "text-[11px] opacity-80",
              isActive ? "text-foreground font-medium" : "text-muted-foreground/70 hover:text-muted-foreground",
              (isChildActive && !isActive) && "text-muted-foreground/85"
            )}
          >
            <span className="relative block">
              {heading.text}
              {isActive && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-foreground rounded-full" />
              )}
            </span>
          </a>
        </div>

        {hasChildren && isExpanded && (
          <ul className={cn(
            "border-l border-border/30",
            depth === 0 ? "ml-1.5 pl-2" : "ml-3 pl-1.5"
          )}>
            {heading.children!.map(child => renderHeading(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden">
      <div className="relative">
        <ul className="pb-4">
          {headings.map(heading => renderHeading(heading))}
        </ul>
      </div>

      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 3px;
        }

        nav::-webkit-scrollbar-track {
          background: transparent;
        }

        nav::-webkit-scrollbar-thumb {
          background: hsl(var(--border) / 0.5);
          border-radius: 1.5px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--border));
        }
      `}</style>
    </nav>
  )
}