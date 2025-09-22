import { getAllPosts } from "@/lib/utils/posts"
import { PostCard } from "@/lib/components/PostCard"
import IconMark from "@/lib/components/IconMark"

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center animate-slideUp">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full">
              <IconMark className="h-12 w-12 text-foreground/80" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">
            Vinit Vyas Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Exploring the mathematical foundations and practical implementations of deep learning and the AI solutions space.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No posts published yet.</p>
            <p className="text-sm text-muted-foreground">
              Content will appear here as the deep learning journey progresses.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-light tracking-tight mb-2">Latest Posts</h2>
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
        )}
      </div>
    </div>
  )
}
