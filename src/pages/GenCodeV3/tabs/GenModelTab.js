import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genViewModel, genSearchModel } from '../../../utils/generators/genModel';

const DEFAULT_FIELD = { name: '', label: '', type: 'string' };

function GenModelTab() {
  const [moduleName, setModuleName] = useState('');
  const [genType, setGenType] = useState('viewmodel');
  const [fields, setFields] = useState([{ ...DEFAULT_FIELD }]);

  const code = useMemo(() => {
    if (!moduleName) return '';
    const validFields = fields.filter((f) => f.name);
    if (genType === 'viewmodel') {
      return genViewModel(moduleName, validFields);
    }
    if (genType === 'searchmodel') {
      return genSearchModel(moduleName, validFields);
    }
    if (genType === 'both') {
      const vm = genViewModel(moduleName, validFields);
      const sm = genSearchModel(moduleName, [
        { name: 'Keyword', type: 'string' },
        ...validFields.filter((f) => f.type === 'date' || f.type === 'Date'),
      ]);
      return vm + '\n\n' + sm;
    }
    return '';
  }, [moduleName, genType, fields]);

  const fileName = genType === 'searchmodel'
    ? `${moduleName || 'Module'}SearchModel.ts`
    : genType === 'both'
    ? `${moduleName || 'Module'}Models.ts`
    : `${moduleName || 'Module'}ViewModel.ts`;

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Model</h3>
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
            <label>Loại</label>
            <select value={genType} onChange={(e) => setGenType(e.target.value)}>
              <option value="viewmodel">ViewModel</option>
              <option value="searchmodel">SearchModel</option>
              <option value="both">Cả hai</option>
            </select>
          </div>
        </div>
      </div>

      <FieldEditor fields={fields} onChange={setFields} showGrid={false} showEditor={false} onClassNameParsed={(name) => { if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, '')); }} />

      {code && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Code</h3>
          <CodePreview code={code} fileName={fileName} />
        </div>
      )}
    </div>
  );
}

export default GenModelTab;
