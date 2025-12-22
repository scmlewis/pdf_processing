import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import './TabStyles.css';

function AddPageNumbersTab() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [position, setPosition] = useState('bottom-right');
  const [format, setFormat] = useState('number');
  const [startNumber, setStartNumber] = useState(1);
  const [pageRange, setPageRange] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);

  const handleFileSelect = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleAddPageNumbers = async () => {
    if (!file) {
      window.showToast('Please select a PDF file', 'error');
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('position', position);
    formData.append('format', format);
    formData.append('startNumber', startNumber);
    formData.append('pageRange', pageRange);
    formData.append('fontSize', fontSize);
    formData.append('margin', margin);

    try {
      const response = await axios.post('/api/pdf/add-page-numbers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = file.name.replace('.pdf', '_numbered.pdf');
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track in recent files
      if (window.addRecentFile) {
        window.addRecentFile(fileName, 'Add Page Numbers', file.size);
      }

      window.showToast('Page numbers added successfully!', 'success');
      
      // Reset form
      setFile(null);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      window.showToast(error.response?.data?.message || 'Failed to add page numbers', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Add Page Numbers</h2>
      <p>Add page numbers to your PDF with custom positioning and formatting</p>

      {!file ? (
          <DragDropZone onFilesSelected={handleFileSelect} maxFiles={1} />
        ) : (
          <>
            <FilePreview files={[file]} onRemove={() => setFile(null)} />
            
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>Position</label>
              <select 
                value={position} 
                onChange={(e) => setPosition(e.target.value)}
                className="text-input"
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="input-group">
              <label>Format</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="text-input"
              >
                <option value="number">Number (1, 2, 3...)</option>
                <option value="page-of-total">Page X of Y</option>
                <option value="page-number">Page X</option>
              </select>
            </div>

            <div className="input-group">
              <label>Start Number</label>
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="text-input"
              />
            </div>

            <div className="input-group">
              <label>Page Range (optional)</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g., 1-5,8,10-12 (leave empty for all)"
                className="text-input"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.9em', display: 'block', marginTop: '5px' }}>
                Leave empty to add numbers to all pages
              </small>
            </div>

            <div className="input-group">
              <label>Font Size: {fontSize}pt</label>
              <input
                type="range"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                min="6"
                max="24"
                className="slider"
              />
            </div>

            <div className="input-group">
              <label>Margin: {margin}pt</label>
              <input
                type="range"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                min="10"
                max="50"
                className="slider"
              />
            </div>

            {processing && <ProgressIndicator fileName={file.name} />}

            <button
              onClick={handleAddPageNumbers}
              disabled={processing}
              className="action-button"
              style={{ marginTop: '20px' }}
            >
              {processing ? 'Adding Page Numbers...' : 'Add Page Numbers'}
            </button>
          </>
        )}
    </div>
  );
}

export default AddPageNumbersTab;
