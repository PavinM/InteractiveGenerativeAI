import React, { useState } from 'react';
import { 
  User, 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  Terminal, 
  Clock,
  VolumeX,
  Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';
import DekuLogo from './DekuLogo';

export default function ChatMessage({ message, onRegenerate }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState(null);

  const isUser = message.role === 'user';
  const isEmptyAssistant = !isUser && (!message.content || message.content.trim() === '');

  const handleCopyMessage = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(index);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSpeech = () => {
    if ('speechSynthesis' in window && message.content) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, 'Code block skipped.'));
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const parseMarkdownContent = (text) => {
    if (!text) return [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
  };

  const parts = parseMarkdownContent(message.content);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`py-3.5 px-4 sm:px-6 flex gap-3.5 sm:gap-4 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-600/20 mt-1 p-1.5">
          <DekuLogo className="w-5 h-5" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end max-w-[85%] sm:max-w-[75%]' : 'items-start flex-1 max-w-[95%] sm:max-w-[88%]'}`}>
        {/* Role & Timestamp Header */}
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-xs font-semibold dark:text-gray-300 text-slate-700">
            {isUser ? 'You' : 'Deku AI'}
          </span>
          {!isUser && message.stats && (
            <span className="text-[10px] dark:text-gray-500 text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 inline text-emerald-500" />
              {message.stats.responseTimeMs}ms • {message.stats.tokensPerSec} tok/s
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`
          rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-md
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
            : 'dark:bg-[#1A1D24] dark:border-white/10 dark:text-gray-100 bg-white border border-slate-200 text-slate-900 rounded-tl-sm glass-panel font-medium'}
        `}>
          {/* User Attached Image Preview */}
          {message.image && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/20 dark:border-white/10 shadow-lg max-w-sm">
              <img 
                src={message.image} 
                alt="Attached input" 
                className="w-full h-auto max-h-64 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
              />
              {message.fileName && (
                <div className="px-3 py-1.5 bg-black/40 text-[11px] font-mono text-gray-200 backdrop-blur-sm flex items-center gap-1.5">
                  <span>📷 {message.fileName}</span>
                </div>
              )}
            </div>
          )}

          {isEmptyAssistant ? (
            /* Animated Thinking Indicator inside bubble */
            <div className="flex items-center gap-2.5 py-1 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dot-wave-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dot-wave-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dot-wave-3" />
              <span className="text-xs font-medium text-slate-500 dark:text-gray-400 ml-1.5 animate-pulse">
                Deku Vision is classifying & thinking...
              </span>
            </div>
          ) : (
            parts.map((part, idx) => {
              if (part.type === 'text') {
                return (
                  <div key={idx} className="space-y-3 whitespace-pre-wrap">
                    {renderFormattedText(part.content, isUser)}
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-800 dark:border-white/15 bg-[#0B0C0E] shadow-2xl font-mono text-xs">
                    {/* Code Header Bar */}
                    <div className="bg-[#15171C] px-4 py-2 flex items-center justify-between border-b border-white/10 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-xs text-gray-200 uppercase tracking-wide">{part.language}</span>
                      </div>
                      <button 
                        onClick={() => handleCopyCode(part.code, idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-[11px] font-medium"
                      >
                        {copiedCodeId === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code Display Area */}
                    <div className="p-4 overflow-x-auto text-gray-100 leading-relaxed font-mono">
                      <pre className="m-0">
                        <code>{part.code}</code>
                      </pre>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Action Toolbar for Assistant Response */}
        {!isUser && message.content && message.content.trim() !== '' && (
          <div className="flex items-center gap-1 mt-2 px-1 text-gray-500 dark:text-gray-400 text-xs">
            <button 
              onClick={handleCopyMessage}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Copy Answer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={handleSpeech}
              className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors ${isSpeaking ? 'text-blue-500 font-bold' : ''}`}
              title={isSpeaking ? "Stop Reading" : "Read Aloud"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={() => onRegenerate && onRegenerate(message.id)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Regenerate Response"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <div className="h-3 w-[1px] bg-slate-300 dark:bg-white/10 mx-1" />

            <button 
              onClick={() => setLiked(liked === 'up' ? null : 'up')}
              className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors ${liked === 'up' ? 'text-emerald-500 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
              title="Good Response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => setLiked(liked === 'down' ? null : 'down')}
              className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors ${liked === 'down' ? 'text-red-500 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
              title="Poor Response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md mt-1">
          U
        </div>
      )}
    </motion.div>
  );
}

function renderFormattedText(text, isUser = false) {
  if (!text) return null;
  const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
  const lines = cleanText.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <h3 key={i} className={`text-base font-bold mt-2 mb-1 ${isUser ? 'text-white' : 'dark:text-white text-slate-900'}`}>{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('#### ')) {
      return <h4 key={i} className={`text-sm font-bold mt-2 mb-1 ${isUser ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>{line.replace('#### ', '')}</h4>;
    }
    if (line.startsWith('- ')) {
      return (
        <li key={i} className={`ml-4 list-disc opacity-90 font-normal ${isUser ? 'text-white' : 'dark:text-gray-200 text-slate-800'}`}>
          {line.replace('- ', '')}
        </li>
      );
    }
    return <p key={i} className={`my-1 font-normal ${isUser ? 'text-white' : 'dark:text-gray-200 text-slate-800'}`}>{line}</p>;
  });
}
