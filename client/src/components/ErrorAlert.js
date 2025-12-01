import React from 'react';
import './ErrorAlert.css';

const ErrorAlert = ({ error = null, onDismiss }) => {
  if (!error) {
    return null;
  }

  const getTroubleshootingTips = (errorMsg) => {
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('file')) {
      return ['Make sure the PDF file is valid and not corrupted', 'Try uploading a different PDF'];
    } else if (msg.includes('size')) {
      return ['The file might be too large', 'Try compressing the PDF first'];
    } else if (msg.includes('memory')) {
      return ['The PDF might be too complex to process', 'Try processing a smaller PDF or breaking it into parts'];
    } else if (msg.includes('network')) {
      return ['Check your internet connection', 'Try reloading the page'];
    } else if (msg.includes('timeout')) {
      return ['The operation took too long', 'Try processing a smaller file'];
    }
    
    return ['Try refreshing the page', 'Contact support if the problem persists'];
  };

  const tips = getTroubleshootingTips(error);

  return (
    <div className="error-alert">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <span className="error-title">Error</span>
        <button className="error-close" onClick={onDismiss}>✕</button>
      </div>
      
      <p className="error-message">{error}</p>
      
      {tips.length > 0 && (
        <div className="error-tips">
          <p className="tips-title">💡 Troubleshooting Tips:</p>
          <ul>
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorAlert;
