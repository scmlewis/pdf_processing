const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pdfRoutes = require('../server/routes/pdf');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Try multiple possible build locations for different deployment environments
const possibleBuildPaths = [
  path.join(__dirname, '../client/build'),      // Local development
  path.join(__dirname, 'public'),                 // After copy-build script
  path.join(__dirname, '../api/public'),          // Alternative path
  '/var/task/client/build',                       // Vercel
  '/var/task/api/public',                         // Vercel
  '/opt/render/project/src/client/build',        // Render
  path.join(process.cwd(), 'client/build'),      // Current working directory (Render)
  path.join(process.cwd(), 'api/public')         // Current working directory (Render)
];

let buildPath = null;
for (const p of possibleBuildPaths) {
  try {
    if (fs.existsSync(p)) {
      buildPath = p;
      console.log('[Startup] Found build at:', buildPath);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

if (!buildPath) {
  console.log('[Startup] Warning: Build directory not found');
  console.log('[Startup] Current working directory:', process.cwd());
  console.log('[Startup] __dirname:', __dirname);
  console.log('[Startup] Checked paths:', possibleBuildPaths);
}

// Serve static files if build exists
if (buildPath) {
  app.use(express.static(buildPath));
  console.log('[Startup] Serving static files from:', buildPath);
}

// API Routes
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PDF Processing Server is running',
    buildPath: buildPath || 'Not found',
    timestamp: new Date().toISOString()
  });
});

// Serve React app - catch-all for client routes
app.get('*', (req, res) => {
  if (buildPath) {
    const indexPath = path.join(buildPath, 'index.html');
    try {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
    } catch (e) {
      console.error('Error serving index.html:', e.message);
    }
  }
  
  // Fallback if no index.html found
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'Static files not found. Build path: ' + (buildPath || 'Not configured'),
    availablePaths: possibleBuildPaths,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;


