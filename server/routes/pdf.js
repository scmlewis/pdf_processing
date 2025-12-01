/**
 * PDF API Routes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFProcessor = require('../pdfProcessor');

const router = express.Router();

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
    fileSize: 200 * 1024 * 1024 // 200MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * POST /api/pdf/combine
 * Combine multiple PDFs
 */
router.post('/combine', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files (maximum 50 files per request)' });
    }

    const inputPaths = req.files.map(f => f.path);
    const pdfBytes = await PDFProcessor.combinePDFsToBytes(inputPaths);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="combined.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pdf/extract
 * Extract specific pages from a PDF
 */
router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pageIndices = JSON.parse(req.body.pageIndices || '[]');
    if (!Array.isArray(pageIndices) || pageIndices.length === 0) {
      return res.status(400).json({ error: 'Invalid page indices' });
    }

    const pdfBytes = await PDFProcessor.extractPagesToBytes(req.file.path, pageIndices);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="extracted.pdf"');
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
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reordered.pdf"');
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
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
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
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
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
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
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

    const result = await PDFProcessor.splitPDF(req.file.path, outputDir);

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
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="deleted.pdf"');
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

module.exports = router;
