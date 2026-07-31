import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import WelcomeState from './components/WelcomeState';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import RightStatsPanel from './components/RightStatsPanel';
import SettingsModal from './components/SettingsModal';
import { generateResponse, DEFAULT_SYSTEM_PROMPT, MODELS } from './services/aiEngine';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tinyllama_theme') || 'dark');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stats, setStats] = useState({
    tokens: 0,
    tokensPerSec: '0.0',
    responseTimeMs: 0
  });

  const [settings, setSettings] = useState({
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    repeatPenalty: 1.1,
    theme: theme
  });

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('tinyllama_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'chat-default',
        title: 'New Conversation',
        createdAt: Date.now(),
        messages: []
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return chats[0]?.id || 'chat-default';
  });

  const chatEndRef = useRef(null);

  // Sync theme with HTML document tag
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    }
    localStorage.setItem('tinyllama_theme', theme);
  }, [theme]);

  // Sync chats to localStorage
  useEffect(() => {
    localStorage.setItem('tinyllama_chats', JSON.stringify(chats));
  }, [chats]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isGenerating]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setSettings(prev => ({ ...prev, theme: nextTheme }));
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || {
    id: 'chat-default',
    title: 'New Conversation',
    messages: []
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = { id: `chat-${Date.now()}`, title: 'New Conversation', createdAt: Date.now(), messages: [] };
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllChats = () => {
    const fresh = { id: `chat-${Date.now()}`, title: 'New Conversation', createdAt: Date.now(), messages: [] };
    setChats([fresh]);
    setActiveChatId(fresh.id);
  };

  const handleSendMessage = async (userPromptText, imageData = null, fileInfo = null) => {
    if ((!userPromptText || !userPromptText.trim()) && !imageData) return;

    const cleanPrompt = (userPromptText || '').trim();

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: cleanPrompt,
      image: imageData,
      fileName: fileInfo?.name || null,
      timestamp: Date.now()
    };

    let updatedTitle = activeChat.title;
    if (activeChat.messages.length === 0) {
      const displayTitle = cleanPrompt || (fileInfo?.name ? `Image: ${fileInfo.name}` : 'Image Analysis');
      updatedTitle = displayTitle.length > 28 ? displayTitle.substring(0, 28) + '...' : displayTitle;
    }

    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantPlaceholderMsg = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    // Add user message & empty assistant placeholder to state
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          title: updatedTitle,
          messages: [...chat.messages, userMsg, assistantPlaceholderMsg]
        };
      }
      return chat;
    }));

    setIsGenerating(true);

    try {
      await generateResponse({
        prompt: cleanPrompt,
        image: imageData,
        history: activeChat.messages,
        settings,
        onChunk: ({ text, stats: currentStats }) => {
          setStats(currentStats);
          setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const updatedMessages = chat.messages.map(msg => {
                if (msg.id === assistantMessageId) {
                  return { ...msg, content: text, stats: currentStats };
                }
                return msg;
              });
              return { ...chat, messages: updatedMessages };
            }
            return chat;
          }));
        },
        onComplete: ({ text, stats: finalStats }) => {
          setStats(finalStats);
          setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const updatedMessages = chat.messages.map(msg => {
                if (msg.id === assistantMessageId) {
                  return { ...msg, content: text, stats: finalStats };
                }
                return msg;
              });
              return { ...chat, messages: updatedMessages };
            }
            return chat;
          }));
          setIsGenerating(false);
        }
      });
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handleRegenerate = (msgId) => {
    if (isGenerating || activeChat.messages.length < 2) return;
    const lastUserMsg = activeChat.messages.filter(m => m.role === 'user').slice(-1)[0];
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.image);
    }
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0B0B0B] text-white'}`}>
      {/* Left Sidebar */}
      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onClearAll={handleClearAllChats}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[280px]">
        {/* Top Navigation */}
        <TopNav 
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          isRightPanelOpen={isRightPanelOpen}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Central Chat View */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {/* Scrollable Content Container with generous bottom clearance */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 pt-4 pb-48">
            {activeChat.messages.length === 0 ? (
              <WelcomeState onSelectPrompt={handleSendMessage} />
            ) : (
              <div className="py-2">
                {activeChat.messages.map(msg => (
                  <ChatMessage 
                    key={msg.id}
                    message={msg}
                    onRegenerate={handleRegenerate}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Sticky Input Bar at Bottom */}
          <div className="sticky bottom-0 left-0 right-0 z-20 dark:bg-[#0B0B0B]/90 bg-[#F8FAFC]/90 backdrop-blur-md pt-2 pb-3 border-t dark:border-white/5 border-slate-200/60">
            <ChatInput 
              onSend={handleSendMessage}
              isGenerating={isGenerating}
              onStopGeneration={handleStopGeneration}
            />
          </div>
        </main>
      </div>

      {/* Right Telemetry & Hyperparameters Panel */}
      <RightStatsPanel 
        isOpen={isRightPanelOpen}
        onClose={() => setIsRightPanelOpen(false)}
        stats={stats}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chats={chats}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
