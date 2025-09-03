import { Brain, Github, Twitter, Linkedin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="animate-slideUp">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full border border-border">
              <Brain className="h-12 w-12 text-foreground/80" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-8 text-center">
            About This Journey
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="lead text-muted-foreground text-center mb-12">
              A deep dive into the mathematical foundations and practical implementations 
              of deep learning, from basic perceptrons to advanced reinforcement learning.
            </p>

            <h2 className="text-2xl font-light mt-12 mb-6">Connect</h2>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://github.com/vinitvyas09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:bg-muted transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
