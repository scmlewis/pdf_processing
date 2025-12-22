import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

/**
 * ProgressBar Component
 * Shows upload/processing progress with time estimates
 */
const ProgressBar = ({ 
  progress = 0, 
  status = 'idle', 
  message = '',
  showTimeEstimate = true 
}) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);

  // Start timer when progress begins
  useEffect(() => {
    if (status === 'processing' || status === 'uploading') {
      if (!startTime) {
        setStartTime(Date.now());
      }
    } else {
      setStartTime(null);
      setElapsedTime(0);
      setEstimatedTimeRemaining(null);
    }
  }, [status, startTime]);

  // Update elapsed time and calculate ETA
  useEffect(() => {
    if (!startTime || progress === 0) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000; // in seconds
      setElapsedTime(elapsed);

      // Calculate ETA based on progress rate
      if (progress > 5 && progress < 100) {
        const rate = progress / elapsed;
        const remaining = (100 - progress) / rate;
        setEstimatedTimeRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, progress]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (status === 'idle' || status === 'complete') {
    return null;
  }

  return (
    <div className="progress-bar-container">
      <div className="progress-info">
        <span className="progress-message">
          {message || (status === 'uploading' ? 'Uploading...' : 'Processing...')}
        </span>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-bar-track">
        <div 
          className={`progress-bar-fill ${status}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="progress-bar-shine"></div>
        </div>
      </div>

      {showTimeEstimate && (startTime || estimatedTimeRemaining) && (
        <div className="progress-time-info">
          {elapsedTime > 0 && (
            <span className="time-elapsed">
              Elapsed: {formatTime(elapsedTime)}
            </span>
          )}
          {estimatedTimeRemaining && progress > 5 && progress < 95 && (
            <span className="time-remaining">
              ETA: {formatTime(estimatedTimeRemaining)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
