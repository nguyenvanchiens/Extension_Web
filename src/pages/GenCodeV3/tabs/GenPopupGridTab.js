import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genPopupGrid } from '../../../utils/generators/genPopupGrid';
import { genLanguageKey } from '../../../utils/generators/genLanguageKey';

const DEFAULT_FIELD = { name: '', label: '', type: 'string', width: '', alignment: '', required: false };

function GenPopupGridTab() {
  const [moduleName, setModuleName] = useState('');
  const [controller, setController] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('90%');
  const [height, setHeight] = useState('90%');
  const [editMode, setEditMode] = useState('popup');
  const [allowInsert, setAllowInsert] = useState(false);
  const [allowUpdate, setAllowUpdate] = useState(true);
  const [allowDelete, setAllowDelete] = useState(true);
  const [fields, setFields] = useState([{ ...DEFAULT_FIELD }]);

  const validFields = fields.filter((f) => f.name);

  const code = useMemo(() => {
    if (!moduleName) return '';
    return genPopupGrid(moduleName, {
      fields: validFields,
      controller: controller || moduleName,
      title: title || moduleName,
      width,
      height,
      editMode,
      allowInsert,
      allowUpdate,
      allowDelete,
    });
  }, [moduleName, controller, title, width, height, editMode, allowInsert, allowUpdate, allowDelete, validFields]);

  const languageKeyCode = useMemo(() => {
    if (!moduleName || validFields.length === 0) return '';
    return genLanguageKey(moduleName, { fields: validFields, section: 'Popup' });
  }, [moduleName, validFields]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Popup Grid</h3>
        <div className="gen-config-row">
          <div className="gen-config-field">
            <label>Module Name</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="VD: SupermarketReturnedGood"
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
            <label>Popup Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mặc định = Module Name"
            />
          </div>
        </div>
        <div className="gen-config-row">
          <div className="gen-config-field">
            <label>Width</label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="90%"
            />
          </div>
          <div className="gen-config-field">
            <label>Height</label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="90%"
            />
          </div>
          <div className="gen-config-field">
            <label>Edit Mode</label>
            <select value={editMode} onChange={(e) => setEditMode(e.target.value)}>
              <option value="popup">popup</option>
              <option value="row">row</option>
              <option value="cell">cell</option>
              <option value="batch">batch</option>
            </select>
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
        </div>
      </div>

      <FieldEditor
        fields={fields}
        onChange={setFields}
        showGrid={true}
        showEditor={false}
        onClassNameParsed={(name) => {
          if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, ''));
        }}
      />

      {code && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Files</h3>
          <CodePreview code={code} fileName={`${moduleName || 'Module'}PopupGrid.ts`} />
          {languageKeyCode && <CodePreview code={languageKeyCode} fileName={`LanguageKey.${moduleName}.Popup.ts`} />}
        </div>
      )}
    </div>
  );
}

export default GenPopupGridTab;
