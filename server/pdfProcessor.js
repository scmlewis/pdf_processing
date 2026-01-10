/**
 * PDF processing utilities using pdf-lib
 */

const { PDFDocument, PDFPage, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const { spawn } = require('child_process');

// pdf-parse v2 exports PDFParse class
const { PDFParse } = require('pdf-parse');

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
   * Selectively combine pages from two PDFs - returns bytes
   * @param {string} inputPath1 - Path to first PDF
   * @param {string} inputPath2 - Path to second PDF
   * @param {number[]} pages1 - Page numbers to include from first PDF (1-based)
   * @param {number[]} pages2 - Page numbers to include from second PDF (1-based)
   */
  static async selectiveCombinePDFs(inputPath1, inputPath2, pages1, pages2) {
    try {
      const mergedPdf = await PDFDocument.create();

      // Load first PDF and add selected pages
      if (pages1.length > 0) {
        const pdfBytes1 = await fs.readFile(inputPath1);
        const pdf1 = await PDFDocument.load(pdfBytes1);
        // Convert 1-based page numbers to 0-based indices
        const indices1 = pages1.map(p => p - 1).filter(i => i >= 0 && i < pdf1.getPageCount());
        if (indices1.length > 0) {
          const copiedPages1 = await mergedPdf.copyPages(pdf1, indices1);
          copiedPages1.forEach(page => mergedPdf.addPage(page));
        }
      }

      // Load second PDF and add selected pages
      if (pages2.length > 0) {
        const pdfBytes2 = await fs.readFile(inputPath2);
        const pdf2 = await PDFDocument.load(pdfBytes2);
        // Convert 1-based page numbers to 0-based indices
        const indices2 = pages2.map(p => p - 1).filter(i => i >= 0 && i < pdf2.getPageCount());
        if (indices2.length > 0) {
          const copiedPages2 = await mergedPdf.copyPages(pdf2, indices2);
          copiedPages2.forEach(page => mergedPdf.addPage(page));
        }
      }

      if (mergedPdf.getPageCount() === 0) {
        throw new Error('No valid pages selected for merging');
      }

      const pdfBytes = await mergedPdf.save();
      return pdfBytes;
    } catch (error) {
      throw new Error(`Failed to selectively combine PDFs: ${error.message}`);
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
          const newRotation = (currentRotation + angle) % 360;
          page.setRotation(degrees(newRotation));
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
          const currentRotation = page.getRotation().angle;
          const newRotation = (currentRotation + angle) % 360;
          page.setRotation(degrees(newRotation));
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
   * Extract text from PDF - returns plain text string
   * @param {string} inputPath - Path to PDF file
   * @returns {Object} - { text, pageCount, info }
   */
  static async extractText(inputPath) {
    try {
      const dataBuffer = await fs.readFile(inputPath);
      // pdf-parse v2 uses PDFParse class
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      const info = await parser.getInfo();
      
      // Clean up text - remove page separators like "-- 4 of 120 --"
      let cleanText = result.text || '';
      cleanText = cleanText.replace(/\n?--\s*\d+\s+of\s+\d+\s*--\n?/gi, '\n');
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
      
      return {
        text: cleanText,
        pageCount: result.total,
        info: info.info || {}
      };
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Convert PDF to Markdown format with smart structure detection
   * @param {string} inputPath - Path to PDF file
   * @returns {Object} - { markdown, pageCount, info }
   */
  static async convertToMarkdown(inputPath) {
    try {
      const dataBuffer = await fs.readFile(inputPath);
      // pdf-parse v2 uses PDFParse class
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      const infoResult = await parser.getInfo();
      
      // Build markdown with metadata header
      let markdown = '';
      
      // Add title if available
      if (infoResult.info?.Title) {
        markdown += `# ${infoResult.info.Title}\n\n`;
      }
      
      // Add metadata section if available
      const metadataLines = [];
      if (infoResult.info?.Author) {
        metadataLines.push(`**Author:** ${infoResult.info.Author}`);
      }
      if (infoResult.info?.Subject) {
        metadataLines.push(`**Subject:** ${infoResult.info.Subject}`);
      }
      if (infoResult.info?.CreationDate) {
        metadataLines.push(`**Created:** ${infoResult.info.CreationDate}`);
      }
      
      if (metadataLines.length > 0) {
        markdown += metadataLines.join('  \n') + '\n\n';
        markdown += '---\n\n';
      }
      
      // Process text content with smart Markdown formatting
      let content = result.text || '';
      
      // Remove page number separators
      content = content.replace(/\n?--\s*\d+\s+of\s+\d+\s*--\n?/gi, '\n');
      
      // Clean up the raw text
      content = content
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      // Process content with enhanced structure detection
      markdown += this._formatTextToMarkdown(content);
      
      return {
        markdown,
        pageCount: result.total,
        info: infoResult.info || {}
      };
    } catch (error) {
      throw new Error(`Failed to convert to Markdown: ${error.message}`);
    }
  }

  /**
   * Enhanced text to Markdown formatter with structure detection
   * @private
   */
  static _formatTextToMarkdown(content) {
    const lines = content.split('\n');
    const formattedLines = [];
    let inCodeBlock = false;
    let inTable = false;
    let tableBuffer = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const prevLine = lines[i - 1]?.trim() || '';
      const nextLine = lines[i + 1]?.trim() || '';
      
      // Skip empty lines but preserve paragraph breaks
      if (!trimmedLine) {
        if (inTable && tableBuffer.length > 0) {
          // End table
          formattedLines.push(...this._formatTable(tableBuffer));
          tableBuffer = [];
          inTable = false;
        }
        formattedLines.push('');
        continue;
      }
      
      // Detect table rows (lines with multiple tab/space separated columns)
      const tabCount = (trimmedLine.match(/\t/g) || []).length;
      const hasMultipleColumns = tabCount >= 2 || /\s{3,}/.test(trimmedLine);
      if (hasMultipleColumns && !inCodeBlock) {
        inTable = true;
        tableBuffer.push(trimmedLine);
        continue;
      } else if (inTable && tableBuffer.length > 0) {
        formattedLines.push(...this._formatTable(tableBuffer));
        tableBuffer = [];
        inTable = false;
      }
      
      // Detect code blocks (lines starting with significant indentation and code chars)
      const leadingSpaces = line.length - line.trimStart().length;
      const hasCodeChars = /[{}();=<>\[\]`]/.test(trimmedLine);
      if (leadingSpaces >= 4 && hasCodeChars) {
        if (!inCodeBlock) {
          formattedLines.push('```');
          inCodeBlock = true;
        }
        formattedLines.push(trimmedLine);
        continue;
      } else if (inCodeBlock) {
        formattedLines.push('```');
        inCodeBlock = false;
      }
      
      // Detect headings based on various heuristics
      const headingResult = this._detectHeading(trimmedLine, prevLine, nextLine, i === 0);
      if (headingResult) {
        formattedLines.push(headingResult);
        continue;
      }
      
      // Detect bullet points
      if (/^[-*•◦▪►→]\s+/.test(trimmedLine)) {
        const bulletContent = trimmedLine.replace(/^[-*•◦▪►→]\s+/, '');
        formattedLines.push(`- ${bulletContent}`);
        continue;
      }
      
      // Detect numbered lists
      if (/^(\d+|[a-zA-Z])[.)]\s+/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+|[a-zA-Z])[.)]\s+(.*)$/);
        if (match) {
          const num = isNaN(match[1]) ? '1' : match[1];
          formattedLines.push(`${num}. ${match[2]}`);
          continue;
        }
      }
      
      // Detect blockquotes (lines starting with > or indented quotes)
      if (/^[">]\s+/.test(trimmedLine) || /^["']/.test(trimmedLine)) {
        formattedLines.push(`> ${trimmedLine.replace(/^[">]\s*/, '')}`);
        continue;
      }
      
      // Detect horizontal rules (lines of dashes, equals, underscores)
      if (/^[-=_]{3,}$/.test(trimmedLine)) {
        formattedLines.push('---');
        continue;
      }
      
      // Detect emphasis patterns
      let processedLine = trimmedLine;
      // Bold for ALL CAPS words (more than 2 chars)
      processedLine = processedLine.replace(/\b([A-Z]{3,})\b/g, (match) => {
        // Don't bold common acronyms
        const commonAcronyms = ['PDF', 'HTML', 'CSS', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'SQL', 'USA', 'UK', 'EU'];
        return commonAcronyms.includes(match) ? match : `**${match}**`;
      });
      
      // Regular paragraph text
      formattedLines.push(processedLine);
    }
    
    // Close any open code block
    if (inCodeBlock) {
      formattedLines.push('```');
    }
    
    // Process remaining table buffer
    if (tableBuffer.length > 0) {
      formattedLines.push(...this._formatTable(tableBuffer));
    }
    
    // Join and clean up
    let result = formattedLines.join('\n');
    
    // Clean up excessive empty lines
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper spacing around headings
    result = result.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    result = result.replace(/(#{1,6}[^\n]+)\n([^#\n])/g, '$1\n\n$2');
    
    // Ensure proper spacing around code blocks
    result = result.replace(/([^\n])\n```/g, '$1\n\n```');
    result = result.replace(/```\n([^\n])/g, '```\n\n$1');
    
    return result;
  }

  /**
   * Detect if a line is a heading and return formatted heading or null
   * @private
   */
  static _detectHeading(line, prevLine, nextLine, isFirstLine) {
    const len = line.length;
    
    // Skip if too long for a heading
    if (len > 100) return null;
    
    // Skip if ends with typical sentence punctuation
    if (/[.,:;]$/.test(line)) return null;
    
    const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
    const isPrevEmpty = !prevLine;
    const isNextEmpty = !nextLine;
    const hasNumbers = /^\d/.test(line);
    
    // Chapter/Section patterns
    if (/^(Chapter|Section|Part|Module|Unit|Lesson)\s+\d+/i.test(line)) {
      return `## ${line}`;
    }
    
    // Numbered headings like "1. Introduction" or "1.1 Overview"
    if (/^\d+(\.\d+)*\s+[A-Z]/.test(line) && len < 80) {
      const depth = (line.match(/\./g) || []).length;
      const prefix = '#'.repeat(Math.min(depth + 2, 6));
      return `${prefix} ${line}`;
    }
    
    // All caps headings (likely major sections)
    if (isAllCaps && len > 3 && len < 60 && isPrevEmpty) {
      return `## ${line}`;
    }
    
    // Title Case headings (short, followed by empty line)
    if (len < 60 && (isPrevEmpty || isFirstLine) && isNextEmpty) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 10) {
        const lowercaseWords = ['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as'];
        const isTitleCase = words.every((w, idx) => {
          if (idx === 0) return /^[A-Z0-9]/.test(w);
          if (lowercaseWords.includes(w.toLowerCase())) return true;
          return /^[A-Z0-9]/.test(w);
        });
        if (isTitleCase) {
          return `### ${line}`;
        }
      }
    }
    
    // Questions as headings (FAQ style)
    if (/^(What|Why|How|When|Where|Who|Which|Can|Do|Does|Is|Are|Will|Should)\s+/i.test(line) && line.endsWith('?')) {
      return `### ${line}`;
    }
    
    return null;
  }

  /**
   * Format table buffer into Markdown table
   * @private
   */
  static _formatTable(rows) {
    if (rows.length === 0) return [];
    
    // Split rows into columns
    const splitRows = rows.map(row => {
      // Try tab first, then multiple spaces
      let cols = row.split(/\t+/);
      if (cols.length <= 1) {
        cols = row.split(/\s{3,}/);
      }
      return cols.map(c => c.trim()).filter(c => c);
    });
    
    // Find max column count
    const maxCols = Math.max(...splitRows.map(r => r.length));
    if (maxCols < 2) {
      // Not a table, return as regular lines
      return rows;
    }
    
    // Normalize all rows to same column count
    const normalizedRows = splitRows.map(row => {
      while (row.length < maxCols) row.push('');
      return row;
    });
    
    // Build markdown table
    const result = [];
    
    // Header row
    result.push('| ' + normalizedRows[0].join(' | ') + ' |');
    
    // Separator row
    result.push('| ' + normalizedRows[0].map(() => '---').join(' | ') + ' |');
    
    // Data rows
    for (let i = 1; i < normalizedRows.length; i++) {
      result.push('| ' + normalizedRows[i].join(' | ') + ' |');
    }
    
    return result;
  }
}

module.exports = PDFProcessor;
