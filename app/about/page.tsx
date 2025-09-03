import { Brain, Github, Twitter, Linkedin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="animate-slideUp">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted/50">
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

            <h2 className="text-2xl font-light mt-12 mb-6">The Mission</h2>
            <p>
              This portfolio documents my journey through deep learning, capturing not just 
              the "what" but the "why" and "how" of neural networks. Each post blends:
            </p>
            <ul className="space-y-2">
              <li>Intuitive explanations that make complex concepts accessible</li>
              <li>Mathematical rigor for those who want to go deeper</li>
              <li>Working code that you can run and experiment with</li>
              <li>Interactive notebooks for hands-on learning</li>
            </ul>

            <h2 className="text-2xl font-light mt-12 mb-6">The Approach</h2>
            <p>
              Learning deep learning shouldn't feel like entering a basement tech dungeon. 
              This site is designed to be a luxurious spa for your mind — clean, minimal, 
              and focused on the content that matters. No gimmicks, no clutter, just 
              pure learning.
            </p>

            <h2 className="text-2xl font-light mt-12 mb-6">Topics Covered</h2>
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Foundation</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Perceptrons, activation functions, gradient descent, backpropagation
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Intermediate</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  CNNs, RNNs, LSTMs, autoencoders, regularization techniques
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Advanced</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Transformers, GANs, VAEs, reinforcement learning, neural architecture search
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Practical</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
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
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
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