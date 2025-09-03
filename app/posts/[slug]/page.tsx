import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getPostBySlug, getAllPosts } from "@/lib/utils/posts"
import { TableOfContents } from "@/lib/components/TableOfContents"
import { PostNavigation } from "@/lib/components/PostNavigation"
import { Calendar, Clock, Tag, ExternalLink } from "lucide-react"
import { SiGithub } from "react-icons/si"
import { mdxComponents } from "@/lib/components/mdx"
import type { Metadata } from "next"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title} | Vinit Vyas Portfolio`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: ["Vinit Vyas"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const allPosts = getAllPosts()
  
  if (!post) {
    notFound()
  }

  const currentIndex = allPosts.findIndex(p => p.slug === post.slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return (
    <div className="container mx-auto relative py-10">
      <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-[1fr_250px] lg:gap-12 max-w-6xl">
        <article className="mx-auto w-full max-w-4xl">
          <div className="mx-auto max-w-[72ch]">
            <header className="mb-10 animate-slideUp">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] tracking-wide uppercase border border-border text-foreground/70`}>
                {post.level}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              {post.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {post.summary}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/tags/${tag}`}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </a>
              ))}
            </div>

            <div className="flex gap-4 text-sm">
              <a
                href={`https://github.com/vinitvyas09/portfolio/tree/main/content/posts/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiGithub className="h-4 w-4" size={16} />
                View source
              </a>
              {post.notebook && (
                <a
                  href={post.notebook}
                  target="_blank"
                  rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open notebook
              </a>
              )}
            </div>
            </header>
          </div>

          <div className="prose-content animate-fadeIn">
            <MDXRemote 
              source={post.content} 
              components={mdxComponents}
            />
          </div>

          <PostNavigation prevPost={prevPost} nextPost={nextPost} />
        </article>

        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>
      </div>
    </div>
  )
}
