import React, { useState } from 'react';
import GenGridTab from './tabs/GenGridTab';
import GenFormTab from './tabs/GenFormTab';
import GenMasterDetailTab from './tabs/GenMasterDetailTab';
import GenServiceTab from './tabs/GenServiceTab';
import GenModelTab from './tabs/GenModelTab';
import GenPopupFormTab from './tabs/GenPopupFormTab';
import GenPopupGridTab from './tabs/GenPopupGridTab';
import './GenCodeV3Page.css';

const TABS = [
  { id: 'grid', label: 'Gen Grid', icon: '📊' },
  { id: 'form', label: 'Gen Form', icon: '📝' },
  { id: 'popup-form', label: 'Gen Popup Form', icon: '🪟' },
  { id: 'popup-grid', label: 'Gen Popup Grid', icon: '🗃' },
  { id: 'master-detail', label: 'Gen Master-Detail', icon: '📋' },
  { id: 'service', label: 'Gen Service', icon: '🔌' },
  { id: 'model', label: 'Gen Model', icon: '🗂' },
];

function GenCodeV3Page() {
  const [activeTab, setActiveTab] = useState('grid');

  const renderTab = () => {
    switch (activeTab) {
      case 'grid': return <GenGridTab />;
      case 'form': return <GenFormTab />;
      case 'popup-form': return <GenPopupFormTab />;
      case 'popup-grid': return <GenPopupGridTab />;
      case 'master-detail': return <GenMasterDetailTab />;
      case 'service': return <GenServiceTab />;
      case 'model': return <GenModelTab />;
      default: return <GenGridTab />;
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Gen Code V3</h1>
        <p className="page-subtitle">Generate TypeScript code theo pattern FastLink V3</p>
      </header>

      <div className="gen-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`gen-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="gen-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="gen-tab-content">
        {renderTab()}
      </div>
    </>
  );
}

export default GenCodeV3Page;
