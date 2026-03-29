import React, { useState, useRef } from 'react';
import BuildTypeSelector from '../components/BuildTypeSelector/BuildTypeSelector';
import NotificationForm from '../components/NotificationForm/NotificationForm';
import MessagePreview from '../components/MessagePreview/MessagePreview';
import { formatMessage } from '../utils/formatMessage';

function NotificationPage() {
  const [buildType, setBuildType] = useState('test');
  const [appName, setAppName] = useState('');
  const [version, setVersion] = useState('');
  const [contentItems, setContentItems] = useState([
    { id: 1, content: '' },
  ]);
  const nextIdRef = useRef(1);

  const message = formatMessage({ buildType, appName, version, contentItems });

  const handleReset = () => {
    setAppName('');
    setVersion('');
    setContentItems([{ id: 1, content: '' }]);
    nextIdRef.current = 1;
  };

  return (
    <>
      <header className="page-header">
        <h1>Build Notification</h1>
        <p className="page-subtitle">Tool tạo thông báo build nhanh chóng</p>
        <p className="page-hint"><kbd>Alt</kbd> + <kbd>V</kbd> để paste ảnh vào terminal</p>
      </header>

      <div className="page-content">
        <div className="page-left">
          <BuildTypeSelector
            buildType={buildType}
            onBuildTypeChange={setBuildType}
          />
          <NotificationForm
            appName={appName}
            setAppName={setAppName}
            version={version}
            setVersion={setVersion}
            contentItems={contentItems}
            setContentItems={setContentItems}
            nextIdRef={nextIdRef}
          />
          <button className="btn-reset" onClick={handleReset}>
            Reset form
          </button>
        </div>
        <div className="page-right">
          <MessagePreview message={message} />
        </div>
      </div>
    </>
  );
}

export default NotificationPage;
