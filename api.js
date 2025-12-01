const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pdfRoutes = require('./server/routes/pdf');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Try to find the React build
const buildPaths = [
  path.join(__dirname, 'api/public'),
  path.join(__dirname, 'client/build'),
];

let buildPath = null;
for (const p of buildPaths) {
  if (fs.existsSync(p)) {
    buildPath = p;
    break;
  }
}

// Serve static files
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
    environment: process.env.NODE_ENV || 'development',
    buildPath: buildPath || 'not found'
  });
});

// Serve React app - catch-all
app.get('*', (req, res) => {
  if (buildPath) {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;

