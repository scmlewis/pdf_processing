# Manual Testing Guide for New Features

## 🔢 Add Page Numbers Feature Testing

### Test 1: Basic Page Numbers (Bottom Right)
1. Navigate to the "🔢 Page Numbers" tab (press '0' key)
2. Upload: `test_pdfs/test_5_pages.pdf`
3. Settings:
   - Position: Bottom Right
   - Format: Number (1, 2, 3...)
   - Start Number: 1
   - Page Range: (leave empty)
   - Font Size: 12pt
   - Margin: 20pt
4. Click "Add Page Numbers"
5. **Expected**: PDF downloads with numbers 1-5 at bottom right of each page

### Test 2: Top Center with "Page X of Y" Format
1. Upload: `test_pdfs/test_5_pages.pdf`
2. Settings:
   - Position: Top Center
   - Format: Page X of Y
   - Start Number: 1
   - Page Range: (leave empty)
   - Font Size: 14pt
   - Margin: 25pt
3. Click "Add Page Numbers"
4. **Expected**: PDF downloads with "Page 1 of 5", "Page 2 of 5", etc. at top center

### Test 3: Page Range (Specific Pages Only)
1. Upload: `test_pdfs/test_5_pages.pdf`
2. Settings:
   - Position: Bottom Left
   - Format: Page X
   - Start Number: 1
   - Page Range: `1-3,5` (pages 1, 2, 3, and 5 only)
   - Font Size: 10pt
   - Margin: 15pt
3. Click "Add Page Numbers"
4. **Expected**: Page numbers only on pages 1, 2, 3, and 5 (page 4 has no number)

### Test 4: Custom Start Number
1. Upload: `test_pdfs/test_3_pages.pdf`
2. Settings:
   - Position: Bottom Center
   - Format: Number (1, 2, 3...)
   - Start Number: 10
   - Page Range: (leave empty)
   - Font Size: 12pt
   - Margin: 20pt
3. Click "Add Page Numbers"
4. **Expected**: Pages numbered 10, 11, 12

---

## 🔒 Protect PDF Feature Testing

### Test 5: User Password Only
1. Navigate to the "🔒 Protect" tab (press 'P' key)
2. Upload: `test_pdfs/test_3_pages.pdf`
3. Settings:
   - User Password: `test123`
   - Owner Password: (leave empty)
4. Click "Protect PDF"
5. **Expected**: Protected PDF downloads
6. **Verification**: 
   - Try opening the PDF - should prompt for password
   - Enter `test123` - PDF should open successfully

### Test 6: User + Owner Passwords with Restrictions
1. Upload: `test_pdfs/test_3_pages.pdf`
2. Settings:
   - User Password: `user123`
   - Owner Password: `owner456`
3. Click "▶ Advanced Permissions" to expand
4. Uncheck these:
   - ☐ Allow Modifying Content
   - ☐ Allow Copying Text/Images
   - ☐ Allow Adding Annotations
5. Keep checked:
   - ☑ Allow Printing
   - ☑ Allow Filling Form Fields
   - ☑ Allow Content Accessibility
6. Click "Protect PDF"
7. **Expected**: Protected PDF with restrictions downloads
8. **Verification**:
   - Open with password `user123`
   - Try to copy text - should be blocked
   - Try to add comments - should be blocked
   - Printing should be allowed

### Test 7: Maximum Security
1. Upload: `test_pdfs/test_5_pages.pdf`
2. Settings:
   - User Password: `secure`
   - Owner Password: `admin`
3. Click "▶ Advanced Permissions"
4. Uncheck ALL except:
   - ☑ Allow Content Accessibility (for screen readers)
5. Click "Protect PDF"
6. **Expected**: Highly restricted PDF downloads
7. **Verification**:
   - Open with password `secure`
   - All operations except viewing should be blocked

### Test 8: Error Handling - No Password
1. Upload any PDF
2. Leave both password fields empty
3. Click "Protect PDF"
4. **Expected**: Button should be disabled OR error message

---

## 🧪 Integration Tests

### Test 9: Combine Features
1. Start with `test_pdfs/test_5_pages.pdf`
2. First add page numbers (Top Center, "Page X of Y")
3. Download the numbered PDF
4. Re-upload the numbered PDF to Protect tab
5. Add password protection (`test123`)
6. Download and verify:
   - PDF requires password
   - Page numbers are still visible after entering password

### Test 10: Recent Files Tracking
1. Add page numbers to a PDF
2. Check "🕒 Recent" button in top-right
3. **Expected**: Should see "Add Page Numbers" operation listed
4. Protect a PDF
5. Check Recent again
6. **Expected**: Should see both operations listed

### Test 11: Progress Indicator
1. Upload a larger PDF (or wait to observe)
2. Start processing
3. **Expected**: Should see progress bar with elapsed time
4. **Expected**: After 5% progress, should show ETA

---

## ✅ Checklist

- [ ] Test 1: Basic page numbers work
- [ ] Test 2: Different positions and formats work
- [ ] Test 3: Page range filtering works
- [ ] Test 4: Custom start numbers work
- [ ] Test 5: Password protection works
- [ ] Test 6: Permission restrictions work
- [ ] Test 7: Maximum security settings work
- [ ] Test 8: Error handling works
- [ ] Test 9: Features can be combined
- [ ] Test 10: Recent files tracking works
- [ ] Test 11: Progress indicators work

---

## 📝 Test Files Location

- **Input PDFs**: `test_pdfs/`
  - `test_5_pages.pdf` (5 pages)
  - `test_3_pages.pdf` (3 pages)

- **Output PDFs**: Browser Downloads folder
  - `test_5_pages_numbered.pdf`
  - `test_5_pages_protected.pdf`
  - etc.

---

## 🐛 Known Issues to Watch For

1. **Page range parsing**: Ensure "1-3,5" works correctly
2. **Font size limits**: Should stay between 6-24pt
3. **Margin limits**: Should stay between 10-50pt
4. **Password validation**: Should require at least one password
5. **Large files**: Test with files close to 50MB limit
6. **Empty page range**: Should apply to all pages

---

## 📊 Expected Results Summary

All tests should pass without errors. The features should:
- ✅ Process PDFs quickly (< 5 seconds for small files)
- ✅ Maintain PDF quality and readability
- ✅ Show clear progress indicators
- ✅ Display success/error toasts
- ✅ Track operations in Recent Files
- ✅ Handle edge cases gracefully
- ✅ Work consistently across different PDFs

---

**Testing Date**: December 22, 2025  
**Tested By**: ___________________  
**Status**: ___________________
