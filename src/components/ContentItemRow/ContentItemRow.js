import React from 'react';
import './ContentItemRow.css';

function ContentItemRow({ item, onChange, onRemove, canRemove }) {
  return (
    <div className="content-item-row">
      <input
        type="text"
        placeholder="VD: [SMT-436] [Supermarket- AU] Bổ sung tool Quản lý data nhân sự (IT-10932)(https://issue.fastlink.vn/browse/SMT-436)"
        value={item.content}
        onChange={(e) => onChange(item.id, { ...item, content: e.target.value })}
        className="input-content"
      />
      {canRemove && (
        <button
          className="btn-remove"
          onClick={() => onRemove(item.id)}
          title="Xóa dòng"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ContentItemRow;
