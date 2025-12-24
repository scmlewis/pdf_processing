import React, { useState, useCallback } from 'react';
import './HomePage.css';

const HomePage = ({ onSelectTool, onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const toolCategories = [
    {
      name: 'Organize',
      tools: [
        {
          id: 'combine',
          icon: '📎',
          title: 'Combine PDF',
          description: 'Merge multiple PDF files into a single document. Drag and drop to reorder before combining.',
          color: '#10b981'
        },
        {
          id: 'split',
          icon: '✂️',
          title: 'Split PDF',
          description: 'Extract pages or split a PDF into multiple smaller documents.',
          color: '#3b82f6'
        },
        {
          id: 'reorder',
          icon: '↕️',
          title: 'Reorder Pages',
          description: 'Rearrange pages in your PDF with an intuitive drag-and-drop interface.',
          color: '#8b5cf6'
        },
        {
          id: 'delete',
          icon: '🗑️',
          title: 'Delete Pages',
          description: 'Remove unwanted pages from your PDF document quickly and easily.',
          color: '#ef4444'
        }
      ]
    },
    {
      name: 'Transform',
      tools: [
        {
          id: 'rotate',
          icon: '🔄',
          title: 'Rotate Pages',
          description: 'Rotate individual pages or entire documents to the correct orientation.',
          color: '#f59e0b'
        },
        {
          id: 'compress',
          icon: '📦',
          title: 'Compress PDF',
          description: 'Reduce file size while maintaining quality. Perfect for email attachments.',
          color: '#06b6d4'
        },
        {
          id: 'extract',
          icon: '📄',
          title: 'Extract Pages',
          description: 'Extract specific pages or page ranges into a new PDF document.',
          color: '#ec4899'
        }
      ]
    },
    {
      name: 'Enhance',
      tools: [
        {
          id: 'watermark',
          icon: '💧',
          title: 'Add Watermark',
          description: 'Protect your documents with custom text or image watermarks.',
          color: '#14b8a6'
        },
        {
          id: 'addpagenumbers',
          icon: '🔢',
          title: 'Page Numbers',
          description: 'Add page numbers with customizable position, format, and styling.',
          color: '#a855f7'
        },
        {
          id: 'metadata',
          icon: '📋',
          title: 'Edit Metadata',
          description: 'View and edit PDF properties like title, author, and keywords.',
          color: '#64748b'
        }
      ]
    }
  ];

  // Handle drag events for global drop zone
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (files.length > 0 && onFilesDropped) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  return (
    <div 
      className={`home-page ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Global Drop Overlay */}
      {isDragging && (
        <div className="global-drop-overlay">
          <div className="drop-overlay-content">
            <div className="drop-icon">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="3" strokeDasharray="6 4"/>
                <path d="M32 24v16M24 32h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="drop-title">Drop your PDF files here</h2>
            <p className="drop-subtitle">Release to upload and choose an action</p>
          </div>
        </div>
      )}

      <div className="home-hero">
        <div className="hero-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="4" width="32" height="40" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 16h16M16 24h16M16 32h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="36" cy="36" r="10" fill="#10b981"/>
            <path d="M33 36h6M36 33v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="hero-title">PDF Processor</h1>
        <p className="hero-subtitle">
          Professional tools for all your PDF needs. Fast, secure, and easy to use.
        </p>
        <div className="hero-features">
          <span className="feature-badge">
            <span className="feature-icon">🔒</span>
            100% Secure
          </span>
          <span className="feature-badge">
            <span className="feature-icon">⚡</span>
            Lightning Fast
          </span>
          <span className="feature-badge">
            <span className="feature-icon">💻</span>
            Works Offline
          </span>
        </div>
      </div>

      <div className="tools-container">
        {toolCategories.map((category) => (
          <div key={category.name} className="tool-category">
            <h2 className="category-title">{category.name}</h2>
            <div className="tools-grid">
              {category.tools.map((tool) => (
                <button
                  key={tool.id}
                  className="tool-card"
                  onClick={() => onSelectTool(tool.id)}
                  style={{ '--tool-color': tool.color }}
                >
                  <div className="tool-icon-wrapper">
                    <span className="tool-icon">{tool.icon}</span>
                    <div className="tool-icon-bg"></div>
                  </div>
                  <div className="tool-content">
                    <h3 className="tool-title">{tool.title}</h3>
                    <p className="tool-description">{tool.description}</p>
                  </div>
                  <div className="tool-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="home-footer">
        <p>Drag and drop a PDF file anywhere to get started</p>
      </div>
    </div>
  );
};

export default HomePage;
