import React from 'react';
import './Sidebar.css';

const menuGroups = [
  {
    label: 'Code Generator',
    items: [
      { id: 'gen-code-v3', label: 'Gen Code V3', icon: '⚡' },
      { id: 'lang-key-gen', label: 'Language Key Gen', icon: '🌐' },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { id: 'notification', label: 'Build Notification', icon: '📢' },
      { id: 'db-explorer', label: 'DB Explorer', icon: '🗄' },
      { id: 'json-formatter', label: 'JSON Formatter', icon: '{ }' },
      { id: 'send-mail', label: 'Send Mail', icon: '📧' },
    ],
  },
  {
    label: 'Docs',
    items: [
      { id: 'helper', label: 'Helper', icon: '📖' },
    ],
  },
];

function Sidebar({ activeTool, onToolChange, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!collapsed && <span className="logo-text">Dev Tools</span>}
          {collapsed && <span className="logo-text-short">DT</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            {!collapsed && <div className="sidebar-group-label">{group.label}</div>}
            {collapsed && <div className="sidebar-group-divider"></div>}
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeTool === item.id ? 'active' : ''}`}
                onClick={() => onToolChange(item.id)}
                title={item.label}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && <span className="sidebar-version">v1.0.0</span>}
      </div>
    </aside>
  );
}

export default Sidebar;
