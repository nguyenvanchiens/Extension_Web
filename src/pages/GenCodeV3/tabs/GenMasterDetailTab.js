import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genMasterDetail } from '../../../utils/generators/genMasterDetail';

const DEFAULT_FIELD = { name: '', label: '', type: 'string', width: '', alignment: '', required: false };

function GenMasterDetailTab() {
  const [moduleName, setModuleName] = useState('');
  const [controller, setController] = useState('');
  const [editMode, setEditMode] = useState('row');
  const [detailEditMode, setDetailEditMode] = useState('popup');
  const [masterFields, setMasterFields] = useState([{ ...DEFAULT_FIELD }]);
  const [detailFields, setDetailFields] = useState([{ ...DEFAULT_FIELD }]);

  const code = useMemo(() => {
    if (!moduleName) return '';
    return genMasterDetail(moduleName, {
      masterFields: masterFields.filter((f) => f.name),
      detailFields: detailFields.filter((f) => f.name),
      controller: controller || moduleName,
      editMode,
      detailEditMode,
    });
  }, [moduleName, controller, editMode, detailEditMode, masterFields, detailFields]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Master-Detail</h3>
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
            <label>Master Edit Mode</label>
            <select value={editMode} onChange={(e) => setEditMode(e.target.value)}>
              <option value="row">row</option>
              <option value="popup">popup</option>
            </select>
          </div>
          <div className="gen-config-field">
            <label>Detail Edit Mode</label>
            <select value={detailEditMode} onChange={(e) => setDetailEditMode(e.target.value)}>
              <option value="popup">popup</option>
              <option value="row">row</option>
              <option value="cell">cell</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Master Fields
        </h3>
        <FieldEditor fields={masterFields} onChange={setMasterFields} showGrid={true} showEditor={false} onClassNameParsed={(name) => { if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, '')); }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Detail Fields
        </h3>
        <FieldEditor fields={detailFields} onChange={setDetailFields} showGrid={true} showEditor={false} onClassNameParsed={() => {}} />
      </div>

      {code && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Code</h3>
          <CodePreview code={code} fileName={`${moduleName || 'Module'}Index.ts`} />
        </div>
      )}
    </div>
  );
}

export default GenMasterDetailTab;
