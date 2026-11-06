import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './views/DashboardView';
import WorkspaceView from './views/WorkspaceView';
import QuizView from './views/QuizView';
import HistoryView from './views/HistoryView';
import { BOILERPLATE } from './components/editor/BoilerplateSnippets';
import { api } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BOILERPLATE.python);
  const [activeTask, setActiveTask] = useState('explain');
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [aiConfigured, setAiConfigured] = useState(false);
  const [modelName, setModelName] = useState('gemini-2.5-flash');

  // Check health on mount
  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const res = await api.checkHealth();
        setAiConfigured(Boolean(res.ai_configured));
        if (res.model) setModelName(res.model);
      } catch (err) {
        console.warn('Backend server not yet reached or in mock mode:', err.message);
      }
    }
    checkBackendHealth();
  }, []);

  const handleSelectFeature = (taskId, targetView) => {
    if (taskId && taskId !== 'quiz') {
      setActiveTask(taskId);
    }
    setActiveView(targetView || 'workspace');
  };

  const handleRestoreSession = (session) => {
    if (!session) return;
    setActiveSessionId(session.id);
    if (session.language) setLanguage(session.language);
    if (session.initial_code) setCode(session.initial_code);

    // If session has messages, determine most recent task
    if (session.messages && session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg.task_type && lastMsg.task_type !== 'chat') {
        setActiveTask(lastMsg.task_type);
      }
    }

    setActiveView('workspace');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        aiConfigured={aiConfigured}
        modelName={modelName}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          onQuickTask={(task) => {
            setActiveTask(task);
            setActiveView('workspace');
          }}
        />

        {activeView === 'dashboard' && (
          <DashboardView
            onSelectFeature={handleSelectFeature}
            onOpenSession={handleRestoreSession}
          />
        )}

        {activeView === 'workspace' && (
          <WorkspaceView
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            activeTask={activeTask}
            setActiveTask={setActiveTask}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
          />
        )}

        {activeView === 'quiz' && <QuizView />}

        {activeView === 'history' && (
          <HistoryView onRestoreSession={handleRestoreSession} />
        )}
      </main>
    </div>
  );
}
