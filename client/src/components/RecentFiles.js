import React, { useState, useEffect } from 'react';
import { fileExists, getPDF } from '../utils/pdfStorage';
import './RecentFiles.css';

/**
 * RecentFiles Component
 * Shows a panel with recently processed files stored in localStorage
 */
const RecentFiles = ({ onFileSelect }) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState({});

  useEffect(() => {
    loadRecentFiles();
  }, []);

  useEffect(() => {
    // Check which files are available in storage
    const checkAvailability = async () => {
      const availability = {};
      for (const file of recentFiles) {
        availability[file.fileName] = await fileExists(file.fileName);
      }
      setAvailableFiles(availability);
    };
    
    if (recentFiles.length > 0) {
      checkAvailability();
    }
  }, [recentFiles]);

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

  const handleFileClick = async (file) => {
    // Check if file is available in storage
    if (!availableFiles[file.fileName]) {
      window.showToast?.('File not available in storage', 'error');
      return;
    }

    try {
      // Retrieve PDF from IndexedDB
      const blob = await getPDF(file.fileName);
      if (!blob) {
        window.showToast?.('Failed to load file from storage', 'error');
        return;
      }

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      window.showToast?.(`Downloaded ${file.fileName}`, 'success');
    } catch (error) {
      console.error('Failed to download file:', error);
      window.showToast?.('Failed to download file', 'error');
    }
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
              <>
                <div className="info-banner">
                  <span>� Click files to re-download (stored in browser)</span>
                </div>
                {recentFiles.map((file) => {
                  const isAvailable = availableFiles[file.fileName];
                  return (
                    <div
                      key={file.id}
                      className={`recent-file-item ${isAvailable ? 'available' : 'unavailable'}`}
                      onClick={() => isAvailable && handleFileClick(file)}
                      title={isAvailable ? 'Click to download' : 'File not stored - process again to save'}
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
                      {isAvailable && (
                        <div className="download-icon" title="Available for download">
                          ⬇️
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
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
