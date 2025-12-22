import React, { useState, useEffect } from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ isLoading = false, progress = 0, message = 'Processing...', onCancel }) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);

  // Start timer when loading begins
  useEffect(() => {
    if (isLoading) {
      if (!startTime) {
        setStartTime(Date.now());
      }
    } else {
      setStartTime(null);
      setElapsedTime(0);
      setEstimatedTimeRemaining(null);
    }
  }, [isLoading, startTime]);

  // Update elapsed time and calculate ETA
  useEffect(() => {
    if (!startTime || !isLoading) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000; // in seconds
      setElapsedTime(elapsed);

      // Calculate ETA based on progress rate
      if (progress > 5 && progress < 95) {
        const rate = progress / elapsed;
        const remaining = (100 - progress) / rate;
        setEstimatedTimeRemaining(remaining);
      } else {
        setEstimatedTimeRemaining(null);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, progress, isLoading]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

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
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                <div className="progress-shine"></div>
              </div>
            </div>
            <p className="progress-percent">{Math.round(progress)}%</p>
          </>
        )}

        {(elapsedTime > 0 || estimatedTimeRemaining) && (
          <div className="progress-time-info">
            {elapsedTime > 0 && (
              <span className="time-elapsed">
                ⏱️ {formatTime(elapsedTime)}
              </span>
            )}
            {estimatedTimeRemaining && (
              <span className="time-remaining">
                ⏳ ~{formatTime(estimatedTimeRemaining)} remaining
              </span>
            )}
          </div>
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
