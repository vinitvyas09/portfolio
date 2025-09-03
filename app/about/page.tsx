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

            <h2 className="text-2xl font-light mt-12 mb-6">Topics Covered</h2>
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-medium mb-2">Foundation</h3>
                <p className="text-sm text-muted-foreground">
                  Perceptrons, activation functions, gradient descent, backpropagation
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-medium mb-2">Intermediate</h3>
                <p className="text-sm text-muted-foreground">
                  CNNs, RNNs, LSTMs, autoencoders, regularization techniques
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-medium mb-2">Advanced</h3>
                <p className="text-sm text-muted-foreground">
                  Transformers, GANs, VAEs, reinforcement learning, neural architecture search
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-medium mb-2">Practical</h3>
                <p className="text-sm text-muted-foreground">
                  PyTorch implementations, optimization tricks, deployment strategies
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-light mt-12 mb-6">Connect</h2>
            <p>
              Follow the journey and connect with me on social platforms:
            </p>
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
