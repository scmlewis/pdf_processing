import React, { useState } from 'react';
import './FloatingActionMenu.css';

function FloatingActionMenu({ onTabSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { id: 'combine', label: 'Combine', icon: '📎', description: 'Merge PDFs' },
    { id: 'extract', label: 'Extract', icon: '✂️', description: 'Extract pages' },
    { id: 'split', label: 'Split', icon: '⚡', description: 'Split PDF' },
    { id: 'compress', label: 'Compress', icon: '📦', description: 'Reduce size' },
  ];

  const handleActionClick = (tabId) => {
    onTabSelect(tabId);
    setIsOpen(false);
    window.showToast?.(`Switched to ${tabId} tab`, 'info');
  };

  return (
    <div className="floating-action-menu">
      <button
        className={`fam-button fam-main ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Quick actions"
      >
        <span className="fam-icon">⚡</span>
      </button>

      {isOpen && (
        <div className="fam-overlay" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fam-menu">
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              className="fam-item"
              onClick={() => handleActionClick(action.id)}
              title={action.description}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            >
              <span className="fam-item-icon">{action.icon}</span>
              <span className="fam-item-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FloatingActionMenu;
