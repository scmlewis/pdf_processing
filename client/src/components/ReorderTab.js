import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function ReorderTab() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [manualOrder, setManualOrder] = useState('');
  const [useManual, setUseManual] = useState(false);

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
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await axios.post('/api/pdf/info', formData);
      const pageList = response.data.pages.map((page, index) => ({
        id: `page-${index}`,
        index,
        pageNumber: page.pageNumber,
        width: page.width,
        height: page.height
      }));
      setPages(pageList);
    } catch (err) {
      console.error('Failed to load PDF info:', err);
      setError('Failed to load PDF information');
    } finally {
      setLoadingInfo(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

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
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Drag pages to reorder:</h3>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pages" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        padding: '16px',
                        background: snapshot.isDraggingOver ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                        borderRadius: '8px',
                        border: '2px dashed var(--border-color)',
                        minHeight: '200px'
                      }}
                    >
                      {pages.map((page, index) => (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                padding: '12px',
                                background: snapshot.isDragging ? 'var(--primary-light)' : 'white',
                                border: '2px solid',
                                borderColor: snapshot.isDragging ? 'var(--primary-color)' : 'var(--border-color)',
                                borderRadius: '8px',
                                width: '150px',
                                textAlign: 'center',
                                cursor: 'grab',
                                userSelect: 'none',
                                boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
                                transition: 'box-shadow 0.2s'
                              }}
                            >
                              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                Page {page.pageNumber}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {Math.round(page.width)}×{Math.round(page.height)}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Index: {page.index}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Current order: {pages.map(p => p.index).join(', ')}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && file && pages.length > 0 && (
        <button onClick={handleReorder} className="action-button" style={{ marginTop: '20px' }}>
          Reorder Pages
        </button>
      )}
    </div>
  );
}

export default ReorderTab;
