import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Check, 
  Keyboard,
  Server,
  Sun,
  Moon,
  Palette,
  Key,
  Zap,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Trash2
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
  const [activeTab, setActiveTab] = useState('groq');
  const [exported, setExported] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState(() => {
    return settings?.groqApiKey || localStorage.getItem('groq_api_key') || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroqKeyInput(settings?.groqApiKey || localStorage.getItem('groq_api_key') || '');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSaveGroqKey = () => {
    const trimmed = groqKeyInput.trim();
    localStorage.setItem('groq_api_key', trimmed);
    onUpdateSettings({ groqApiKey: trimmed });
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 2500);
  };

  const handleClearGroqKey = () => {
    localStorage.removeItem('groq_api_key');
    setGroqKeyInput('');
    onUpdateSettings({ groqApiKey: '' });
  };

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

  const isKeySaved = Boolean(settings?.groqApiKey || localStorage.getItem('groq_api_key'));

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
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base dark:text-white text-slate-900">Deku AI & Groq Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure Groq API key, model architecture, theme & export logs</p>
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
        <div className="flex border-b dark:border-white/10 border-slate-200 px-5 dark:bg-[#0F1014] bg-slate-100 overflow-x-auto">
          {[
            { id: 'groq', label: '⚡ Groq API Key' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'general', label: 'General' },
            { id: 'model', label: 'Model Guidelines' },
            { id: 'shortcuts', label: 'Shortcuts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Groq Cloud API Key Tab */}
          {activeTab === 'groq' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm dark:text-white text-slate-900">Groq Cloud LPU Hardware Acceleration</h4>
                    {isKeySaved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                        <ShieldCheck className="w-3 h-3" /> Key Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                        Key Not Set
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-[11px]">
                    Paste your Groq API Key to run <strong>Llama 3.3 70B</strong>, <strong>Llama 3.1 8B</strong>, and <strong>Mixtral 8x7B</strong> at <strong>~500+ tokens/sec</strong> ultra speed directly from your browser!
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-orange-500" /> Enter Groq API Key
                  </span>
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-orange-500 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get Free Key at console.groq.com <ExternalLink className="w-3 h-3" />
                  </a>
                </label>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={groqKeyInput}
                    onChange={(e) => setGroqKeyInput(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full pl-4 pr-24 py-3 rounded-xl dark:bg-[#090A0D] bg-slate-100 border dark:border-white/15 border-slate-300 dark:text-white text-slate-900 font-mono text-xs focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 p-1.5 text-gray-400 hover:text-white transition-colors"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveGroqKey}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer transition-all active:scale-95"
                    >
                      {keySavedMessage ? <Check className="w-4 h-4 text-emerald-300" /> : <Check className="w-4 h-4" />}
                      <span>{keySavedMessage ? 'Saved to Browser!' : 'Save Groq Key'}</span>
                    </button>

                    {groqKeyInput && (
                      <button
                        type="button"
                        onClick={handleClearGroqKey}
                        className="px-3 py-2 rounded-xl dark:bg-white/5 bg-slate-200 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    🔒 Key stored securely in browser localStorage only.
                  </p>
                </div>
              </div>

              {/* Supported Models Info */}
              <div className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 space-y-2">
                <h5 className="font-bold text-xs dark:text-white text-slate-900 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-orange-500" /> Groq Cloud Models Supported
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg dark:bg-black/40 bg-white border dark:border-white/5 border-slate-200">
                    <div className="font-bold text-orange-400">Llama 3.3 70B</div>
                    <div className="text-gray-400 mt-0.5">320 tok/s • Reasoning</div>
                  </div>
                  <div className="p-2.5 rounded-lg dark:bg-black/40 bg-white border dark:border-white/5 border-slate-200">
                    <div className="font-bold text-emerald-400">Llama 3.1 8B</div>
                    <div className="text-gray-400 mt-0.5">560 tok/s • Instant</div>
                  </div>
                  <div className="p-2.5 rounded-lg dark:bg-black/40 bg-white border dark:border-white/5 border-slate-200">
                    <div className="font-bold text-blue-400">Mixtral 8x7B</div>
                    <div className="text-gray-400 mt-0.5">480 tok/s • MoE</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <span>PyTorch / Hardware Inference Target</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-600 dark:text-orange-200 font-medium">
                    <div className="font-bold dark:text-white text-slate-900 mb-1">Groq LPU Hardware</div>
                    <span>Cloud API (~500 tok/s)</span>
                  </div>
                  <div className="p-3 rounded-xl dark:bg-white/5 bg-slate-200 border dark:border-white/5 border-slate-300 text-gray-500 font-medium">
                    <div className="font-bold text-slate-700 dark:text-gray-300 mb-1">Local Direct PyTorch</div>
                    <span>ResNet-50 / Ollama</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <div className="font-bold text-sm dark:text-white text-slate-900 mb-2">Model System Guidelines</div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Deku AI operates under strict system rules and leverages Groq LPUs or PyTorch models:
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
            className="py-2 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

