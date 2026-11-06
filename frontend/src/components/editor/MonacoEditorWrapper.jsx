import React from 'react';
import Editor from '@monaco-editor/react';

export default function MonacoEditorWrapper({
  code,
  language,
  onChange,
  onMount,
  readOnly = false,
}) {
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'c':
        return 'c';
      default:
        return 'python';
    }
  };

  const handleEditorWillMount = (monaco) => {
    // Custom dark theme matching SaaS palette
    monaco.editor.defineTheme('aiMentorDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'E2E8F0' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'type', foreground: '38BDF8' },
      ],
      colors: {
        'editor.background': '#0E1626',
        'editor.foreground': '#F8FAFC',
        'editorCursor.foreground': '#6366F1',
        'editor.lineHighlightBackground': '#141E34',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818CF8',
        'editor.selectionBackground': '#2A3B66',
        'editor.inactiveSelectionBackground': '#1E2942',
      },
    });
  };

  return (
    <div className="editor-surface">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        theme="aiMentorDark"
        beforeMount={handleEditorWillMount}
        onMount={onMount}
        onChange={onChange}
        options={{
          fontSize: 13.5,
          fontFamily: "'Fira Code', Menlo, Monaco, Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: true, maxColumn: 80 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: language === 'python' ? 4 : 2,
          wordWrap: 'on',
          readOnly: readOnly,
          bracketPairColorization: { enabled: true },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
        }}
        loading={
          <div style={{ padding: '24px', color: 'var(--text-muted)' }}>
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
}
