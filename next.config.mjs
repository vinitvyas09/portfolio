import createMDX from '@next/mdx'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Pin tracing root to this project to avoid monorepo root inference
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { isServer }) => {
    if (isServer) {
      const serverExternals = ['esprima', 'framer-motion']

      if (Array.isArray(config.externals)) {
        config.externals.push(...serverExternals)
      } else if (typeof config.externals === 'function') {
        config.externals = [config.externals, ...serverExternals]
      } else if (config.externals) {
        config.externals = [...config.externals, ...serverExternals]
      } else {
        config.externals = [...serverExternals]
      }
    }

    return config
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeHighlight,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})

export default withMDX(nextConfig)
