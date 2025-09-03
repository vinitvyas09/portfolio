import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostFrontmatter {
  title: string
  date: string
  summary: string
  tags: string[]
  level: 'foundation' | 'intermediate' | 'advanced'
  status: 'draft' | 'published'
  hero?: string
  notebook?: string
  selectedCells?: number[]
  references?: string[]
}

export interface Post extends PostFrontmatter {
  slug: string
  content: string
  readingTime: string
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory)
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}/index.mdx`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  const time = readingTime(content)

  return {
    slug: realSlug,
    content,
    readingTime: time.text,
    ...(data as PostFrontmatter)
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null && post.status === 'published')
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  
  return posts
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(post => post.tags.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  
  return Array.from(tags).sort()
}