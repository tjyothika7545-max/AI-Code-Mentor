import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FollowUpChat({
  messages = [],
  onSendMessage,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const samplePrompts = [
    'Can you explain this in simpler terms?',
    'What happens if the input is empty or null?',
    'Can this be solved using recursion instead?',
    'Why is this algorithm optimal for this problem?',
  ];

  return (
    <div className="chat-tab-container">
      {/* Messages Scroll Area */}
      <div className="chat-messages-scroll">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} style={{ marginBottom: '12px', opacity: 0.5, color: 'var(--accent-indigo)' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Ask Your Mentor Anything</h4>
            <p style={{ fontSize: '0.86rem', maxWidth: '380px', margin: '0 auto 20px' }}>
              Have questions about lines of code, time complexity, or alternative algorithms? Ask below!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  💬 {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div key={index} className={`chat-bubble ${isUser ? 'user' : 'mentor'}`}>
                <div className={`avatar-circle ${isUser ? 'user' : 'mentor'}`}>
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="bubble-body">
                  {isUser ? (
                    <div>{msg.content}</div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="chat-bubble mentor">
            <div className="avatar-circle mentor">
              <Bot size={16} />
            </div>
            <div className="bubble-body" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Mentor is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask a follow-up question about this code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '9px 14px' }}
          disabled={!input.trim() || isLoading}
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
