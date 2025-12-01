const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pdfRoutes = require('../server/routes/pdf');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client build
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

// API Routes
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PDF Processing Server is running' });
});

// Serve React app - catch-all for client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
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

