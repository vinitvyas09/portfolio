import { getAllTags, getPostsByTag } from "@/lib/utils/posts"
import { Tag } from "lucide-react"
import Link from "next/link"

export default function TagsPage() {
  const tags = getAllTags()
  
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center animate-slideUp">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">
            Tags
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore posts by topic
          </p>
        </div>

        {tags.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No tags available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => {
              const posts = getPostsByTag(tag)
              return (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm animate-slideUp"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium group-hover:opacity-90">{tag}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
