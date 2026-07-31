import React from 'react';
import { 
  Activity, 
  Sliders, 
  FileCode, 
  X,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RightStatsPanel({ 
  isOpen, 
  onClose, 
  stats, 
  settings, 
  onUpdateSettings 
}) {
  if (!isOpen) return null;

  return (
    <aside className="w-80 dark:bg-[#0E0F12] bg-white border-l dark:border-white/10 border-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-y-auto sticky top-16 z-20 text-slate-900 dark:text-white shadow-xl">
      {/* Panel Header */}
      <div className="p-4 border-b dark:border-white/10 border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm dark:text-white text-slate-900">Hardware & Telemetry</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Real-time Hardware Gauges */}
        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" /> Live Metrics
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Tokens Used</div>
              <div className="text-lg font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.tokens || 0}</div>
            </div>

            <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Latency</div>
              <div className="text-lg font-bold text-emerald-500 font-mono mt-0.5">
                {stats.responseTimeMs ? `${stats.responseTimeMs}ms` : '0ms'}
              </div>
            </div>

            <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Generation Speed</div>
              <div className="text-base font-bold text-blue-500 font-mono mt-0.5">
                {stats.tokensPerSec ? `${stats.tokensPerSec} t/s` : '0 t/s'}
              </div>
            </div>

            <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">GPU Memory</div>
              <div className="text-base font-bold text-purple-500 font-mono mt-0.5">1.2 GB</div>
            </div>
          </div>
        </div>

        {/* Model Hardware Info */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Model Name:</span>
            <span className="font-mono text-blue-600 dark:text-blue-300 font-semibold text-[11px]">TinyLlama-1.1B</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Device Target:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">cuda (PyTorch FP32)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Context Window:</span>
            <span className="font-mono text-slate-800 dark:text-gray-200 font-semibold text-[11px]">2048 Tokens</span>
          </div>
        </div>

        {/* Hyperparameters Controls */}
        <div className="space-y-4 pt-2 border-t dark:border-white/10 border-slate-200">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-500" /> Hyperparameters
          </div>

          {/* Temperature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-gray-300 text-slate-700 font-medium">Temperature</span>
              <span className="font-mono text-blue-500 font-bold">{settings.temperature}</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 dark:bg-white/10 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0.1 (Precise)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* Top-P */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-gray-300 text-slate-700 font-medium">Top-P (Nucleus Sampling)</span>
              <span className="font-mono text-blue-500 font-bold">{settings.topP}</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={settings.topP}
              onChange={(e) => onUpdateSettings({ topP: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 dark:bg-white/10 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Repetition Penalty */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-gray-300 text-slate-700 font-medium">Repetition Penalty</span>
              <span className="font-mono text-blue-500 font-bold">{settings.repetitionPenalty}</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="2.0" 
              step="0.05" 
              value={settings.repetitionPenalty}
              onChange={(e) => onUpdateSettings({ repetitionPenalty: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 dark:bg-white/10 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* System Prompt Customizer */}
        <div className="space-y-2 pt-2 border-t dark:border-white/10 border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-500" /> System Prompt
            </div>
          </div>
          <textarea 
            rows={6}
            value={settings.systemPrompt}
            onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
            className="w-full p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/10 border-slate-300 text-xs font-mono dark:text-gray-200 text-slate-900 focus:outline-none focus:border-purple-500/50 leading-relaxed"
          />
        </div>
      </div>
    </aside>
  );
}
