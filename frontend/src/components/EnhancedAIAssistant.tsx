import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Sparkles, Clock, Calendar, FileText, DollarSign, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: {
    label: string;
    action: string;
    icon: React.ReactNode;
  }[];
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'timesheet' | 'project' | 'analytics' | 'automation';
}

const EnhancedAIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Features
  const aiFeatures: AIFeature[] = [
    {
      id: 'smart-timesheet',
      name: 'Smart Timesheet',
      description: 'AI ช่วยกรอกข้อมูลไทม์ชีทอัตโนมัติ',
      icon: <FileText className="h-5 w-5" />,
      category: 'timesheet'
    },
    {
      id: 'project-suggestions',
      name: 'Project Suggestions',
      description: 'แนะนำโครงการที่เกี่ยวข้อง',
      icon: <Calendar className="h-5 w-5" />,
      category: 'project'
    },
    {
      id: 'time-tracking',
      name: 'Time Tracking',
      description: 'วิเคราะห์รูปแบบการทำงาน',
      icon: <Clock className="h-5 w-5" />,
      category: 'analytics'
    },
    {
      id: 'cost-analysis',
      name: 'Cost Analysis',
      description: 'วิเคราะห์ต้นทุนและงบประมาณ',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'analytics'
    },
    {
      id: 'team-insights',
      name: 'Team Insights',
      description: 'ข้อมูลเชิงลึกเกี่ยวกับทีม',
      icon: <Users className="h-5 w-5" />,
      category: 'analytics'
    },
    {
      id: 'auto-scheduling',
      name: 'Auto Scheduling',
      description: 'จัดตารางการประชุมอัตโนมัติ',
      icon: <Calendar className="h-5 w-5" />,
      category: 'automation'
    }
  ];

  // Quick prompts
  const quickPrompts = [
    'ช่วยสร้างไทม์ชีทสำหรับวันนี้',
    'วิเคราะห์ประสิทธิภาพของทีม',
    'แนะนำการปรับปรุงโครงการ',
    'คำนวณต้นทุนโครงการ',
    'จัดตารางการประชุม',
    'สร้างรายงานสรุป'
  ];

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('ไทม์ชีท') || lowerInput.includes('timesheet')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'ฉันสามารถช่วยคุณสร้างไทม์ชีทได้! ฉันจะวิเคราะห์กิจกรรมล่าสุดของคุณและแนะนำการบันทึกเวลาที่เหมาะสม',
        timestamp: new Date(),
        suggestions: [
          'สร้างไทม์ชีทสำหรับวันนี้',
          'ดูสถิติการทำงาน',
          'แก้ไขไทม์ชีทล่าสุด'
        ],
        actions: [
          {
            label: 'สร้างไทม์ชีท',
            action: 'create-timesheet',
            icon: <FileText className="h-4 w-4" />
          },
          {
            label: 'ดูสถิติ',
            action: 'view-stats',
            icon: <Clock className="h-4 w-4" />
          }
        ]
      };
    } else if (lowerInput.includes('โครงการ') || lowerInput.includes('project')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'ฉันจะช่วยคุณวิเคราะห์และจัดการโครงการ! ฉันสามารถแนะนำการปรับปรุงประสิทธิภาพและติดตามความคืบหน้าได้',
        timestamp: new Date(),
        suggestions: [
          'วิเคราะห์ประสิทธิภาพโครงการ',
          'คำนวณต้นทุนโครงการ',
          'ติดตามความคืบหน้า'
        ],
        actions: [
          {
            label: 'วิเคราะห์โครงการ',
            action: 'analyze-project',
            icon: <Calendar className="h-4 w-4" />
          },
          {
            label: 'คำนวณต้นทุน',
            action: 'calculate-cost',
            icon: <DollarSign className="h-4 w-4" />
          }
        ]
      };
    } else if (lowerInput.includes('ทีม') || lowerInput.includes('team')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'ฉันจะให้ข้อมูลเชิงลึกเกี่ยวกับทีมของคุณ! ฉันสามารถวิเคราะห์ประสิทธิภาพ การทำงานร่วมกัน และแนะนำการปรับปรุงได้',
        timestamp: new Date(),
        suggestions: [
          'วิเคราะห์ประสิทธิภาพทีม',
          'ดูการทำงานร่วมกัน',
          'แนะนำการปรับปรุง'
        ],
        actions: [
          {
            label: 'วิเคราะห์ทีม',
            action: 'analyze-team',
            icon: <Users className="h-4 w-4" />
          },
          {
            label: 'รายงานทีม',
            action: 'team-report',
            icon: <FileText className="h-4 w-4" />
          }
        ]
      };
    } else {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'สวัสดี! ฉันเป็น AI Assistant ของระบบ Painai ฉันสามารถช่วยคุณในเรื่องต่างๆ เช่น การจัดการไทม์ชีท โครงการ การวิเคราะห์ข้อมูล และการทำงานร่วมกันในทีม คุณต้องการความช่วยเหลือในเรื่องอะไรบ้าง?',
        timestamp: new Date(),
        suggestions: [
          'ช่วยสร้างไทม์ชีท',
          'วิเคราะห์โครงการ',
          'ดูข้อมูลทีม'
        ]
      };
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Implement voice recognition here
    if (!isListening) {
      // Start listening
      console.log('Starting voice recognition...');
    } else {
      // Stop listening
      console.log('Stopping voice recognition...');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Implement action handling
  };

  const handleFeatureClick = (feature: AIFeature) => {
    const message = `ช่วยฉันเกี่ยวกับ ${feature.name}`;
    setInput(message);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* AI Assistant Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[600px] bg-white border rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <p className="text-sm text-gray-500">พร้อมช่วยเหลือคุณ</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>

          {/* AI Features */}
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-sm font-medium mb-3">AI Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {aiFeatures.slice(0, 4).map((feature) => (
                <div
                  key={feature.id}
                  className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleFeatureClick(feature)}
                >
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <span className="text-xs font-medium">{feature.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">สวัสดี! ฉันพร้อมช่วยเหลือคุณ</p>
                <div className="space-y-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleSuggestionClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      {message.type === 'user' ? (
                        <AvatarFallback>U</AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.type === 'assistant' && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-7"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {message.actions && message.type === 'assistant' && (
                        <div className="mt-3 flex space-x-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleActionClick(action.action)}
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
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

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความหรือใช้เสียง..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className={isListening ? 'bg-red-100 text-red-600' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIAssistant; 