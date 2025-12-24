import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';
import './CombineTab.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function CombineTab({ initialFiles }) {
  // Mode: 'batch' or 'selective'
  const [mode, setMode] = useState('batch');
  
  // Batch mode state
  const [files, setFiles] = useState([]);
  
  // Selective mode state
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [thumbnails1, setThumbnails1] = useState([]);
  const [thumbnails2, setThumbnails2] = useState([]);
  const [selectedPages1, setSelectedPages1] = useState([]);
  const [selectedPages2, setSelectedPages2] = useState([]);
  const [loadingThumbnails1, setLoadingThumbnails1] = useState(false);
  const [loadingThumbnails2, setLoadingThumbnails2] = useState(false);
  const [pageRange1, setPageRange1] = useState('');
  const [pageRange2, setPageRange2] = useState('');
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Handle initial files passed from global drag-drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const pdfFiles = initialFiles.filter(f => 
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFiles.length > 0) {
        if (pdfFiles.length === 2) {
          // If exactly 2 files, switch to selective mode
          setMode('selective');
          setFile1(pdfFiles[0]);
          setFile2(pdfFiles[1]);
        } else {
          // Otherwise use batch mode
          setFiles(pdfFiles);
        }
        if (window.clearDroppedFiles) {
          window.clearDroppedFiles();
        }
      }
    }
  }, [initialFiles]);

  // Generate thumbnails when files change in selective mode
  useEffect(() => {
    if (file1) {
      generateThumbnails(file1, setThumbnails1, setLoadingThumbnails1, setSelectedPages1);
    } else {
      setThumbnails1([]);
      setSelectedPages1([]);
    }
  }, [file1]);

  useEffect(() => {
    if (file2) {
      generateThumbnails(file2, setThumbnails2, setLoadingThumbnails2, setSelectedPages2);
    } else {
      setThumbnails2([]);
      setSelectedPages2([]);
    }
  }, [file2]);

  const generateThumbnails = async (file, setThumbnails, setLoadingState, setSelectedPages) => {
    setLoadingState(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      
      const thumbs = [];
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.25 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        thumbs.push({
          pageNumber: pageNum,
          dataUrl: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height
        });
      }

      setThumbnails(thumbs);
      // Select all pages by default
      setSelectedPages(thumbs.map(t => t.pageNumber));
    } catch (err) {
      console.error('Error generating thumbnails:', err);
      setError('Failed to generate page previews');
    } finally {
      setLoadingState(false);
    }
  };

  // Batch mode handlers
  const handleFilesSelected = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter(f => f.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setFiles(prevFiles => {
        const newFiles = [...prevFiles, ...pdfFiles];
        const uniqueFiles = newFiles.filter((file, index, self) =>
          index === self.findIndex(f => f.name === file.name && f.size === file.size)
        );
        return uniqueFiles;
      });
      setError(null);
    } else {
      setError('Please select valid PDF files only');
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Selective mode handlers
  const handleFile1Selected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile1(selectedFiles[0]);
      setError(null);
    }
  };

  const handleFile2Selected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile2(selectedFiles[0]);
      setError(null);
    }
  };

  const handlePageClick = (pageNumber, selectedPages, setSelectedPages) => {
    const newSelection = selectedPages.includes(pageNumber)
      ? selectedPages.filter(p => p !== pageNumber)
      : [...selectedPages, pageNumber].sort((a, b) => a - b);
    setSelectedPages(newSelection);
  };

  const handleSelectAll = (thumbnails, selectedPages, setSelectedPages) => {
    if (selectedPages.length === thumbnails.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(thumbnails.map(t => t.pageNumber));
    }
  };

  // Parse page range string like "1-5, 8, 10-15" into array of page numbers
  const parsePageRange = (rangeString, maxPage) => {
    if (!rangeString.trim()) return [];
    
    const pages = new Set();
    const parts = rangeString.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPage) {
          pages.add(num);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const applyPageRange = (rangeString, thumbnails, setSelectedPages, setRangeInput) => {
    const maxPage = thumbnails.length;
    const selectedPages = parsePageRange(rangeString, maxPage);
    if (selectedPages.length > 0) {
      setSelectedPages(selectedPages);
    } else if (rangeString.trim()) {
      setError('Invalid page range. Use format like: 1-5, 8, 10-15');
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

  // Batch combine
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
    formData.append('originalFilename', files[0].name);

    try {
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
      const filename = `${baseName}-combined.pdf`;
      downloadPDF(response.data, filename);
      
      if (window.addRecentFile) {
        window.addRecentFile(filename, 'combine', response.data.size);
      }
      
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

  // Selective combine
  const handleSelectiveCombine = async () => {
    if (!file1 || !file2) {
      setError('Please upload both PDF files');
      return;
    }

    if (selectedPages1.length === 0 && selectedPages2.length === 0) {
      setError('Please select at least one page to combine');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('files', file1);
    formData.append('files', file2);
    formData.append('mode', 'selective');
    formData.append('pages1', JSON.stringify(selectedPages1));
    formData.append('pages2', JSON.stringify(selectedPages2));
    formData.append('originalFilename', file1.name);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/combine', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      const baseName = file1.name.replace('.pdf', '');
      const filename = `${baseName}-merged.pdf`;
      downloadPDF(response.data, filename);
      
      if (window.addRecentFile) {
        window.addRecentFile(filename, 'combine', response.data.size);
      }
      
      window.showToast?.('Selected pages merged successfully!', 'success');
      setFile1(null);
      setFile2(null);
      setThumbnails1([]);
      setThumbnails2([]);
      setSelectedPages1([]);
      setSelectedPages2([]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error merging PDFs';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const renderThumbnailGrid = (thumbnails, selectedPages, setSelectedPages, loading, file, onRemove, pageRange, setPageRange) => {
    if (loading) {
      return (
        <div className="selective-loading">
          <div className="spinner"></div>
          <p>Loading pages...</p>
        </div>
      );
    }

    if (!file) return null;

    return (
      <div className="selective-file-content">
        <div className="selective-file-header">
          <div className="file-info">
            <span className="file-name" title={file.name}>
              {file.name.length > 25 ? file.name.substring(0, 25) + '...' : file.name}
            </span>
            <span className="page-count">
              {selectedPages.length} / {thumbnails.length} pages selected
            </span>
          </div>
          <div className="file-actions">
            <button 
              className="select-all-btn"
              onClick={() => handleSelectAll(thumbnails, selectedPages, setSelectedPages)}
            >
              {selectedPages.length === thumbnails.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              className="remove-file-btn"
              onClick={onRemove}
              title="Remove file"
            >
              🗑️
            </button>
          </div>
        </div>
        
        {/* Page Range Input */}
        <div className="page-range-container">
          <div className="page-range-row">
            <input
              type="text"
              className="page-range-input"
              placeholder="e.g., 1-5, 8, 10-15"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyPageRange(pageRange, thumbnails, setSelectedPages);
                }
              }}
            />
            <button
              className="apply-range-btn"
              onClick={() => applyPageRange(pageRange, thumbnails, setSelectedPages)}
            >
              Apply
            </button>
          </div>
          <p className="page-range-hint">Enter page numbers or ranges (1-{thumbnails.length})</p>
        </div>

        <div className="selective-thumbnails">
          {thumbnails.map((thumb) => (
            <div
              key={thumb.pageNumber}
              className={`selective-thumbnail ${selectedPages.includes(thumb.pageNumber) ? 'selected' : ''}`}
              onClick={() => handlePageClick(thumb.pageNumber, selectedPages, setSelectedPages)}
            >
              <div className="thumbnail-check">
                {selectedPages.includes(thumb.pageNumber) && <span>✓</span>}
              </div>
              <img src={thumb.dataUrl} alt={`Page ${thumb.pageNumber}`} />
              <span className="thumbnail-number">{thumb.pageNumber}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content combine-tab">
      <div className="tab-header">
        <h2>Combine PDFs</h2>
        <p>{mode === 'batch' 
          ? 'Merge multiple PDF files into a single document' 
          : 'Select specific pages from two PDFs to merge'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button 
          className={`mode-btn ${mode === 'batch' ? 'active' : ''}`}
          onClick={() => setMode('batch')}
        >
          <span className="mode-icon">📚</span>
          Batch Mode
        </button>
        <button 
          className={`mode-btn ${mode === 'selective' ? 'active' : ''}`}
          onClick={() => setMode('selective')}
        >
          <span className="mode-icon">✂️</span>
          Selective Mode
        </button>
      </div>

      <ProgressIndicator isLoading={loading} progress={progress} message="Combining PDFs..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {mode === 'batch' ? (
        /* Batch Mode UI */
        <div className="batch-mode">
          <DragDropZone 
            onFilesSelected={handleFilesSelected} 
            multiple 
            label="Drop PDFs here to combine" 
          />
          
          {files.length > 0 && (
            <div className="files-ready">
              <div className="files-ready-header">
                <span className="files-count">{files.length}</span>
                <span>files ready to combine</span>
              </div>
              <FilePreview files={files} onRemoveFile={handleRemoveFile} />
            </div>
          )}

          {!loading && (
            <button
              onClick={handleCombine}
              className="action-button primary-action"
              disabled={files.length < 2}
            >
              <span className="btn-icon">📎</span>
              Combine {files.length > 0 ? `${files.length} PDFs` : 'PDFs'}
            </button>
          )}
        </div>
      ) : (
        /* Selective Mode UI */
        <div className="selective-mode">
          <div className="selective-info">
            <span className="info-icon">💡</span>
            <p>Upload two PDF files, then click on pages to select which ones to include in the merged document.</p>
          </div>

          <div className="selective-container">
            {/* File 1 */}
            <div className="selective-file">
              <div className="selective-file-label">
                <span className="file-number">1</span>
                First Document
              </div>
              {!file1 ? (
                <DragDropZone 
                  onFilesSelected={handleFile1Selected} 
                  multiple={false}
                  label="Upload first PDF" 
                />
              ) : (
                renderThumbnailGrid(
                  thumbnails1, 
                  selectedPages1, 
                  setSelectedPages1, 
                  loadingThumbnails1,
                  file1,
                  () => setFile1(null),
                  pageRange1,
                  setPageRange1
                )
              )}
            </div>

            {/* File 2 */}
            <div className="selective-file">
              <div className="selective-file-label">
                <span className="file-number">2</span>
                Second Document
              </div>
              {!file2 ? (
                <DragDropZone 
                  onFilesSelected={handleFile2Selected} 
                  multiple={false}
                  label="Upload second PDF" 
                />
              ) : (
                renderThumbnailGrid(
                  thumbnails2, 
                  selectedPages2, 
                  setSelectedPages2, 
                  loadingThumbnails2,
                  file2,
                  () => setFile2(null),
                  pageRange2,
                  setPageRange2
                )
              )}
            </div>
          </div>

          {!loading && (
            <button
              onClick={handleSelectiveCombine}
              className="action-button primary-action"
              disabled={!file1 || !file2 || (selectedPages1.length === 0 && selectedPages2.length === 0)}
            >
              <span className="btn-icon">✨</span>
              Merge Selected Pages ({selectedPages1.length + selectedPages2.length} pages)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CombineTab;
