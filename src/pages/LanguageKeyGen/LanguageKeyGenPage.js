import React, { useState } from 'react';
import { toEnglishReadable } from '../../utils/viDictionary';
import { translateBatch } from '../../utils/translateApi';
import './LanguageKeyGenPage.css';

const MODES = [
  { id: 'code', label: 'Từ Code (có comment)', icon: '📝' },
  { id: 'key', label: 'Từ Key (auto dịch)', icon: '🌐' },
];

function LanguageKeyGenPage() {
  const [mode, setMode] = useState('code');
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const parseCodeMode = () => {
    const lines = input.split('\n');
    const parsed = [];
    let vietnameseComment = '';
    let englishComment = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('//') && !vietnameseComment) {
        vietnameseComment = line.replace('//', '').trim();
        continue;
      }

      if (line.startsWith('//') && vietnameseComment && !englishComment) {
        englishComment = line.replace('//', '').trim();
        continue;
      }

      const keyMatch = line.match(/^\w+:\s*['"]([^'"]+)['"]/);
      if (keyMatch && vietnameseComment && englishComment) {
        parsed.push({
          key: keyMatch[1],
          vietnamese: vietnameseComment,
          english: englishComment,
        });
        vietnameseComment = '';
        englishComment = '';
      }
    }

    setResults(parsed);
  };

  const parseKeyMode = async () => {
    const lines = input.split('\n');
    const items = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let key = line;
      const keyMatch = line.match(/['"]([^'"]+)['"]/);
      if (keyMatch) {
        key = keyMatch[1];
      } else {
        key = line.replace(/,\s*$/, '').trim();
      }

      if (!key) continue;

      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      const english = toEnglishReadable(lastPart);

      items.push({ key, english });
    }

    if (items.length === 0) return;

    // Gọi API dịch batch
    setLoading(true);
    try {
      const englishTexts = items.map((item) => item.english);
      const vietnameseTexts = await translateBatch(englishTexts, 'en', 'vi');

      const parsed = items.map((item, i) => ({
        key: item.key,
        english: item.english,
        vietnamese: vietnameseTexts[i] || item.english,
      }));

      setResults(parsed);
    } catch {
      // Fallback: giữ nguyên english
      setResults(items.map((item) => ({
        ...item,
        vietnamese: item.english,
      })));
    }
    setLoading(false);
  };

  const handleParse = () => {
    if (mode === 'code') {
      parseCodeMode();
    } else {
      parseKeyMode();
    }
  };

  const updateResult = (index, field, value) => {
    setResults(results.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const copyRow = (item, index) => {
    const text = `${item.key}\t${item.vietnamese}\t${item.english}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 500);
    showToast('Đã copy!');
  };

  const copyAll = () => {
    if (results.length === 0) return;
    const text = results
      .map((item) => `${item.key}\t${item.vietnamese}\t${item.english}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Đã copy tất cả!');
  };

  return (
    <>
      <header className="page-header">
        <h1>Language Key Generator</h1>
        <p className="page-subtitle">Chuyển đổi Language Key sang bảng dữ liệu (Key / Tiếng Việt / English)</p>
      </header>

      <div className="lkg-container">
        <div className="lkg-mode-switch">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`lkg-mode-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => { setMode(m.id); setResults([]); }}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {mode === 'code' && (
          <div className="lkg-instructions">
            <p><strong>Hướng dẫn:</strong> Paste đoạn code có format:</p>
            <div className="lkg-format">
              <code>{'// Tiếng Việt'}</code>
              <code>{'// English'}</code>
              <code>{"KeyName: 'Module.KeyName',"}</code>
            </div>
            <p className="lkg-hint">Click vào hàng để copy dạng tab-separated (paste vào Excel)</p>
          </div>
        )}

        {mode === 'key' && (
          <div className="lkg-instructions">
            <p><strong>Hướng dẫn:</strong> Paste danh sách key, mỗi dòng 1 key. Tool sẽ tự dịch qua <strong>Google Translate</strong>.</p>
            <div className="lkg-format">
              <code>{'Office.SupplierInteraction.Button.History'}</code>
              <code>{'SupermarketCheckin.Table.CreatedTime'}</code>
              <code>{'SupermarketProduct.Form.UnitPrice'}</code>
            </div>
            <p className="lkg-hint">Lấy phần cuối (VD: <code>History</code>), tách PascalCase, gọi API dịch sang Tiếng Việt. Có thể sửa trực tiếp nếu dịch sai.</p>
          </div>
        )}

        <textarea
          className="lkg-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'code'
            ? 'Paste code vào đây...'
            : 'Paste danh sách key vào đây...\n\nVD:\nOffice.SupplierInteraction.Button.History\nSupermarketCheckin.Table.MaBangKe\nSupermarketCheckin.Table.TenNhaCungCap'
          }
          rows={10}
        />

        <div className="lkg-actions">
          <button className="lkg-btn lkg-btn-primary" onClick={handleParse} disabled={loading}>
            {loading ? 'Đang dịch...' : 'Chuyển đổi'}
          </button>
          <button className="lkg-btn lkg-btn-copy" onClick={copyAll} disabled={results.length === 0}>
            Copy tất cả
          </button>
          {results.length > 0 && (
            <span className="lkg-count">{results.length} kết quả</span>
          )}
          {loading && <span className="lkg-loading">Đang gọi Google Translate...</span>}
        </div>

        {results.length > 0 && (
          <div className="lkg-table-wrapper">
            <table className="lkg-table">
              <thead>
                <tr>
                  <th className="lkg-th-index">#</th>
                  <th>Key</th>
                  <th>Tiếng Việt</th>
                  <th>English</th>
                  <th className="lkg-th-copy"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, i) => (
                  <tr
                    key={i}
                    className={`lkg-row ${copiedIndex === i ? 'lkg-copied' : ''}`}
                  >
                    <td className="lkg-td-index">{i + 1}</td>
                    <td><code>{item.key}</code></td>
                    <td>
                      <input
                        type="text"
                        className="lkg-edit-input"
                        value={item.vietnamese}
                        onChange={(e) => updateResult(i, 'vietnamese', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="lkg-edit-input"
                        value={item.english}
                        onChange={(e) => updateResult(i, 'english', e.target.value)}
                      />
                    </td>
                    <td className="lkg-td-copy">
                      <button className="lkg-btn-row-copy" onClick={() => copyRow(item, i)} title="Copy dòng này">
                        📋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div className="lkg-toast">{toast}</div>}
    </>
  );
}

export default LanguageKeyGenPage;
