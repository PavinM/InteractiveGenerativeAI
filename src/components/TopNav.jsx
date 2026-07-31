import React, { useState } from 'react';
import { 
  Menu, 
  ChevronDown, 
  SlidersHorizontal, 
  Settings as SettingsIcon, 
  Cpu, 
  Sun,
  Moon
} from 'lucide-react';
import { MODELS } from '../services/aiEngine';
import DekuLogo from './DekuLogo';

export default function TopNav({ 
  selectedModel, 
  onSelectModel, 
  onToggleMobileSidebar, 
  onToggleRightPanel, 
  isRightPanelOpen,
  onOpenSettings,
  theme,
  onToggleTheme
}) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <header className="h-16 border-b dark:border-white/10 border-slate-200 dark:bg-[#0B0B0B]/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 flex items-center justify-between">
      {/* Left section: Sidebar toggle & Model Selector */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl dark:bg-white/5 bg-slate-100 dark:hover:bg-white/10 hover:bg-slate-200 border dark:border-white/10 border-slate-300 text-xs font-semibold dark:text-gray-200 text-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[180px] sm:max-w-[240px]">{currentModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Model Selector Menu */}
          {showModelDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowModelDropdown(false)} 
              />
              <div className="absolute left-0 mt-2 w-72 dark:bg-[#16181D] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl p-2 z-40 space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b dark:border-white/5 border-slate-100">
                  Select Deku AI Architecture
                </div>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setShowModelDropdown(false);
                    }}
                    className={`
                      w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-3 cursor-pointer
                      ${m.id === selectedModel 
                        ? 'dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-200 bg-blue-50 border border-blue-200 text-blue-800 font-semibold' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'}
                    `}
                  >
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500">
                      <DekuLogo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold dark:text-white text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{m.description}</div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Speed: <strong className="text-emerald-500">{m.speed}</strong></span>
                        <span>VRAM: <strong className="text-blue-500">{m.vram}</strong></span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right section: Hardware Pill, Theme Toggle & Telemetry Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hardware Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Deku Engine • Active</span>
        </div>

        {/* Quick Theme Toggle Button */}
        <button
          onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {/* Settings button */}
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Right Panel Telemetry Toggle */}
        <button 
          onClick={onToggleRightPanel}
          className={`
            p-2 rounded-xl transition-all border cursor-pointer
            ${isRightPanelOpen 
              ? 'dark:bg-blue-600/20 dark:border-blue-500/40 dark:text-blue-300 bg-blue-100 border-blue-300 text-blue-800' 
              : 'dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-300 text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'}
          `}
          title="Toggle Hardware Stats & Hyperparameters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
