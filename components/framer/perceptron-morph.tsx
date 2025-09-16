'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const PerceptronContinuum = () => {
  const [stage, setStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  
  const stages = [
    'neuron',
    'circuit',
    'math',
    'code',
    'chat'
  ];
  
  const haikuLines = [
    "Mid-engine beauty,",
    "Ninety-eight-six carved corners—",
    "Pure driving, distilled."
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 3500);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (stage === 4) {
      // Type out the question
      const question = "Write a haiku about a 986 Boxster";
      let index = 0;
      setTypedText('');
      setShowResponse(false);
      
      const typeTimer = setInterval(() => {
        if (index < question.length) {
          setTypedText(question.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeTimer);
          setTimeout(() => setShowResponse(true), 500);
        }
      }, 40);
      
      return () => clearInterval(typeTimer);
    }
  }, [stage]);
  
  const renderNeuron = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        {/* Gradient for cell body */}
        <radialGradient id="cellGradient">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
        
        {/* Gradient for signal flow */}
        <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
        </linearGradient>
        
        {/* Filter for glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Dendrites (inputs) - more organic branching structure */}
      <g opacity="0.9">
        {/* Main dendrite branches */}
        <path
          d="M 30 80 Q 70 90 120 130"
          stroke="#475569"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 35 120 Q 75 125 120 140"
          stroke="#475569"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 30 160 Q 70 155 120 150"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 35 200 Q 75 185 120 160"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 30 240 Q 70 220 120 170"
          stroke="#475569"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Smaller dendrite branches */}
        <path
          d="M 50 90 Q 60 85 65 78"
          stroke="#475569"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 55 95 Q 65 100 70 95"
          stroke="#475569"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 60 155 Q 70 150 75 145"
          stroke="#475569"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Synaptic terminals (input points) */}
        <circle cx="30" cy="80" r="3" fill="#3b82f6" opacity="0.8" />
        <circle cx="35" cy="120" r="3" fill="#3b82f6" opacity="0.8" />
        <circle cx="30" cy="160" r="3" fill="#3b82f6" opacity="0.8" />
        <circle cx="35" cy="200" r="3" fill="#3b82f6" opacity="0.8" />
        <circle cx="30" cy="240" r="3" fill="#3b82f6" opacity="0.8" />
      </g>
      
      {/* Cell body (soma) with nucleus */}
      <g>
        {/* Outer membrane */}
        <ellipse
          cx="150"
          cy="150"
          rx="38"
          ry="35"
          fill="url(#cellGradient)"
          stroke="#64748b"
          strokeWidth="2"
          opacity="0.95"
        />
        
        {/* Nucleus */}
        <circle
          cx="150"
          cy="150"
          r="15"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
          opacity="0.8"
        />
        
        {/* Nucleolus */}
        <circle
          cx="153"
          cy="148"
          r="5"
          fill="#0f172a"
          opacity="0.6"
        />
      </g>
      
      {/* Axon hillock and axon */}
      <g>
        {/* Axon hillock (cone shape) */}
        <path
          d="M 188 150 L 200 145 L 200 155 Z"
          fill="#475569"
          stroke="#64748b"
          strokeWidth="1"
        />
        
        {/* Axon with myelin sheaths */}
        {[0, 1, 2, 3].map((i) => (
          <g key={`myelin-${i}`}>
            <rect
              x={210 + i * 28}
              y="145"
              width="20"
              height="10"
              rx="5"
              fill="#334155"
              stroke="#475569"
              strokeWidth="1"
            />
          </g>
        ))}
        
        {/* Nodes of Ranvier (gaps between myelin) */}
        {[0, 1, 2].map((i) => (
          <line
            key={`node-${i}`}
            x1={230 + i * 28}
            y1="150"
            x2={238 + i * 28}
            y2="150"
            stroke="#64748b"
            strokeWidth="2"
          />
        ))}
      </g>
      
      {/* Axon terminals */}
      <g>
        <path
          d="M 318 150 Q 330 145 340 143"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 318 150 Q 330 150 340 150"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 318 150 Q 330 155 340 157"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Synaptic boutons */}
        <circle cx="340" cy="143" r="3" fill="#10b981" opacity="0.8" />
        <circle cx="340" cy="150" r="3" fill="#10b981" opacity="0.8" />
        <circle cx="340" cy="157" r="3" fill="#10b981" opacity="0.8" />
      </g>
      
      {/* Subtle signal flow visualization */}
      <rect
        x="30"
        y="148"
        width="310"
        height="4"
        fill="url(#signalGradient)"
        opacity="0.3"
        rx="2"
      />
      
      {/* Elegant labels */}
      <text x="25" y="60" fill="#64748b" fontSize="10" fontFamily="serif" fontStyle="italic">
        Dendrites
      </text>
      <text x="135" y="200" fill="#64748b" fontSize="10" fontFamily="serif" fontStyle="italic">
        Soma
      </text>
      <text x="240" y="175" fill="#64748b" fontSize="10" fontFamily="serif" fontStyle="italic">
        Axon
      </text>
      <text x="320" y="180" fill="#64748b" fontSize="10" fontFamily="serif" fontStyle="italic">
        Terminals
      </text>
    </svg>
  );
  
  const renderCircuit = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Input nodes */}
      {[0, 1, 2].map((i) => (
        <g key={`input-${i}`}>
          <rect
            x="50"
            y={80 + i * 50}
            width="40"
            height="30"
            fill="#1e293b"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <text x="70" y={100 + i * 50} textAnchor="middle" fill="#f1f5f9" fontSize="11">
            x{i + 1}
          </text>
        </g>
      ))}
      
      {/* Connections with weights */}
      {[0, 1, 2].map((i) => (
        <g key={`wire-${i}`}>
          <line
            x1="90"
            y1={95 + i * 50}
            x2="180"
            y2="150"
            stroke="#64748b"
            strokeWidth="2"
          />
          <text x="135" y={90 + i * 40} fill="#3b82f6" fontSize="10">
            w{i + 1}
          </text>
        </g>
      ))}
      
      {/* Summation node */}
      <rect
        x="180"
        y="130"
        width="50"
        height="40"
        fill="#1e293b"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <text x="205" y="155" textAnchor="middle" fill="#f1f5f9" fontSize="14">
        Σ
      </text>
      
      {/* Activation */}
      <line x1="230" y1="150" x2="270" y2="150" stroke="#64748b" strokeWidth="2" />
      <rect
        x="270"
        y="135"
        width="40"
        height="30"
        fill="#1e293b"
        stroke="#10b981"
        strokeWidth="2"
      />
      <text x="290" y="155" textAnchor="middle" fill="#f1f5f9" fontSize="10">
        f(x)
      </text>
      
      {/* Output */}
      <line x1="310" y1="150" x2="340" y2="150" stroke="#64748b" strokeWidth="2" />
      <circle cx="345" cy="150" r="5" fill="#10b981" />
    </svg>
  );
  
  const renderMath = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      <div className="text-3xl text-white font-serif mb-4">
        y = f(Σ w<sub>i</sub>x<sub>i</sub> + b)
      </div>
      <div className="text-sm text-slate-400 mt-4 space-y-1">
        <div>where:</div>
        <div className="ml-4">f = activation function</div>
        <div className="ml-4">w<sub>i</sub> = weights</div>
        <div className="ml-4">x<sub>i</sub> = inputs</div>
        <div className="ml-4">b = bias</div>
      </div>
    </div>
  );
  
  const renderCode = () => (
    <div className="bg-slate-900 p-6 rounded-lg h-full font-mono text-sm">
      <pre className="text-green-400">
{`def perceptron(inputs, weights, bias):
    # Sum weighted inputs
    total = sum(x * w for x, w in 
                zip(inputs, weights))
    total += bias
    
    # Apply activation (step function)
    return 1 if total > 0 else 0`}
      </pre>
      <div className="mt-4 text-slate-500 text-xs">
        # That's it. That's a neuron.
      </div>
    </div>
  );
  
  const renderChat = () => (
    <div className="bg-slate-900 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-slate-400 text-xs">Claude</span>
      </div>
      
      {/* User message */}
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
          <p className="text-sm">{typedText}</p>
        </div>
      </div>
      
      {/* AI response */}
      {showResponse && (
        <div className="flex justify-start">
          <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%]">
            <div className="text-sm space-y-1">
              {haikuLines.map((line, i) => (
                <div
                  key={i}
                  className="animate-fadeIn italic"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const getStageContent = () => {
    switch (stage) {
      case 0: return renderNeuron();
      case 1: return renderCircuit();
      case 2: return renderMath();
      case 3: return renderCode();
      case 4: return renderChat();
      default: return renderNeuron();
    }
  };
  
  const stageLabels = [
    'Biological Neuron',
    'Circuit Diagram',
    'Mathematical Model',
    'Code Implementation',
    'Modern AI Chat'
  ];
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">        
        {/* Main content area */}
        <div className="h-96 p-8 flex items-center justify-center">
          <div className="w-full h-full transition-all duration-700 ease-in-out transform">
            {getStageContent()}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default PerceptronContinuum;