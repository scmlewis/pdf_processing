import React, { useState, useEffect } from 'react';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
import UserGuide from './components/UserGuide';
import SecurityPledge from './components/SecurityPledge';
import Toast from './components/Toast';
import CombineTab from './components/CombineTab';
import ExtractTab from './components/ExtractTab';
import ReorderTab from './components/ReorderTab';
import RotateTab from './components/RotateTab';
import WatermarkTab from './components/WatermarkTab';
import CompressTab from './components/CompressTab';
import MetadataTab from './components/MetadataTab';
import SplitTab from './components/SplitTab';
import DeleteTab from './components/DeleteTab';

function App() {
  const [activeTab, setActiveTab] = useState('combine');
  const [toast, setToast] = useState(null);

  const tabs = [
    { id: 'combine', label: '📎 Combine', component: CombineTab, shortcut: '1' },
    { id: 'extract', label: '✂️ Extract', component: ExtractTab, shortcut: '2' },
    { id: 'reorder', label: '↕️ Reorder', component: ReorderTab, shortcut: '3' },
    { id: 'rotate', label: '🔄 Rotate', component: RotateTab, shortcut: '4' },
    { id: 'watermark', label: '💧 Watermark', component: WatermarkTab, shortcut: '5' },
    { id: 'compress', label: '📦 Compress', component: CompressTab, shortcut: '6' },
    { id: 'metadata', label: '📋 Metadata', component: MetadataTab, shortcut: '7' },
    { id: 'split', label: '⚡ Split', component: SplitTab, shortcut: '8' },
    { id: 'delete', label: '🗑️ Delete', component: DeleteTab, shortcut: '9' }
  ];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in an input (avoid conflicts)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Number keys (1-9) to switch tabs
      if (e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex < tabs.length) {
          setActiveTab(tabs[tabIndex].id);
        }
      }

      // Ctrl+Space to toggle theme
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        document.querySelector('.theme-toggle')?.click();
      }

      // ? to open help
      if (e.key === '?') {
        e.preventDefault();
        document.querySelector('.help-button')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tabs]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Expose toast to window for child components
  useEffect(() => {
    window.showToast = showToast;
  }, []);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="app">
      <ThemeToggle />
      <UserGuide />
      <SecurityPledge />
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="container">
        <header className="header">
          <h1>📄 PDF Processor</h1>
          <p>Process, combine, and manipulate your PDF files with ease</p>
        </header>

        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={`${tab.label} (Press ${tab.shortcut})`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content">
          {ActiveComponent && <ActiveComponent onToast={showToast} />}
        </div>
      </div>
    </div>
  );
}

export default App;
