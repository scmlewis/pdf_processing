import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PageThumbnailGrid.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function PageThumbnailGrid({ 
  file, 
  selectedPages, 
  onPageSelect,
  onPagesLoad,
  selectionMode = 'multiple', // 'multiple', 'single', 'range'
  showSelectAll = true,
  disabled = false 
}) {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setThumbnails([]);
      return;
    }

    generateThumbnails();
  }, [file]);

  const generateThumbnails = async () => {
    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      
      // Notify parent of total pages
      if (onPagesLoad) {
        onPagesLoad(pageCount);
      }
      
      const thumbs = [];

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.3 });
        
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
    } catch (err) {
      console.error('Error generating thumbnails:', err);
      setError('Failed to generate page previews');
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (disabled) return;

    if (selectionMode === 'single') {
      onPageSelect([pageNumber]);
    } else if (selectionMode === 'multiple') {
      const newSelection = selectedPages.includes(pageNumber)
        ? selectedPages.filter(p => p !== pageNumber)
        : [...selectedPages, pageNumber].sort((a, b) => a - b);
      onPageSelect(newSelection);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;

    if (selectedPages.length === thumbnails.length) {
      onPageSelect([]);
    } else {
      onPageSelect(thumbnails.map(t => t.pageNumber));
    }
  };

  const isSelected = (pageNumber) => selectedPages.includes(pageNumber);
  const allSelected = thumbnails.length > 0 && selectedPages.length === thumbnails.length;

  if (loading) {
    return (
      <div className="thumbnail-grid-loading">
        <div className="spinner"></div>
        <p>Generating page previews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="thumbnail-grid-error">
        <p>{error}</p>
      </div>
    );
  }

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <div className="thumbnail-grid-container">
      {showSelectAll && selectionMode === 'multiple' && (
        <div className="thumbnail-grid-header">
          <button 
            onClick={handleSelectAll}
            className="select-all-btn"
            disabled={disabled}
          >
            {allSelected ? '✓ Deselect All' : 'Select All'}
          </button>
          <span className="selection-count">
            {selectedPages.length} of {thumbnails.length} selected
          </span>
        </div>
      )}

      <div className="thumbnail-grid">
        {thumbnails.map((thumb) => (
          <div
            key={thumb.pageNumber}
            className={`thumbnail-item ${isSelected(thumb.pageNumber) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => handlePageClick(thumb.pageNumber)}
          >
            <div className="thumbnail-checkbox">
              {isSelected(thumb.pageNumber) && <span className="checkmark">✓</span>}
            </div>
            <img 
              src={thumb.dataUrl} 
              alt={`Page ${thumb.pageNumber}`}
              className="thumbnail-image"
            />
            <div className="thumbnail-label">
              {thumb.pageNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageThumbnailGrid;
