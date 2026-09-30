import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_URL);

const ChatWidget = ({ courseId, userName }) => {
  const sessionKey = `chat_messages_${courseId}`;
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(sessionKey);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify(messages));
  }, [messages, sessionKey]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    socket.emit('join_course_room', courseId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleBotTyping = (status) => {
      setIsTyping(status);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('bot_typing', handleBotTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('bot_typing', handleBotTyping);
    };
  }, [courseId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageData = {
      courseId,
      user: userName || 'Student',
      message: input,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b p-3 shrink-0">
        <h3 className="font-semibold text-gray-800">Classroom Discussion</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${msg.isBot || msg.user === 'Masterji' ? 'text-brand-600 bg-brand-100 px-2 py-0.5 rounded' : 'text-gray-500'}`}>
                {msg.user} {msg.isBot && ' (AI TA)'}
              </span>
            </div>
            <div className={`mt-1 rounded-lg py-2 px-3 inline-block self-start max-w-[90%] ${msg.isBot || msg.user === 'Masterji' ? 'bg-brand-50 border border-brand-200' : 'bg-gray-100'}`}>
              <span className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded self-start">Masterji (AI TA)</span>
            <div className="mt-1 bg-brand-50 border border-brand-200 rounded-lg py-2 px-3 inline-block self-start max-w-[90%]">
              <span className="text-sm text-gray-500 italic">Masterji is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t bg-gray-50 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question..."
          className="flex-1 rounded-md border-gray-300 shadow-sm p-2 text-sm text-black focus:border-brand-500 focus:ring-brand-500"
        />
        <button type="submit" className="p-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
