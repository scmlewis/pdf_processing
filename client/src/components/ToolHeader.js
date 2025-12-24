import React from 'react';
import './ToolHeader.css';

const ToolHeader = ({ title, icon, onBack }) => {
  return (
    <div className="tool-header">
      <button className="back-button" onClick={onBack} title="Back to Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>All Tools</span>
      </button>
      <div className="tool-header-title">
        <span className="tool-header-icon">{icon}</span>
        <h1>{title}</h1>
      </div>
      <div className="tool-header-spacer"></div>
    </div>
  );
};

export default ToolHeader;
