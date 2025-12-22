import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import { parsePageRange, validatePageRange, pagesToIndices } from '../utils/pageRangeParser';
import './TabStyles.css';

function ExtractTab() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('1-3,5');
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

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    // Validate page range
    const validation = validatePageRange(pages);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    // Parse page range and convert to 0-based indices
    const pageNumbers = parsePageRange(pages);
    const zeroBasedIndices = pagesToIndices(pageNumbers);
    
    formData.append('pageIndices', JSON.stringify(zeroBasedIndices));
    formData.append('originalFilename', file.name);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      // Automatically download the PDF with original filename + suffix
      const baseName = file.name.replace('.pdf', '');
      const filename = `${baseName}-extracted.pdf`;
      downloadPDF(response.data, filename);
      
      // Add to recent files
      if (window.addRecentFile) {
        window.addRecentFile(filename, 'extract', response.data.size);
      }
      
      window.showToast?.('Pages extracted successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error extracting pages';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Extract Pages</h2>
      <p>Extract specific pages from a PDF</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Extracting pages..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to extract pages" />
      {file && <FilePreview files={[file]} onRemoveFile={() => setFile(null)} />}

      <div className="input-group" style={{ marginTop: '20px' }}>
        <label>Page Numbers (supports ranges, 1-based)</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="1-5,8,10-12"
          className="text-input"
        />
        <small>Example: "1-5,8,10-12" extracts pages 1,2,3,4,5,8,10,11,12</small>
      </div>

      {!loading && (
        <button onClick={handleExtract} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Extract Pages
        </button>
      )}
    </div>
  );
}

export default ExtractTab;
