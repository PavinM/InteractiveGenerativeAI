import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Settings as SettingsIcon, 
  Pin, 
  Edit2, 
  ShieldCheck, 
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DekuLogo from './DekuLogo';

export default function Sidebar({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat, 
  onClearAll, 
  onOpenSettings,
  isOpen,
  onCloseMobileSidebar
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const recentChats = filteredChats.filter(c => !c.pinned);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleText(chat.title);
  };

  const handleSaveRename = (e, chat) => {
    e.stopPropagation();
    if (editTitleText.trim()) {
      chat.title = editTitleText.trim();
    }
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 lg:z-30 w-[280px] 
        dark:bg-[#0E0F12] dark:border-white/10 bg-slate-50 border-r border-slate-200 text-slate-900 dark:text-white
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo */}
        <div className="p-4 border-b dark:border-white/10 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white p-1.5">
              <DekuLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold tracking-tight text-lg dark:text-white text-slate-900 lowercase">deku</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">GenAI Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={onCloseMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button 
            onClick={() => {
              onNewChat();
              onCloseMobileSidebar();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-between shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              <span>New Conversation</span>
            </div>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-white/20 rounded font-mono text-white/90">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-200/70 dark:bg-white/5 border border-transparent focus:border-blue-500 dark:text-gray-200 text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {/* Pinned Section */}
          {pinnedChats.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-blue-500" />
                <span>Pinned</span>
              </div>
              <div className="space-y-1">
                {pinnedChats.map(chat => (
                  <ChatListItem 
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelect={() => {
                      onSelectChat(chat.id);
                      onCloseMobileSidebar();
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    isEditing={editingChatId === chat.id}
                    editTitleText={editTitleText}
                    setEditTitleText={setEditTitleText}
                    onStartRename={(e) => handleStartRename(e, chat)}
                    onSaveRename={(e) => handleSaveRename(e, chat)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            <div className="px-2 mb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Recent Conversations
            </div>
            {recentChats.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No chats found.
              </div>
            ) : (
              <div className="space-y-1">
                {recentChats.map(chat => (
                  <ChatListItem 
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelect={() => {
                      onSelectChat(chat.id);
                      onCloseMobileSidebar();
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    isEditing={editingChatId === chat.id}
                    editTitleText={editTitleText}
                    setEditTitleText={setEditTitleText}
                    onStartRename={(e) => handleStartRename(e, chat)}
                    onSaveRename={(e) => handleSaveRename(e, chat)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t dark:border-white/10 border-slate-200 space-y-1.5">
          <button 
            onClick={onOpenSettings}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium dark:text-gray-300 text-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4 text-gray-400" />
              <span>Settings & Preferences</span>
            </div>
          </button>

          <button 
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Clear History</span>
            </div>
          </button>

          {/* User Profile Footer */}
          <div className="pt-2 border-t dark:border-white/5 border-slate-200 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                U
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold dark:text-gray-200 text-slate-900">User Account</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 inline" /> Deku Engine
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dark:bg-[#16181D] bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg dark:text-white text-slate-900">Clear All Conversations?</h3>
            </div>
            <p className="text-xs dark:text-gray-300 text-slate-600">
              This action will permanently remove all your active chat history. This cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl border dark:border-white/10 border-slate-300 text-xs font-semibold dark:text-gray-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg shadow-red-600/30"
              >
                Clear History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function ChatListItem({ chat, isActive, onSelect, onDelete, isEditing, editTitleText, setEditTitleText, onStartRename, onSaveRename }) {
  return (
    <div 
      onClick={onSelect}
      className={`
        group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all duration-150 border
        ${isActive 
          ? 'dark:bg-blue-600/20 dark:border-blue-500/40 dark:text-blue-100 bg-blue-100/80 border-blue-300 text-blue-900 font-bold shadow-sm' 
          : 'bg-transparent border-transparent dark:text-gray-300 text-slate-700 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        {isEditing ? (
          <input 
            type="text"
            value={editTitleText}
            onChange={(e) => setEditTitleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveRename(e)}
            onBlur={onSaveRename}
            autoFocus
            className="w-full bg-slate-200 dark:bg-black/50 text-slate-900 dark:text-white px-2 py-0.5 rounded border border-blue-500 focus:outline-none text-xs"
          />
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onStartRename}
          className="p-1 rounded text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
          title="Rename Chat"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button 
          onClick={onDelete}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10"
          title="Delete Chat"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
