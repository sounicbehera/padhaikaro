import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Send } from 'lucide-react';

const socket = io('http://localhost:4000');

const ChatWidget = ({ courseId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.emit('join_course_room', courseId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
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
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b p-3">
        <h3 className="font-semibold text-gray-800">Classroom Discussion</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500">{msg.user}</span>
            <div className="bg-gray-100 rounded-lg py-2 px-3 inline-block self-start max-w-[90%]">
              <span className="text-sm text-gray-800">{msg.message}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t bg-gray-50 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question..."
          className="flex-1 rounded-md border-gray-300 shadow-sm p-2 text-sm focus:border-brand-500 focus:ring-brand-500"
        />
        <button type="submit" className="p-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
