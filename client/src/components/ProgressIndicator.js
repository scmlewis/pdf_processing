import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ isLoading = false, progress = 0, message = 'Processing...', onCancel }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="progress-overlay">
      <div className="progress-container">
        <div className="progress-spinner"></div>
        <p className="progress-message">{message}</p>
        
        {progress > 0 && progress < 100 && (
          <>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-percent">{Math.round(progress)}%</p>
          </>
        )}
        
        {onCancel && (
          <button className="progress-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
