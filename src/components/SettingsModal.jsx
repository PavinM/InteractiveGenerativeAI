import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Check, 
  Keyboard,
  Server,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  chats, 
  settings, 
  onUpdateSettings,
  theme,
  onToggleTheme 
}) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tinyllama_chats_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="dark:bg-[#121419] bg-white dark:border-white/10 border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-5 border-b dark:border-white/10 border-slate-200 flex items-center justify-between dark:bg-[#16181F] bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base dark:text-white text-slate-900">TinyLlama Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage appearance, model parameters, exports & workspace preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b dark:border-white/10 border-slate-200 px-5 dark:bg-[#0F1014] bg-slate-100">
          {[
            { id: 'appearance', label: 'Appearance' },
            { id: 'general', label: 'General' },
            { id: 'model', label: 'Model Guidelines' },
            { id: 'shortcuts', label: 'Shortcuts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm dark:text-white text-slate-900 mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-500" /> Interface Theme
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Choose your preferred workspace color theme.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Theme Option */}
                  <div 
                    onClick={() => onToggleTheme('dark')}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5
                      ${theme === 'dark' 
                        ? 'bg-blue-600/15 border-blue-500 text-white' 
                        : 'dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 text-gray-500 hover:border-blue-300'}
                    `}
                  >
                    <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-blue-400 flex-shrink-0 border border-white/10">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm dark:text-white text-slate-900 flex items-center justify-between">
                        <span>Dark Theme</span>
                        {theme === 'dark' && <Check className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Sleek black (#0B0B0B) dark mode with glass cards and neon blue glow.
                      </p>
                    </div>
                  </div>

                  {/* Light Theme Option */}
                  <div 
                    onClick={() => onToggleTheme('light')}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5
                      ${theme === 'light' 
                        ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm' 
                        : 'dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 text-gray-500 hover:border-blue-300'}
                    `}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-amber-500 flex-shrink-0 border border-slate-300">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm dark:text-white text-slate-900 flex items-center justify-between">
                        <span>Light Theme</span>
                        {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Clean slate (#F8FAFC) light workspace with sharp, readable typography.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Export Data */}
              <div className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm dark:text-white text-slate-900">Export Conversation Data</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Download all your chat logs in JSON format.</p>
                  </div>
                  <button 
                    onClick={handleExportJSON}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    {exported ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                    <span>{exported ? 'Exported!' : 'Export JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Server Endpoint */}
              <div className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 space-y-3">
                <div className="flex items-center gap-2 dark:text-white text-slate-900 font-bold text-sm">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span>PyTorch Model Execution Target</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-200 font-medium">
                    <div className="font-bold dark:text-white text-slate-900 mb-1">Local Direct PyTorch</div>
                    <span>CUDA GPU Enabled (v1.1B v1.0)</span>
                  </div>
                  <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-200 border dark:border-white/5 border-slate-300 text-gray-500 font-medium opacity-60">
                    <div className="font-bold text-slate-700 dark:text-gray-300 mb-1">Remote API Server</div>
                    <span>http://localhost:8000/v1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <div className="font-bold text-sm dark:text-white text-slate-900 mb-2">Model System Guidelines</div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                TinyLlama operates under strict rules defined in your python execution loop:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-gray-300">
                <li>Answers basic & advanced questions clearly.</li>
                <li>Explains AI, ML, Deep Learning concepts.</li>
                <li>Generates clean Python, Java, C++, HTML, CSS, SQL code.</li>
                <li>Keeps responses short unless details are explicitly requested.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="font-bold text-sm dark:text-white text-slate-900 mb-2 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-500" /> Keyboard Shortcuts
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-2.5 rounded-lg dark:bg-white/5 bg-slate-100">
                  <span className="text-slate-700 dark:text-gray-300">New Conversation</span>
                  <kbd className="px-2 py-0.5 dark:bg-black/40 bg-slate-200 rounded border dark:border-white/10 border-slate-300 text-blue-600 dark:text-blue-400 font-mono">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg dark:bg-white/5 bg-slate-100">
                  <span className="text-slate-700 dark:text-gray-300">Send Message</span>
                  <kbd className="px-2 py-0.5 dark:bg-black/40 bg-slate-200 rounded border dark:border-white/10 border-slate-300 text-blue-600 dark:text-blue-400 font-mono">Enter ↵</kbd>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg dark:bg-white/5 bg-slate-100">
                  <span className="text-slate-700 dark:text-gray-300">New Line in Input</span>
                  <kbd className="px-2 py-0.5 dark:bg-black/40 bg-slate-200 rounded border dark:border-white/10 border-slate-300 text-blue-600 dark:text-blue-400 font-mono">Shift + Enter</kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-white/10 border-slate-200 dark:bg-[#16181F] bg-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
