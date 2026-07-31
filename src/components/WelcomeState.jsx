import React, { useState } from 'react';
import {
  Code,
  BrainCircuit,
  FileText,
  Database,
  ArrowRight,
  Terminal,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import DekuLogo from './DekuLogo';

const PROMPT_CARDS = [
  {
    id: 'ml',
    category: 'AI & ML',
    title: 'Explain Machine Learning',
    prompt: 'Explain Machine Learning and its 3 core types with a simple Python code example.',
    description: 'Supervised, Unsupervised & Reinforcement Learning breakdown.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-cyan-500',
    badge: 'Popular'
  },
  {
    id: 'python',
    category: 'Coding',
    title: 'Write Python Code',
    prompt: 'Write Python code for Binary Search with line-by-line explanation.',
    description: 'Efficient O(log N) algorithm with example usage.',
    icon: Code,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Python'
  },
  {
    id: 'notes',
    category: 'Writing',
    title: 'Summarize Notes',
    prompt: 'Summarize notes on AI automation efficiency and model deployment.',
    description: 'Concise executive summary with bullet points.',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    badge: 'Summary'
  },
  {
    id: 'sql',
    category: 'SQL & Data',
    title: 'Generate SQL Query',
    prompt: 'Generate SQL Query to find top 5 spending customers in 2026.',
    description: 'INNER JOIN, GROUP BY, HAVING and aggregation.',
    icon: Database,
    color: 'from-amber-500 to-orange-500',
    badge: 'SQL'
  },
  {
    id: 'dl',
    category: 'AI & ML',
    title: 'Explain Deep Learning',
    prompt: 'Explain Deep Learning architectures like CNNs, RNNs, and Transformers.',
    description: 'Neural Network layers & PyTorch module structure.',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-500',
    badge: 'PyTorch'
  },
  {
    id: 'cpp',
    category: 'Coding',
    title: 'C++ Vector Optimization',
    prompt: 'Write a C++ program demonstrating vector sorting and dynamic memory usage.',
    description: 'Low-latency C++ STL algorithms example.',
    icon: Terminal,
    color: 'from-cyan-500 to-blue-600',
    badge: 'C++'
  }
];

const CATEGORIES = ['All', 'AI & ML', 'Coding', 'Writing', 'SQL & Data'];

export default function WelcomeState({ onSelectPrompt }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCards = selectedCategory === 'All'
    ? PROMPT_CARDS
    : PROMPT_CARDS.filter(c => c.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      {/* Hero Logo Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6"
      >
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-2xl animate-pulse-slow" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 p-[1px] shadow-2xl shadow-blue-500/30">
          <div className="w-full h-full rounded-[23px] dark:bg-[#0E0F12] bg-white flex items-center justify-center text-blue-500 dark:text-white border border-slate-200 dark:border-transparent p-3">
            <DekuLogo className="w-10 h-10" />
          </div>
        </div>
      </motion.div>

      {/* Main Welcome Heading */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center dark:text-white text-slate-900 tracking-tight mb-3"
      >
        What can <span className="lowercase bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">deku</span> help you with today?
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-xl mb-8 font-medium"
      >
        Deku AI Assistant is online and operational. Select a prompt below or ask any question to begin.
      </motion.p>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex items-center justify-center flex-wrap gap-2 mb-8"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer
              ${selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                : 'dark:bg-white/5 bg-slate-100 dark:hover:bg-white/10 hover:bg-slate-200 dark:text-gray-400 text-slate-700 dark:border-white/5 border-slate-200'}
            `}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Suggested Prompt Cards Grid */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
      >
        {filteredCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPrompt(card.prompt)}
              className="glass-card p-4 rounded-2xl cursor-pointer group transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md dark:bg-white/10 bg-slate-100 dark:text-gray-300 text-slate-700 border dark:border-white/10 border-slate-200">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-bold dark:text-white text-slate-900 text-sm group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-100 flex items-center justify-between text-xs text-gray-400 group-hover:text-blue-500 font-medium transition-colors">
                <span>Start conversation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
