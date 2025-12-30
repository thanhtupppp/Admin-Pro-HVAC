import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from './AIService';

const AISmartAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, isThinking?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Add thinking state
    setMessages(prev => [...prev, { role: 'ai', text: 'Đang phân tích sâu câu hỏi của bạn...', isThinking: true }]);

    try {
      // Map history for API
      const history = messages
        .filter(m => !m.isThinking)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        } as any)); // Cast because exact type might differ slightly in strict checks

      // In a real app, 'Dashboard Admin' would come from some global context hook
      const result = await chatWithAI(userMsg, history, 'Dashboard Admin');

      setMessages(prev => prev.filter(m => !m.isThinking).concat({ role: 'ai', text: result || 'Không có phản hồi' }));
    } catch (error) {
      setMessages(prev => prev.filter(m => !m.isThinking).concat({ role: 'ai', text: 'Lỗi: Không thể kết nối với AI.' }));
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] bg-surface-dark border border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-primary flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined animate-pulse">psychology</span>
              <span className="font-bold text-sm tracking-wide">AI Thinking Expert</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-background-dark/50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                </div>
                <p className="text-xs text-text-secondary px-6">Chào Admin! Hãy dán dữ liệu hoặc đặt câu hỏi kỹ thuật phức tạp, tôi sẽ sử dụng chế độ tư duy sâu để hỗ trợ bạn.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-lg'
                    : 'bg-surface-dark border border-border-dark text-gray-300 rounded-tl-none'
                  }`}>
                  {m.isThinking && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase">Thinking Mode</span>
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-background-dark border-t border-border-dark/30">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập yêu cầu phân tích..."
                className="w-full bg-surface-dark border-border-dark rounded-xl pl-4 pr-12 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
        >
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">psychology</span>
        </button>
      )}
    </div>
  );
};

export default AISmartAssistant;
