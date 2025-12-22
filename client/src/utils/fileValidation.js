/**
 * File validation utilities
 */

// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Maximum number of files
export const MAX_FILE_COUNT = 50;

/**
 * Validate file size
 */
export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }
  return { valid: true };
};

/**
 * Validate file count
 */
export const validateFileCount = (files) => {
  if (files.length > MAX_FILE_COUNT) {
    return {
      valid: false,
      error: `Too many files. Maximum is ${MAX_FILE_COUNT} files at once.`
    };
  }
  return { valid: true };
};

/**
 * Validate file type (must be PDF)
 */
export const validateFileType = (file) => {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPDF) {
    return {
      valid: false,
      error: `File "${file.name}" is not a PDF. Only PDF files are allowed.`
    };
  }
  return { valid: true };
};

/**
 * Validate all files
 */
export const validateFiles = (files) => {
  const fileArray = Array.isArray(files) ? files : [files];
  
  // Check file count
  const countCheck = validateFileCount(fileArray);
  if (!countCheck.valid) {
    return countCheck;
  }

  // Check each file
  for (const file of fileArray) {
    // Check file type
    const typeCheck = validateFileType(file);
    if (!typeCheck.valid) {
      return typeCheck;
    }

    // Check file size
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) {
      return sizeCheck;
    }
  }

  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Get total size of multiple files
 */
export const getTotalFileSize = (files) => {
  return files.reduce((total, file) => total + file.size, 0);
};

/**
 * Calculate upload progress with size info
 */
export const calculateProgress = (loaded, total) => {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
};
