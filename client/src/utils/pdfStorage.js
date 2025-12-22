/**
 * PDF Storage Utility using IndexedDB
 * Provides client-side storage for processed PDF files
 */

const DB_NAME = 'PDFProcessorDB';
const STORE_NAME = 'processedPDFs';
const DB_VERSION = 1;

// Storage limits
const MAX_STORAGE_MB = 100; // Maximum storage usage in MB
const MAX_FILE_AGE_DAYS = 7; // Auto-delete files older than this

/**
 * Initialize/Open IndexedDB database
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('fileName', 'fileName', { unique: false });
      }
    };
  });
};

/**
 * Save a PDF file to IndexedDB
 * @param {string} fileName - Name of the file
 * @param {Blob} blob - PDF blob data
 * @param {string} operation - Operation type (extract, rotate, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const savePDF = async (fileName, blob, operation) => {
  try {
    // Check storage quota before saving
    const canStore = await checkStorageQuota(blob.size);
    if (!canStore) {
      console.warn('Storage quota exceeded, cleaning up old files...');
      await cleanupOldFiles();
    }

    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      id: `${fileName}_${Date.now()}`,
      fileName,
      blob,
      operation,
      size: blob.size,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save PDF to storage:', error);
    return false;
  }
};

/**
 * Get a PDF file from IndexedDB by filename
 * @param {string} fileName - Name of the file to retrieve
 * @returns {Promise<Blob|null>} PDF blob or null if not found
 */
export const getPDF = async (fileName) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('fileName');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(fileName));
      let mostRecentFile = null;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Check if this is the most recent version
          if (!mostRecentFile || cursor.value.timestamp > mostRecentFile.timestamp) {
            mostRecentFile = cursor.value;
          }
          cursor.continue();
        } else {
          // Return the most recent file's blob
          resolve(mostRecentFile ? mostRecentFile.blob : null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to retrieve PDF from storage:', error);
    return null;
  }
};

/**
 * Check if a file exists in storage
 * @param {string} fileName - Name of the file
 * @returns {Promise<boolean>} True if file exists
 */
export const fileExists = async (fileName) => {
  try {
    const blob = await getPDF(fileName);
    return blob !== null;
  } catch (error) {
    console.error('Failed to check file existence:', error);
    return false;
  }
};

/**
 * Get all stored PDF files
 * @returns {Promise<Array>} Array of stored file records
 */
export const getAllPDFs = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get all PDFs:', error);
    return [];
  }
};

/**
 * Delete a specific PDF file
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePDF = async (id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete PDF:', error);
    return false;
  }
};

/**
 * Clear all stored PDFs
 * @returns {Promise<boolean>} Success status
 */
export const clearAllPDFs = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear all PDFs:', error);
    return false;
  }
};

/**
 * Check storage quota and usage
 * @param {number} additionalBytes - Size of file to be added
 * @returns {Promise<boolean>} True if enough space available
 */
const checkStorageQuota = async (additionalBytes = 0) => {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return true; // Can't check, assume OK
    }

    const estimate = await navigator.storage.estimate();
    const currentUsage = estimate.usage || 0;
    const quota = estimate.quota || Infinity;
    
    const maxBytes = MAX_STORAGE_MB * 1024 * 1024;
    const projectedUsage = currentUsage + additionalBytes;
    
    // Check both our limit and browser quota
    return projectedUsage < maxBytes && projectedUsage < quota * 0.9;
  } catch (error) {
    console.error('Failed to check storage quota:', error);
    return true; // Assume OK on error
  }
};

/**
 * Clean up old files to free storage space
 * Removes files older than MAX_FILE_AGE_DAYS
 * @returns {Promise<number>} Number of files deleted
 */
export const cleanupOldFiles = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_FILE_AGE_DAYS);
    const cutoffISO = cutoffDate.toISOString();

    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.timestamp < cutoffISO) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to cleanup old files:', error);
    return 0;
  }
};

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage stats
 */
export const getStorageStats = async () => {
  try {
    const files = await getAllPDFs();
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    
    let quota = Infinity;
    let usage = 0;
    
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      quota = estimate.quota || Infinity;
      usage = estimate.usage || 0;
    }

    return {
      fileCount: files.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      quota,
      usage,
      percentUsed: quota !== Infinity ? ((usage / quota) * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      fileCount: 0,
      totalSize: 0,
      totalSizeMB: '0',
      quota: Infinity,
      usage: 0,
      percentUsed: 0
    };
  }
};

/**
 * Check if IndexedDB is available
 * @returns {boolean} True if supported
 */
export const isStorageAvailable = () => {
  try {
    return typeof indexedDB !== 'undefined';
  } catch (e) {
    return false;
  }
};
