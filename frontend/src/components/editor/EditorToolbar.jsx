import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Trash2,
  FileCode,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SNIPPET_PRESETS, BOILERPLATE } from './BoilerplateSnippets';

export default function EditorToolbar({
  language,
  setLanguage,
  code,
  setCode,
  editorRef,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear all code in the editor?')) {
      setCode('');
    }
  };

  const handleFormat = () => {
    if (editorRef && editorRef.current) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
      } catch (e) {
        console.warn('Format action not available for this language mode:', e);
      }
    }
  };

  const handlePresetSelect = (presetLang) => {
    setLanguage(presetLang);
    if (BOILERPLATE[presetLang]) {
      setCode(BOILERPLATE[presetLang]);
    }
  };

  return (
    <div className="editor-toolbar">
      {/* Left: Language & Snippets */}
      <div className="toolbar-group">
        <select
          className="select-input"
          value={language}
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            // If code is empty or default, update with template
            if (!code.trim() && BOILERPLATE[newLang]) {
              setCode(BOILERPLATE[newLang]);
            }
          }}
          title="Select Programming Language"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>

        <select
          className="select-input"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              handlePresetSelect(e.target.value);
              e.target.value = '';
            }
          }}
          title="Load Algorithmic Template"
        >
          <option value="" disabled>
            ⚡ Load Snippet...
          </option>
          {SNIPPET_PRESETS.map((preset, idx) => (
            <option key={idx} value={preset.lang}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="toolbar-group">
        <button
          className="tool-icon-btn"
          onClick={handleFormat}
          title="Format Code"
        >
          <FileCode size={16} />
        </button>

        <button
          className="tool-icon-btn"
          onClick={handleCopy}
          title="Copy Code to Clipboard"
        >
          {copied ? <Check size={16} style={{ color: 'var(--status-success)' }} /> : <Copy size={16} />}
        </button>

        <button
          className="tool-icon-btn"
          onClick={handleClear}
          title="Clear Editor"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
