import React, { useState } from 'react';
import {
  Sparkles,
  ListOrdered,
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  Code2,
  Bug,
  Zap,
  Gauge
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LineByLineView from './LineByLineView';
import FollowUpChat from './FollowUpChat';

export default function AnalysisPanel({
  analysis,
  isLoading,
  chatMessages,
  onSendMessage,
  isChatLoading,
  onApplyCodeToEditor,
}) {
  const [activeTab, setActiveTab] = useState('insights');
  const [copied, setCopied] = useState(false);

  const handleCopyOutput = () => {
    if (!analysis?.content) return;
    navigator.clipboard.writeText(analysis.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineBreakdown = analysis?.metadata?.line_breakdown || [];
  const generatedCode = analysis?.metadata?.generated_code || analysis?.metadata?.optimized_code || analysis?.metadata?.corrected_code;

  return (
    <section className="mentor-pane">
      {/* Pane Header */}
      <div className="mentor-header">
        <div className="mentor-tabs">
          <button
            className={`mentor-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights & Breakdown
          </button>

          {lineBreakdown.length > 0 && (
            <button
              className={`mentor-tab ${activeTab === 'linebyline' ? 'active' : ''}`}
              onClick={() => setActiveTab('linebyline')}
            >
              Line-by-Line ({lineBreakdown.length})
            </button>
          )}

          <button
            className={`mentor-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Follow-Up Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {generatedCode && (
            <button
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-indigo)' }}
              onClick={() => onApplyCodeToEditor(generatedCode)}
              title="Apply suggested code directly into the Monaco editor"
            >
              <Code2 size={13} style={{ color: 'var(--accent-indigo)' }} />
              <span>Apply to Editor</span>
            </button>
          )}

          {analysis?.content && (
            <button
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={handleCopyOutput}
              title="Copy markdown response"
            >
              {copied ? <Check size={13} style={{ color: 'var(--status-success)' }} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pane Content */}
      <div className="mentor-content">
        {isLoading ? (
          <div style={{ padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div className="avatar-circle mentor">
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Mentor is analyzing...</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Synthesizing pedagogical insights and complexity breakdown</div>
              </div>
            </div>
            <div className="skeleton-line" style={{ width: '85%' }}></div>
            <div className="skeleton-line" style={{ width: '95%' }}></div>
            <div className="skeleton-line" style={{ width: '70%' }}></div>
            <div className="skeleton-line" style={{ width: '90%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
          </div>
        ) : activeTab === 'linebyline' ? (
          <LineByLineView lineBreakdown={lineBreakdown} />
        ) : activeTab === 'chat' ? (
          <FollowUpChat
            messages={chatMessages}
            onSendMessage={onSendMessage}
            isLoading={isChatLoading}
          />
        ) : analysis ? (
          <div className="ai-markdown-output">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline) {
                    return (
                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="copy-code-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                              }}
                            >
                              <Copy size={12} />
                              <span>Copy</span>
                            </button>
                            <button
                              className="copy-code-btn"
                              onClick={() => onApplyCodeToEditor(codeString)}
                              title="Paste code into editor"
                            >
                              <ArrowRight size={12} />
                              <span>Use Code</span>
                            </button>
                          </div>
                        </div>
                        <pre>
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85em',
                        color: 'var(--text-accent)',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {analysis.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Sparkles size={48} style={{ marginBottom: '16px', color: 'var(--accent-indigo)', opacity: 0.7 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Your AI Programming Mentor is Ready</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Select a task in the toolbar below (Explain, Debug, Optimize, Complexity, or Generate) and click <strong>Ask AI Mentor</strong> to receive structured insights.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
