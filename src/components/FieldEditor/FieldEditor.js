import React, { useState } from 'react';
import { parseCSharpClass } from '../../utils/parseCSharpClass';
import './FieldEditor.css';

const DATA_TYPES = ['string', 'number', 'boolean', 'date', 'datetime', 'lookup'];
const EDITOR_TYPES = ['', 'dxTextBox', 'dxNumberBox', 'dxSelectBox', 'dxDateBox', 'dxTextArea', 'dxCheckBox'];
const ALIGNMENTS = ['', 'left', 'center', 'right'];

function FieldEditor({ fields, onChange, showEditor = false, showGrid = true, onClassNameParsed }) {
  const [showPaste, setShowPaste] = useState(false);
  const [csharpCode, setCsharpCode] = useState('');

  const handleFieldChange = (index, key, value) => {
    const updated = fields.map((f, i) =>
      i === index ? { ...f, [key]: value } : f
    );
    onChange(updated);
  };

  const addField = () => {
    onChange([
      ...fields,
      { name: '', label: '', type: 'string', dataType: '', width: '', alignment: '', required: false, editorType: '', visible: true },
    ]);
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleParseCSharp = () => {
    if (!csharpCode.trim()) return;
    const result = parseCSharpClass(csharpCode);
    if (result.fields.length > 0) {
      onChange(result.fields);
      if (onClassNameParsed && result.className) {
        onClassNameParsed(result.className);
      }
      setShowPaste(false);
      setCsharpCode('');
    }
  };

  return (
    <div className="field-editor">
      <div className="field-editor-header">
        <span>Fields</span>
        <div className="field-editor-actions">
          <button
            className={`btn-paste-csharp ${showPaste ? 'active' : ''}`}
            onClick={() => setShowPaste(!showPaste)}
          >
            {showPaste ? '✕ Đóng' : '# Paste C# Class'}
          </button>
          <button className="btn-add-field" onClick={addField}>
            + Thêm field
          </button>
        </div>
      </div>

      {showPaste && (
        <div className="csharp-paste-area">
          <textarea
            value={csharpCode}
            onChange={(e) => setCsharpCode(e.target.value)}
            placeholder={`Paste class C# vào đây, VD:\n\npublic class SupermarketProductViewModel\n{\n    public string MaSanPham { get; set; }\n    public string TenSanPham { get; set; }\n    public decimal GiaBan { get; set; }\n    public DateTime NgayTao { get; set; }\n    [Required]\n    public string MaDanhMuc { get; set; }\n}`}
            rows={10}
          />
          <div className="csharp-paste-actions">
            <button className="btn-parse" onClick={handleParseCSharp}>
              Parse & Import Fields
            </button>
            <span className="parse-hint">
              Auto detect: type, required, alignment, editor type
            </span>
          </div>
        </div>
      )}

      <div className="field-table-wrapper">
        <table className="field-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Label</th>
              <th>Type</th>
              {showGrid && <th>Width</th>}
              {showGrid && <th>Align</th>}
              {showGrid && <th>Lookup</th>}
              {showEditor && <th>Editor</th>}
              <th>Required</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => handleFieldChange(i, 'name', e.target.value)}
                    placeholder="TenTruong"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => handleFieldChange(i, 'label', e.target.value)}
                    placeholder="Tên trường"
                  />
                </td>
                <td>
                  <select
                    value={f.type || 'string'}
                    onChange={(e) => handleFieldChange(i, 'type', e.target.value)}
                  >
                    {DATA_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                {showGrid && (
                  <td>
                    <input
                      type="number"
                      value={f.width || ''}
                      onChange={(e) => handleFieldChange(i, 'width', e.target.value ? Number(e.target.value) : '')}
                      placeholder="120"
                      className="input-small"
                    />
                  </td>
                )}
                {showGrid && (
                  <td>
                    <select
                      value={f.alignment || ''}
                      onChange={(e) => handleFieldChange(i, 'alignment', e.target.value)}
                    >
                      {ALIGNMENTS.map((a) => (
                        <option key={a} value={a}>{a || '—'}</option>
                      ))}
                    </select>
                  </td>
                )}
                {showGrid && (
                  <td>
                    {f.type === 'lookup' ? (
                      <input
                        type="text"
                        value={f.lookupDataSource || ''}
                        onChange={(e) => handleFieldChange(i, 'lookupDataSource', e.target.value)}
                        placeholder="this.listTrangThai"
                      />
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                    )}
                  </td>
                )}
                {showEditor && (
                  <td>
                    <select
                      value={f.editorType || ''}
                      onChange={(e) => handleFieldChange(i, 'editorType', e.target.value)}
                    >
                      {EDITOR_TYPES.map((t) => (
                        <option key={t} value={t}>{t || '— auto —'}</option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="td-center">
                  <input
                    type="checkbox"
                    checked={f.required || false}
                    onChange={(e) => handleFieldChange(i, 'required', e.target.checked)}
                  />
                </td>
                <td>
                  {fields.length > 1 && (
                    <button className="btn-remove-field" onClick={() => removeField(i)}>
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FieldEditor;
