import React, { useState } from 'react';
import CodePreview from '../../components/CodePreview/CodePreview';
import { genV4All } from '../../utils/generators/v4/genV4All';
import { tableToModuleName } from '../../utils/generators/v4/genV4Helpers';
import './DbExplorerPage.css';

const API_OPTIONS = [
  { label: 'Node.js (localhost:3001)', url: 'http://localhost:3001/api/db' },
];

function DbExplorerPage() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('dbe_api_url') || API_OPTIONS[0].url);
  const [customApi, setCustomApi] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [connected, setConnected] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [searchDb, setSearchDb] = useState('');
  const [searchTable, setSearchTable] = useState('');
  const [showColumns, setShowColumns] = useState(true);
  const [dbMode, setDbMode] = useState('connect'); // 'connect' | 'paste'
  const [pasteInput, setPasteInput] = useState('');
  const [pasteTableName, setPasteTableName] = useState('');
  const [showGenV4, setShowGenV4] = useState(false);
  const [genV4Result, setGenV4Result] = useState(null);
  const [v4ModuleName, setV4ModuleName] = useState('');
  const [v4Namespace, setV4Namespace] = useState('Fastlink.Portal');
  const [v4ActiveFile, setV4ActiveFile] = useState(null);

  const handleApiChange = (value) => {
    if (value === 'custom') return;
    setApiUrl(value);
    localStorage.setItem('dbe_api_url', value);
  };

  const handleCustomApiApply = () => {
    if (!customApi.trim()) return;
    const url = customApi.trim().replace(/\/+$/, '');
    setApiUrl(url);
    localStorage.setItem('dbe_api_url', url);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const apiCall = async (endpoint, body) => {
    const res = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const handleConnect = async () => {
    if (!connectionString.trim()) return;
    setLoading('connect');
    setError('');
    setConnected(false);
    setDatabases([]);
    setTables([]);
    setColumns([]);
    setSelectedDb('');
    setSelectedTable('');

    try {
      const testRes = await apiCall('test', { connectionString });
      if (!testRes.success) {
        setError(testRes.message);
        setLoading('');
        return;
      }

      const dbRes = await apiCall('databases', { connectionString });
      if (dbRes.success) {
        setDatabases(dbRes.data);
        setConnected(true);
      } else {
        setError(dbRes.message);
      }
    } catch (err) {
      setError('Không thể kết nối API server. Hãy chạy: node server.js');
    }
    setLoading('');
  };

  const handleSelectDb = async (db) => {
    setSelectedDb(db);
    setSelectedTable('');
    setColumns([]);
    setSearchTable('');
    if (!db) {
      setTables([]);
      return;
    }
    setLoading('tables');
    setError('');

    try {
      const res = await apiCall('tables', { connectionString, database: db });
      if (res.success) {
        setTables(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Lỗi kết nối API server');
    }
    setLoading('');
  };

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setShowGenV4(false);
    setGenV4Result(null);
    setV4ActiveFile(null);
    setV4ModuleName('');
    if (!table) {
      setColumns([]);
      return;
    }
    setLoading('columns');
    setError('');

    try {
      const res = await apiCall('columns', { connectionString, database: selectedDb, table });
      if (res.success) {
        setColumns(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Lỗi kết nối API server');
    }
    setLoading('');
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDatabases([]);
    setTables([]);
    setColumns([]);
    setSelectedDb('');
    setSelectedTable('');
    setError('');
    setSearchTable('');
  };

  const handleGenV4 = () => {
    const name = v4ModuleName || tableToModuleName(selectedTable);
    setV4ModuleName(name);
    const result = genV4All(selectedTable, columns, { moduleName: name, namespace: v4Namespace });
    setGenV4Result(result);
    setShowGenV4(true);
    setV4ActiveFile(null);
  };

  // Build flat file list from gen result for tree view
  const getV4FileTree = () => {
    if (!genV4Result) return [];
    const files = [];
    const add = (folder, item) => files.push({ folder, fileName: item.fileName, code: item.code });
    add('Entities', genV4Result.entity);
    add('Repos', genV4Result.repository);
    add('Services', genV4Result.service);
    add('Services', genV4Result.mappingProfile);
    add(`Models/${v4ModuleName}`, genV4Result.constFile);
    genV4Result.models.forEach((m) => add(`Models/${v4ModuleName}`, m));
    genV4Result.endpoints.forEach((e) => add(`Endpoints/${v4ModuleName}`, e));
    add('ApiClient', genV4Result.apiClient);
    return files;
  };

  const v4Files = getV4FileTree();
  // Group by folder
  const v4Folders = {};
  v4Files.forEach((f) => {
    if (!v4Folders[f.folder]) v4Folders[f.folder] = [];
    v4Folders[f.folder].push(f);
  });

  const parseNavicatStructure = () => {
    if (!pasteInput.trim() || !pasteTableName.trim()) return;
    const lines = pasteInput.trim().split('\n');
    const parsed = [];
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;
      const name = parts[0].trim();
      const type = parts[1].trim();
      const length = parseInt(parts[2]) || 0;
      const decimals = parseInt(parts[3]) || 0;
      // cột index 4: not null flag (-1 = nullable, 0 = not null)
      const nullFlag = parseInt(parts[4]);
      const nullable = nullFlag === -1 || nullFlag === 1;
      // cột index 5: key (0 = none, -1 = PRI)
      const keyFlag = parseInt(parts[5]);
      const key = keyFlag === -1 ? 'PRI' : '';
      parsed.push({ name, type, length, decimals, nullable, key, default: null, extra: '', comment: '' });
    }
    if (parsed.length > 0) {
      setColumns(parsed);
      setSelectedTable(pasteTableName.trim());
      setShowColumns(true);
      setShowGenV4(false);
      setGenV4Result(null);
      setV4ActiveFile(null);
      setV4ModuleName('');
    }
  };

  const copyColumns = () => {
    if (columns.length === 0) return;
    const text = columns.map((c) => `${c.name}\t${c.type}\t${c.length || 0}\t${c.decimals || 0}\t${c.nullable ? '' : '✓'}\t${c.key}\t${c.default || ''}\t${c.extra}\t${c.comment || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('Đã copy columns!');
  };

  const copyCSharpClass = () => {
    if (columns.length === 0) return;
    const className = selectedTable.replace(/[^a-zA-Z0-9]/g, '');
    const lines = [`public class ${className}Model`, '{'];
    columns.forEach((c) => {
      const csType = mysqlToCSharp(c.type, c.nullable);
      lines.push(`    public ${csType} ${toPascalCase(c.name)} { get; set; }`);
    });
    lines.push('}');
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Đã copy C# class!');
  };

  const copyTsInterface = () => {
    if (columns.length === 0) return;
    const name = selectedTable.replace(/[^a-zA-Z0-9]/g, '');
    const lines = [`export interface ${toPascalCase(name)}ViewModel {`];
    columns.forEach((c) => {
      const tsType = mysqlToTs(c.type);
      lines.push(`    ${toPascalCase(c.name)}: ${tsType};`);
    });
    lines.push('}');
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Đã copy TS interface!');
  };

  const filteredDbs = searchDb
    ? databases.filter((d) => d.toLowerCase().includes(searchDb.toLowerCase()))
    : databases;

  const filteredTables = searchTable
    ? tables.filter((t) => t.toLowerCase().includes(searchTable.toLowerCase()))
    : tables;

  return (
    <>
      <header className="page-header">
        <h1>DB Explorer</h1>
        <p className="page-subtitle">Kết nối MySQL, xem databases, tables, columns</p>
      </header>

      <div className="dbe-container">
        {/* Mode switch */}
        <div className="dbe-mode-switch">
          <button className={`dbe-mode-btn ${dbMode === 'connect' ? 'active' : ''}`} onClick={() => setDbMode('connect')}>
            🔌 Kết nối DB
          </button>
          <button className={`dbe-mode-btn ${dbMode === 'paste' ? 'active' : ''}`} onClick={() => setDbMode('paste')}>
            📋 Paste Structure
          </button>
        </div>

        {/* Paste mode */}
        {dbMode === 'paste' && (
          <div className="dbe-card">
            <div className="dbe-connect-row">
              <div className="dbe-field">
                <label>Table Name</label>
                <input
                  type="text"
                  className="dbe-input"
                  value={pasteTableName}
                  onChange={(e) => setPasteTableName(e.target.value)}
                  placeholder="VD: op_au_super_market_check_in"
                />
              </div>
              <button className="dbe-btn dbe-btn-connect" onClick={parseNavicatStructure} disabled={!pasteInput.trim() || !pasteTableName.trim()}>
                Parse
              </button>
            </div>
            <textarea
              className="dbe-paste-textarea"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="Paste cấu trúc từ Navicat vào đây (select all columns rồi copy)"
              rows={8}
            />
          </div>
        )}

        {/* Connect mode */}
        {dbMode === 'connect' && (<>
        <div className="dbe-card">
          <div className="dbe-connect-row">
            <div className="dbe-field">
              <label>API Server</label>
              <select
                className="dbe-select"
                value={API_OPTIONS.find((o) => o.url === apiUrl) ? apiUrl : 'custom'}
                onChange={(e) => handleApiChange(e.target.value)}
                disabled={connected}
              >
                {API_OPTIONS.map((o) => (
                  <option key={o.url} value={o.url}>{o.label}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
            {!API_OPTIONS.find((o) => o.url === apiUrl) && (
              <div className="dbe-field dbe-field-grow">
                <label>Custom API URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="dbe-input"
                    style={{ flex: 1 }}
                    value={customApi}
                    onChange={(e) => setCustomApi(e.target.value)}
                    placeholder="https://your-api.com/api/db"
                    disabled={connected}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomApiApply(); }}
                  />
                  <button className="dbe-btn dbe-btn-connect" onClick={handleCustomApiApply} disabled={connected}>
                    Apply
                  </button>
                </div>
              </div>
            )}
            <div className="dbe-api-status">
              <kbd>{apiUrl}</kbd>
            </div>
          </div>
        </div>

        {/* Connection */}
        <div className="dbe-card">
          <div className="dbe-connect-row">
            <div className="dbe-field dbe-field-grow">
              <label>Connection String</label>
              <input
                type="text"
                className="dbe-input"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="Server=localhost;Port=3306;Uid=root;Pwd=123456; hoặc mysql://root:123456@localhost:3306"
                disabled={connected}
                onKeyDown={(e) => { if (e.key === 'Enter' && !connected) handleConnect(); }}
              />
            </div>
            {!connected ? (
              <button className="dbe-btn dbe-btn-connect" onClick={handleConnect} disabled={loading === 'connect'}>
                {loading === 'connect' ? 'Đang kết nối...' : 'Kết nối'}
              </button>
            ) : (
              <button className="dbe-btn dbe-btn-disconnect" onClick={handleDisconnect}>
                Ngắt kết nối
              </button>
            )}
          </div>

          {error && <div className="dbe-error">{error}</div>}

          {connected && (
            <div className="dbe-select-row">
              <div className="dbe-field">
                <label>
                  Database
                  {databases.length > 0 && <span className="dbe-label-badge">{databases.length}</span>}
                </label>
                <div className="dbe-table-select-wrapper">
                  <input
                    type="text"
                    className="dbe-input dbe-search-input"
                    placeholder="Tìm database..."
                    value={searchDb}
                    onChange={(e) => setSearchDb(e.target.value)}
                  />
                  <select
                    className="dbe-select"
                    value={selectedDb}
                    onChange={(e) => handleSelectDb(e.target.value)}
                    size={Math.min(filteredDbs.length + 1, 10)}
                  >
                    <option value="">-- Chọn database --</option>
                    {filteredDbs.map((db) => (
                      <option key={db} value={db}>{db}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDb && (
                <div className="dbe-field dbe-field-grow">
                  <label>
                    Table
                    {tables.length > 0 && <span className="dbe-label-badge">{tables.length}</span>}
                    {loading === 'tables' && <span className="dbe-loading-dot">Loading...</span>}
                  </label>
                  <div className="dbe-table-select-wrapper">
                    <input
                      type="text"
                      className="dbe-input dbe-search-input"
                      placeholder="Tìm table..."
                      value={searchTable}
                      onChange={(e) => setSearchTable(e.target.value)}
                    />
                    <select
                      className="dbe-select"
                      value={selectedTable}
                      onChange={(e) => handleSelectTable(e.target.value)}
                      size={Math.min(filteredTables.length + 1, 10)}
                    >
                      <option value="">-- Chọn table --</option>
                      {filteredTables.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </>)}

        {/* Columns */}
        {columns.length > 0 && (
          <div className="dbe-card">
            <div className="dbe-columns-header" onClick={() => setShowColumns(!showColumns)} style={{ cursor: 'pointer' }}>
              <div className="dbe-columns-title">
                <span className="dbe-toggle-arrow">{showColumns ? '▾' : '▸'}</span>
                <strong>{selectedTable}</strong>
                <span className="dbe-label-badge">{columns.length} columns</span>
              </div>
              <div className="dbe-columns-actions" onClick={(e) => e.stopPropagation()}>
                <button className="dbe-copy-btn" onClick={copyColumns} title="Copy dạng tab-separated">📋 Copy</button>
                <button className="dbe-copy-btn" onClick={copyCSharpClass} title="Copy C# class">C# Class</button>
                <button className="dbe-copy-btn" onClick={copyTsInterface} title="Copy TypeScript interface">TS Interface</button>
                <button className="dbe-copy-btn dbe-btn-gen-v4" onClick={handleGenV4} title="Gen Code V4 (Entity, Repo, Service, Endpoints, Models, Validators)">⚡ Gen V4</button>
              </div>
            </div>

            {loading === 'columns' ? (
              <div className="dbe-empty">Loading columns...</div>
            ) : showColumns && (
              <div className="dbe-table-wrapper">
                <table className="dbe-table">
                  <thead>
                    <tr>
                      <th className="dbe-th-index">#</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th className="dbe-th-right">Length</th>
                      <th className="dbe-th-right">Decimals</th>
                      <th className="dbe-th-center">Not Null</th>
                      <th className="dbe-th-center">Key</th>
                      <th>Default</th>
                      <th>Extra</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col, i) => (
                      <tr key={col.name}>
                        <td className="dbe-td-index">{i + 1}</td>
                        <td><code className="dbe-col-name">{col.name}</code></td>
                        <td><span className="dbe-type">{col.type}</span></td>
                        <td className="dbe-td-right">{col.length || 0}</td>
                        <td className="dbe-td-right">{col.decimals || 0}</td>
                        <td className="dbe-td-center">{!col.nullable ? <span className="dbe-check">✓</span> : ''}</td>
                        <td className="dbe-td-center">
                          {col.key === 'PRI' && <span className="dbe-key dbe-key-pri">PK</span>}
                          {col.key === 'MUL' && <span className="dbe-key dbe-key-fk">FK</span>}
                          {col.key === 'UNI' && <span className="dbe-key dbe-key-uni">UQ</span>}
                        </td>
                        <td className="dbe-td-default">{col.default != null ? col.default : ''}</td>
                        <td className="dbe-td-extra">{col.extra}</td>
                        <td className="dbe-td-comment">{col.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Gen V4 Result */}
        {showGenV4 && genV4Result && (
          <div className="dbe-card">
            <div className="dbe-gen-toolbar">
              <div className="dbe-columns-title">
                <strong>Gen Code V4</strong>
                <span className="dbe-label-badge">{v4ModuleName}</span>
              </div>
              <div className="dbe-gen-config">
                <label>Module:</label>
                <input type="text" className="dbe-input dbe-input-small" value={v4ModuleName} onChange={(e) => setV4ModuleName(e.target.value)} />
                <label>Namespace:</label>
                <input type="text" className="dbe-input dbe-input-small" value={v4Namespace} onChange={(e) => setV4Namespace(e.target.value)} />
                <button className="dbe-copy-btn dbe-btn-gen-v4" onClick={handleGenV4}>Re-gen</button>
                <button className="dbe-copy-btn" onClick={() => setShowGenV4(false)}>Đóng</button>
              </div>
            </div>

            <div className="v4-layout">
              {/* Tree */}
              <div className="v4-tree">
                {Object.entries(v4Folders).map(([folder, files]) => (
                  <div key={folder} className="v4-folder">
                    <div className="v4-folder-name">📁 {folder}</div>
                    {files.map((f) => (
                      <button
                        key={f.fileName}
                        className={`v4-file ${v4ActiveFile && v4ActiveFile.fileName === f.fileName && v4ActiveFile.folder === f.folder ? 'active' : ''}`}
                        onClick={() => setV4ActiveFile(f)}
                      >
                        <span className="v4-file-icon">📄</span>
                        {f.fileName}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Code preview */}
              <div className="v4-preview">
                {v4ActiveFile ? (
                  <CodePreview code={v4ActiveFile.code} fileName={`${v4ActiveFile.folder}/${v4ActiveFile.fileName}`} />
                ) : (
                  <div className="v4-empty">Chọn file bên trái để xem code</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="lkg-toast">{toast}</div>}
    </>
  );
}

function toPascalCase(str) {
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function mysqlToCSharp(type, nullable) {
  const t = type.toLowerCase();
  let csType = 'string';
  if (t === 'bit') csType = 'bool';
  else if (t === 'tinyint') csType = 'bool';
  else if (t === 'bigint') csType = 'long';
  else if (t === 'int' || t === 'mediumint' || t === 'smallint') csType = 'int';
  else if (t === 'decimal' || t === 'numeric') csType = 'decimal';
  else if (t === 'float') csType = 'float';
  else if (t === 'double') csType = 'double';
  else if (t === 'datetime' || t === 'timestamp') csType = 'DateTime';
  else if (t === 'date') csType = 'DateTime';
  else if (t === 'time') csType = 'TimeSpan';
  else if (t === 'varchar' || t === 'char' || t === 'text' || t === 'longtext' || t === 'mediumtext' || t === 'tinytext' || t === 'enum' || t === 'set') csType = 'string';
  else if (t === 'blob' || t === 'longblob' || t === 'mediumblob' || t === 'tinyblob' || t === 'binary' || t === 'varbinary') csType = 'byte[]';
  else if (t === 'json') csType = 'string';

  if (nullable && csType !== 'string' && csType !== 'byte[]') csType += '?';
  return csType;
}

function mysqlToTs(type) {
  const t = type.toLowerCase();
  if (t === 'bit' || t === 'tinyint') return 'boolean';
  if (t === 'int' || t === 'bigint' || t === 'smallint' || t === 'mediumint' || t === 'decimal' || t === 'numeric' || t === 'float' || t === 'double') return 'number';
  if (t === 'datetime' || t === 'timestamp' || t === 'date' || t === 'time') return 'Date';
  return 'string';
}

export default DbExplorerPage;
