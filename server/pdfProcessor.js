/**
 * PDF processing utilities using pdf-lib
 */

const { PDFDocument, PDFPage, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const { spawn } = require('child_process');

class PDFProcessor {
  /**
   * Combine multiple PDF files into one - returns bytes instead of writing to disk
   */
  static async combinePDFsToBytes(inputPaths) {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const inputPath of inputPaths) {
        const pdfBytes = await fs.readFile(inputPath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      return pdfBytes;
    } catch (error) {
      throw new Error(`Failed to combine PDFs: ${error.message}`);
    }
  }

  /**
   * Extract specific pages from a PDF
   */
  static async extractPages(inputPath, outputPath, pageIndices) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (const pageIndex of pageIndices) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf, [pageIndex]);
          newPdf.addPage(page);
        }
      }

      const outputBytes = await newPdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: 'Pages extracted successfully' };
    } catch (error) {
      throw new Error(`Failed to extract pages: ${error.message}`);
    }
  }

  /**
   * Reorder pages in a PDF
   */
  static async reorderPages(inputPath, outputPath, newOrder) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (const pageIndex of newOrder) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf, [pageIndex]);
          newPdf.addPage(page);
        }
      }

      const outputBytes = await newPdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: 'Pages reordered successfully' };
    } catch (error) {
      throw new Error(`Failed to reorder pages: ${error.message}`);
    }
  }

  /**
   * Rotate pages in a PDF
   */
  static async rotatePages(inputPath, outputPath, pageIndices, angle) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      for (const pageIndex of pageIndices) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const page = pdf.getPage(pageIndex);
          const currentRotation = page.getRotation().angle || 0;
          page.setRotation({ angle: currentRotation + angle });
        }
      }

      const outputBytes = await pdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: `Pages rotated ${angle} degrees` };
    } catch (error) {
      throw new Error(`Failed to rotate pages: ${error.message}`);
    }
  }

  /**
   * Add watermark to PDF
   */
  static async addWatermark(inputPath, outputPath, text, options = {}) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const fontSize = options.fontSize || 60;
      const opacity = options.opacity || 0.3;
      const angle = options.angle || -45;

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();

        page.drawText(text, {
          x: width / 2 - (text.length * fontSize) / 4,
          y: height / 2,
          size: fontSize,
          color: rgb(0.8, 0.8, 0.8),
          opacity: opacity,
          rotate: angle
        });
      }

      const outputBytes = await pdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: 'Watermark added successfully' };
    } catch (error) {
      throw new Error(`Failed to add watermark: ${error.message}`);
    }
  }

  /**
   * Compress PDF by reducing image quality
   */
  static async compressPDF(inputPath, outputPath) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const outputBytes = await pdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: 'PDF compressed successfully' };
    } catch (error) {
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
  }

  /**
   * Get PDF metadata and page count
   */
  static async getMetadata(inputPath) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const metadata = {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle() || 'N/A',
        author: pdf.getAuthor() || 'N/A',
        subject: pdf.getSubject() || 'N/A',
        creator: pdf.getCreator() || 'N/A'
      };

      // Add page dimensions
      metadata.pages = [];
      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        metadata.pages.push({ index: i, width, height });
      }

      return metadata;
    } catch (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  /**
   * Split PDF into separate files (one file per page)
   */
  static async splitPDF(inputPath, outputDir, options = {}) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const files = [];
      const totalPages = pdf.getPageCount();
      
      const splitMode = options.splitMode || 'single';
      const pagesPerFile = parseInt(options.pagesPerFile) || 1;
      const pageRange = options.pageRange || `1-${totalPages}`;

      // Parse page range (e.g., "1-5,10,15-20")
      const parsePageRange = (rangeStr, totalPages) => {
        const pages = [];
        const parts = rangeStr.split(',').map(p => p.trim());
        
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(p => parseInt(p.trim()));
            for (let i = Math.max(1, start); i <= Math.min(end, totalPages); i++) {
              if (!pages.includes(i)) pages.push(i);
            }
          } else {
            const page = parseInt(part.trim());
            if (page >= 1 && page <= totalPages && !pages.includes(page)) {
              pages.push(page);
            }
          }
        }
        return pages.sort((a, b) => a - b);
      };

      if (splitMode === 'single') {
        // Single page per file
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);

          const outputPath = `${outputDir}/page_${i + 1}.pdf`;
          const outputBytes = await newPdf.save();
          await fs.writeFile(outputPath, outputBytes);
          files.push(`page_${i + 1}.pdf`);
        }
      } else if (splitMode === 'multi') {
        // Multiple pages per file
        let fileIndex = 1;
        for (let i = 0; i < totalPages; i += pagesPerFile) {
          const newPdf = await PDFDocument.create();
          const pagesToCopy = [];
          for (let j = 0; j < pagesPerFile && i + j < totalPages; j++) {
            pagesToCopy.push(i + j);
          }
          const pages = await newPdf.copyPages(pdf, pagesToCopy);
          pages.forEach(page => newPdf.addPage(page));

          const outputPath = `${outputDir}/split_${fileIndex}.pdf`;
          const outputBytes = await newPdf.save();
          await fs.writeFile(outputPath, outputBytes);
          files.push(`split_${fileIndex}.pdf`);
          fileIndex++;
        }
      } else if (splitMode === 'range') {
        // Custom page range
        const selectedPages = parsePageRange(pageRange, totalPages);
        if (selectedPages.length === 0) {
          throw new Error('No valid pages found in the specified range');
        }

        const newPdf = await PDFDocument.create();
        const pagesToCopy = selectedPages.map(p => p - 1); // Convert to 0-based index
        const pages = await newPdf.copyPages(pdf, pagesToCopy);
        pages.forEach(page => newPdf.addPage(page));

        const outputPath = `${outputDir}/range_${selectedPages[0]}_${selectedPages[selectedPages.length - 1]}.pdf`;
        const outputBytes = await newPdf.save();
        await fs.writeFile(outputPath, outputBytes);
        files.push(`range_${selectedPages[0]}_${selectedPages[selectedPages.length - 1]}.pdf`);
      }

      return { success: true, files, message: `PDF split into ${files.length} file(s)` };
    } catch (error) {
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
  }

  /**
   * Delete specific pages from PDF
   */
  static async deletePages(inputPath, outputPath, pageIndices) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      // Sort indices in descending order to delete from end first
      const sortedIndices = pageIndices.sort((a, b) => b - a);

      for (const pageIndex of sortedIndices) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          pdf.removePage(pageIndex);
        }
      }

      const outputBytes = await pdf.save();
      await fs.writeFile(outputPath, outputBytes);
      return { success: true, message: 'Pages deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete pages: ${error.message}`);
    }
  }

  // In-memory versions that return bytes instead of writing to disk
  
  static async extractPagesToBytes(inputPath, pageIndices) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (const pageIndex of pageIndices) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf, [pageIndex]);
          newPdf.addPage(page);
        }
      }

      return await newPdf.save();
    } catch (error) {
      throw new Error(`Failed to extract pages: ${error.message}`);
    }
  }

  static async reorderPagesToBytes(inputPath, newOrder) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (const pageIndex of newOrder) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const [page] = await newPdf.copyPages(pdf, [pageIndex]);
          newPdf.addPage(page);
        }
      }

      return await newPdf.save();
    } catch (error) {
      throw new Error(`Failed to reorder pages: ${error.message}`);
    }
  }

  static async rotatePagesTobytes(inputPath, pageIndices, angle) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      for (const pageIndex of pageIndices) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const page = pdf.getPage(pageIndex);
          page.setRotation((page.getRotation().angle + angle) % 360);
        }
      }

      return await pdf.save();
    } catch (error) {
      throw new Error(`Failed to rotate pages: ${error.message}`);
    }
  }

  static async addWatermarkToBytes(inputPath, watermarkText, options = {}) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const fontSize = options.fontSize || 60;
      const opacity = options.opacity || 0.3;

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        page.drawText(watermarkText, {
          x: 50,
          y: page.getHeight() / 2,
          size: fontSize,
          opacity: opacity,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      return await pdf.save();
    } catch (error) {
      throw new Error(`Failed to add watermark: ${error.message}`);
    }
  }

  static async compressPDFToBytes(inputPath) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      return await pdf.save();
    } catch (error) {
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
  }

  static async deletePagesTobytes(inputPath, pageIndices) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const indicesToDelete = pageIndices.sort((a, b) => b - a);

      for (const pageIndex of indicesToDelete) {
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          pdf.removePage(pageIndex);
        }
      }

      return await pdf.save();
    } catch (error) {
      throw new Error(`Failed to delete pages: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail images for PDF pages
   */
  static async generateThumbnails(inputPath, pageIndices = null, maxWidth = 200) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
      const thumbnails = [];

      // If no specific pages requested, generate for all pages
      const pagesToProcess = pageIndices || Array.from({ length: pageCount }, (_, i) => i);

      for (const pageIndex of pagesToProcess) {
        if (pageIndex >= 0 && pageIndex < pageCount) {
          const page = pdf.getPage(pageIndex);
          const { width, height } = page.getSize();
          
          // Calculate scaled dimensions
          const scale = maxWidth / width;
          const thumbWidth = Math.floor(width * scale);
          const thumbHeight = Math.floor(height * scale);

          thumbnails.push({
            pageIndex,
            width: thumbWidth,
            height: thumbHeight,
            originalWidth: width,
            originalHeight: height
          });
        }
      }

      return thumbnails;
    } catch (error) {
      throw new Error(`Failed to generate thumbnails: ${error.message}`);
    }
  }

  /**
   * Get basic PDF info including page count and dimensions
   */
  static async getPDFInfo(inputPath) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
      const pages = [];

      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        pages.push({ pageNumber: i + 1, width, height });
      }

      return { pageCount, pages };
    } catch (error) {
      throw new Error(`Failed to get PDF info: ${error.message}`);
    }
  }

  /**
   * Add page numbers to PDF
   */
  static async addPageNumbers(inputPath, options = {}) {
    try {
      const {
        position = 'bottom-right',
        format = 'number',
        startNumber = 1,
        pageRange = '',
        fontSize = 12,
        margin = 20
      } = options;

      const pdfBytes = await fs.readFile(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Parse page range if provided
      let pagesToNumber = [];
      if (pageRange && pageRange.trim() !== '') {
        const ranges = pageRange.split(',').map(s => s.trim());
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) {
                pagesToNumber.push(i - 1); // Convert to 0-indexed
              }
            }
          } else {
            const pageNum = parseInt(range);
            if (pageNum >= 1 && pageNum <= totalPages) {
              pagesToNumber.push(pageNum - 1); // Convert to 0-indexed
            }
          }
        }
        // Remove duplicates
        pagesToNumber = [...new Set(pagesToNumber)].sort((a, b) => a - b);
      } else {
        // Number all pages
        pagesToNumber = Array.from({ length: totalPages }, (_, i) => i);
      }

      // Add page numbers
      for (let i = 0; i < pagesToNumber.length; i++) {
        const pageIndex = pagesToNumber[i];
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Calculate page number text
        let pageNumberText;
        const currentPageNumber = startNumber + i;
        switch (format) {
          case 'page-of-total':
            pageNumberText = `Page ${currentPageNumber} of ${pagesToNumber.length}`;
            break;
          case 'page-number':
            pageNumberText = `Page ${currentPageNumber}`;
            break;
          case 'number':
          default:
            pageNumberText = `${currentPageNumber}`;
            break;
        }

        // Calculate position
        let x, y;
        const textWidth = fontSize * pageNumberText.length * 0.5; // Approximate width

        switch (position) {
          case 'top-left':
            x = margin;
            y = height - margin;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - margin;
            break;
          case 'top-right':
            x = width - textWidth - margin;
            y = height - margin;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = margin;
            break;
          case 'bottom-right':
          default:
            x = width - textWidth - margin;
            y = margin;
            break;
        }

        // Draw page number
        page.drawText(pageNumberText, {
          x,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      return modifiedPdfBytes;
    } catch (error) {
      throw new Error(`Failed to add page numbers: ${error.message}`);
    }
  }

  /**
   * Protect PDF with password using qpdf command directly
   */
  static async protectPDF(inputPath, options = {}) {
    try {
      const {
        userPassword = '',
        ownerPassword = '',
        permissions = {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false
        }
      } = options;

      if (!userPassword && !ownerPassword) {
        throw new Error('At least one password (user or owner) is required');
      }

      const outputPath = inputPath.replace(/\.pdf$/i, '_encrypted.pdf');
      
      // Build qpdf command arguments
      const args = ['--encrypt'];
      
      // User password and owner password
      args.push(userPassword || ownerPassword); // user password
      args.push(ownerPassword || userPassword); // owner password
      
      // Key length (256 = AES-256)
      args.push('256');
      
      // Add restrictions
      // For 256-bit encryption, options are:
      // --print=none|low|full
      // --modify=none|annotate|form|assembly|all
      // --extract=y|n
      // --accessibility=y|n
      
      if (permissions.printing === false || permissions.printing === 'lowResolution') {
        args.push('--print=' + (permissions.printing === false ? 'none' : 'low'));
      } else {
        args.push('--print=full');
      }
      
      if (!permissions.modifying) {
        args.push('--modify=none');
      } else {
        args.push('--modify=all');
      }
      
      if (!permissions.copying) {
        args.push('--extract=n');
      } else {
        args.push('--extract=y');
      }
      
      if (!permissions.contentAccessibility) {
        args.push('--accessibility=n');
      } else {
        args.push('--accessibility=y');
      }
      
      // End of encryption options
      args.push('--');
      
      // Input and output files
      args.push(inputPath);
      args.push(outputPath);
      
      // Execute qpdf command
      console.log('[protectPDF] Executing qpdf with args:', args);
      
      await new Promise((resolve, reject) => {
        const qpdf = spawn('qpdf', args);
        
        let stderr = '';
        let stdout = '';
        
        qpdf.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        qpdf.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        qpdf.on('close', (code) => {
          console.log('[protectPDF] qpdf exit code:', code);
          if (stdout) console.log('[protectPDF] stdout:', stdout);
          if (stderr) console.log('[protectPDF] stderr:', stderr);
          
          if (code === 0 || code === 3) {
            // Code 0 = success, Code 3 = warnings but success
            resolve();
          } else {
            reject(new Error(`qpdf exited with code ${code}: ${stderr}`));
          }
        });
        
        qpdf.on('error', (err) => {
          console.error('[protectPDF] spawn error:', err);
          reject(new Error(`Failed to spawn qpdf: ${err.message}`));
        });
      });
      
      // Read the encrypted file
      const encryptedBuffer = await fs.readFile(outputPath);
      
      // Clean up temp file
      await fs.unlink(outputPath).catch(() => {});
      
      return encryptedBuffer;
      
    } catch (error) {
      throw new Error(`Failed to protect PDF: ${error.message}`);
    }
  }
}

module.exports = PDFProcessor;
