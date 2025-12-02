import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function CombineTab() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter(f => f.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
      setError(null);
    } else {
      setError('Please select valid PDF files only');
    }
  };

  const downloadPDF = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCombine = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    // Send first filename for naming the output
    formData.append('originalFilename', files[0].name);

    try {
      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/combine', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      const baseName = files[0].name.replace('.pdf', '');
      downloadPDF(response.data, `${baseName}-combined.pdf`);
      window.showToast?.('PDFs combined successfully!', 'success');
      setFiles([]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error combining PDFs';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="tab-content">
      <h2>Combine Multiple PDFs</h2>
      <p>Merge multiple PDF files into a single document</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Combining PDFs..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple label="Drag & drop PDFs to combine" />
      <FilePreview files={files} onRemoveFile={handleRemoveFile} />

      {!loading && (
        <button
          onClick={handleCombine}
          className="action-button"
          disabled={files.length < 2}
          style={{ marginTop: '20px' }}
        >
          Combine PDFs
        </button>
      )}
    </div>
  );
}

export default CombineTab;
