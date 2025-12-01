import React from 'react';

export const FileInput = ({ onChange, multiple = false, label = 'Select PDF' }) => {
  return (
    <div className="file-input-wrapper">
      <label htmlFor="file-input" className="file-label">
        {label}
      </label>
      <input
        id="file-input"
        type="file"
        accept=".pdf"
        onChange={onChange}
        multiple={multiple}
        className="file-input"
      />
    </div>
  );
};

export const DownloadButton = ({ url, filename }) => {
  if (!url) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error.message);
    }
  };

  return (
    <button onClick={handleDownload} className="download-button">
      ⬇️ Download Result
    </button>
  );
};

export const LoadingSpinner = () => (
  <div className="spinner">
    <div className="spin"></div>
    <p>Processing...</p>
  </div>
);

export const Alert = ({ message, type = 'info' }) => (
  <div className={`alert alert-${type}`}>
    {message}
  </div>
);
