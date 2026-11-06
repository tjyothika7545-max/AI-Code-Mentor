import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  ArrowRight,
  Code2,
  Clock,
  Filter,
  CheckCircle,
  FileCode
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoryView({ onRestoreSession }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHistory({
        limit: 50,
        task: taskFilter || undefined,
        language: languageFilter || undefined,
      });
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [languageFilter, taskFilter]);

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved session?')) return;

    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setActionMessage('Session deleted.');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert('Failed to delete session: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL sessions and history? This cannot be undone.')) return;

    try {
      await api.clearAllHistory();
      setSessions([]);
      setActionMessage('All history cleared.');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert('Failed to clear history: ' + err.message);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title?.toLowerCase().includes(q);
    const codeMatch = s.initial_code?.toLowerCase().includes(q);
    return titleMatch || codeMatch;
  });

  return (
    <div className="content-viewport">
      <div className="dashboard-container">
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Analysis History & Saved Sessions
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Revisit previous code analyses, review line-by-line notes, and resume follow-up chats.
            </p>
          </div>

          {sessions.length > 0 && (
            <button
              className="btn-secondary"
              onClick={handleClearAll}
              style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <Trash2 size={15} />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {actionMessage && (
          <div style={{ padding: '10px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            ℹ️ {actionMessage}
          </div>
        )}

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by snippet keywords, title..."
              className="select-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', height: '38px' }}
            />
          </div>

          <select
            className="select-input"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            style={{ height: '38px' }}
          >
            <option value="">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>

          <select
            className="select-input"
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            style={{ height: '38px' }}
          >
            <option value="">All Tasks</option>
            <option value="explain">Explain</option>
            <option value="debug">Debug</option>
            <option value="optimize">Optimize</option>
            <option value="complexity">Complexity</option>
            <option value="generate">Generate</option>
          </select>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div style={{ padding: '24px 0' }}>
            <div className="skeleton-line" style={{ width: '90%' }}></div>
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '70%' }}></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <History size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>No Sessions Found</h4>
            <p style={{ fontSize: '0.88rem' }}>
              {searchQuery || languageFilter || taskFilter
                ? 'Try adjusting your filters.'
                : 'Analyze code in the Workspace to create your first session.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredSessions.map((session) => {
              const latestMsg = session.messages?.[session.messages.length - 1];
              const taskType = latestMsg?.task_type || 'explain';

              return (
                <div
                  key={session.id}
                  className="feature-card"
                  onClick={() => onRestoreSession(session)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`task-tag ${taskType}`}>{taskType}</span>
                      <span className="lang-pill">{session.language}</span>
                    </div>

                    <button
                      className="tool-icon-btn"
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      title="Delete session"
                    >
                      <Trash2 size={14} style={{ color: '#F87171' }} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{session.title}</h3>

                  {session.initial_code && (
                    <div
                      style={{
                        background: '#080D1A',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: '#94A3B8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '14px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {session.initial_code.split('\n')[0]}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>
                      {new Date(session.updated_at || session.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                      <span>Resume in Workspace</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
