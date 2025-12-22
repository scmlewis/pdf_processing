import React from 'react';
import './PageThumbnails.css';

/**
 * PageThumbnails Component
 * Displays a grid of PDF page thumbnails with page numbers
 */
const PageThumbnails = ({ pages, selectedPages, onPageClick, multiSelect = false }) => {
  const handleClick = (pageIndex) => {
    if (onPageClick) {
      onPageClick(pageIndex);
    }
  };

  const isSelected = (pageIndex) => {
    if (!selectedPages) return false;
    return Array.isArray(selectedPages) 
      ? selectedPages.includes(pageIndex)
      : selectedPages === pageIndex;
  };

  return (
    <div className="thumbnails-container">
      <div className="thumbnails-grid">
        {pages.map((page, index) => (
          <div
            key={index}
            className={`thumbnail-item ${isSelected(index) ? 'selected' : ''}`}
            onClick={() => handleClick(index)}
            style={{ cursor: onPageClick ? 'pointer' : 'default' }}
          >
            <div 
              className="thumbnail-placeholder"
              style={{
                width: page.width || 150,
                height: page.height || 200,
                maxWidth: '200px',
                maxHeight: '280px'
              }}
            >
              <div className="thumbnail-content">
                <svg 
                  viewBox="0 0 100 140" 
                  className="pdf-icon"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="140" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
                  <text x="50" y="70" textAnchor="middle" fontSize="14" fill="#666">
                    PDF
                  </text>
                  <text x="50" y="90" textAnchor="middle" fontSize="12" fill="#999">
                    Page {index + 1}
                  </text>
                </svg>
              </div>
            </div>
            <div className="thumbnail-label">
              {multiSelect && (
                <input
                  type="checkbox"
                  checked={isSelected(index)}
                  onChange={() => handleClick(index)}
                  onClick={(e) => e.stopPropagation()}
                  className="thumbnail-checkbox"
                />
              )}
              <span className="page-number">Page {index + 1}</span>
              <span className="page-dimensions">
                {Math.round(page.originalWidth || page.width)}×{Math.round(page.originalHeight || page.height)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageThumbnails;
