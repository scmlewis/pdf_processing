import React, { useState, useEffect } from 'react';
import './FilePreview.css';

const FilePreview = ({ files = [], onRemoveFile = null }) => {
  const [pageInfo, setPageInfo] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    const detectPageCounts = async () => {
      const newPageInfo = {};
      
      // Define processFiles first before using it
      const processFiles = async () => {
        for (let file of files) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            newPageInfo[file.name] = pdf.numPages;
          } catch (err) {
            console.log(`Could not detect pages for ${file.name}`);
            newPageInfo[file.name] = null;
          }
        }
        setPageInfo(newPageInfo);
      };

      // Dynamically load PDF.js from CDN
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          processFiles();
        };
        document.head.appendChild(script);
      } else {
        processFiles();
      }
    };

    if (files.length > 0) {
      detectPageCounts();
    }
  }, [files]);

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
              <div className="file-meta">
                <span className="file-size">{formatFileSize(file.size)}</span>
                {pageInfo[file.name] && (
                  <span className="file-pages">
                    {pageInfo[file.name]} page{pageInfo[file.name] !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            {onRemoveFile && (
              <button 
                className="file-remove-btn" 
                onClick={() => onRemoveFile(index)}
                title="Remove this file"
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;
