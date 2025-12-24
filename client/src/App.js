import React, { useState, useEffect } from 'react';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
import UserGuide from './components/UserGuide';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import RecentFiles from './components/RecentFiles';
import HomePage from './components/HomePage';
import ToolHeader from './components/ToolHeader';
import ToolPickerModal from './components/ToolPickerModal';
import CombineTab from './components/CombineTab';
import ExtractTab from './components/ExtractTab';
import ReorderTab from './components/ReorderTab';
import RotateTab from './components/RotateTab';
import WatermarkTab from './components/WatermarkTab';
import CompressTab from './components/CompressTab';
import MetadataTab from './components/MetadataTab';
import SplitTab from './components/SplitTab';
import DeleteTab from './components/DeleteTab';
import AddPageNumbersTab from './components/AddPageNumbersTab';

function App() {
  const [activeTab, setActiveTab] = useState(null); // null = show home page
  const [toast, setToast] = useState(null);
  const [fileCounts, setFileCounts] = useState({});
  const [droppedFiles, setDroppedFiles] = useState(null);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);

  const tabs = [
    { id: 'combine', label: '📎 Combine', icon: '📎', title: 'Combine PDF', component: CombineTab, shortcut: '1' },
    { id: 'extract', label: '✂️ Extract', icon: '📄', title: 'Extract Pages', component: ExtractTab, shortcut: '2' },
    { id: 'reorder', label: '↕️ Reorder', icon: '↕️', title: 'Reorder Pages', component: ReorderTab, shortcut: '3' },
    { id: 'rotate', label: '🔄 Rotate', icon: '🔄', title: 'Rotate Pages', component: RotateTab, shortcut: '4' },
    { id: 'watermark', label: '💧 Watermark', icon: '💧', title: 'Add Watermark', component: WatermarkTab, shortcut: '5' },
    { id: 'compress', label: '📦 Compress', icon: '📦', title: 'Compress PDF', component: CompressTab, shortcut: '6' },
    { id: 'metadata', label: '📋 Metadata', icon: '📋', title: 'Edit Metadata', component: MetadataTab, shortcut: '7' },
    { id: 'split', label: '⚡ Split', icon: '✂️', title: 'Split PDF', component: SplitTab, shortcut: '8' },
    { id: 'delete', label: '🗑️ Delete', icon: '🗑️', title: 'Delete Pages', component: DeleteTab, shortcut: '9' },
    { id: 'addpagenumbers', label: '🔢 Page Numbers', icon: '🔢', title: 'Add Page Numbers', component: AddPageNumbersTab, shortcut: '0' }
  ];

  // Handle tool selection from home page
  const handleSelectTool = (toolId) => {
    setActiveTab(toolId);
  };

  // Handle back to home
  const handleBackToHome = () => {
    setActiveTab(null);
    setDroppedFiles(null); // Clear dropped files when going home
  };

  // Handle files dropped on home page
  const handleFilesDropped = (files) => {
    if (files.length > 0) {
      setPendingFiles(files);
      setShowToolPicker(true);
    }
  };

  // Handle tool selection from picker modal
  const handleToolFromPicker = (toolId, files) => {
    setDroppedFiles(files);
    setActiveTab(toolId);
    setShowToolPicker(false);
    setPendingFiles(null);
  };

  // Close tool picker modal
  const handleCloseToolPicker = () => {
    setShowToolPicker(false);
    setPendingFiles(null);
  };

  // Handle tab switching (legacy, kept for keyboard shortcuts)
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in an input (avoid conflicts)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Escape to go back to home
      if (e.key === 'Escape' && activeTab) {
        handleBackToHome();
        return;
      }

      // Escape to close tool picker
      if (e.key === 'Escape' && showToolPicker) {
        handleCloseToolPicker();
        return;
      }

      // Number keys (1-9) to switch tabs
      if (e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex < tabs.length) {
          handleTabClick(tabs[tabIndex].id);
        }
      }

      // 0 for the 10th tab
      if (e.key === '0' && tabs.length >= 10) {
        handleTabClick(tabs[9].id);
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
  }, [tabs, activeTab, showToolPicker]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Expose toast and file count tracker to window for child components
  useEffect(() => {
    window.showToast = showToast;
    window.updateFileCount = (tabId, count) => {
      setFileCounts(prev => ({ ...prev, [tabId]: count }));
    };
    // Expose dropped files for components to access
    window.getDroppedFiles = () => droppedFiles;
    window.clearDroppedFiles = () => setDroppedFiles(null);
  }, [droppedFiles]);

  const activeTabData = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  // Show home page when no tab is selected
  if (!activeTab) {
    return (
      <div className="app">
        <ThemeToggle />
        <UserGuide />
        <SettingsPanel />
        {toast && <Toast message={toast.message} type={toast.type} />}
        {showToolPicker && pendingFiles && (
          <ToolPickerModal 
            files={pendingFiles}
            onSelectTool={handleToolFromPicker}
            onClose={handleCloseToolPicker}
          />
        )}
        <HomePage 
          onSelectTool={handleSelectTool} 
          onFilesDropped={handleFilesDropped}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <ThemeToggle />
      <UserGuide />
      <SettingsPanel />
      <RecentFiles />
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <ToolHeader 
        title={activeTabData?.title || ''} 
        icon={activeTabData?.icon || ''} 
        onBack={handleBackToHome} 
      />
      
      <div className="container tool-container">
        <div className="content">
          {ActiveComponent && <ActiveComponent onToast={showToast} initialFiles={droppedFiles} />}
        </div>
      </div>
    </div>
  );
}

export default App;
