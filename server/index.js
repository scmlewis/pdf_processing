/**
 * Main Express server for PDF processing
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[Startup] Created uploads directory:', uploadsDir);
} else {
  console.log('[Startup] Uploads directory exists:', uploadsDir);
}

// Try multiple possible build locations for different deployment environments
const possibleBuildPaths = [
  path.join(__dirname, '../client/build'),        // Local & after copy-build
  path.join(__dirname, 'public'),                  // Alternative
  path.join(__dirname, '../api/public'),           // After copy-build to api
  path.join(process.cwd(), 'client/build'),       // Render CWD
  path.join(process.cwd(), 'api/public'),         // Render CWD alternative
  '/opt/render/project/src/client/build'          // Render explicit
];

let buildPath = null;
for (const p of possibleBuildPaths) {
  try {
    if (fs.existsSync(p)) {
      buildPath = p;
      console.log('[Startup] Found React build at:', buildPath);
      break;
    }
  } catch (e) {
    // Continue
  }
}

if (!buildPath) {
  console.log('[Startup] WARNING: React build not found!');
  console.log('[Startup] CWD:', process.cwd());
  console.log('[Startup] __dirname:', __dirname);
  console.log('[Startup] Checked:', possibleBuildPaths);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Serve static files
if (buildPath) {
  app.use(express.static(buildPath));
}

// API Routes (must come BEFORE static middleware)
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PDF Processing Server is running',
    buildPath: buildPath || 'not found'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  const fs = require('fs');
  const dirs = {
    cwd: process.cwd(),
    dirname: __dirname,
    buildPath: buildPath,
    buildExists: buildPath ? fs.existsSync(buildPath) : false,
    indexExists: buildPath ? fs.existsSync(require('path').join(buildPath, 'index.html')) : false,
    apiPublicExists: fs.existsSync(require('path').join(__dirname, '../api/public')),
    clientBuildExists: fs.existsSync(require('path').join(__dirname, '../client/build'))
  };
  res.json(dirs);
});

// Serve React app - catch all (must come AFTER all /api routes)
app.get('*', (req, res) => {
  if (buildPath) {
    const indexPath = path.join(buildPath, 'index.html');
    try {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
    } catch (e) {
      console.error('Error sending index.html:', e.message);
    }
  }
  
  res.status(404).json({ 
    error: 'Not Found',
    message: buildPath ? 'index.html not found' : 'Build path not found'
  });
});;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

try {
  app.listen(PORT, () => {
    console.log(`PDF Processing Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

