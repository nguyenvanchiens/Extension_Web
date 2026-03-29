import React, { useState, useMemo } from 'react';
import FieldEditor from '../../../components/FieldEditor/FieldEditor';
import CodePreview from '../../../components/CodePreview/CodePreview';
import { genPopupForm } from '../../../utils/generators/genPopupForm';
import { genLanguageKey } from '../../../utils/generators/genLanguageKey';

const DEFAULT_FIELD = { name: '', label: '', type: 'string', editorType: '', required: false };

function GenPopupFormTab() {
  const [moduleName, setModuleName] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [labelLocation, setLabelLocation] = useState('top');
  const [colCount, setColCount] = useState(2);
  const [fields, setFields] = useState([{ ...DEFAULT_FIELD }]);

  const validFields = fields.filter((f) => f.name);

  const code = useMemo(() => {
    if (!moduleName) return '';
    return genPopupForm(moduleName, {
      fields: validFields,
      title: title || moduleName,
      width,
      height,
      labelLocation,
      colCount,
    });
  }, [moduleName, title, width, height, labelLocation, colCount, validFields]);

  const languageKeyCode = useMemo(() => {
    if (!moduleName || validFields.length === 0) return '';
    return genLanguageKey(moduleName, { fields: validFields, section: 'Popup' });
  }, [moduleName, validFields]);

  return (
    <div>
      <div className="gen-config">
        <h3>Cấu hình Popup Form</h3>
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
            <label>Popup Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mặc định = Module Name"
            />
          </div>
          <div className="gen-config-field">
            <label>Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
          <div className="gen-config-field">
            <label>Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="gen-config-row">
          <div className="gen-config-field">
            <label>Label Location</label>
            <select value={labelLocation} onChange={(e) => setLabelLocation(e.target.value)}>
              <option value="top">top</option>
              <option value="left">left</option>
            </select>
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

      <FieldEditor
        fields={fields}
        onChange={setFields}
        showGrid={false}
        showEditor={true}
        onClassNameParsed={(name) => {
          if (!moduleName) setModuleName(name.replace(/ViewModel$|Model$|SearchModel$/, ''));
        }}
      />

      {code && (
        <div className="gen-result">
          <h3 className="gen-result-title">Generated Files</h3>
          <CodePreview code={code} fileName={`${moduleName || 'Module'}PopupForm.ts`} />
          {languageKeyCode && <CodePreview code={languageKeyCode} fileName={`LanguageKey.${moduleName}.Popup.ts`} />}
        </div>
      )}
    </div>
  );
}

export default GenPopupFormTab;
