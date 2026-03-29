import React, { useState } from 'react';
import './MessagePreview.css';

function MessagePreview({ message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="message-preview">
      <div className="preview-header">
        <h2 className="preview-title">Preview</h2>
        <button
          className={`btn-copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Đã copy!' : '📋 Copy'}
        </button>
      </div>
      <pre className="preview-content">{message}</pre>
    </div>
  );
}

export default MessagePreview;
