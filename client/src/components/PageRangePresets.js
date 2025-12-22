import React from 'react';
import './PageRangePresets.css';

function PageRangePresets({ totalPages, onSelectPreset, disabled = false }) {
  if (!totalPages || totalPages === 0) return null;

  const presets = [
    {
      label: '✓ All Pages',
      action: () => {
        const all = [];
        for (let i = 1; i <= totalPages; i++) all.push(i);
        onSelectPreset(all);
      }
    },
    {
      label: '📊 Even Pages',
      action: () => {
        const even = [];
        for (let i = 2; i <= totalPages; i += 2) even.push(i);
        onSelectPreset(even);
      }
    },
    {
      label: '📈 Odd Pages',
      action: () => {
        const odd = [];
        for (let i = 1; i <= totalPages; i += 2) odd.push(i);
        onSelectPreset(odd);
      }
    },
    {
      label: '⬆️ First 10',
      action: () => {
        const first = [];
        for (let i = 1; i <= Math.min(10, totalPages); i++) first.push(i);
        onSelectPreset(first);
      }
    },
    {
      label: '⬇️ Last 10',
      action: () => {
        const last = [];
        for (let i = Math.max(1, totalPages - 9); i <= totalPages; i++) last.push(i);
        onSelectPreset(last);
      }
    },
    {
      label: '🔄 Reverse Order',
      action: () => {
        const reversed = [];
        for (let i = totalPages; i >= 1; i--) reversed.push(i);
        onSelectPreset(reversed);
      }
    }
  ];

  return (
    <div className="page-range-presets">
      <label className="presets-label">Quick Selection:</label>
      <div className="presets-buttons">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={preset.action}
            disabled={disabled}
            className="preset-btn"
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PageRangePresets;
