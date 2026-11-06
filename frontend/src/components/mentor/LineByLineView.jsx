import React from 'react';
import { ListOrdered, CheckCircle2, Copy } from 'lucide-react';

export default function LineByLineView({ lineBreakdown = [] }) {
  if (!lineBreakdown || lineBreakdown.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <ListOrdered size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p>Run <strong>Explain Code</strong> to generate a line-by-line pedagogical breakdown.</p>
      </div>
    );
  }

  return (
    <div className="line-breakdown-list">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Detailed Step-by-Step Breakdown ({lineBreakdown.length} checkpoints)
        </span>
      </div>

      {lineBreakdown.map((item, index) => (
        <div key={index} className="line-breakdown-card">
          <div className="line-header">
            <span className="line-num-badge">Line {item.line_number || index + 1}</span>
            {item.code && (
              <span className="line-code-snippet" title={item.code}>
                {item.code}
              </span>
            )}
          </div>
          <p className="line-explanation-text">
            {item.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}
