import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import './TabStyles.css';
import './ConvertTab.css';

function ConvertTab({ initialFiles }) {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('markdown'); // 'text' or 'markdown'
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { content, pageCount, info }
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  // Handle initial files passed from global drag-drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const pdfFile = initialFiles.find(f => 
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFile) {
        setFile(pdfFile);
        setResult(null);
        if (window.clearDroppedFiles) {
          window.clearDroppedFiles();
        }
      }
    }
  }, [initialFiles]);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalFilename', file.name);

    const endpoint = format === 'markdown' ? '/api/pdf/convert-markdown' : '/api/pdf/convert-text';

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);

      const content = format === 'markdown' ? response.data.markdown : response.data.text;
      setResult({
        content,
        pageCount: response.data.pageCount,
        info: response.data.info
      });

      window.showToast?.(`PDF converted to ${format === 'markdown' ? 'Markdown' : 'text'} successfully!`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error converting PDF';
      window.showToast?.(errMsg, 'error');
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCopy = async () => {
    if (!result?.content) return;
    try {
      await navigator.clipboard.writeText(result.content);
      window.showToast?.('Copied to clipboard!', 'success');
    } catch (err) {
      window.showToast?.('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    if (!result?.content) return;
    
    const extension = format === 'markdown' ? 'md' : 'txt';
    const mimeType = format === 'markdown' ? 'text/markdown' : 'text/plain';
    const baseName = file?.name?.replace(/\.pdf$/i, '') || 'document';
    const filename = `${baseName}.${extension}`;
    
    const blob = new Blob([result.content], { type: `${mimeType};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    window.showToast?.(`Downloaded ${filename}`, 'success');
  };

  const handlePreviewHtml = () => {
    setShowHtmlPreview(true);
  };

  const closeHtmlPreview = () => {
    setShowHtmlPreview(false);
  };

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (md) => {
    if (!md) return '';
    return md
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getCharCount = (text) => {
    if (!text) return 0;
    return text.length;
  };

  return (
    <div className="tab-content">
      <h2>Convert PDF</h2>
      <p>Convert PDF to plain text or Markdown format</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Converting PDF..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone 
        onFilesSelected={handleFilesSelected} 
        multiple={false} 
        label="Drag and drop a PDF file here, or click to select"
      />

      <div className="format-selector">
        <label>Output Format:</label>
        <select 
          value={format} 
          onChange={(e) => {
            setFormat(e.target.value);
            setResult(null);
          }}
          disabled={loading}
        >
          <option value="markdown">Markdown (.md)</option>
          <option value="text">Plain Text (.txt)</option>
        </select>
      </div>

      {file && (
        <FilePreview 
          files={[file]} 
          onRemoveFile={handleRemoveFile}
        />
      )}

      {!loading && !result && (
        <button 
          onClick={handleConvert} 
          className="action-button"
          disabled={!file}
        >
          Convert to {format === 'markdown' ? 'Markdown' : 'Text'}
        </button>
      )}

      {result && (
        <div className="convert-result">
          <div className="result-header">
            <h3>Converted {format === 'markdown' ? 'Markdown' : 'Text'}</h3>
            <div className="result-actions">
              {format === 'markdown' && (
                <button 
                  className="result-btn preview-btn"
                  onClick={handlePreviewHtml}
                >
                  Preview HTML
                </button>
              )}
              <button 
                className="result-btn copy-btn"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button 
                className="result-btn download-btn"
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
          
          <div className="result-stats">
            <span>{result.pageCount} page{result.pageCount !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{getWordCount(result.content).toLocaleString()} words</span>
            <span>•</span>
            <span>{getCharCount(result.content).toLocaleString()} characters</span>
          </div>
          
          <textarea 
            className="result-content"
            value={result.content}
            readOnly
            rows={15}
          />

          <div className="result-footer">
            <button 
              className="action-button secondary"
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
            >
              Convert Another
            </button>
          </div>
        </div>
      )}

      {/* HTML Preview Modal for Markdown */}
      {showHtmlPreview && format === 'markdown' && result && (
        <div className="html-preview-overlay" onClick={closeHtmlPreview}>
          <div className="html-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="html-preview-header">
              <h3>HTML Preview</h3>
              <button className="close-btn" onClick={closeHtmlPreview}>×</button>
            </div>
            <div 
              className="html-preview-content"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(result.content) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConvertTab;
