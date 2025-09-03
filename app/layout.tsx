import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/components/ThemeProvider"
import { ThemeToggle } from "@/lib/components/ThemeToggle"
import "./globals.css"
import "katex/dist/katex.min.css"
import "highlight.js/styles/github.css"
import { Inter, Fraunces } from "next/font/google"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" })

export const metadata: Metadata = {
  title: "Vinit Vyas Portfolio",
  description: "A portfolio of deep learning concepts, from perceptron to reinforcement learning",
  authors: [{ name: "Vinit Vyas" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vinitvyas.ai",
    siteName: "Vinit Vyas Portfolio",
    title: "Vinit Vyas Portfolio",
    description: "A portfolio of deep learning concepts, from perceptron to reinforcement learning",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinit Vyas Portfolio",
    description: "A portfolio of deep learning concepts, from perceptron to reinforcement learning",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen antialiased ${inter.variable} ${fraunces.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
                <div className="mr-4 flex">
                  <Link className="mr-6 flex items-center" href="/">
                    <span className="text-sm tracking-[0.18em] uppercase text-foreground/80">Vinit Vyas Portfolio</span>
                  </Link>
                </div>
                <div className="flex flex-1 items-center justify-between md:justify-end">
                  <nav className="flex items-center gap-6 text-sm">
                    <Link href="/" className="nav-link">Posts</Link>
                    <Link href="/tags" className="nav-link">Tags</Link>
                    <Link href="/about" className="nav-link">About</Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t">
              <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left py-6">
                  © 2024 — Vinit Vyas Portfolio
                </p>
              </div>
            </footer>
          </div>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
