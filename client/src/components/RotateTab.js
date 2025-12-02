import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function RotateTab() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('1');
  const [angle, setAngle] = useState(90);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const downloadPDF = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleRotate = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    // Convert 1-based page numbers to 0-based indices for server
    const oneBased = pages.split(',').map(p => parseInt(p.trim()));
    const zeroBasedIndices = oneBased.map(p => p - 1);
    formData.append('pageIndices', JSON.stringify(zeroBasedIndices));
    formData.append('angle', angle);
    formData.append('originalFilename', file.name);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/rotate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(response.data, `${baseName}-rotated.pdf`);
      window.showToast?.('Pages rotated successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error rotating pages';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Rotate Pages</h2>
      <p>Rotate specific pages in a PDF</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Rotating pages..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to rotate" />
      {file && <FilePreview files={[file]} />}

      <div className="input-group" style={{ marginTop: '20px' }}>
        <label>Page Numbers (comma-separated, 1-based)</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="1,2"
          className="text-input"
        />
      </div>

      <div className="input-group">
        <label>Rotation Angle (degrees)</label>
        <select value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="text-input">
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      </div>

      {!loading && (
        <button onClick={handleRotate} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Rotate Pages
        </button>
      )}
    </div>
  );
}

export default RotateTab;
