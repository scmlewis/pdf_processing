import React, { useState } from 'react';
import './DragDropZone.css';
import { validateFiles, formatFileSize, MAX_FILE_SIZE, MAX_FILE_COUNT } from '../utils/fileValidation';

const DragDropZone = ({ onFilesSelected, accept = '.pdf', multiple = true, label = 'Drag & drop your PDFs here or click to browse' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      if (window.showToast) {
        window.showToast('Please drop PDF files only', 'error');
      } else {
        alert('Please drop PDF files only');
      }
      return;
    }

    // Validate files
    const validation = validateFiles(pdfFiles);
    if (!validation.valid) {
      if (window.showToast) {
        window.showToast(validation.error, 'error');
      } else {
        alert(validation.error);
      }
      return;
    }
    
    onFilesSelected(pdfFiles);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate files
      const validation = validateFiles(files);
      if (!validation.valid) {
        if (window.showToast) {
          window.showToast(validation.error, 'error');
        } else {
          alert(validation.error);
        }
        e.target.value = ''; // Reset input
        return;
      }

      onFilesSelected(files);
      e.target.value = ''; // Reset for next selection
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <div className="drag-drop-content">
        <div className="drag-drop-icon">📥</div>
        <p className="drag-drop-label">{label}</p>
        <p className="drag-drop-hint">PDF files only • Max {formatFileSize(MAX_FILE_SIZE)} per file • Max {MAX_FILE_COUNT} files</p>
      </div>
    </div>
  );
};

export default DragDropZone;
