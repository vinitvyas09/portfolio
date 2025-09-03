"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils/cn"

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const elements = document.querySelectorAll("article h2, article h3")
    const headingElements: Heading[] = Array.from(elements).map((elem) => ({
      id: elem.id || elem.textContent?.toLowerCase().replace(/\s+/g, "-") || "",
      text: elem.textContent || "",
      level: parseInt(elem.tagName.substring(1)),
    }))
    setHeadings(headingElements)

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const elem = document.getElementById(headingElements[i].id)
        if (elem && elem.offsetTop <= scrollPosition) {
          setActiveId(headingElements[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-20 space-y-1">
      <h4 className="mb-4 text-xs tracking-[0.2em] uppercase text-foreground/70">On this page</h4>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              heading.level === 3 && "ml-4"
            )}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                "toc-link block",
                activeId === heading.id && "active"
              )}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
