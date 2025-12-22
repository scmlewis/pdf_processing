/**
 * Page range parsing utilities
 */

/**
 * Parse page range string into array of page numbers
 * Supports:
 * - Individual pages: "1,3,5" → [1,3,5]
 * - Ranges: "1-5" → [1,2,3,4,5]
 * - Mixed: "1-3,5,7-9" → [1,2,3,5,7,8,9]
 * 
 * @param {string} rangeString - Page range string (1-based)
 * @returns {number[]} Array of page numbers
 */
export const parsePageRange = (rangeString) => {
  const pages = new Set(); // Use Set to avoid duplicates
  
  if (!rangeString || rangeString.trim() === '') {
    return [];
  }

  // Split by comma to get individual parts
  const parts = rangeString.split(',').map(p => p.trim()).filter(p => p);

  for (const part of parts) {
    if (part.includes('-')) {
      // Handle range (e.g., "1-5")
      const [start, end] = part.split('-').map(p => parseInt(p.trim()));
      
      if (isNaN(start) || isNaN(end)) {
        continue; // Skip invalid ranges
      }

      // Add all pages in range
      const rangeStart = Math.min(start, end);
      const rangeEnd = Math.max(start, end);
      
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.add(i);
      }
    } else {
      // Handle individual page
      const pageNum = parseInt(part);
      if (!isNaN(pageNum) && pageNum > 0) {
        pages.add(pageNum);
      }
    }
  }

  // Convert Set to sorted array
  return Array.from(pages).sort((a, b) => a - b);
};

/**
 * Validate page range string
 * @param {string} rangeString - Page range string
 * @returns {object} { valid: boolean, error?: string }
 */
export const validatePageRange = (rangeString) => {
  if (!rangeString || rangeString.trim() === '') {
    return { valid: false, error: 'Page range cannot be empty' };
  }

  const validPattern = /^[\d\s,-]+$/;
  if (!validPattern.test(rangeString)) {
    return { 
      valid: false, 
      error: 'Invalid format. Use numbers, commas, and hyphens only (e.g., "1-5,7,9-12")' 
    };
  }

  const pages = parsePageRange(rangeString);
  if (pages.length === 0) {
    return { valid: false, error: 'No valid pages found in range' };
  }

  return { valid: true, pages };
};

/**
 * Convert 1-based page numbers to 0-based indices
 * @param {number[]} pageNumbers - Array of 1-based page numbers
 * @returns {number[]} Array of 0-based indices
 */
export const pagesToIndices = (pageNumbers) => {
  return pageNumbers.map(p => p - 1);
};

/**
 * Format page range for display
 * Collapses consecutive pages into ranges
 * @param {number[]} pages - Array of page numbers
 * @returns {string} Formatted string (e.g., "1-5, 7, 9-12")
 */
export const formatPageRange = (pages) => {
  if (!pages || pages.length === 0) return '';

  const sorted = [...pages].sort((a, b) => a - b);
  const ranges = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      // Continue the range
      rangeEnd = sorted[i];
    } else {
      // End current range and start new one
      if (rangeStart === rangeEnd) {
        ranges.push(`${rangeStart}`);
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(`${rangeStart},${rangeEnd}`);
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }

  // Add the last range
  if (rangeStart === rangeEnd) {
    ranges.push(`${rangeStart}`);
  } else if (rangeEnd === rangeStart + 1) {
    ranges.push(`${rangeStart},${rangeEnd}`);
  } else {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  }

  return ranges.join(', ');
};
