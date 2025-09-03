import { Brain } from "lucide-react"
import { SiGithub, SiX, SiLinkedin } from "react-icons/si"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <div className="animate-slideUp">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full border border-border">
              <Brain className="h-12 w-12 text-foreground/80" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-8 text-center">
            About
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="lead text-muted-foreground text-center mb-12">
              A deep dive into the mathematical foundations and practical implementations 
              of deep learning, from basic perceptrons to advanced reinforcement learning.
            </p>

            <div className="flex justify-center gap-4 mt-10">
              <a 
                href="https://github.com/vinitvyas09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <SiGithub className="h-5 w-5" size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <SiX className="h-5 w-5" size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                aria-label="LinkedIn"
              >
                <SiLinkedin className="h-5 w-5" size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
