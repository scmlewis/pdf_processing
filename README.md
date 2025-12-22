# PDF Processor Web Application

A full-stack web application for processing, combining, and manipulating PDF files. Built with React (frontend) and Node.js/Express (backend).

## Features

### Core Operations
- ✅ **Combine PDFs** - Merge multiple PDF files into a single document
- ✅ **Extract Pages** - Extract specific pages from a PDF (supports page ranges)
- ✅ **Reorder Pages** - Rearrange pages via drag-and-drop interface
- ✅ **Rotate Pages** - Rotate specific pages (90°, 180°, 270°) with page range support
- ✅ **Add Watermark** - Add text watermarks with customizable options
- ✅ **Compress PDF** - Reduce PDF file size
- ✅ **View Metadata** - Display PDF information and page dimensions
- ✅ **Split PDF** - Split PDF into individual page files
- ✅ **Delete Pages** - Remove specific pages from a PDF (supports page ranges)
- ✅ **Add Page Numbers** - Add customizable page numbers (6 positions, 3 formats, custom ranges)
- ✅ **Protect PDF** - Encrypt PDFs with password protection (AES-256) and permissions

### Enhanced Features
- 📄 **Page Thumbnails** - Visual preview of all pages in grid layout
- 📊 **Progress Indicators** - Real-time progress bars with ETA for all operations
- 📁 **Recent Files** - Track recently processed files with quick access
- ✅ **File Validation** - Pre-upload validation (50MB limit, PDF-only, 50 files max)
- 🔢 **Page Range Parser** - Support for complex ranges like "1-5,7,10-15"
- 🎨 **Modern UI** - Dark/light theme support with responsive design

## Project Structure

```
pdf_processing/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── pdfProcessor.js          # PDF processing logic
│   ├── routes/
│   │   └── pdf.js              # API routes for PDF operations
│   └── uploads/                # Temporary file storage
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js              # Main React component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── components/
│   │       ├── CommonComponents.js
│   │       ├── CombineTab.js
│   │       ├── ExtractTab.js
│   │       ├── ReorderTab.js
│   │       ├── RotateTab.js
│   │       ├── WatermarkTab.js
│   │       ├── CompressTab.js
│   │       ├── MetadataTab.js
│   │       ├── SplitTab.js
│   │       ├── DeleteTab.js
│   │       └── TabStyles.css
│   └── package.json
├── package.json
└── README.md
```

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **pdf-lib** - PDF manipulation library
- **QPDF** - PDF encryption and security (AES-256)
- **multer** - File upload middleware
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **react-beautiful-dnd** - Drag-and-drop page reordering
- **CSS3** - Modern styling with CSS variables

### Deployment
- **Render.com** - Cloud hosting with auto-deploy from GitHub
- **Live URL:** https://pdf-processor-uugw.onrender.com

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- **QPDF** (for PDF encryption feature)
  - Windows: `winget install QPDF.QPDF`
  - macOS: `brew install qpdf`
  - Linux: `apt-get install qpdf` or `yum install qpdf`

### Setup

1. **Install server dependencies:**
   ```bash
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client && npm install && cd ..
   ```

## Running the Application

### Development Mode

**Terminal 1 - Start the backend server:**
```bash
npm start
```
Server runs on `http://localhost:5000`

**Terminal 2 - Start the React development server:**
```bash
npm run client
```
Client runs on `http://localhost:3000`

### Production Mode

1. **Build the React app:**
   ```bash
   cd client && npm run build && cd ..
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:5000`

## API Endpoints

### POST /api/pdf/combine
Combine multiple PDFs into one
- **Files:** Multiple PDF files
- **Response:** Download URL for combined PDF

### POST /api/pdf/extract
Extract specific pages from a PDF
- **File:** PDF file
- **pageIndices:** Array of page indices (0-based)
- **Response:** Download URL for extracted PDF

### POST /api/pdf/reorder
Reorder pages in a PDF
- **File:** PDF file
- **newOrder:** Array with new page order
- **Response:** Download URL for reordered PDF

### POST /api/pdf/rotate
Rotate specific pages
- **File:** PDF file
- **pageIndices:** Array of page indices to rotate
- **angle:** Rotation angle (90, 180, 270)
- **Response:** Download URL for rotated PDF

### POST /api/pdf/watermark
Add watermark to PDF
- **File:** PDF file
- **text:** Watermark text
- **fontSize:** Font size (20-100)
- **opacity:** Opacity (0-1)
- **angle:** Rotation angle
- **Response:** Download URL for watermarked PDF

### POST /api/pdf/compress
Compress a PDF file
- **File:** PDF file
- **Response:** Download URL for compressed PDF

### POST /api/pdf/metadata
Get PDF metadata and information
- **File:** PDF file
- **Response:** Metadata object with page count, dimensions, etc.

### POST /api/pdf/split
Split PDF into individual page files
- **File:** PDF file
- **Response:** List of download URLs for individual pages

### POST /api/pdf/delete-pages
Delete specific pages from a PDF
- **POST /api/pdf/add-page-numbers
Add page numbers to a PDF
- **File:** PDF file
- **position:** Position (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
- **format:** Format (numeric, roman, alphabetic)
- **fontSize:** Font size (8-72)
- **pageRange:** Optional page range (e.g., "1-5,10")
- **Response:** Download URL for numbered PDF

### POST /api/pdf/protect
Protect PDF with password and permissions
- **File:** PDF file
- **userPassword:** Password to open the PDF
- **ownerPassword:** Optional owner password
- **permissions:** Object with permission settings (printing, modifying, copying, etc.)
- **Response:** Download URL for encrypted PDF

### File:** PDF file
- **pageIndices:** Array of page indices to delete
- **Response:** Download URL for modified PDF

### GET /api/pdf/download/:filename
Download a processed PDF file

## Configuration

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Port already in use
ChaRecent Updates

### Version 2.0 (December 2025)
- ✅ Added **Page Numbers** feature with customizable positioning and formatting
- ✅ Added **Protect PDF** feature with AES-256 encryption
- ✅ Implemented drag-and-drop page reordering
- ✅ Added visual page thumbnails for all operations
- ✅ Enhanced progress indicators with ETA
- ✅ Added recent files tracking
- ✅ Implemented page range parser (e.g., "1-5,8,10-15")
- ✅ Added pre-upload file validation
- ✅ Migrated from Vercel to Render.com for better reliability

## Future Enhancements

- 📸 PDF to JPG conversion
- 🔓 Unlock/decrypt protected PDFs
- ✂️ Crop pages functionality
- 🖼️ JPG to PDF conversion
- 📝 OCR capabilities
- 📎 Digital signatures
- 🗂️ Batch processing improvements
### Large file uploads
Modify multer settings in `server/routes/pdf.js` if needed for larger files

## Performance Tips

- Use PDF compression for large files
- Avoid processing very large PDFs (>100MB) in watermarking operations
- Clear the `server/uploads` directory periodically to free up space

## Future Enhancements

- PDF image extraction
- OCR capabilities
- PDF annotation tools
- Batch processing improvements
- AWS S3 integration for file storage
- Docker containerization

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
