import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function ReorderTab() {
  const [file, setFile] = useState(null);
  const [newOrder, setNewOrder] = useState('0,1,2');
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

  const handleReorder = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('newOrder', JSON.stringify(newOrder.split(',').map(p => parseInt(p.trim()))));
    formData.append('originalFilename', file.name);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/reorder', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(response.data, `${baseName}-reordered.pdf`);
      window.showToast?.('Pages reordered successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error reordering pages';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Reorder Pages</h2>
      <p>Rearrange pages in a custom order</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Reordering pages..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to reorder" />
      {file && <FilePreview files={[file]} />}

      <div className="input-group" style={{ marginTop: '20px' }}>
        <label>New Page Order (comma-separated, 0-based)</label>
        <input
          type="text"
          value={newOrder}
          onChange={(e) => setNewOrder(e.target.value)}
          placeholder="0,1,2"
          className="text-input"
        />
        <small>Example: "2,1,0" reverses the first 3 pages</small>
      </div>

      {!loading && (
        <button onClick={handleReorder} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Reorder Pages
        </button>
      )}
    </div>
  );
}

export default ReorderTab;
