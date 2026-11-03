import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Send } from 'lucide-react';
import ChatMessageContent from './ChatMessageContent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const ChatWidget = ({ courseId, userName }) => {
  const sessionKey = `chat_messages_${courseId}`;
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(sessionKey);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const messagesEndRef = useRef(null);

  // Sync to sessionStorage on new messages
  useEffect(() => {
    if (courseId) {
      sessionStorage.setItem(sessionKey, JSON.stringify(messages));
    }
  }, [messages, sessionKey, courseId]);

  // Load from sessionStorage when courseId changes
  useEffect(() => {
    if (!courseId) return;
    const saved = sessionStorage.getItem(sessionKey);
    setMessages(saved ? JSON.parse(saved) : []);
  }, [courseId, sessionKey]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!courseId) return;

    const joinRoom = () => {
      console.log('[ChatWidget] Joining course room:', courseId);
      socket.emit('join_course_room', courseId);
    };

    if (socket.connected) {
      setIsConnected(true);
      joinRoom();
    } else {
      socket.connect();
    }

    const onConnect = () => {
      console.log('[ChatWidget] Socket connected with id:', socket.id);
      setIsConnected(true);
      joinRoom();
    };

    const onDisconnect = () => {
      console.log('[ChatWidget] Socket disconnected');
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      console.error('[ChatWidget] Socket connection error:', err?.message || err);
      setIsConnected(false);
    };

    const handleReceiveMessage = (message) => {
      console.log('[ChatWidget] Received message:', message);
      setMessages((prev) => [...prev, message]);
    };

    const handleBotTyping = (status) => {
      setIsTyping(status);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('bot_typing', handleBotTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('bot_typing', handleBotTyping);
    };
  }, [courseId]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!courseId) {
      console.error('[ChatWidget] Cannot send message: courseId is missing');
      return;
    }

    const messageData = {
      courseId,
      user: userName || 'Student',
      message: trimmed,
      timestamp: new Date().toISOString()
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_course_room', courseId);
    socket.emit('send_message', messageData);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b p-3 shrink-0 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Classroom Discussion</h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className={isConnected ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-xs">
            No messages yet. Ask a question or type <span className="font-mono text-brand-600 bg-brand-50 px-1 py-0.5 rounded border border-brand-200">@masterji</span> to chat with AI!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${msg.isBot || msg.user === 'Masterji' ? 'text-brand-600 bg-brand-100 px-2 py-0.5 rounded' : 'text-gray-500'}`}>
                {msg.user} {msg.isBot && ' (AI TA)'}
              </span>
            </div>
            <div className={`mt-1 rounded-lg py-2.5 px-3.5 inline-block self-start max-w-[95%] sm:max-w-[90%] ${msg.isBot || msg.user === 'Masterji' ? 'bg-brand-50 border border-brand-200 shadow-sm' : 'bg-gray-100'}`}>
              <ChatMessageContent content={msg.message} isBot={msg.isBot || msg.user === 'Masterji'} />
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
          placeholder="Type @masterji to chat with Ai"
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
