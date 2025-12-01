import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import { DownloadButton } from './CommonComponents';
import './TabStyles.css';

function ReorderTab() {
  const [file, setFile] = useState(null);
  const [newOrder, setNewOrder] = useState('0,1,2');
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

  const handleReorder = async () => {
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
    formData.append('newOrder', JSON.stringify(newOrder.split(',').map(p => parseInt(p.trim()))));

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/reorder', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error reordering pages. Please check your page order.');
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
        <>
          <button onClick={handleReorder} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
            Reorder Pages
          </button>
          {result && <DownloadButton url={result.downloadUrl} filename="reordered.pdf" />}
        </>
      )}
    </div>
  );
}

export default ReorderTab;
