import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    defaultCompression: 'medium',
    autoDownload: true,
    notificationsEnabled: true,
    darkModeAuto: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pdfProcessorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('pdfProcessorSettings', JSON.stringify(newSettings));
    window.showToast?.(`Setting updated: ${key}`, 'success');
  };

  return (
    <div className="settings-panel-wrapper">
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="settings-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>⚙️ Settings</h2>
              <button
                className="settings-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="settings-content">
              {/* Compression Quality */}
              <div className="settings-group">
                <h3>PDF Compression</h3>
                <label className="settings-option">
                  <span>Default Compression Quality:</span>
                  <select
                    value={settings.defaultCompression}
                    onChange={(e) => handleSettingChange('defaultCompression', e.target.value)}
                  >
                    <option value="high">High (Best Quality)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="low">Low (Smallest File)</option>
                  </select>
                </label>
              </div>

              {/* Behavior Settings */}
              <div className="settings-group">
                <h3>Behavior</h3>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.autoDownload}
                    onChange={(e) => handleSettingChange('autoDownload', e.target.checked)}
                  />
                  <span>Auto-download processed files</span>
                </label>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                  <span>Show toast notifications</span>
                </label>
              </div>

              {/* Theme Settings */}
              <div className="settings-group">
                <h3>Theme</h3>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.darkModeAuto}
                    onChange={(e) => handleSettingChange('darkModeAuto', e.target.checked)}
                  />
                  <span>Auto dark mode (system preference)</span>
                </label>
              </div>

              {/* Storage Info */}
              <div className="settings-group info-group">
                <h3>ℹ️ Information</h3>
                <p className="info-text">
                  • All files are processed on the server
                </p>
                <p className="info-text">
                  • Files are automatically deleted after processing
                </p>
                <p className="info-text">
                  • Settings are saved locally in your browser
                </p>
              </div>
            </div>

            <button
              className="settings-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
