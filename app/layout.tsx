import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/components/ThemeProvider"
import { ThemeToggle } from "@/lib/components/ThemeToggle"
import "./globals.css"
import "katex/dist/katex.min.css"
import "highlight.js/styles/github.css"

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
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                  <a className="mr-6 flex items-center space-x-2" href="/">
                    <span className="font-medium">Deep Learning Journey</span>
                  </a>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                    <a href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Posts
                    </a>
                    <a href="/tags" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Tags
                    </a>
                    <a href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      About
                    </a>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with passion for deep learning. © 2024
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