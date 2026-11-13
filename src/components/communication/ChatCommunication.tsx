import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  initials: string;
  text: string;
  timestamp: string;
}

export const ChatCommunication: React.FC = () => {
  const { customer, agentInitials } = useWorkspace();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'customer',
      initials: customer.avatarInitials,
      text: 'Hi, I would like to check availability for a Nissan Sunny from 10 Oct to 13 Oct at Dubai Airport Terminal 1.',
      timestamp: '14:24',
    },
    {
      id: '2',
      sender: 'agent',
      initials: agentInitials,
      text: 'I will check availability for those dates and share the quote with you.',
      timestamp: '14:25',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [agentNotes, setAgentNotes] = useState(
    'Customer looking for Nissan Sunny, 10–13 Oct. Checking availability and will send quote.'
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'agent',
      initials: agentInitials,
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
  };

  return (
    <div className="space-y-1.5 text-[10px]">
      {/* Chat Messages Transcript */}
      <div className="bg-slate-50/70 p-1.5 rounded border border-slate-200 min-h-[60px] max-h-[90px] overflow-y-auto space-y-1.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-1.5 ${
              msg.sender === 'agent' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'customer' && (
              <div className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                {msg.initials}
              </div>
            )}

            <div
              className={`max-w-[80%] p-1.5 rounded text-[10px] leading-snug shadow-2xs ${
                msg.sender === 'agent'
                  ? 'bg-blue-50 text-slate-900 border border-blue-200'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <p>{msg.text}</p>
              <div
                className={`text-[8px] mt-0.5 font-mono ${
                  msg.sender === 'agent' ? 'text-right text-blue-600' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'agent' && (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                {msg.initials}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-1.5">
        <button
          type="button"
          className="flex items-center space-x-0.5 px-2 py-0.5 border border-slate-300 rounded bg-white text-slate-600 text-[10px]"
        >
          <Paperclip className="w-3 h-3 text-slate-500" />
          <span>Attach</span>
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="px-3 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 shadow-2xs shrink-0"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>

      {/* Bottom Notes & Follow Up Controls */}
      <div className="grid grid-cols-12 gap-1.5 pt-0.5">
        <div className="col-span-6 bg-slate-50 p-1.5 rounded border border-slate-200">
          <label className="block text-[9px] font-semibold text-slate-700 mb-0.5">
            Agent Notes
          </label>
          <input
            type="text"
            value={agentNotes}
            onChange={(e) => setAgentNotes(e.target.value)}
            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
          />
        </div>

        <div className="col-span-3 bg-slate-50 p-1.5 rounded border border-slate-200">
          <label className="block text-[9px] font-semibold text-slate-700 mb-0.5">Follow-Up</label>
          <input
            type="text"
            defaultValue="Today 16:00 - Send quote"
            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
          />
        </div>

        <div className="col-span-3 bg-slate-50 p-1.5 rounded border border-slate-200">
          <label className="block text-[9px] font-semibold text-slate-700 mb-0.5">
            Loss Reason (if cancelled)
          </label>
          <select className="w-full px-1 py-0.5 bg-white border border-slate-300 rounded text-[10px]">
            <option value="">Select reason</option>
            <option>Price</option>
            <option>Class unavailable</option>
            <option>Customer changed mind</option>
          </select>
        </div>
      </div>
    </div>
  );
};
