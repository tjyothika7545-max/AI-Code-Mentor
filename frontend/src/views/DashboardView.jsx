import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Bug,
  Zap,
  Gauge,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  FileCode2,
  Code
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardView({
  onSelectFeature,
  onOpenSession,
}) {
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_quizzes: 0,
    average_quiz_score: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await api.getHistory({ limit: 6 });
        if (data.stats) setStats(data.stats);
        if (data.sessions) setRecentSessions(data.sessions);
      } catch (err) {
        console.error('Failed to load dashboard history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const featureCards = [
    {
      id: 'explain',
      title: 'Line-by-Line Explanation',
      desc: 'Understand code flow, variable mutations, and invariant properties with pedagogical step-by-step notes.',
      icon: BookOpen,
      iconBg: 'rgba(99, 102, 241, 0.15)',
      iconColor: 'var(--accent-indigo)',
      target: 'workspace',
    },
    {
      id: 'debug',
      title: 'Bug Hunter & Debugger',
      desc: 'Pinpoint syntax errors, off-by-one bounds, and logic flaws with root cause analysis and corrected code diffs.',
      icon: Bug,
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: 'var(--status-danger)',
      target: 'workspace',
    },
    {
      id: 'optimize',
      title: 'Code Optimizer & Clean Refactor',
      desc: 'Transform slow or verbose routines into idiomatic, high-performance implementations.',
      icon: Zap,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: 'var(--status-success)',
      target: 'workspace',
    },
    {
      id: 'complexity',
      title: 'Time & Space Complexity Analyzer',
      desc: 'Calculate exact Best, Average, and Worst Case Big-O bounds with step-by-step mathematical reasoning.',
      icon: Gauge,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: 'var(--status-warning)',
      target: 'workspace',
    },
    {
      id: 'generate',
      title: 'Natural Language Code Generator',
      desc: 'Describe any algorithm or routine in plain English to generate clean, documented, tested code.',
      icon: Sparkles,
      iconBg: 'rgba(6, 182, 212, 0.15)',
      iconColor: 'var(--accent-cyan)',
      target: 'workspace',
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz Arena',
      desc: 'Test your algorithmic, pointer, and language mastery with adaptive multiple-choice challenges and explanations.',
      icon: HelpCircle,
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: 'var(--accent-violet)',
      target: 'quiz',
    },
  ];

  return (
    <div className="content-viewport">
      <div className="dashboard-container">
        {/* Welcome Hero Banner */}
        <div className="welcome-banner">
          <div className="welcome-title">Welcome to AI Code Mentor</div>
          <p className="welcome-subtitle">
            Your personalized AI programming tutor. Master algorithms, analyze time & space complexity,
            fix subtle bugs, and challenge your understanding across Python, Java, C, C++, and JavaScript.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper indigo">
              <FileCode2 size={22} />
            </div>
            <div>
              <div className="stat-val">{stats.total_sessions}</div>
              <div className="stat-lbl">Sessions Analyzed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper violet">
              <HelpCircle size={22} />
            </div>
            <div>
              <div className="stat-val">{stats.total_quizzes}</div>
              <div className="stat-lbl">Quizzes Generated</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper emerald">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="stat-val">{stats.average_quiz_score}%</div>
              <div className="stat-lbl">Avg. Quiz Accuracy</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper cyan">
              <Code size={22} />
            </div>
            <div>
              <div className="stat-val">5</div>
              <div className="stat-lbl">Languages Supported</div>
            </div>
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="section-header">
          <h2 className="section-title">Explore Tutoring Capabilities</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Choose an area to jump straight into the workspace
          </span>
        </div>

        <div className="features-grid">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="feature-card"
                onClick={() => onSelectFeature(feat.id, feat.target)}
              >
                <div className="feature-card-header">
                  <div
                    className="feature-icon-badge"
                    style={{ background: feat.iconBg, color: feat.iconColor }}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
                <div className="feature-card-action">
                  <span>Launch Module</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Panel */}
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Past snippets and analysis runs
          </span>
        </div>

        <div className="recent-activity-panel">
          {isLoading ? (
            <div style={{ padding: '20px 0' }}>
              <div className="skeleton-line" style={{ width: '80%' }}></div>
              <div className="skeleton-line" style={{ width: '90%' }}></div>
            </div>
          ) : recentSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No activity recorded yet. Run your first analysis in the Workspace!</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentSessions.map((session) => {
                const latestMsg = session.messages?.[session.messages.length - 1];
                const taskType = latestMsg?.task_type || 'explain';

                return (
                  <div
                    key={session.id}
                    className="activity-item"
                    onClick={() => onOpenSession(session)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="activity-left">
                      <span className={`task-tag ${taskType}`}>{taskType}</span>
                      <span className="activity-title">{session.title}</span>
                    </div>

                    <div className="activity-meta">
                      <span className="lang-pill">{session.language}</span>
                      <span className="activity-time">
                        {new Date(session.updated_at || session.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
