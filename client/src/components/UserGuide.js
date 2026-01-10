import React, { useState } from 'react';
import './UserGuide.css';
import { HelpIcon, CloseIcon, DocumentIcon } from './Icons';

function UserGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const guides = {
    'Combine': {
      description: 'Merge multiple PDF files into one document',
      steps: [
        'Select the "Combine" tab',
        'Upload 2-50 PDF files (up to 200MB each)',
        'Files are combined in the order you selected them',
        'Click "Combine PDFs" to generate the result',
        'Download your merged PDF'
      ]
    },
    'Extract Pages': {
      description: 'Extract specific pages from a PDF document',
      steps: [
        'Select the "Extract Pages" tab',
        'Upload a single PDF file',
        'Enter the page numbers you want to extract (e.g., 1,3,5 or 1-5)',
        'Click "Extract Pages"',
        'Download the new PDF with only your selected pages'
      ]
    },
    'Reorder': {
      description: 'Change the order of pages in your PDF',
      steps: [
        'Select the "Reorder" tab',
        'Upload a PDF file',
        'The pages will be displayed with drag handles',
        'Drag pages to reorder them',
        'Click "Reorder Pages" to apply changes',
        'Download your reordered PDF'
      ]
    },
    'Rotate': {
      description: 'Rotate pages 90°, 180°, or 270°',
      steps: [
        'Select the "Rotate" tab',
        'Upload a PDF file',
        'Enter page numbers to rotate (e.g., 1,3,5)',
        'Select rotation angle: 90°, 180°, or 270°',
        'Click "Rotate Pages"',
        'Download the rotated PDF'
      ]
    },
    'Watermark': {
      description: 'Add text watermark to your PDF pages',
      steps: [
        'Select the "Watermark" tab',
        'Upload a PDF file',
        'Enter the watermark text (e.g., "CONFIDENTIAL")',
        'Select pages to apply watermark (default: all)',
        'Adjust opacity and rotation if needed',
        'Click "Add Watermark"',
        'Download your watermarked PDF'
      ]
    },
    'Compress': {
      description: 'Reduce PDF file size while maintaining quality',
      steps: [
        'Select the "Compress" tab',
        'Upload a PDF file',
        'Choose compression quality level:',
        '  - High: Best quality, larger file',
        '  - Medium: Good balance (recommended)',
        '  - Low: Smallest file, lower quality',
        'Click "Compress PDF"',
        'Download your compressed PDF'
      ]
    },
    'Metadata': {
      description: 'View PDF document information and properties',
      steps: [
        'Select the "Metadata" tab',
        'Upload a PDF file',
        'View document properties such as:',
        '  - Total number of pages',
        '  - Author (if available)',
        '  - Creation date',
        '  - Modification date',
        '  - File size'
      ]
    },
    'Delete Pages': {
      description: 'Remove unwanted pages from your PDF',
      steps: [
        'Select the "Delete Pages" tab',
        'Upload a PDF file',
        'Enter page numbers to delete (e.g., 2,4,6 or 2-5)',
        'Click "Delete Pages"',
        'Download your PDF with selected pages removed'
      ]
    },
    'Split': {
      description: 'Split a PDF into individual pages or by page range',
      steps: [
        'Select the "Split" tab',
        'Upload a PDF file',
        'Choose split method:',
        '  - All pages: Creates separate PDF for each page',
        '  - By range: Creates PDF with specified pages',
        'Click "Split PDF"',
        'Download your split PDF(s)'
      ]
    }
  };

  return (
    <div className="user-guide-container">
      <button 
        className="guide-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to view user instructions"
      >
        <HelpIcon className="help-icon" />
      </button>

      {isExpanded && (
        <div className="guide-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="guide-panel" onClick={(e) => e.stopPropagation()}>
            <div className="guide-header">
              <div className="guide-header-content">
                <DocumentIcon className="guide-header-icon" />
                <div>
                  <h2>PDF Processor User Guide</h2>
                  <p className="guide-subtitle">Learn how to use each feature</p>
                </div>
              </div>
              <button 
                className="guide-close-x"
                onClick={() => setIsExpanded(false)}
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="guide-content">
              <div className="guide-intro">
                <h3>Getting Started</h3>
                <ul>
                  <li><strong>File Limits:</strong> Upload up to 200MB per file, maximum 50 files for combine operation</li>
                  <li><strong>Supported Format:</strong> Only PDF files (.pdf) are accepted</li>
                  <li><strong>Privacy:</strong> All files are processed on the server and deleted after the operation</li>
                  <li><strong>Dark Mode:</strong> Click the moon icon in the top-right corner to toggle dark/light theme</li>
                  <li><strong>Download:</strong> Your processed file will download automatically when ready</li>
                </ul>
              </div>

              <div className="guide-features">
                <h3>Feature Guides</h3>
                <div className="features-grid">
                  {Object.entries(guides).map(([feature, guide]) => (
                    <div key={feature} className="feature-card">
                      <div className="feature-title">{feature}</div>
                      <p className="feature-description">{guide.description}</p>
                      <ol className="feature-steps">
                        {guide.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>

              <div className="guide-tips">
                <h3>💡 Pro Tips</h3>
                <ul>
                  <li>Use "Extract Pages" to remove unnecessary content and reduce file size</li>
                  <li>Use "Metadata" to check document properties before processing</li>
                  <li>For large files, use "Compress" to reduce file size significantly</li>
                  <li>When combining multiple files, they are merged in the order you select them</li>
                  <li>Page numbers are 1-indexed (first page is page 1, not 0)</li>
                  <li>For page ranges, use format like "1-5" or "1,3,5-7"</li>
                </ul>
              </div>

              <div className="guide-limits">
                <h3>⚙️ Limits & Specifications</h3>
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Max File Size</strong></td>
                      <td>200 MB per file</td>
                    </tr>
                    <tr>
                      <td><strong>Combine Operation</strong></td>
                      <td>Maximum 50 files</td>
                    </tr>
                    <tr>
                      <td><strong>File Format</strong></td>
                      <td>PDF only (.pdf)</td>
                    </tr>
                    <tr>
                      <td><strong>Processing</strong></td>
                      <td>Server-side, secure</td>
                    </tr>
                    <tr>
                      <td><strong>Storage</strong></td>
                      <td>Files deleted after processing</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="guide-troubleshoot">
                <h3>❓ Troubleshooting</h3>
                <ul>
                  <li><strong>Upload fails:</strong> Check file size is under 200MB and format is PDF</li>
                  <li><strong>Processing slow:</strong> Large files take longer; please wait</li>
                  <li><strong>Invalid page numbers:</strong> Ensure page numbers don't exceed total pages</li>
                  <li><strong>Download doesn't start:</strong> Check browser download settings; try refreshing</li>
                  <li><strong>Need help?</strong> Check the feature guide above or contact support</li>
                </ul>
              </div>

              <div className="guide-security">
                <h3>🔒 Security & Privacy Pledge</h3>
                
                <div className="security-subsection">
                  <h4>✅ Your Data is Safe</h4>
                  <ul>
                    <li><strong>No Data Collection:</strong> We don't collect, store, or share your personal information</li>
                    <li><strong>No Account Required:</strong> Use the app without creating an account</li>
                    <li><strong>No Tracking:</strong> No cookies, trackers, or analytics on your activity</li>
                  </ul>
                </div>

                <div className="security-subsection">
                  <h4>📄 How Your Files Are Handled</h4>
                  <ul>
                    <li><strong>Temporary Storage:</strong> Files are stored only during processing</li>
                    <li><strong>Auto-Delete:</strong> Files are automatically deleted after each operation</li>
                    <li><strong>No Backup:</strong> Processed files are never backed up or archived</li>
                    <li><strong>Your Control:</strong> You delete files from your device when ready</li>
                  </ul>
                </div>

                <div className="security-subsection">
                  <h4>🔐 Encryption & Security</h4>
                  <ul>
                    <li><strong>HTTPS Only:</strong> All connections are encrypted with SSL/TLS</li>
                    <li><strong>No Third Parties:</strong> Files are processed only on our secure servers</li>
                    <li><strong>PDF Validation:</strong> Only PDF files are accepted and processed</li>
                    <li><strong>File Size Limits:</strong> Upload limits (200MB) prevent abuse</li>
                  </ul>
                </div>

                <div className="security-subsection">
                  <h4>👀 Complete Transparency</h4>
                  <ul>
                    <li><strong>Open Source:</strong> Code is available on <a href="https://github.com/scmlewis/pdf_processing" target="_blank" rel="noopener noreferrer">GitHub</a> for inspection</li>
                    <li><strong>No Hidden Features:</strong> Everything shown works exactly as described</li>
                    <li><strong>Audit-Ready:</strong> Simple, auditable code with no malicious behavior</li>
                  </ul>
                </div>

                <div className="security-subsection highlight">
                  <h4>🎯 Our Promise</h4>
                  <p>We respect your privacy and security. Your PDF files are your business—literally. We never:</p>
                  <ul>
                    <li>❌ Sell your data</li>
                    <li>❌ Track your usage</li>
                    <li>❌ Share your files</li>
                    <li>❌ Store your files permanently</li>
                    <li>❌ Use your files for AI training</li>
                    <li>❌ Display ads or pop-ups</li>
                  </ul>
                </div>
              </div>
            </div>

            <button 
              className="guide-close"
              onClick={() => setIsExpanded(false)}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserGuide;
