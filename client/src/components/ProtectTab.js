import React, { useState } from 'react';
import axios from 'axios';
import DragDropZone from './DragDropZone';
import FilePreview from './FilePreview';
import ProgressIndicator from './ProgressIndicator';
import './TabStyles.css';

function ProtectTab() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowAnnotating, setAllowAnnotating] = useState(false);
  const [allowFillingForms, setAllowFillingForms] = useState(true);
  const [allowContentAccessibility, setAllowContentAccessibility] = useState(true);
  const [allowDocumentAssembly, setAllowDocumentAssembly] = useState(false);

  const handleFileSelect = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleProtect = async () => {
    if (!file) {
      window.showToast('Please select a PDF file', 'error');
      return;
    }

    if (!userPassword && !ownerPassword) {
      window.showToast('Please enter at least one password', 'error');
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('userPassword', userPassword);
    formData.append('ownerPassword', ownerPassword);
    formData.append('allowPrinting', allowPrinting);
    formData.append('allowModifying', allowModifying);
    formData.append('allowCopying', allowCopying);
    formData.append('allowAnnotating', allowAnnotating);
    formData.append('allowFillingForms', allowFillingForms);
    formData.append('allowContentAccessibility', allowContentAccessibility);
    formData.append('allowDocumentAssembly', allowDocumentAssembly);

    try {
      const response = await axios.post('/api/pdf/protect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = file.name.replace('.pdf', '_protected.pdf');
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track in recent files
      if (window.addRecentFile) {
        window.addRecentFile(fileName, 'Protect PDF', file.size);
      }

      window.showToast('PDF protected successfully!', 'success');
      
      // Reset form
      setFile(null);
      setUserPassword('');
      setOwnerPassword('');
    } catch (error) {
      console.error('Error protecting PDF:', error);
      window.showToast(error.response?.data?.message || 'Failed to protect PDF', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Protect PDF</h2>
      <p>Add password protection and set permissions for your PDF</p>

      {!file ? (
          <DragDropZone onFilesSelected={handleFileSelect} maxFiles={1} />
        ) : (
          <>
            <FilePreview files={[file]} onRemove={() => setFile(null)} />
            
            <div className="input-group" style={{ marginTop: '20px' }}>
              <label>User Password</label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Required to open the PDF"
                className="text-input"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.9em', display: 'block', marginTop: '5px' }}>
                Users must enter this password to open and view the PDF
              </small>
            </div>

            <div className="input-group">
              <label>Owner Password (optional)</label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Required to change permissions"
                className="text-input"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.9em', display: 'block', marginTop: '5px' }}>
                Owner password is needed to change document permissions
              </small>
            </div>

            <button
              className="toggle-advanced-button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              type="button"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Permissions
            </button>

            {showAdvanced && (
              <div className="permissions-panel">
                <h4>Document Permissions</h4>
                
                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowPrinting}
                      onChange={(e) => setAllowPrinting(e.target.checked)}
                    />
                    Allow Printing
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowModifying}
                      onChange={(e) => setAllowModifying(e.target.checked)}
                    />
                    Allow Modifying Content
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowCopying}
                      onChange={(e) => setAllowCopying(e.target.checked)}
                    />
                    Allow Copying Text/Images
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowAnnotating}
                      onChange={(e) => setAllowAnnotating(e.target.checked)}
                    />
                    Allow Adding Annotations
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowFillingForms}
                      onChange={(e) => setAllowFillingForms(e.target.checked)}
                    />
                    Allow Filling Form Fields
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowContentAccessibility}
                      onChange={(e) => setAllowContentAccessibility(e.target.checked)}
                    />
                    Allow Content Accessibility (Screen Readers)
                  </label>
                </div>

                <div className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowDocumentAssembly}
                      onChange={(e) => setAllowDocumentAssembly(e.target.checked)}
                    />
                    Allow Document Assembly
                  </label>
                </div>
              </div>
            )}

            {processing && <ProgressIndicator fileName={file.name} />}

            <button
              onClick={handleProtect}
              disabled={processing || (!userPassword && !ownerPassword)}
              className="action-button"
              style={{ marginTop: '20px' }}
            >
              {processing ? 'Protecting PDF...' : 'Protect PDF'}
            </button>
          </>
        )}
    </div>
  );
}

export default ProtectTab;
