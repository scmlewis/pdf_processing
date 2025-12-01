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

// Try multiple possible build locations
const possibleBuildPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../client/build'),
  path.join(__dirname, '../../client/build'),
  '/var/task/api/public',
  '/var/task/client/build'
];

let buildPath = null;
for (const p of possibleBuildPaths) {
  try {
    if (fs.existsSync(p)) {
      buildPath = p;
      console.log('✓ Found build at:', buildPath);
      break;
    }
  } catch (e) {
    console.log('✗ Checked:', p, 'Error:', e.message);
  }
}

// Serve static files if build exists
if (buildPath) {
  app.use(express.static(buildPath));
}

// API Routes
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PDF Processing Server is running',
    buildPath: buildPath || 'Not found'
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
    availablePaths: possibleBuildPaths
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;


