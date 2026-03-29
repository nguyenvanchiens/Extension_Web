import React from 'react';
import ContentItemRow from '../ContentItemRow/ContentItemRow';
import AutocompleteInput from '../AutocompleteInput/AutocompleteInput';
import './NotificationForm.css';

const APP_NAMES = [
  'supermarket-web',
  'office-web',
  'portal-web',
  'gift-web',
];

function NotificationForm({
  appName,
  setAppName,
  version,
  setVersion,
  contentItems,
  setContentItems,
  nextIdRef,
}) {
  const handleItemChange = (id, updatedItem) => {
    setContentItems(
      contentItems.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  const handleItemRemove = (id) => {
    setContentItems(contentItems.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    nextIdRef.current += 1;
    setContentItems([
      ...contentItems,
      { id: nextIdRef.current, content: '' },
    ]);
  };

  return (
    <div className="notification-form">
      <h2 className="form-title">Thông tin build</h2>

      <div className="form-group">
        <label>App name</label>
        <AutocompleteInput
          value={appName}
          onChange={setAppName}
          suggestions={APP_NAMES}
          placeholder="VD: supermarket-web"
        />
      </div>

      <div className="form-group">
        <label>Version</label>
        <input
          type="text"
          placeholder="VD: 1.1.66.415"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Nội dung (Content items)</label>
        {contentItems.map((item) => (
          <ContentItemRow
            key={item.id}
            item={item}
            onChange={handleItemChange}
            onRemove={handleItemRemove}
            canRemove={contentItems.length > 1}
          />
        ))}
        <button className="btn-add" onClick={handleAddItem}>
          + Thêm nội dung
        </button>
      </div>
    </div>
  );
}

export default NotificationForm;
