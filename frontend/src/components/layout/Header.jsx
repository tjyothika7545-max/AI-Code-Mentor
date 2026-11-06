import React from 'react';
import { Sparkles, Terminal, Code2, HelpCircle, History, LayoutDashboard } from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  onQuickTask,
}) {
  const getHeaderInfo = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Learning Command Center',
          subtitle: 'Track your tutoring progress, review activity, and launch tasks.',
          icon: LayoutDashboard,
        };
      case 'workspace':
        return {
          title: 'AI Code Mentor Workspace',
          subtitle: 'Interactive Monaco Editor with Line-by-Line explanations, bug fixes, and optimization.',
          icon: Code2,
        };
      case 'quiz':
        return {
          title: 'Interactive Quiz Arena',
          subtitle: 'Test your algorithmic & language knowledge with AI-generated programming quizzes.',
          icon: HelpCircle,
        };
      case 'history':
        return {
          title: 'Session & Analysis History',
          subtitle: 'Review past code explanations, optimizations, and reload sessions directly.',
          icon: History,
        };
      default:
        return { title: 'AI Code Mentor', subtitle: '', icon: Terminal };
    }
  };

  const { title, subtitle, icon: HeaderIcon } = getHeaderInfo();

  return (
    <header className="app-header">
      <div className="header-title-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--accent-indigo)', display: 'flex' }}>
          <HeaderIcon size={20} />
        </div>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {activeView !== 'workspace' && (
          <button
            className="btn-primary"
            onClick={() => {
              if (onQuickTask) onQuickTask('explain');
              setActiveView('workspace');
            }}
          >
            <Sparkles size={16} />
            <span>Open Workspace</span>
          </button>
        )}
      </div>
    </header>
  );
}
