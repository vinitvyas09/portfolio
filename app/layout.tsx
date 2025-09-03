import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/components/ThemeProvider"
import { ThemeToggle } from "@/lib/components/ThemeToggle"
import "./globals.css"
import "katex/dist/katex.min.css"
import "highlight.js/styles/github.css"
import { Inter, Fraunces } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" })

export const metadata: Metadata = {
  title: "Deep Learning Journey",
  description: "A portfolio of deep learning concepts, from perceptron to reinforcement learning",
  authors: [{ name: "Vinit Vyas" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vinitvyas.ai",
    siteName: "Deep Learning Journey",
    title: "Deep Learning Journey",
    description: "A portfolio of deep learning concepts, from perceptron to reinforcement learning",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Learning Journey",
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
              <div className="container flex h-16 items-center">
                <div className="mr-4 flex">
                  <a className="mr-6 flex items-center" href="/">
                    <span className="text-sm tracking-[0.18em] uppercase text-foreground/80">Deep Learning Journey</span>
                  </a>
                </div>
                <div className="flex flex-1 items-center justify-between md:justify-end">
                  <nav className="flex items-center gap-6 text-sm">
                    <a href="/" className="nav-link">Posts</a>
                    <a href="/tags" className="nav-link">Tags</a>
                    <a href="/about" className="nav-link">About</a>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left py-6">
                  © 2024 — Deep Learning Journey
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
