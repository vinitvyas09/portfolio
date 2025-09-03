import Link from "next/link"
import { type Post } from "@/lib/utils/posts"
import { Calendar, Clock, Tag } from "lucide-react"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col space-y-2 animate-slideUp">
      <div className="overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
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
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            post.level === 'foundation' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            post.level === 'intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}>
            {post.level}
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
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
              className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted/80"
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