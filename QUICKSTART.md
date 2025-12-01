# Quick Start Guide

## 🚀 Getting Started with PDF Processor Web App

### Prerequisites
- Node.js v14 or higher
- npm v6 or higher

### Step 1: Install All Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Step 2: Start the Application

**Option A: Development Mode (Two Terminals)**

Terminal 1 - Start Backend Server:
```bash
npm start
```
Server will run on: `http://localhost:5000`

Terminal 2 - Start React Development Server:
```bash
npm run client
```
Client will run on: `http://localhost:3000` (opens automatically)

**Option B: Using VS Code Tasks**
1. Press `Ctrl+Shift+B` to open the task menu
2. Select "Start Server" to run the backend
3. Open another terminal and select "Start Client (React)"

### Step 3: Use the Application
Open your browser and navigate to `http://localhost:3000`

## 📋 Available Features

### Tab Navigation
Click through the tabs to access different PDF operations:

1. **Combine** - Merge multiple PDF files
2. **Extract Pages** - Keep only specific pages
3. **Reorder** - Rearrange pages in custom order
4. **Rotate** - Rotate pages (90°, 180°, 270°)
5. **Watermark** - Add text watermark with customization
6. **Compress** - Reduce PDF file size
7. **Metadata** - View PDF information
8. **Split** - Split PDF into individual pages
9. **Delete Pages** - Remove specific pages

## 🔧 VS Code Tasks

Open the task menu with `Ctrl+Shift+B`:
- **Install Dependencies** - Install all npm packages
- **Start Server** - Launch backend (port 5000)
- **Start Client** - Launch React app (port 3000)
- **Build Client** - Build React for production

## 📁 File Management

Processed PDFs are temporarily stored in `server/uploads/`
- Files are automatically named with timestamps
- Clean up old files periodically to free space

## 🌐 API Endpoints

All API endpoints are prefixed with `/api/pdf/`:
- `POST /combine` - Combine PDFs
- `POST /extract` - Extract pages
- `POST /reorder` - Reorder pages
- `POST /rotate` - Rotate pages
- `POST /watermark` - Add watermark
- `POST /compress` - Compress PDF
- `POST /metadata` - Get metadata
- `POST /split` - Split PDF
- `POST /delete-pages` - Delete pages
- `GET /download/:filename` - Download result

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is in use, modify `.env`:
```
PORT=3001
```

### CORS Errors
Ensure both servers are running:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Module Not Found
Run installation again:
```bash
npm install
cd client && npm install && cd ..
```

### Build Issues
Clear node_modules and reinstall:
```bash
rm -r node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

## 📦 Production Build

1. Build the React app:
   ```bash
   cd client && npm run build && cd ..
   ```

2. Start the server (serves built React app):
   ```bash
   npm start
   ```

3. Access the app at `http://localhost:5000`

## 💡 Tips

- Use **Combine** to merge multiple document sources
- Use **Watermark** for confidential documents
- Use **Split** to extract individual pages for distribution
- Use **Metadata** to check document properties before processing
- Use **Compress** for email sharing or web uploads

## 📝 Next Steps

- Customize the styling in `client/src/components/TabStyles.css`
- Add more PDF operations in `server/pdfProcessor.js`
- Implement file size validation in `server/routes/pdf.js`
- Add user authentication for production use

Enjoy! 🎉
