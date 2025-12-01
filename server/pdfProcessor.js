/**
 * PDF processing utilities using pdf-lib
 */

const { PDFDocument, PDFPage, rgb } = require('pdf-lib');
const fs = require('fs').promises;

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
  static async splitPDF(inputPath, outputDir) {
    try {
      const pdfBytes = await fs.readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const files = [];

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);

        const outputPath = `${outputDir}/page_${i + 1}.pdf`;
        const outputBytes = await newPdf.save();
        await fs.writeFile(outputPath, outputBytes);
        files.push(`page_${i + 1}.pdf`);
      }

      return { success: true, files, message: `PDF split into ${files.length} files` };
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
}

module.exports = PDFProcessor;
