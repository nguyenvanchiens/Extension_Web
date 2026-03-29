import React, { useState } from 'react';
import './CodePreview.css';

function CodePreview({ code, fileName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-preview">
      <div className="code-header">
        <span className="code-filename">{fileName}</span>
        <button
          className={`btn-copy-code ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Đã copy!' : '📋 Copy'}
        </button>
      </div>
      <pre className="code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default CodePreview;
