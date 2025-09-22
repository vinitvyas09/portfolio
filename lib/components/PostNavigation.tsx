import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { type Post } from "@/lib/utils/posts"

interface PostNavigationProps {
  prevPost: Post | null
  nextPost: Post | null
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav className="mt-16 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevPost ? (
          <Link
            href={`/posts/${prevPost.slug}`}
            className="group flex items-start gap-3 p-4 rounded-lg  hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Previous</p>
              <p className="font-medium group-hover:text-primary transition-colors">
                {prevPost.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextPost ? (
          <Link
            href={`/posts/${nextPost.slug}`}
            className="group flex items-start gap-3 p-4 rounded-lg  hover:bg-muted/50 transition-colors text-right md:flex-row-reverse"
          >
            <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Next</p>
              <p className="font-medium group-hover:text-primary transition-colors">
                {nextPost.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}