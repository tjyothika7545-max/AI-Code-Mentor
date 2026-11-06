import React from 'react';
import {
  BookOpen,
  Bug,
  Zap,
  Gauge,
  Sparkles,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function TaskSelector({
  activeTask,
  setActiveTask,
  onAnalyze,
  isLoading,
  canSubmit,
}) {
  const tasks = [
    { id: 'explain', label: 'Explain Code', icon: BookOpen },
    { id: 'debug', label: 'Debug & Fix', icon: Bug },
    { id: 'optimize', label: 'Optimize', icon: Zap },
    { id: 'complexity', label: 'Complexity', icon: Gauge },
    { id: 'generate', label: 'Generate Code', icon: Sparkles },
  ];

  return (
    <div className="task-bar">
      <div className="task-tabs">
        {tasks.map((task) => {
          const Icon = task.icon;
          const isActive = activeTask === task.id;
          return (
            <button
              key={task.id}
              className={`task-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTask(task.id)}
            >
              <Icon size={14} />
              <span>{task.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className="btn-primary"
        onClick={onAnalyze}
        disabled={isLoading || !canSubmit}
        style={{ padding: '6px 16px', fontSize: '0.84rem' }}
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles size={15} />
            <span>Ask AI Mentor</span>
          </>
        )}
      </button>
    </div>
  );
}
