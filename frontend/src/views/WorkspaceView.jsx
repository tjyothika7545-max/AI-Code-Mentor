import React, { useState, useRef, useEffect } from 'react';
import MonacoEditorWrapper from '../components/editor/MonacoEditorWrapper';
import EditorToolbar from '../components/editor/EditorToolbar';
import TaskSelector from '../components/mentor/TaskSelector';
import AnalysisPanel from '../components/mentor/AnalysisPanel';
import { BOILERPLATE } from '../components/editor/BoilerplateSnippets';
import { api } from '../services/api';

export default function WorkspaceView({
  code,
  setCode,
  language,
  setLanguage,
  activeTask,
  setActiveTask,
  activeSessionId,
  setActiveSessionId,
  recentActivityTrigger,
}) {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const editorRef = useRef(null);

  // If initial code is empty, load standard boilerplate for current language
  useEffect(() => {
    if (!code && BOILERPLATE[language]) {
      setCode(BOILERPLATE[language]);
    }
  }, [language]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleAnalyze = async () => {
    setErrorMessage('');
    setIsAnalyzing(true);

    try {
      const res = await api.analyzeCode({
        task: activeTask,
        language,
        code,
        prompt,
        sessionId: activeSessionId,
      });

      setAnalysisResult({
        content: res.content,
        metadata: res.metadata,
      });

      if (res.session_id) {
        setActiveSessionId(res.session_id);
      }

      if (recentActivityTrigger) {
        recentActivityTrigger();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Append user message immediately to state
    const userMsg = { role: 'user', content: messageText };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await api.sendChatMessage({
        sessionId: activeSessionId,
        message: messageText,
        code,
        language,
      });

      if (res.session_id) {
        setActiveSessionId(res.session_id);
      }

      const assistantMsg = { role: 'assistant', content: res.reply };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorReply = {
        role: 'assistant',
        content: `⚠️ Failed to get reply: ${err.message}`,
      };
      setChatMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleApplyCodeToEditor = (newCode) => {
    if (!newCode) return;
    setCode(newCode);
  };

  const canSubmit = activeTask === 'generate' ? Boolean(prompt.trim() || code.trim()) : Boolean(code.trim());

  return (
    <div className="workspace-container">
      {/* Left Pane: Code Editor */}
      <section className="editor-pane">
        <EditorToolbar
          language={language}
          setLanguage={setLanguage}
          code={code}
          setCode={setCode}
          editorRef={editorRef}
        />

        {/* Prompt Input Bar (Shown specifically for Code Generation or custom prompts) */}
        {activeTask === 'generate' && (
          <div className="prompt-input-container">
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-indigo)' }}>
              Describe what code you want to generate:
            </span>
            <textarea
              className="prompt-textarea"
              placeholder="e.g. Implement a function to find the longest palindromic substring with unit tests..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        )}

        <MonacoEditorWrapper
          code={code}
          language={language}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorDidMount}
        />

        {errorMessage && (
          <div style={{ padding: '8px 16px', background: 'var(--status-danger-bg)', color: '#F87171', fontSize: '0.82rem', borderTop: '1px solid var(--border-subtle)' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <TaskSelector
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          canSubmit={canSubmit}
        />
      </section>

      {/* Right Pane: AI Analysis & Chat */}
      <AnalysisPanel
        analysis={analysisResult}
        isLoading={isAnalyzing}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
        isChatLoading={isChatLoading}
        onApplyCodeToEditor={handleApplyCodeToEditor}
      />
    </div>
  );
}
