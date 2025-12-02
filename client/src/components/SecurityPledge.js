import React, { useState } from 'react';
import './SecurityPledge.css';

const SecurityPledge = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Security Badge */}
      <button
        className="security-badge"
        onClick={() => setIsOpen(true)}
        title="View Security & Privacy Policy"
        aria-label="Security information"
      >
        🔒
      </button>

      {/* Security Modal */}
      {isOpen && (
        <div className="security-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="security-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="security-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <h2>🔒 Security & Privacy Pledge</h2>

            <div className="security-content">
              <div className="pledge-section">
                <h3>✅ Your Data is Safe</h3>
                <ul>
                  <li>
                    <strong>No Data Collection:</strong> We don't collect, store, or share your personal information
                  </li>
                  <li>
                    <strong>No Account Required:</strong> Use the app without creating an account
                  </li>
                  <li>
                    <strong>No Tracking:</strong> No cookies, trackers, or analytics on your activity
                  </li>
                </ul>
              </div>

              <div className="pledge-section">
                <h3>📄 How Your Files Are Handled</h3>
                <ul>
                  <li>
                    <strong>Temporary Storage:</strong> Files are stored only during processing
                  </li>
                  <li>
                    <strong>Auto-Delete:</strong> Files are automatically deleted after each operation
                  </li>
                  <li>
                    <strong>No Backup:</strong> Processed files are never backed up or archived
                  </li>
                  <li>
                    <strong>Your Control:</strong> You delete files from your device when ready
                  </li>
                </ul>
              </div>

              <div className="pledge-section">
                <h3>🔐 Encryption & Security</h3>
                <ul>
                  <li>
                    <strong>HTTPS Only:</strong> All connections are encrypted with SSL/TLS
                  </li>
                  <li>
                    <strong>No Third Parties:</strong> Files are processed only on our secure servers
                  </li>
                  <li>
                    <strong>PDF Validation:</strong> Only PDF files are accepted and processed
                  </li>
                  <li>
                    <strong>File Size Limits:</strong> Upload limits (200MB) prevent abuse
                  </li>
                </ul>
              </div>

              <div className="pledge-section">
                <h3>👀 Complete Transparency</h3>
                <ul>
                  <li>
                    <strong>Open Source:</strong> Code is available on GitHub for inspection
                  </li>
                  <li>
                    <strong>No Hidden Features:</strong> Everything shown works exactly as described
                  </li>
                  <li>
                    <strong>Audit-Ready:</strong> Simple, auditable code with no malicious behavior
                  </li>
                </ul>
              </div>

              <div className="pledge-section highlight">
                <h3>🎯 Our Promise</h3>
                <p>
                  We respect your privacy and security. Your PDF files are your business—literally. We never:
                </p>
                <ul>
                  <li>❌ Sell your data</li>
                  <li>❌ Track your usage</li>
                  <li>❌ Share your files</li>
                  <li>❌ Store your files permanently</li>
                  <li>❌ Use your files for AI training</li>
                  <li>❌ Display ads or pop-ups</li>
                </ul>
              </div>

              <div className="pledge-section">
                <h3>❓ Questions?</h3>
                <p>
                  For security concerns or questions, visit our GitHub repository:
                  <br />
                  <a href="https://github.com/scmlewis/pdf_processing" target="_blank" rel="noopener noreferrer">
                    github.com/scmlewis/pdf_processing
                  </a>
                </p>
              </div>

              <button className="pledge-close-btn" onClick={() => setIsOpen(false)}>
                ✓ I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecurityPledge;
