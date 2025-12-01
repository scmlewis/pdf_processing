import React from 'react';
import './FilePreview.css';

const FilePreview = ({ files = [] }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-preview-container">
      <h3>Selected Files ({files.length})</h3>
      <div className="file-list">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="file-item">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{formatFileSize(file.size)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;
