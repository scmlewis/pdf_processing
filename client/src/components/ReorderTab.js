import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import * as pdfjsLib from 'pdfjs-dist';
import './TabStyles.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function ReorderTab() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [manualOrder, setManualOrder] = useState('');
  const [useManual, setUseManual] = useState(false);
  const droppableRef = useRef(null);

  const handleFilesSelected = async (selectedFiles) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setError(null);
      setPages([]);
      await loadPDFInfo(selectedFile);
    }
  };

  const loadPDFInfo = async (pdfFile) => {
    setLoadingInfo(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pageList = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.3 });
        
        // Render page to canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        pageList.push({
          id: `page-${pageNum - 1}`,
          index: pageNum - 1,
          pageNumber: pageNum,
          width: viewport.width,
          height: viewport.height,
          thumbnail: canvas.toDataURL()
        });
      }
      
      setPages(pageList);
    } catch (err) {
      console.error('Failed to load PDF info:', err);
      setError('Failed to load PDF information');
    } finally {
      setLoadingInfo(false);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    console.log('Drag ended:', { source, destination });
    
    // If dropped outside a valid droppable area, do nothing
    if (!destination) {
      return;
    }
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index) {
      return;
    }

    // Reorder the pages array
    const newPages = Array.from(pages);
    const draggedPage = newPages[source.index];
    newPages.splice(source.index, 1);
    newPages.splice(destination.index, 0, draggedPage);

    console.log('New order:', newPages.map(p => p.pageNumber));
    setPages(newPages);
  };

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    console.log('Drag started:', index);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    console.log('Dropped on index:', dropIndex, 'from:', draggedIndex);
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPages = Array.from(pages);
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(dropIndex, 0, draggedPage);

    setPages(newPages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedIndex(null);
  };

  const movePageUp = (index) => {
    if (index <= 0) return;
    const items = Array.from(pages);
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    setPages(items);
  };

  const movePageDown = (index) => {
    if (index >= pages.length - 1) return;
    const items = Array.from(pages);
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setPages(items);
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
    
    // Add to recent files
    if (window.addRecentFile) {
      window.addRecentFile(filename, 'reorder', blob.size);
    }
  };

  const handleReorder = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    const orderArray = useManual
      ? manualOrder.split(',').map(p => parseInt(p.trim()))
      : pages.map(page => page.index);

    if (orderArray.some(isNaN)) {
      setError('Invalid page order. Use comma-separated numbers.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('newOrder', JSON.stringify(orderArray));
    formData.append('originalFilename', file.name);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/reorder', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(response.data, `${baseName}-reordered.pdf`);
      window.showToast?.('Pages reordered successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error reordering pages';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Reorder Pages</h2>
      <p>Rearrange pages by dragging and dropping or entering a custom order</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Reordering pages..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to reorder" />
      {file && <FilePreview files={[file]} onRemoveFile={() => { setFile(null); setPages([]); }} />}

      {loadingInfo && <div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF pages...</div>}

      {pages.length > 0 && (
        <>
          <div className="toggle-section" style={{ marginTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => setUseManual(e.target.checked)}
              />
              Use manual order (comma-separated indices)
            </label>
          </div>

          {useManual ? (
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>Page Order (comma-separated, 0-based)</label>
              <input
                type="text"
                value={manualOrder}
                onChange={(e) => setManualOrder(e.target.value)}
                placeholder={`0,1,2,...${pages.length - 1}`}
                className="text-input"
              />
              <small>Example: "2,1,0" reverses the first 3 pages. Indices from 0 to {pages.length - 1}</small>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Reorder pages (drag vertically or use arrow buttons):</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Pages loaded: {pages.length} | Dragging: {draggedIndex !== null ? `Page ${draggedIndex + 1}` : 'None'}
              </p>
              <div
                ref={droppableRef}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '2px dashed var(--border-color)',
                  minHeight: '300px',
                  maxHeight: '700px',
                  overflowY: 'auto'
                }}
              >
                {pages.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pages loaded
                  </div>
                ) : (
                  pages.map((page, index) => (
                    <div
                      key={page.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        padding: '12px',
                        background: draggedIndex === index ? 'var(--primary-color)' : 'var(--bg-primary)',
                        border: '2px solid',
                        borderColor: draggedIndex === index ? 'var(--primary-color)' : 'var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '12px',
                        userSelect: 'none',
                        boxShadow: draggedIndex === index ? '0 12px 24px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                        cursor: 'move',
                        opacity: draggedIndex === index ? 0.85 : 1
                      }}
                    >
                      {/* Drag Handle */}
                      <div
                        style={{
                          cursor: 'grab',
                          padding: '8px 6px',
                          borderRadius: '4px',
                          background: draggedIndex === index ? 'var(--primary-color)' : 'var(--bg-secondary)',
                          color: draggedIndex === index ? 'white' : 'var(--text-muted)',
                          fontSize: '18px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '40px',
                          userSelect: 'none'
                        }}
                        title="Drag to reorder"
                      >
                        ⋮⋮
                      </div>

                      {/* Thumbnail */}
                      <img 
                        src={page.thumbnail} 
                        alt={`Page ${page.pageNumber}`}
                        draggable={false}
                        style={{
                          width: '80px',
                          minWidth: '80px',
                          height: 'auto',
                          borderRadius: '4px',
                          background: 'var(--bg-primary)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          pointerEvents: 'none',
                          border: '1px solid var(--border-color)'
                        }}
                      />

                      {/* Page Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: draggedIndex === index ? 'white' : 'var(--text-primary)' }}>
                          Page {page.pageNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: draggedIndex === index ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', marginBottom: '6px' }}>
                          Position: {index + 1} of {pages.length} • Index: {page.index}
                        </div>
                      </div>

                      {/* Arrow Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          style={{
                            padding: '8px 10px',
                            background: index === 0 ? 'var(--bg-secondary)' : 'var(--primary-color)',
                            color: index === 0 ? 'var(--text-muted)' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            opacity: index === 0 ? 0.5 : 1
                          }}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePageDown(index)}
                          disabled={index === pages.length - 1}
                          style={{
                            padding: '8px 10px',
                            background: index === pages.length - 1 ? 'var(--bg-secondary)' : 'var(--primary-color)',
                            color: index === pages.length - 1 ? 'var(--text-muted)' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: index === pages.length - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            opacity: index === pages.length - 1 ? 0.5 : 1
                          }}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Current order: {pages.map(p => p.index).join(', ')}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && (
        <button onClick={handleReorder} className="action-button" disabled={!file || pages.length === 0} style={{ marginTop: '20px' }}>
          Reorder Pages
        </button>
      )}
    </div>
  );
}

export default ReorderTab;
