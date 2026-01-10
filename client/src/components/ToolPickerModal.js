import React from 'react';
import './ToolPickerModal.css';
import {
  CombineIcon,
  CompressIcon,
  SplitIcon,
  ReorderIcon,
  RotateIcon,
  ExtractIcon,
  DeleteIcon,
  WatermarkIcon,
  PageNumbersIcon,
  MetadataIcon,
  PDFIcon
} from './Icons';

const ToolPickerModal = ({ files, onSelectTool, onClose }) => {
  const fileCount = files?.length || 0;
  const fileName = fileCount === 1 ? files[0].name : `${fileCount} files`;

  // Tools available for dropped files
  const availableTools = [
    {
      id: 'combine',
      Icon: CombineIcon,
      title: 'Combine',
      description: 'Merge files into one PDF',
      recommended: fileCount > 1
    },
    {
      id: 'compress',
      Icon: CompressIcon,
      title: 'Compress',
      description: 'Reduce file size',
      recommended: fileCount === 1
    },
    {
      id: 'split',
      Icon: SplitIcon,
      title: 'Split',
      description: 'Split into multiple PDFs',
      recommended: false
    },
    {
      id: 'reorder',
      Icon: ReorderIcon,
      title: 'Reorder',
      description: 'Rearrange pages',
      recommended: false
    },
    {
      id: 'rotate',
      Icon: RotateIcon,
      title: 'Rotate',
      description: 'Rotate pages',
      recommended: false
    },
    {
      id: 'extract',
      Icon: ExtractIcon,
      title: 'Extract',
      description: 'Extract specific pages',
      recommended: false
    },
    {
      id: 'delete',
      Icon: DeleteIcon,
      title: 'Delete Pages',
      description: 'Remove unwanted pages',
      recommended: false
    },
    {
      id: 'watermark',
      Icon: WatermarkIcon,
      title: 'Watermark',
      description: 'Add watermark',
      recommended: false
    },
    {
      id: 'addpagenumbers',
      Icon: PageNumbersIcon,
      title: 'Page Numbers',
      description: 'Add page numbers',
      recommended: false
    },
    {
      id: 'metadata',
      Icon: MetadataIcon,
      title: 'Metadata',
      description: 'Edit PDF properties',
      recommended: false
    }
  ];

  // Sort to show recommended first
  const sortedTools = [...availableTools].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return 0;
  });

  const handleToolSelect = (toolId) => {
    onSelectTool(toolId, files);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="tool-picker-overlay" onClick={handleOverlayClick}>
      <div className="tool-picker-modal">
        <button className="tool-picker-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="tool-picker-header">
          <PDFIcon className="file-preview-icon" />
          <h2>Choose an action</h2>
          <p className="file-name">{fileName}</p>
        </div>

        <div className="tool-picker-grid">
          {sortedTools.map((tool) => {
            const IconComponent = tool.Icon;
            return (
              <button
                key={tool.id}
                className={`tool-picker-item ${tool.recommended ? 'recommended' : ''}`}
                onClick={() => handleToolSelect(tool.id)}
              >
                {tool.recommended && <span className="recommended-badge">Recommended</span>}
                <IconComponent className="tool-picker-icon" />
                <span className="tool-picker-title">{tool.title}</span>
                <span className="tool-picker-desc">{tool.description}</span>
              </button>
            );
          })}
        </div>

        <div className="tool-picker-footer">
          <p>Press <kbd>Esc</kbd> to cancel</p>
        </div>
      </div>
    </div>
  );
};

export default ToolPickerModal;
