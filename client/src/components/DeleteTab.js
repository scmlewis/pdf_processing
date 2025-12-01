import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function DeleteTab() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('0');
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

  const handleDelete = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageIndices', JSON.stringify(pages.split(',').map(p => parseInt(p.trim()))));

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/delete-pages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      downloadPDF(response.data, 'modified.pdf');
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting pages. Please check your page indices.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Delete Pages</h2>
      <p>Remove specific pages from a PDF</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Deleting pages..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to delete pages" />
      {file && <FilePreview files={[file]} />}

      <div className="input-group" style={{ marginTop: '20px' }}>
        <label>Page Indices to Delete (comma-separated, 0-based)</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="0,1"
          className="text-input"
        />
        <small>Example: "0,2" deletes pages 1 and 3</small>
      </div>

      {!loading && (
        <button onClick={handleDelete} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Delete Pages
        </button>
      )}
    </div>
  );
}

export default DeleteTab;
