import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import NotificationPage from './pages/NotificationPage';
import GenCodeV3Page from './pages/GenCodeV3/GenCodeV3Page';
import HelperPage from './pages/Helper/HelperPage';
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
      case 'helper':
        return <HelperPage />;
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
