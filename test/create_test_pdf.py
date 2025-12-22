"""
Create a simple test PDF for testing page numbers and protection features
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

def create_test_pdf(filename, num_pages=5):
    """Create a multi-page test PDF"""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    for page_num in range(1, num_pages + 1):
        # Add some content to each page
        c.setFont("Helvetica-Bold", 24)
        c.drawString(100, height - 100, f"Test Page {page_num}")
        
        c.setFont("Helvetica", 12)
        c.drawString(100, height - 150, f"This is page {page_num} of {num_pages}")
        c.drawString(100, height - 180, "This PDF is for testing:")
        c.drawString(100, height - 200, "• Add Page Numbers feature")
        c.drawString(100, height - 220, "• Protect PDF feature")
        
        # Add page footer
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(100, 50, "Test PDF created for feature testing")
        
        c.showPage()
    
    c.save()
    print(f"✅ Created {filename} with {num_pages} pages")

if __name__ == "__main__":
    # Create test directory if it doesn't exist
    os.makedirs("test_pdfs", exist_ok=True)
    
    # Create test PDFs
    create_test_pdf("test_pdfs/test_5_pages.pdf", 5)
    create_test_pdf("test_pdfs/test_3_pages.pdf", 3)
    
    print("\n✅ Test PDFs created successfully!")
    print("📁 Files saved in: test_pdfs/")
