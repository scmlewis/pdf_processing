/**
 * PDF API Routes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFProcessor = require('../pdfProcessor');

const router = express.Router();

// Helper function to get output filename
function getOutputFilename(originalFilename, operation) {
  if (!originalFilename) return `${operation}.pdf`;
  const baseName = originalFilename.replace(/\.pdf$/i, '');
  return `${baseName}-${operation}.pdf`;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file - reduced from 200MB for better performance
    files: 50 // Maximum 50 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum file size is 50MB per file.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files. Maximum is 50 files at once.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected file field.' 
      });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

/**
 * POST /api/pdf/combine
 * Combine multiple PDFs
 */
router.post('/combine', upload.array('files', 50), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files (maximum 50 files per request)' });
    }

    const inputPaths = req.files.map(f => f.path);
    const pdfBytes = await PDFProcessor.combinePDFsToBytes(inputPaths);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'combined');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/extract
 * Extract specific pages from a PDF
 */
router.post('/extract', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pageIndices = JSON.parse(req.body.pageIndices || '[]');
    if (!Array.isArray(pageIndices) || pageIndices.length === 0) {
      return res.status(400).json({ error: 'Invalid page indices' });
    }

    const pdfBytes = await PDFProcessor.extractPagesToBytes(req.file.path, pageIndices);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'extracted');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/reorder
 * Reorder pages in a PDF
 */
router.post('/reorder', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const newOrder = JSON.parse(req.body.newOrder || '[]');
    if (!Array.isArray(newOrder) || newOrder.length === 0) {
      return res.status(400).json({ error: 'Invalid page order' });
    }

    const pdfBytes = await PDFProcessor.reorderPagesToBytes(req.file.path, newOrder);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'reordered');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/rotate
 * Rotate pages in a PDF
 */
router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pageIndices = JSON.parse(req.body.pageIndices || '[]');
    const angle = parseInt(req.body.angle || 90);

    if (pageIndices.length === 0) {
      return res.status(400).json({ error: 'No page indices specified' });
    }

    const pdfBytes = await PDFProcessor.rotatePagesTobytes(req.file.path, pageIndices, angle);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'rotated');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/watermark
 * Add watermark to PDF
 */
router.post('/watermark', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const watermarkText = req.body.text || 'WATERMARK';
    const options = {
      fontSize: parseInt(req.body.fontSize || 60),
      opacity: parseFloat(req.body.opacity || 0.3),
      angle: parseInt(req.body.angle || -45)
    };

    const pdfBytes = await PDFProcessor.addWatermarkToBytes(req.file.path, watermarkText, options);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'watermarked');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/compress
 * Compress a PDF
 */
router.post('/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfBytes = await PDFProcessor.compressPDFToBytes(req.file.path);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'compressed');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/metadata
 * Get PDF metadata
 */
router.post('/metadata', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const metadata = await PDFProcessor.getMetadata(req.file.path);
    res.json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/split
 * Split PDF into separate files
 */
router.post('/split', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const splitDirName = `split-${Date.now()}`;
    const outputDir = path.join(__dirname, '../uploads', splitDirName);
    await fs.mkdir(outputDir, { recursive: true });

    const options = {
      splitMode: req.body.splitMode || 'single',
      pagesPerFile: req.body.pagesPerFile || '1',
      pageRange: req.body.pageRange || undefined
    };

    const result = await PDFProcessor.splitPDF(req.file.path, outputDir, options);

    res.json({
      success: true,
      ...result,
      downloadUrls: result.files.map(f => `/api/pdf/download/${f}?dir=${splitDirName}`)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/delete-pages
 * Delete specific pages from PDF
 */
router.post('/delete-pages', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pageIndices = JSON.parse(req.body.pageIndices || '[]');
    if (pageIndices.length === 0) {
      return res.status(400).json({ error: 'No page indices to delete' });
    }

    const pdfBytes = await PDFProcessor.deletePagesTobytes(req.file.path, pageIndices);
    
    const outputFilename = getOutputFilename(req.body.originalFilename, 'deleted');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pdf/download/:filename
 * Download processed PDF (supports nested paths)
 */
router.get('/download/:filename', (req, res) => {
  try {
    let filename = req.params.filename;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Handle nested paths for split files
    let filepath;
    if (req.query.dir) {
      filepath = path.join(uploadsDir, req.query.dir, filename);
    } else {
      filepath = path.join(uploadsDir, filename);
    }
    
    // Prevent path traversal attacks
    const normalizedPath = path.normalize(filepath);
    const normalizedUploadsDir = path.normalize(uploadsDir);
    
    if (!normalizedPath.startsWith(normalizedUploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    const fsSync = require('fs');
    if (!fsSync.existsSync(normalizedPath)) {
      console.error(`File not found: ${normalizedPath}`);
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send the file
    const fileStream = fsSync.createReadStream(normalizedPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * POST /api/pdf/info
 * Get PDF information including page count and dimensions
 */
router.post('/info', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const info = await PDFProcessor.getPDFInfo(req.file.path);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json(info);
  } catch (error) {
    console.error('Get info error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: error.message || 'Failed to get PDF info' });
  }
});

/**
 * POST /api/pdf/thumbnails
 * Generate thumbnails for PDF pages
 */
router.post('/thumbnails', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pageIndices = req.body.pages ? JSON.parse(req.body.pages) : null;
    const maxWidth = req.body.maxWidth ? parseInt(req.body.maxWidth) : 200;

    const thumbnails = await PDFProcessor.generateThumbnails(req.file.path, pageIndices, maxWidth);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({ thumbnails });
  } catch (error) {
    console.error('Generate thumbnails error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: error.message || 'Failed to generate thumbnails' });
  }
});

/**
 * Add page numbers to PDF
 */
router.post('/add-page-numbers', upload.single('pdf'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const options = {
      position: req.body.position || 'bottom-right',
      format: req.body.format || 'number',
      startNumber: parseInt(req.body.startNumber) || 1,
      pageRange: req.body.pageRange || '',
      fontSize: parseInt(req.body.fontSize) || 12,
      margin: parseInt(req.body.margin) || 20
    };

    const pdfBytes = await PDFProcessor.addPageNumbers(req.file.path, options);

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => {});

    // Send the PDF
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Add page numbers error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: error.message || 'Failed to add page numbers' });
  }
});

module.exports = router;
