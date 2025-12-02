import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function MetadataTab() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleGetMetadata = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/metadata', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setMetadata(response.data.metadata);
      window.showToast?.('Metadata loaded successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error retrieving metadata';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>PDF Metadata</h2>
      <p>View detailed information about your PDF</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Reading PDF metadata..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to view metadata" />
      {file && <FilePreview files={[file]} onRemoveFile={() => setFile(null)} />}

      {!loading && (
        <button onClick={handleGetMetadata} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Get Metadata
        </button>
      )}

      {metadata && (
        <div className="metadata-display" style={{ marginTop: '20px' }}>
          <h3>PDF Information</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>Page Count:</strong>
              <span>{metadata.pageCount}</span>
            </div>
            <div className="metadata-item">
              <strong>Title:</strong>
              <span>{metadata.title || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Author:</strong>
              <span>{metadata.author || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Subject:</strong>
              <span>{metadata.subject || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Creator:</strong>
              <span>{metadata.creator || 'N/A'}</span>
            </div>
          </div>

          {metadata.pages && metadata.pages.length > 0 && (
            <div className="pages-info">
              <h4>Page Dimensions</h4>
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Width</th>
                    <th>Height</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.pages.slice(0, 10).map((page, idx) => (
                    <tr key={idx}>
                      <td>{page.index + 1}</td>
                      <td>{page.width.toFixed(0)} pt</td>
                      <td>{page.height.toFixed(0)} pt</td>
                    </tr>
                  ))}
                  {metadata.pages.length > 10 && (
                    <tr>
                      <td colSpan="3">... and {metadata.pages.length - 10} more pages</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MetadataTab;
