import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Clock, Calendar, FileText, TrendingUp, Lightbulb, X } from 'lucide-react';
import { useGemini } from '../../hooks/useGemini';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
}

interface Suggestion {
  id: string;
  text: string;
  action?: () => void;
  icon?: React.ReactNode;
}

export const EnhancedAIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const { generate, response, isLoading, error } = useGemini();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick suggestions
  const suggestions: Suggestion[] = [
    {
      id: '1',
      text: 'ช่วยสร้างไทม์ชีทสำหรับวันนี้',
      icon: <Clock className="w-4 h-4" />,
      action: () => handleSuggestion('ช่วยสร้างไทม์ชีทสำหรับวันนี้')
    },
    {
      id: '2',
      text: 'แสดงรายงานการทำงานของสัปดาห์นี้',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => handleSuggestion('แสดงรายงานการทำงานของสัปดาห์นี้')
    },
    {
      id: '3',
      text: 'แนะนำวิธีการจัดการเวลา',
      icon: <Lightbulb className="w-4 h-4" />,
      action: () => handleSuggestion('แนะนำวิธีการจัดการเวลา')
    },
    {
      id: '4',
      text: 'ช่วยตรวจสอบไทม์ชีทที่ยังไม่ได้ส่ง',
      icon: <FileText className="w-4 h-4" />,
      action: () => handleSuggestion('ช่วยตรวจสอบไทม์ชีทที่ยังไม่ได้ส่ง')
    }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `สวัสดี! ฉันเป็น AI Assistant ที่จะช่วยคุณจัดการไทม์ชีทและโครงการต่างๆ 

คุณสามารถถามฉันเกี่ยวกับ:
• การสร้างและจัดการไทม์ชีท
• การดูรายงานและสถิติ
• คำแนะนำในการจัดการเวลา
• การตรวจสอบสถานะโครงการ

ลองเลือกคำแนะนำด้านล่างหรือพิมพ์คำถามของคุณได้เลย!`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const aiResponse = await generate(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถามของคุณ กรุณาลองใหม่อีกครั้ง',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 group"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Assistant
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">AI Assistant</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">ออนไลน์</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
                title="ล้างแชท"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'assistant' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                คำแนะนำ
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={suggestion.action}
                    className="text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.icon}
                      <span className="truncate">{suggestion.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์คำถามของคุณ..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              กด Enter เพื่อส่ง หรือ Shift+Enter เพื่อขึ้นบรรทัดใหม่
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// Mobile AI Assistant
export const MobileAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <EnhancedAIAssistant />
    </div>
  );
};

// Desktop AI Assistant
export const DesktopAIAssistant: React.FC = () => {
  return (
    <div className="hidden md:block">
      <EnhancedAIAssistant />
    </div>
  );
}; 