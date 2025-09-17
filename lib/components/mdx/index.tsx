/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Intuition } from "./Intuition"
import { Math } from "./Math"
import { Code } from "./Code"
import { Notebook } from "./Notebook"
import { References } from "./References"
import ChatGif from "../../../components/framer/chatgif"
import HeadlineCascade from "../../../components/framer/headline-cascade"
import MCPWeatherFlow from "../../../components/framer/weather-finder"
import MCPPort from "../../../components/framer/mcp-port"
import IntegrationTaxGif from "../../../components/framer/integration-tax"
import PerceptronContinuum from "../../../components/framer/perceptron-morph"
import NeuronAnimation from "../../../components/framer/neuron-animation"
import NeuronVsPerceptron from "../../../components/framer/neuron-vs-perceptron"

export const mdxComponents = {
  Intuition,
  Math,
  Code,
  Notebook,
  References,
  ChatGif,
  HeadlineCascade,
  MCPWeatherFlow,
  MCPPort,
  IntegrationTaxGif,
  PerceptronContinuum,
  NeuronAnimation,
  NeuronVsPerceptron,
  h1: (props: any) => <h1 {...props} className="text-4xl font-light tracking-tight mt-12 mb-6" />,
  h2: (props: any) => <h2 {...props} className="text-3xl font-light tracking-tight mt-10 mb-4" id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} />,
  h3: (props: any) => <h3 {...props} className="text-2xl font-light tracking-tight mt-8 mb-3" id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} />,
  h4: (props: any) => <h4 {...props} className="text-xl font-light mt-6 mb-2" />,
  p: (props: any) => <p {...props} className="mb-6 leading-relaxed" />,
  ul: (props: any) => <ul {...props} className="mb-6 ml-6 list-disc" />,
  ol: (props: any) => <ol {...props} className="mb-6 ml-6 list-decimal" />,
  li: (props: any) => <li {...props} className="mb-2" />,
  blockquote: (props: any) => (
    <blockquote {...props} className="border-l-4 border-muted-foreground/20 pl-6 italic my-8 text-muted-foreground" />
  ),
  hr: (props: any) => <hr {...props} className="my-12 border-border" />,
  a: (props: any) => (
    <a {...props} className="text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity" />
  ),
  img: (props: any) => (
    <figure className="my-8">
      <img {...props} className="rounded-lg w-full" alt={props.alt || ""} />
      {props.alt && <figcaption className="text-center text-sm text-muted-foreground mt-2">{props.alt}</figcaption>}
    </figure>
  ),
  table: (props: any) => (
    <div className="my-8 overflow-x-auto">
      <table {...props} className="w-full border-collapse" />
    </div>
  ),
  thead: (props: any) => <thead {...props} className="border-b-2 border-border" />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => <tr {...props} className="border-b border-border" />,
  th: (props: any) => <th {...props} className="text-left p-3 font-medium" />,
  td: (props: any) => <td {...props} className="p-3" />,
}
