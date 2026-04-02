import React, { useState } from 'react';
import './DbExplorerPage.css';

const API_URL = process.env.REACT_APP_DB_API_URL || 'https://connect-database.runasp.net/api/db';

function DbExplorerPage() {
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const apiCall = async (endpoint, body) => {
    const res = await fetch(`${API_URL}/${endpoint}`, {
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
        <p className="page-hint">
          API: <kbd>connect-database.runasp.net</kbd>
        </p>
      </header>

      <div className="dbe-container">
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

        {/* Columns */}
        {columns.length > 0 && (
          <div className="dbe-card">
            <div className="dbe-columns-header">
              <div className="dbe-columns-title">
                <strong>{selectedTable}</strong>
                <span className="dbe-label-badge">{columns.length} columns</span>
              </div>
              <div className="dbe-columns-actions">
                <button className="dbe-copy-btn" onClick={copyColumns} title="Copy dạng tab-separated">📋 Copy</button>
                <button className="dbe-copy-btn" onClick={copyCSharpClass} title="Copy C# class">C# Class</button>
                <button className="dbe-copy-btn" onClick={copyTsInterface} title="Copy TypeScript interface">TS Interface</button>
              </div>
            </div>

            {loading === 'columns' ? (
              <div className="dbe-empty">Loading columns...</div>
            ) : (
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
