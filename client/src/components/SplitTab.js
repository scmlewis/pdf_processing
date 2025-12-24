import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';

function SplitTab({ initialFiles }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [splitMode, setSplitMode] = useState('single'); // 'single', 'multi', 'range'
  const [pagesPerFile, setPagesPerFile] = useState('1');
  const [pageRange, setPageRange] = useState('1-5');
  const [pageInfo, setPageInfo] = useState(null);

  // Handle initial files passed from global drag-drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const pdfFile = initialFiles.find(f => 
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFile) {
        setFile(pdfFile);
        detectPageCount(pdfFile);
        if (window.clearDroppedFiles) {
          window.clearDroppedFiles();
        }
      }
    }
  }, [initialFiles]);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
      // Try to detect page count
      detectPageCount(selectedFiles[0]);
    }
  };

  const detectPageCount = async (file) => {
    try {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          processFile();
        };
        document.head.appendChild(script);
      } else {
        processFile();
      }

      const processFile = async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          setPageInfo(pdf.numPages);
          setPageRange(`1-${pdf.numPages}`);
        } catch (err) {
          console.log('Could not detect page count');
        }
      };
    } catch (err) {
      console.log('Error detecting page count');
    }
  };

  const handleSplit = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalFilename', file.name);
    formData.append('splitMode', splitMode);
    
    if (splitMode === 'single') {
      formData.append('pagesPerFile', 1);
    } else if (splitMode === 'multi') {
      formData.append('pagesPerFile', parseInt(pagesPerFile));
    } else if (splitMode === 'range') {
      formData.append('pageRange', pageRange);
    }

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/split', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
      window.showToast?.('PDF split successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error splitting PDF';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownloadSplit = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Add to recent files
      if (window.addRecentFile) {
        window.addRecentFile(filename, 'split', blob.size);
      }
    } catch (err) {
      setError('Error downloading file');
    }
  };

  return (
    <div className="tab-content">
      <h2>Split PDF</h2>
      <p>Split a PDF with custom options</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Splitting PDF..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to split" />
      {file && <FilePreview files={[file]} onRemoveFile={() => { setFile(null); setPageInfo(null); }} />}

      {file && !loading && (
        <div className="split-config">
          <div className="config-group">
            <label>Split Mode</label>
            <div className="split-mode-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  value="single" 
                  checked={splitMode === 'single'} 
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Single Page (1 page per file)</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  value="multi" 
                  checked={splitMode === 'multi'} 
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Multiple Pages (custom pages per file)</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  value="range" 
                  checked={splitMode === 'range'} 
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Custom Range (specific page range)</span>
              </label>
            </div>
          </div>

          {splitMode === 'multi' && (
            <div className="config-group">
              <label htmlFor="pagesPerFile">Pages Per File</label>
              <select 
                id="pagesPerFile"
                value={pagesPerFile} 
                onChange={(e) => setPagesPerFile(e.target.value)}
                className="select-input"
              >
                <option value="1">1 page</option>
                <option value="2">2 pages</option>
                <option value="3">3 pages</option>
                <option value="5">5 pages</option>
                <option value="10">10 pages</option>
              </select>
              <small>Each output file will contain this many pages</small>
            </div>
          )}

          {splitMode === 'range' && (
            <div className="config-group">
              <label htmlFor="pageRange">Page Range</label>
              <input
                id="pageRange"
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-10, 15, 20-25"
                className="text-input"
              />
              <small>Examples: "1-5" (pages 1 to 5), "1,3,5" (specific pages), "10-20,25" (multiple ranges)</small>
              {pageInfo && <small>Total pages: {pageInfo}</small>}
            </div>
          )}
        </div>
      )}

      {!loading && (
        <button onClick={handleSplit} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
          Split PDF
        </button>
      )}

      {result && (
        <div className="split-results" style={{ marginTop: '20px' }}>
          <h3>Split Files ({result.files.length})</h3>
          <div className="file-list">
            {result.files.map((filename, idx) => (
              <div key={idx} className="file-item">
                <div className="file-icon">📄</div>
                <div className="file-info" style={{ flex: 1 }}>
                  <p className="file-name">{filename}</p>
                </div>
                <button
                  className="download-btn"
                  onClick={() => handleDownloadSplit(result.downloadUrls[idx], filename)}
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitTab;
