import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import NotificationPage from './pages/NotificationPage';
import GenCodeV3Page from './pages/GenCodeV3/GenCodeV3Page';
import LanguageKeyGenPage from './pages/LanguageKeyGen/LanguageKeyGenPage';
import DbExplorerPage from './pages/DbExplorer/DbExplorerPage';
import JsonFormatterPage from './pages/JsonFormatter/JsonFormatterPage';
import HelperPage from './pages/Helper/HelperPage';
import SendMailPage from './pages/SendMail/SendMailPage';
import './App.css';

function App() {
  const [activeTool, setActiveTool] = useState('notification');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activeTool) {
      case 'notification':
        return <NotificationPage />;
      case 'gen-code-v3':
        return <GenCodeV3Page />;
      case 'lang-key-gen':
        return <LanguageKeyGenPage />;
      case 'db-explorer':
        return <DbExplorerPage />;
      case 'json-formatter':
        return <JsonFormatterPage />;
      case 'helper':
        return <HelperPage />;
      case 'send-mail':
        return <SendMailPage />;
      default:
        return <NotificationPage />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
