import React, { useState } from 'react';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
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

  const tabs = [
    { id: 'combine', label: 'Combine', component: CombineTab },
    { id: 'extract', label: 'Extract Pages', component: ExtractTab },
    { id: 'reorder', label: 'Reorder', component: ReorderTab },
    { id: 'rotate', label: 'Rotate', component: RotateTab },
    { id: 'watermark', label: 'Watermark', component: WatermarkTab },
    { id: 'compress', label: 'Compress', component: CompressTab },
    { id: 'metadata', label: 'Metadata', component: MetadataTab },
    { id: 'split', label: 'Split', component: SplitTab },
    { id: 'delete', label: 'Delete Pages', component: DeleteTab }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="app">
      <ThemeToggle />
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
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}

export default App;
