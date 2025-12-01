import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function SplitTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/split', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error splitting PDF. Please check your file.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownloadSplit = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Error downloading file');
    }
  };

  return (
    <div className="tab-content">
      <h2>Split PDF</h2>
      <p>Split a PDF into separate single-page files</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Splitting PDF..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to split" />
      {file && <FilePreview files={[file]} />}

      {!loading && (
        <button onClick={handleSplit} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Split PDF
        </button>
      )}

      {result && (
        <div className="split-results" style={{ marginTop: '20px' }}>
          <h3>Split Files ({result.files.length})</h3>
          <div className="file-list">
            {result.files.map((filename, idx) => (
              <div key={idx} className="file-item">
                <div className="file-icon">📄</div>
                <div className="file-info" style={{ flex: 1 }}>
                  <p className="file-name">{filename}</p>
                </div>
                <button
                  className="download-btn"
                  onClick={() => handleDownloadSplit(result.downloadUrls[idx], filename)}
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitTab;
