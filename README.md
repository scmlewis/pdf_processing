# PDF Processor Web Application

A full-stack web application for processing, combining, and manipulating PDF files. Built with React (frontend) and Node.js/Express (backend).

## Features

### Core Operations
- ✅ **Combine PDFs** - Merge multiple PDF files into a single document
- ✅ **Extract Pages** - Extract specific pages from a PDF
- ✅ **Reorder Pages** - Rearrange pages in custom order
- ✅ **Rotate Pages** - Rotate specific pages (90°, 180°, 270°)
- ✅ **Add Watermark** - Add text watermarks with customizable options
- ✅ **Compress PDF** - Reduce PDF file size
- ✅ **View Metadata** - Display PDF information and page dimensions
- ✅ **Split PDF** - Split PDF into individual page files
- ✅ **Delete Pages** - Remove specific pages from a PDF

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
- **multer** - File upload middleware
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

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
- **File:** PDF file
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
Change the PORT in `.env` or use:
```bash
npm start -- --port 3001
```

### CORS errors
Make sure both servers are running and the proxy is configured correctly in `client/package.json`

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
