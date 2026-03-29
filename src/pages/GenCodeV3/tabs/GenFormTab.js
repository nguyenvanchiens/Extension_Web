import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genForm } from '../../../utils/generators/genForm';

const DEFAULT_FIELD = { name: '', label: '', type: 'string', editorType: '', required: false };

function GenFormTab() {
  const [moduleName, setModuleName] = useState('');
  const [controller, setController] = useState('');
  const [colCount, setColCount] = useState(2);
  const [fields, setFields] = useState([{ ...DEFAULT_FIELD }]);

  const result = useMemo(() => {
    if (!moduleName) return null;
    return genForm(moduleName, {
      fields: fields.filter((f) => f.name),
      controller: controller || moduleName,
      colCount,
    });
  }, [moduleName, controller, colCount, fields]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Form</h3>
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
            <label>Col Count</label>
            <select value={colCount} onChange={(e) => setColCount(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>
      </div>

      <FieldEditor fields={fields} onChange={setFields} showGrid={false} showEditor={true} onClassNameParsed={(name) => { if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, '')); }} />

      {result && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Files</h3>
          <CodePreview code={result.formCode} fileName={`Forms/${moduleName}Detail.ts`} />
          <CodePreview code={result.languageKeyCode} fileName={`LanguageKey.${moduleName}.ts`} />
          <CodePreview code={result.serviceCode} fileName={`${moduleName}Service.ts`} />
        </div>
      )}
    </div>
  );
}

export default GenFormTab;
