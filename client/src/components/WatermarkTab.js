import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import ErrorAlert from './ErrorAlert';
import { DownloadButton } from './CommonComponents';
import './TabStyles.css';

function WatermarkTab() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.3);
  const [angle, setAngle] = useState(-45);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleWatermark = async () => {
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
    formData.append('text', text);
    formData.append('fontSize', fontSize);
    formData.append('opacity', opacity);
    formData.append('angle', angle);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const response = await axios.post('/api/pdf/watermark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding watermark. Please check your settings.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="tab-content">
      <h2>Add Watermark</h2>
      <p>Add a text watermark to your PDF</p>

      <ProgressIndicator isLoading={loading} progress={progress} message="Adding watermark..." />
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <DragDropZone onFilesSelected={handleFilesSelected} multiple={false} label="Drag & drop a PDF to watermark" />
      {file && <FilePreview files={[file]} />}

      <div className="input-group" style={{ marginTop: '20px' }}>
        <label>Watermark Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="CONFIDENTIAL"
          className="text-input"
        />
      </div>

      <div className="input-group">
        <label>Font Size: {fontSize}</label>
        <input
          type="range"
          min="20"
          max="100"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="input-group">
        <label>Opacity: {opacity.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <div className="input-group">
        <label>Rotation Angle (degrees)</label>
        <input
          type="number"
          value={angle}
          onChange={(e) => setAngle(parseInt(e.target.value))}
          className="text-input"
        />
      </div>

      {!loading && (
        <>
          <button onClick={handleWatermark} className="action-button" disabled={!file} style={{ marginTop: '20px' }}>
            Add Watermark
          </button>
          {result && <DownloadButton url={result.downloadUrl} filename="watermarked.pdf" />}
        </>
      )}
    </div>
  );
}

export default WatermarkTab;
