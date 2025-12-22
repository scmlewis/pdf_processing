import React, { useState, useEffect } from 'react';
import './RecentFiles.css';

/**
 * RecentFiles Component
 * Shows a panel with recently processed files stored in localStorage
 */
const RecentFiles = ({ onFileSelect }) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = () => {
    try {
      const stored = localStorage.getItem('recentPdfFiles');
      if (stored) {
        const files = JSON.parse(stored);
        setRecentFiles(files);
      }
    } catch (error) {
      console.error('Failed to load recent files:', error);
    }
  };

  const addRecentFile = (fileName, operation, size) => {
    try {
      const newFile = {
        id: Date.now(),
        fileName,
        operation,
        size,
        timestamp: new Date().toISOString()
      };

      const stored = localStorage.getItem('recentPdfFiles');
      let files = stored ? JSON.parse(stored) : [];
      
      // Remove duplicate if exists
      files = files.filter(f => f.fileName !== fileName || f.operation !== operation);
      
      // Add new file at beginning
      files.unshift(newFile);
      
      // Keep only last 10 files
      files = files.slice(0, 10);
      
      localStorage.setItem('recentPdfFiles', JSON.stringify(files));
      setRecentFiles(files);
    } catch (error) {
      console.error('Failed to save recent file:', error);
    }
  };

  const clearRecentFiles = () => {
    if (window.confirm('Clear all recent files?')) {
      localStorage.removeItem('recentPdfFiles');
      setRecentFiles([]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getOperationIcon = (operation) => {
    const icons = {
      combine: '📎',
      extract: '✂️',
      reorder: '↕️',
      rotate: '🔄',
      watermark: '💧',
      compress: '📦',
      split: '⚡',
      delete: '🗑️',
      metadata: '📋'
    };
    return icons[operation] || '📄';
  };

  // Expose addRecentFile to window for other components
  useEffect(() => {
    window.addRecentFile = addRecentFile;
  }, []);

  return (
    <>
      <button
        className="recent-files-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Recent Files"
      >
        🕒 Recent ({recentFiles.length})
      </button>

      {isOpen && (
        <div className="recent-files-panel">
          <div className="recent-files-header">
            <h3>Recent Files</h3>
            <div className="recent-files-actions">
              {recentFiles.length > 0 && (
                <button
                  className="clear-button"
                  onClick={clearRecentFiles}
                  title="Clear all"
                >
                  Clear All
                </button>
              )}
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="recent-files-list">
            {recentFiles.length === 0 ? (
              <div className="empty-state">
                <p>No recent files</p>
                <span>Processed files will appear here</span>
              </div>
            ) : (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="recent-file-item"
                  onClick={() => onFileSelect && onFileSelect(file)}
                >
                  <div className="file-icon">
                    {getOperationIcon(file.operation)}
                  </div>
                  <div className="file-details">
                    <div className="file-name" title={file.fileName}>
                      {file.fileName}
                    </div>
                    <div className="file-meta">
                      <span className="operation-label">{file.operation}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      <span className="file-time">{formatTimestamp(file.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="recent-files-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default RecentFiles;
