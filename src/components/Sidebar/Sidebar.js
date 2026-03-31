import React from 'react';
import './Sidebar.css';

const menuItems = [
  { id: 'notification', label: 'Build Notification', icon: '📢' },
  { id: 'gen-code-v3', label: 'Gen Code V3', icon: '⚡' },
  { id: 'helper', label: 'Helper', icon: '📖' },
  { id: 'send-mail', label: 'Send Mail', icon: '📧' },
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
        {menuItems.map((item) => (
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
      </nav>

      <div className="sidebar-footer">
        {!collapsed && <span className="sidebar-version">v1.0.0</span>}
      </div>
    </aside>
  );
}

export default Sidebar;
