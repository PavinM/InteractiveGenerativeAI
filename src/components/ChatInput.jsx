import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square, 
  X, 
  FileText,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ onSend, isGenerating, onStopGeneration }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea based on input content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const processFile = (file) => {
    if (!file) return;
    const fileName = file.name || `image_${Date.now()}.png`;
    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    const isImg = (file.type && file.type.startsWith('image/')) || /\.(jfif|jpeg|jpg|png|webp|gif|bmp|tiff|svg)$/i.test(fileName);

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: fileName,
          size: sizeStr,
          type: file.type || 'image/png',
          dataUrl: event.target.result,
          isImage: true
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFile({
        name: fileName,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        dataUrl: null,
        isImage: false
      });
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1 || item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleSubmit = () => {
    if ((input.trim() || attachedFile) && !isGenerating) {
      const promptText = input.trim() || (attachedFile?.isImage ? "Analyze this image and classify its contents." : "");
      const imageData = attachedFile?.isImage ? attachedFile.dataUrl : null;

      onSend(promptText, imageData, attachedFile);
      setInput('');
      setAttachedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleSimulateVoice = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate voice recognition typing
      setTimeout(() => {
        setInput(prev => (prev ? prev + ' ' : '') + 'Explain Machine Learning and Neural Networks');
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div 
      className="relative max-w-4xl mx-auto px-4 pb-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Active Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-x-4 inset-y-0 z-30 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-600/20 backdrop-blur-md flex flex-col items-center justify-center text-blue-400 font-medium pointer-events-none shadow-2xl"
          >
            <UploadCloud className="w-10 h-10 animate-bounce text-blue-400 mb-1" />
            <span className="text-sm font-bold text-white">Drop Image Here to Analyze</span>
            <span className="text-xs text-blue-200">PyTorch MobileNetV3 + ResNet-50 Vision Classifier</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Attachment Pill Preview */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-200 text-xs font-medium backdrop-blur-md shadow-md"
          >
            {attachedFile.isImage ? (
              <div className="flex items-center gap-2">
                <img 
                  src={attachedFile.dataUrl} 
                  alt="Thumbnail" 
                  className="w-7 h-7 object-cover rounded-md border border-blue-400/40"
                />
                <span className="font-semibold">{attachedFile.name}</span>
                <span className="text-[10px] opacity-75">({attachedFile.size})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{attachedFile.name} ({attachedFile.size})</span>
              </div>
            )}

            <button 
              onClick={() => setAttachedFile(null)}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-gray-400 hover:text-slate-900 dark:hover:text-white ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Wave Visualizer Bar */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-2 p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold dark:text-blue-200 text-blue-900">Listening to voice input...</span>
              <div className="flex items-center gap-1">
                <span className="w-1 h-4 bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-6 bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-3 bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-7 bg-blue-500 animate-bounce" style={{ animationDelay: '450ms' }} />
              </div>
            </div>
            <button 
              onClick={() => setIsRecording(false)}
              className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Input Bar */}
      <div className="glass-input rounded-2xl p-2.5 sm:p-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/40 shadow-lg">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={attachedFile?.isImage ? "Ask something about this image or press Enter to analyze..." : "Ask anything, paste (Ctrl+V), or drag & drop an image..."}
          rows={1}
          className="w-full bg-transparent dark:text-white text-slate-900 placeholder:text-gray-400 text-sm focus:outline-none resize-none px-2 py-1 min-h-[40px] max-h-[180px] leading-relaxed font-sans"
        />

        {/* Input Control Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 border-slate-200">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Upload File / Image Button */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Upload Image or File for Classification (or Drag & Drop / Ctrl+V Paste)"
            >
              <ImageIcon className="w-4 h-4 text-blue-400 hover:scale-110 transition-transform" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.jfif,.bmp,.svg"
              onChange={handleFileUpload} 
              className="hidden" 
            />

            {/* Voice Input Button */}
            <button 
              type="button"
              onClick={handleSimulateVoice}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
              title="Voice Input"
            >
              {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </button>

            <span className="hidden sm:inline-block text-[11px] text-gray-400 font-medium ml-2">
              Drag & Drop or Ctrl+V Paste Images Supported
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stop Generation Button */}
            {isGenerating ? (
              <button 
                type="button"
                onClick={onStopGeneration}
                className="py-2 px-3.5 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-500 dark:text-red-300 font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              /* Send Button */
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() && !attachedFile}
                className={`
                  py-2 px-4 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all duration-200 shadow-lg
                  ${(input.trim() || attachedFile)
                    ? 'blue-gradient-glow text-white cursor-pointer active:scale-95' 
                    : 'dark:bg-white/5 bg-slate-100 text-gray-400 border dark:border-white/5 border-slate-200 cursor-not-allowed'}
                `}
              >
                <span>{attachedFile?.isImage ? "Analyze Image" : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 text-center mt-2 font-medium">
        Deku AI Image Classification (MobileNetV3 + ResNet-50). Drag & drop or paste images anytime.
      </div>
    </div>
  );
}
