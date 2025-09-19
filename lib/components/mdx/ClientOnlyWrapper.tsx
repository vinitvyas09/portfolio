"use client";

import dynamic from 'next/dynamic';

// Dynamically import components that use framer-motion with SSR disabled
export const NeuronVsPerceptron = dynamic(
  () => import('../../../components/framer/neuron-vs-perceptron'),
  { ssr: false }
);

export const PerceptronContinuum = dynamic(
  () => import('../../../components/framer/perceptron-morph'),
  { ssr: false }
);

export const InfoBox = dynamic(
  () => import('../../../components/framer/info-box'),
  { ssr: false }
);

export const PerceptronLineConnection = dynamic(
  () => import('../../../components/framer/perceptron-line-connection'),
  { ssr: false }
);