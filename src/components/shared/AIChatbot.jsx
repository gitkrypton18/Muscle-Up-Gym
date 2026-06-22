import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Dumbbell } from 'lucide-react';
import { chatWithGymAssistant } from '../../lib/ai';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hey! I'm your MuscleUp AI Assistant. Ask me anything about fitness, diets, or exercises!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithGymAssistant(messages, userMessage.text);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not reach the AI. Please check the API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to detect exercise names and render mock API images
  const renderMessageContent = (text) => {
    // If the text looks like an exercise explanation, we can inject placeholder images.
    // For a real FAANG level app, you'd integrate RapidAPI ExerciseDB here.
    return (
      <div className="space-y-2">
        <p className="whitespace-pre-wrap">{text}</p>
        
        {/* Simple keyword detection to show how API images would render */}
        {(text.toLowerCase().includes('lat pulldown') || text.toLowerCase().includes('squat')) && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {[1, 2, 3, 4].map(i => (
              <img 
                key={i}
                src={`https://fakeimg.pl/200x200/222222/ea580c?text=Step+${i}`} 
                alt="Exercise step" 
                className="w-24 h-24 object-cover rounded-md border border-zinc-700 flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-primary text-black p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <Bot size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center text-primary">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-bold">MuscleUp AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-black rounded-br-sm' 
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                }`}>
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-200 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-zinc-950 border-t border-zinc-800">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about a workout..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-black p-2 rounded-full disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
