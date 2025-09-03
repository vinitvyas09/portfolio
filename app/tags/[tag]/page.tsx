import { getPostsByTag, getAllTags } from "@/lib/utils/posts"
import { PostCard } from "@/lib/components/PostCard"
import { Tag } from "lucide-react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `${tag} | Deep Learning Journey`,
    description: `Posts tagged with ${tag}`,
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const posts = getPostsByTag(tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center animate-slideUp">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Tag className="h-5 w-5" />
              <span className="font-medium">{tag}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Posts tagged "{tag}"
          </h1>
          <p className="text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post, index) => (
            <div
              key={post.slug}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-slideUp"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}