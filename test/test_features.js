/**
 * Automated test script for Add Page Numbers and Protect PDF features
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const BASE_URL = 'http://localhost:5000';
const TEST_PDF_PATH = path.join(__dirname, '..', 'test_pdfs', 'test_5_pages.pdf');
const OUTPUT_DIR = path.join(__dirname, '..', 'test_output');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function testAddPageNumbers() {
  console.log('\n🔢 Testing Add Page Numbers Feature...');
  console.log('─'.repeat(60));

  const tests = [
    {
      name: 'Bottom Right - Simple Number',
      config: {
        position: 'bottom-right',
        format: 'number',
        startNumber: 1,
        pageRange: '',
        fontSize: 12,
        margin: 20
      }
    },
    {
      name: 'Top Center - Page X of Y',
      config: {
        position: 'top-center',
        format: 'page-of-total',
        startNumber: 1,
        pageRange: '',
        fontSize: 14,
        margin: 25
      }
    },
    {
      name: 'Bottom Left - Specific Pages',
      config: {
        position: 'bottom-left',
        format: 'page-number',
        startNumber: 1,
        pageRange: '1-3,5',
        fontSize: 10,
        margin: 15
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n  Testing: ${test.name}`);
      
      const formData = new FormData();
      formData.append('pdf', fs.createReadStream(TEST_PDF_PATH));
      formData.append('position', test.config.position);
      formData.append('format', test.config.format);
      formData.append('startNumber', test.config.startNumber);
      formData.append('pageRange', test.config.pageRange);
      formData.append('fontSize', test.config.fontSize);
      formData.append('margin', test.config.margin);

      const response = await axios.post(`${BASE_URL}/api/pdf/add-page-numbers`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 10000
      });

      if (response.status === 200) {
        const outputPath = path.join(OUTPUT_DIR, `numbered_${test.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        fs.writeFileSync(outputPath, response.data);
        
        // Verify PDF is valid
        const pdfDoc = await PDFDocument.load(response.data);
        const pageCount = pdfDoc.getPageCount();
        
        console.log(`  ✅ Success! Generated PDF with ${pageCount} pages`);
        console.log(`     Saved to: ${path.basename(outputPath)}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testProtectPDF() {
  console.log('\n\n🔒 Testing Protect PDF Feature...');
  console.log('─'.repeat(60));

  const tests = [
    {
      name: 'User Password Only',
      config: {
        userPassword: 'test123',
        ownerPassword: '',
        allowPrinting: 'true',
        allowModifying: 'false',
        allowCopying: 'false',
        allowAnnotating: 'false',
        allowFillingForms: 'true',
        allowContentAccessibility: 'true',
        allowDocumentAssembly: 'false'
      }
    },
    {
      name: 'User + Owner Passwords',
      config: {
        userPassword: 'user123',
        ownerPassword: 'owner456',
        allowPrinting: 'true',
        allowModifying: 'false',
        allowCopying: 'false',
        allowAnnotating: 'false',
        allowFillingForms: 'false',
        allowContentAccessibility: 'true',
        allowDocumentAssembly: 'false'
      }
    },
    {
      name: 'Maximum Restrictions',
      config: {
        userPassword: 'secure',
        ownerPassword: 'admin',
        allowPrinting: 'false',
        allowModifying: 'false',
        allowCopying: 'false',
        allowAnnotating: 'false',
        allowFillingForms: 'false',
        allowContentAccessibility: 'true',
        allowDocumentAssembly: 'false'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n  Testing: ${test.name}`);
      
      const formData = new FormData();
      formData.append('pdf', fs.createReadStream(TEST_PDF_PATH));
      
      Object.entries(test.config).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(`${BASE_URL}/api/pdf/protect`, formData, {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 10000
      });

      if (response.status === 200) {
        const outputPath = path.join(OUTPUT_DIR, `protected_${test.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        fs.writeFileSync(outputPath, response.data);
        
        console.log(`  ✅ Success! Protected PDF created`);
        console.log(`     Saved to: ${path.basename(outputPath)}`);
        console.log(`     User Password: ${test.config.userPassword}`);
        if (test.config.ownerPassword) {
          console.log(`     Owner Password: ${test.config.ownerPassword}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function runTests() {
  console.log('\n📋 Automated Feature Testing');
  console.log('═'.repeat(60));
  console.log(`Test PDF: ${path.basename(TEST_PDF_PATH)}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  
  try {
    // Check if server is running
    await axios.get(BASE_URL, { timeout: 3000 });
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Server is not running! Please start the server first.');
    console.error('   Run: npm start');
    process.exit(1);
  }

  try {
    await testAddPageNumbers();
    await testProtectPDF();
    
    console.log('\n\n═'.repeat(60));
    console.log('✅ All tests completed!');
    console.log(`📁 Output files saved to: ${OUTPUT_DIR}`);
    console.log('\n💡 Manual verification recommended:');
    console.log('   1. Open numbered PDFs and verify page numbers appear correctly');
    console.log('   2. Try opening protected PDFs - should prompt for password');
    console.log('   3. After entering password, verify permissions are enforced');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
