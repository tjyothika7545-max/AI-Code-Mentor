import React from 'react';
import {
  LayoutDashboard,
  Code2,
  HelpCircle,
  History,
  Sparkles,
  Cpu,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  aiConfigured,
  modelName
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Mentor Workspace', icon: Code2 },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle },
    { id: 'history', label: 'History & Activity', icon: History },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Terminal size={20} />
        </div>
        <div>
          <div className="brand-name">AI Code Mentor</div>
        </div>
        <span className="brand-badge">PRO</span>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="sidebar-footer">
        <div className="api-status-badge">
          <span className={`status-indicator-dot ${aiConfigured ? 'active' : ''}`} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
              {aiConfigured ? 'Gemini Live' : 'Offline / Mock'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {modelName || 'gemini-2.5-flash'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
