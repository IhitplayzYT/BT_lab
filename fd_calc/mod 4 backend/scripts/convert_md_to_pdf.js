const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function convertMarkdownToPDF(mdPath, pdfPath) {
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    
    doc.pipe(stream);
    
    // Title
    const lines = mdContent.split('\n');
    let y = 50;
    
    lines.forEach(line => {
        if (line.startsWith('# ')) {
            doc.fontSize(20).font('Helvetica-Bold').text(line.substring(2), 50, y);
            y += 30;
        } else if (line.startsWith('## ')) {
            doc.fontSize(16).font('Helvetica-Bold').text(line.substring(3), 50, y);
            y += 25;
        } else if (line.startsWith('### ')) {
            doc.fontSize(14).font('Helvetica-Bold').text(line.substring(4), 50, y);
            y += 20;
        } else if (line.startsWith('|')) {
            // Table - skip for simplicity
        } else if (line.startsWith('- ')) {
            doc.fontSize(10).font('Helvetica').text('• ' + line.substring(2), 70, y);
            y += 15;
        } else if (line.trim() === '') {
            y += 10;
        } else if (line.startsWith('```')) {
            // Code block - skip for simplicity
        } else if (line.startsWith('**')) {
            doc.fontSize(10).font('Helvetica-Bold').text(line.replace(/\*\*/g, ''), 50, y);
            y += 15;
        } else {
            doc.fontSize(10).font('Helvetica').text(line, 50, y);
            y += 15;
        }
        
        // Add new page if needed
        if (y > 700) {
            doc.addPage();
            y = 50;
        }
    });
    
    doc.end();
    
    stream.on('finish', () => {
        console.log(`PDF generated: ${pdfPath}`);
    });
}

// Convert FD Calculator audit
const fdMd = '/home/ihitplayzyt/Downloads/BT_LAB/fd_calc/mod 4 backend/FD_Calculator_Code_Audit.md';
const fdPdf = '/home/ihitplayzyt/Downloads/BT_LAB/fd_calc/mod 4 backend/FD_Calculator_Code_Audit.pdf';
convertMarkdownToPDF(fdMd, fdPdf);

// Convert Product & Pricing audit
const ppMd = '/home/ihitplayzyt/Downloads/BT_LAB/banking-product-backend/Product_Pricing_Code_Audit.md';
const ppPdf = '/home/ihitplayzyt/Downloads/BT_LAB/banking-product-backend/Product_Pricing_Code_Audit.pdf';
convertMarkdownToPDF(ppMd, ppPdf);
