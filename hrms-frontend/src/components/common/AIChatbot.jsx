// src/components/common/AIChatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi';
import aiService from '../../services/aiService';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Hi! I\'m your HR AI Assistant. How can I help you today?',
      suggestions: ['Leave balance', 'My payslip', 'HR policies'],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chatbot(message);
      const botResponse = res.data.data;
      setMessages(prev => [...prev, {
        role: 'bot',
        text: botResponse.answer,
        suggestions: botResponse.suggestions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I couldn\'t process that. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br
                     from-purple-600 to-pink-600 rounded-full shadow-2xl
                     flex items-center justify-center text-white
                     hover:scale-110 transition-transform z-40"
        >
          <FiMessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500
                           rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-3 right-6 w-80 h-[400px] bg-white
                        rounded-2xl shadow-2xl flex flex-col z-40
                        border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600
                          text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full
                                flex items-center justify-center">
                  <FiZap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">HR AI Assistant</h3>
                  <p className="text-xs opacity-90">Powered by AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/20">
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx}
                   className={`flex ${msg.role === 'user'
                     ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[95%] rounded-2xl p-3
                  ${msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm">{msg.text}</p>

                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="text-xs bg-white/80 hover:bg-white
                                     text-purple-700 px-2 py-1 rounded-full
                                     border border-purple-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask me anything..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white p-3 rounded-lg
                           hover:bg-purple-700 disabled:opacity-50"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;