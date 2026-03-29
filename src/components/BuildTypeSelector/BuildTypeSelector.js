import React from 'react';
import './BuildTypeSelector.css';

function BuildTypeSelector({ buildType, onBuildTypeChange }) {
  return (
    <div className="build-type-selector">
      <button
        className={`type-btn ${buildType === 'test' ? 'active' : ''}`}
        onClick={() => onBuildTypeChange('test')}
      >
        🔨 Build Test
      </button>
      <button
        className={`type-btn ${buildType === 'online' ? 'active' : ''}`}
        onClick={() => onBuildTypeChange('online')}
      >
        🆙 Build Online
      </button>
    </div>
  );
}

export default BuildTypeSelector;
