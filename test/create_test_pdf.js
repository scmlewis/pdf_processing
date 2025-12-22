/**
 * Create test PDF files for testing features
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function createTestPDF(filename, numPages) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 1; i <= numPages; i++) {
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    // Title
    page.drawText(`Test Page ${i}`, {
      x: 100,
      y: height - 100,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Subtitle
    page.drawText(`This is page ${i} of ${numPages}`, {
      x: 100,
      y: height - 150,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Content
    page.drawText('This PDF is for testing:', {
      x: 100,
      y: height - 180,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('• Add Page Numbers feature', {
      x: 100,
      y: height - 200,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('• Protect PDF feature', {
      x: 100,
      y: height - 220,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Footer
    page.drawText('Test PDF created for feature testing', {
      x: 100,
      y: 50,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(filename, pdfBytes);
  console.log(`✅ Created ${filename} with ${numPages} pages`);
}

async function main() {
  try {
    // Create test directory
    const testDir = path.join(__dirname, '..', 'test_pdfs');
    await fs.mkdir(testDir, { recursive: true });

    // Create test PDFs
    await createTestPDF(path.join(testDir, 'test_5_pages.pdf'), 5);
    await createTestPDF(path.join(testDir, 'test_3_pages.pdf'), 3);

    console.log('\n✅ Test PDFs created successfully!');
    console.log('📁 Files saved in: test_pdfs/');
  } catch (error) {
    console.error('Error creating test PDFs:', error);
    process.exit(1);
  }
}

main();
