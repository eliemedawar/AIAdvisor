import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Loader2, Plus } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdvisorChat } from '../../hooks/useAdvisorChat';

const CHAT_HERO_IMAGE =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663445009235/mqrjtnLTPuV8W9rpRJHu95/neural_canvas_chat_hero-hPioH6LQCY3nBdSnezTLJ3.webp';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md ${
          isUser
            ? 'bg-gradient-to-r from-indigo-neon-600 to-indigo-neon-500 text-void-950 rounded-3xl rounded-tr-sm'
            : 'glass rounded-3xl rounded-tl-sm border-l-2 border-indigo-neon-600'
        } p-4 animate-slide-up`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex gap-2 items-center mb-4">
    <div className="glass rounded-3xl rounded-tl-sm p-4">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-indigo-neon-600 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-indigo-neon-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-neon-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

const QuickPrompt: React.FC<{ text: string; onClick: () => void }> = ({
  text,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="glass rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-indigo-neon-600 hover:border-indigo-neon-600/50 transition-all border border-indigo-neon-600/20 hover:border-indigo-neon-600/50"
  >
    {text}
  </button>
);

const EmptyState: React.FC<{ onPromptClick: (prompt: string) => void }> = ({
  onPromptClick,
}) => (
  <div className="h-full flex flex-col items-center justify-center gap-8 px-6">
    {/* Animated orb */}
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-neon-600/20 to-teal-neon-600/20 animate-pulse shadow-glow-indigo-lg" />

    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        What can I help you with?
      </h2>
      <p className="text-gray-400">
        Ask me about your courses, study tips, or academic planning
      </p>
    </div>

    {/* Quick prompts */}
    <div className="grid grid-cols-2 gap-3 max-w-sm">
      <QuickPrompt
        text="Study tips for exams"
        onClick={() => onPromptClick('Give me study tips for exams')}
      />
      <QuickPrompt
        text="Course recommendations"
        onClick={() => onPromptClick('What courses should I take?')}
      />
      <QuickPrompt
        text="Time management"
        onClick={() => onPromptClick('How can I manage my time better?')}
      />
      <QuickPrompt
        text="GPA improvement"
        onClick={() => onPromptClick('How can I improve my GPA?')}
      />
    </div>
  </div>
);

export const ChatPage: React.FC = () => {
  const {
    conversation,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    clearConversation,
  } = useAdvisorChat();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-neon-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <div
          className="bg-cover bg-center relative border-b border-indigo-neon-600/10"
          style={{
            backgroundImage: `url(${CHAT_HERO_IMAGE})`,
            minHeight: '120px',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-void-950/70 to-transparent" />
          <div className="relative z-10 flex items-center justify-between h-full px-6 lg:px-12">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                AI Academic Advisor
              </h1>
              <p className="text-gray-300 text-sm">
                Your personal study companion
              </p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
              >
                <Plus size={18} className="mr-2" />
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-4"
        >
          {messages.length === 0 ? (
            <EmptyState onPromptClick={handleQuickPrompt} />
          ) : (
            <>
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              {sending && <TypingIndicator />}
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 lg:px-12 py-4 bg-danger/10 border-t border-danger/30 flex gap-3">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-danger text-sm font-medium">Error</p>
              <p className="text-danger/80 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="sticky bottom-0 px-6 lg:px-12 py-6 bg-gradient-to-t from-void-950 to-transparent border-t border-indigo-neon-600/10">
          <div className="glass-strong rounded-full flex items-end gap-2 p-2 max-w-4xl mx-auto">
            <textarea
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus-visible:outline-none p-3 max-h-24 scrollable"
              placeholder="Ask me anything..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-full bg-indigo-neon-600 text-void-950 flex items-center justify-center hover:shadow-glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-gray-500 text-xs text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
