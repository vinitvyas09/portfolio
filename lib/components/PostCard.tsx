import Link from "next/link"
import { type Post } from "@/lib/utils/posts"
import { Calendar, Clock, Tag } from "lucide-react"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col space-y-2 animate-slideUp">
      <div className="overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-sm hover:-translate-y-0.5">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] tracking-wide uppercase border border-border text-foreground/70`}>
            {post.level}
          </span>
        </div>
        <h2 className="text-2xl font-normal tracking-tight">
          <Link href={`/posts/${post.slug}`} className="hover:opacity-90">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 text-muted-foreground line-clamp-3">
          {post.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[12px] text-foreground/70 transition-colors hover:text-foreground"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}
