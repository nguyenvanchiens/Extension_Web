import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genService } from '../../../utils/generators/genService';

const DEFAULT_FIELD = { name: '', label: '', type: 'string' };

function GenServiceTab() {
  const [moduleName, setModuleName] = useState('');
  const [methods, setMethods] = useState([{ name: '', params: '', genRequest: false }]);
  const [requestFields, setRequestFields] = useState([{ ...DEFAULT_FIELD }]);
  const [requestName, setRequestName] = useState('');

  const addMethod = () => {
    setMethods([...methods, { name: '', params: '', genRequest: false }]);
  };

  const removeMethod = (index) => {
    setMethods(methods.filter((_, i) => i !== index));
  };

  const updateMethod = (index, key, value) => {
    setMethods(methods.map((m, i) => (i === index ? { ...m, [key]: value } : m)));
  };

  const validFields = requestFields.filter((f) => f.name);

  const code = useMemo(() => {
    if (!moduleName) return '';
    return genService(moduleName, methods.filter((m) => m.name), {
      requestName: requestName || `${moduleName}Request`,
      requestFields: validFields,
    });
  }, [moduleName, methods, requestName, validFields]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Service</h3>
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
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Method name</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Params (cách nhau bởi dấu ,)</span>
            <span style={{ width: 28 }}></span>
          </div>
          {methods.map((m, i) => (
            <div className="method-row" key={i}>
              <input
                type="text"
                value={m.name}
                onChange={(e) => updateMethod(i, 'name', e.target.value)}
                placeholder="VD: updateStatus"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                value={m.params}
                onChange={(e) => updateMethod(i, 'params', e.target.value)}
                placeholder="VD: id, code, status"
                style={{ flex: 1 }}
              />
              {methods.length > 1 && (
                <button className="btn-remove-method" onClick={() => removeMethod(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="btn-add-method" onClick={addMethod}>
            + Thêm method
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="gen-config" style={{ marginBottom: 0, paddingBottom: 12 }}>
          <div className="gen-config-row">
            <div className="gen-config-field">
              <label>Request Model Name</label>
              <input
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder={`Mặc định = ${moduleName || 'Module'}Request`}
              />
            </div>
          </div>
        </div>
        <FieldEditor
          fields={requestFields}
          onChange={setRequestFields}
          showGrid={false}
          showEditor={false}
          onClassNameParsed={(name) => {
            if (!requestName) setRequestName(name);
            if (!moduleName) setModuleName(name.replace(/Request$|Model$|ViewModel$/, ''));
          }}
        />
      </div>

      {code && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Code</h3>
          <CodePreview code={code} fileName={`${moduleName || 'Module'}Service.ts`} />
        </div>
      )}
    </div>
  );
}

export default GenServiceTab;
