import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genGrid } from '../../../utils/generators/genGrid';

const DEFAULT_FIELD = { name: '', label: '', type: 'string', width: '', alignment: '', required: false };
const PARAM_TYPES = ['string', 'date', 'datetime', 'select', 'number'];

function GenGridTab() {
  const [moduleName, setModuleName] = useState('');
  const [controller, setController] = useState('');
  const [editMode, setEditMode] = useState('row');
  const [allowInsert, setAllowInsert] = useState(true);
  const [allowUpdate, setAllowUpdate] = useState(true);
  const [allowDelete, setAllowDelete] = useState(true);
  const [height, setHeight] = useState('70vh');
  const [fields, setFields] = useState([{ ...DEFAULT_FIELD }]);
  const [hasExportExcel, setHasExportExcel] = useState(true);
  const [excelFileName, setExcelFileName] = useState('');
  const [hasParams, setHasParams] = useState(false);
  const [cacheSearch, setCacheSearch] = useState(false);
  const [searchParams, setSearchParams] = useState([
    { name: 'FromDate', label: 'Từ ngày', type: 'date' },
    { name: 'ToDate', label: 'Đến ngày', type: 'date' },
  ]);

  const addParam = () => {
    setSearchParams([...searchParams, { name: '', label: '', type: 'string' }]);
  };

  const removeParam = (index) => {
    setSearchParams(searchParams.filter((_, i) => i !== index));
  };

  const updateParam = (index, key, value) => {
    setSearchParams(searchParams.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const result = useMemo(() => {
    if (!moduleName) return null;
    return genGrid(moduleName, {
      fields: fields.filter((f) => f.name),
      controller: controller || moduleName,
      editMode,
      allowInsert,
      allowUpdate,
      allowDelete,
      height,
      hasParams,
      searchParams: hasParams ? searchParams.filter((p) => p.name) : [],
      hasExportExcel,
      excelFileName: excelFileName || moduleName,
      cacheSearch,
    });
  }, [moduleName, controller, editMode, allowInsert, allowUpdate, allowDelete, height, fields, hasParams, searchParams, hasExportExcel, excelFileName, cacheSearch]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Grid</h3>
        <div className="gen-config-row">
          <div className="gen-config-field">
            <label>Module Name</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="VD: SupermarketCheckin"
            />
          </div>
          <div className="gen-config-field">
            <label>Controller</label>
            <input
              type="text"
              value={controller}
              onChange={(e) => setController(e.target.value)}
              placeholder="Mặc định = Module Name"
            />
          </div>
          <div className="gen-config-field">
            <label>Edit Mode</label>
            <select value={editMode} onChange={(e) => setEditMode(e.target.value)}>
              <option value="row">row</option>
              <option value="popup">popup</option>
              <option value="cell">cell</option>
              <option value="batch">batch</option>
            </select>
          </div>
          <div className="gen-config-field">
            <label>Height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>
        <div className="gen-config-row">
          <div className="gen-config-field gen-config-check">
            <input type="checkbox" checked={allowInsert} onChange={(e) => setAllowInsert(e.target.checked)} />
            <label>Allow Insert</label>
          </div>
          <div className="gen-config-field gen-config-check">
            <input type="checkbox" checked={allowUpdate} onChange={(e) => setAllowUpdate(e.target.checked)} />
            <label>Allow Update</label>
          </div>
          <div className="gen-config-field gen-config-check">
            <input type="checkbox" checked={allowDelete} onChange={(e) => setAllowDelete(e.target.checked)} />
            <label>Allow Delete</label>
          </div>
          <div className="gen-config-field gen-config-check">
            <input type="checkbox" checked={hasExportExcel} onChange={(e) => setHasExportExcel(e.target.checked)} />
            <label>Export Excel</label>
          </div>
          <div className="gen-config-field gen-config-check">
            <input type="checkbox" checked={hasParams} onChange={(e) => setHasParams(e.target.checked)} />
            <label>Có Search Params</label>
          </div>
        </div>
        {hasExportExcel && (
          <div className="gen-config-row" style={{ marginTop: 8 }}>
            <div className="gen-config-field">
              <label>Excel File Name</label>
              <input
                type="text"
                value={excelFileName}
                onChange={(e) => setExcelFileName(e.target.value)}
                placeholder={`Mặc định = ${moduleName || 'ModuleName'}`}
              />
            </div>
          </div>
        )}
      </div>

      {hasParams && (
        <div className="gen-config" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Search Params <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>— tạo search form + getLoadParams()</span></h3>
            <label style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={cacheSearch}
                onChange={(e) => setCacheSearch(e.target.checked)}
                style={{ accentColor: '#4f46e5', width: 16, height: 16 }}
              />
              Cache Search (sessionStorage)
            </label>
          </div>
          {searchParams.map((p, i) => (
            <div className="method-row" key={i}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateParam(i, 'name', e.target.value)}
                placeholder="Tên param (VD: FromDate)"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                value={p.label}
                onChange={(e) => updateParam(i, 'label', e.target.value)}
                placeholder="Label (VD: Từ ngày)"
                style={{ flex: 1 }}
              />
              <select
                value={p.type}
                onChange={(e) => updateParam(i, 'type', e.target.value)}
                style={{ width: 120, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
              >
                {PARAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {searchParams.length > 1 && (
                <button className="btn-remove-method" onClick={() => removeParam(i)}>✕</button>
              )}
            </div>
          ))}
          <button className="btn-add-method" onClick={addParam}>+ Thêm param</button>
        </div>
      )}

      <FieldEditor fields={fields} onChange={setFields} showGrid={true} showEditor={false} onClassNameParsed={(name) => { if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, '')); }} />

      {result && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Files</h3>
          <CodePreview code={result.indexCode} fileName={`Forms/${moduleName}Index.ts`} />
          <CodePreview code={result.languageKeyCode} fileName={`LanguageKey.${moduleName}.ts`} />
          <CodePreview code={result.serviceCode} fileName={`${moduleName}Service.ts`} />
        </div>
      )}
    </div>
  );
}

export default GenGridTab;
