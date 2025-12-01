const fs = require('fs');
const path = require('path');

// Copy client build to api/public
const srcDir = path.join(__dirname, 'client', 'build');
const destDir = path.join(__dirname, 'api', 'public');

if (fs.existsSync(srcDir)) {
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Recursive copy function
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const stat = fs.statSync(srcFile);

      if (stat.isDirectory()) {
        copyRecursive(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });
  }

  copyRecursive(srcDir, destDir);
  console.log('✓ Copied client build to api/public');
} else {
  console.error('✗ Client build directory not found:', srcDir);
}
