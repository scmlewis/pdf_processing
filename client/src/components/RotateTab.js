import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import PageThumbnailGrid from './PageThumbnailGrid';
import PageRangePresets from './PageRangePresets';
import PDFPreviewModal from './PDFPreviewModal';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import { parsePageRange, validatePageRange, pagesToIndices } from '../utils/pageRangeParser';
import { savePDF } from '../utils/pdfStorage';
import './TabStyles.css';

function RotateTab({ initialFiles }) {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('1');
  const [selectedPages, setSelectedPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [angle, setAngle] = useState(90);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewFilename, setPreviewFilename] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Handle initial files passed from global drag-drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const pdfFile = initialFiles.find(f => 
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFile) {
        setFile(pdfFile);
        setPages('1');
        setSelectedPages([]);
        if (window.clearDroppedFiles) {
          window.clearDroppedFiles();
        }
      }
    }
  }, [initialFiles]);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setPages('1');
      setSelectedPages([]);
      setError(null);
    }
  };

  // Sync text input to thumbnail selection
  const handlePagesChange = (value) => {
    setPages(value);
    const validation = validatePageRange(value);
    if (validation.valid) {
      const pageNumbers = parsePageRange(value);
      setSelectedPages(pageNumbers);
    }
  };

  // Sync thumbnail selection to text input
  const handlePageSelect = (pages) => {
    setSelectedPages(pages);
    if (pages.length > 0) {
      const sorted = [...pages].sort((a, b) => a - b);
      setPages(sorted.join(','));
    } else {
      setPages('');
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

    if (selectedPages.length === 0) {
      setError('Please select at least one page to rotate');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    // Convert page numbers to 0-based indices
    const zeroBasedIndices = pagesToIndices(selectedPages);
    
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
      
      // Store blob and show preview instead of downloading immediately
      const baseName = file.name.replace('.pdf', '');
      const filename = `${baseName}-rotated.pdf`;
      setPreviewBlob(response.data);
      setPreviewFilename(filename);
      setShowPreview(true);
      
      // Save to IndexedDB for re-download
      await savePDF(filename, response.data, 'rotate');
      
      // Add to recent files
      if (window.addRecentFile) {
        window.addRecentFile(filename, 'rotate', response.data.size);
      }
      
      window.showToast?.('Pages rotated successfully! Preview your PDF.', 'success');
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
      {file && <FilePreview files={[file]} onRemoveFile={() => setFile(null)} />}

      {file && (
        <>
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label>Page Numbers (supports ranges, 1-based)</label>
            <input
              type="text"
              value={pages}
              onChange={(e) => handlePagesChange(e.target.value)}
              placeholder="1-3,5"
              className="text-input"
            />
            <small>Example: "1-3,5" rotates pages 1,2,3,5. Or use thumbnails below to select pages visually.</small>
          </div>

          <PageRangePresets
            totalPages={totalPages}
            onSelectPreset={handlePageSelect}
            disabled={loading}
          />
          <PageThumbnailGrid
            file={file}
            selectedPages={selectedPages}
            onPageSelect={handlePageSelect}
            onPagesLoad={(count) => setTotalPages(count)}
            selectionMode="multiple"
            showSelectAll={true}
            disabled={loading}
          />

          <div className="input-group">
            <label>Rotation Angle (degrees)</label>
            <select value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="text-input">
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </div>
        </>
      )}

      {!loading && (
        <button onClick={handleRotate} className="action-button" disabled={!file || selectedPages.length === 0} style={{ marginTop: '20px' }}>
          Rotate {selectedPages.length > 0 ? `${selectedPages.length} Page${selectedPages.length > 1 ? 's' : ''}` : 'Pages'}
        </button>
      )}

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        pdfBlob={previewBlob}
        filename={previewFilename}
      />
    </div>
  );
}

export default RotateTab;
