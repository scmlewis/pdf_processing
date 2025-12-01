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

// Serve static files from public directory (which contains the React build)
const buildPath = path.join(__dirname, 'public');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log('Serving static files from:', buildPath);
}

// API Routes
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PDF Processing Server is running' });
});

// Serve React app - catch-all for client routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Not Found', 
      message: 'Application not found'
    });
  }
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


