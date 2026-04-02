import React, { useState } from 'react';
import './JsonFormatterPage.css';

function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const handleFormat = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleMinify = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    showToast('Đã copy!');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      // ignore
    }
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setOutput('');
      setError('');
    }
  };

  // Đếm thông tin JSON
  const getJsonInfo = () => {
    if (!output) return null;
    try {
      const parsed = JSON.parse(output);
      if (Array.isArray(parsed)) {
        return `Array [${parsed.length} items]`;
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return `Object {${Object.keys(parsed).length} keys}`;
      }
      return typeof parsed;
    } catch {
      return null;
    }
  };

  const jsonInfo = getJsonInfo();

  return (
    <>
      <header className="page-header">
        <h1>JSON Formatter</h1>
        <p className="page-subtitle">Format, Minify, Validate JSON</p>
      </header>

      <div className="jf-container">
        <div className="jf-toolbar">
          <div className="jf-toolbar-left">
            <button className="jf-btn jf-btn-primary" onClick={handleFormat}>
              Format
            </button>
            <button className="jf-btn jf-btn-secondary" onClick={handleMinify}>
              Minify
            </button>
            <button className="jf-btn jf-btn-outline" onClick={handleSwap} disabled={!output} title="Chuyển output sang input">
              ⇄ Swap
            </button>
            <button className="jf-btn jf-btn-danger" onClick={handleClear}>
              Clear
            </button>
          </div>
          <div className="jf-toolbar-right">
            <label className="jf-indent-label">
              Indent:
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="jf-indent-select">
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={1}>1 tab</option>
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="jf-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="jf-panels">
          <div className="jf-panel">
            <div className="jf-panel-header">
              <span>Input</span>
              <button className="jf-panel-btn" onClick={handlePaste} title="Paste từ clipboard">
                📋 Paste
              </button>
            </div>
            <textarea
              className="jf-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste JSON vào đây...'
              spellCheck={false}
            />
          </div>

          <div className="jf-panel">
            <div className="jf-panel-header">
              <span>
                Output
                {jsonInfo && <span className="jf-info">{jsonInfo}</span>}
              </span>
              <button className="jf-panel-btn" onClick={handleCopy} disabled={!output} title="Copy output">
                📋 Copy
              </button>
            </div>
            <textarea
              className="jf-textarea jf-output"
              value={output}
              readOnly
              placeholder="Kết quả sẽ hiển thị ở đây..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {toast && <div className="lkg-toast">{toast}</div>}
    </>
  );
}

export default JsonFormatterPage;
