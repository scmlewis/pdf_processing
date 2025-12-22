import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFPreviewModal.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function PDFPreviewModal({ isOpen, onClose, pdfBlob, filename }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (isOpen && pdfBlob) {
      loadPDF();
    } else {
      setPages([]);
      setCurrentPage(1);
    }
  }, [isOpen, pdfBlob]);

  const loadPDF = async () => {
    setLoading(true);
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      
      // Load first page initially
      await renderPage(pdf, 1);
    } catch (error) {
      console.error('Error loading PDF preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      setPages([{
        pageNumber: pageNum,
        dataUrl: canvas.toDataURL(),
        width: viewport.width,
        height: viewport.height
      }]);
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setLoading(true);
    
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      await renderPage(pdf, newPage);
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3.0);
    setScale(newScale);
    handlePageChange(currentPage);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
    handlePageChange(currentPage);
  };

  const handleDownload = () => {
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-preview-modal-overlay" onClick={onClose}>
      <div className="pdf-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Preview: {filename}</h3>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="modal-toolbar">
          <div className="page-controls">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              title="Previous page"
            >
              ⬅
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              title="Next page"
            >
              ➡
            </button>
          </div>

          <div className="zoom-controls">
            <button 
              onClick={handleZoomOut}
              disabled={scale <= 0.5 || loading}
              title="Zoom out"
            >
              🔍−
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button 
              onClick={handleZoomIn}
              disabled={scale >= 3.0 || loading}
              title="Zoom in"
            >
              🔍+
            </button>
          </div>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="preview-loading">
              <div className="spinner"></div>
              <p>Loading preview...</p>
            </div>
          ) : pages.length > 0 ? (
            <div className="preview-page">
              <img 
                src={pages[0].dataUrl} 
                alt={`Page ${currentPage}`}
                className="page-image"
              />
            </div>
          ) : (
            <div className="preview-empty">
              <p>No preview available</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            ⬇ Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFPreviewModal;
