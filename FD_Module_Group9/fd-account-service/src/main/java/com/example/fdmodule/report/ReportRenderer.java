package com.example.fdmodule.report;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Turns a {@link ReportData} into a downloadable file: CSV, PDF (OpenPDF) or Excel (Apache POI). */
@Component
public class ReportRenderer {

    public record Rendered(byte[] body, String contentType, String fileName) { }

    public static boolean isFileFormat(String format) {
        return "csv".equalsIgnoreCase(format) || "pdf".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format);
    }

    public Rendered render(ReportData data, String format, String baseName) {
        try {
            return switch (format.toLowerCase()) {
                case "csv" -> new Rendered(CsvWriter.toCsv(data.columns(), data.rows()).getBytes(StandardCharsets.UTF_8),
                        "text/csv; charset=UTF-8", baseName + ".csv");
                case "pdf" -> new Rendered(pdf(data), "application/pdf", baseName + ".pdf");
                case "xlsx" -> new Rendered(xlsx(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", baseName + ".xlsx");
                default -> throw new IllegalArgumentException("format must be json, csv, pdf or xlsx");
            };
        } catch (IOException | DocumentException e) {
            throw new IllegalStateException("Could not build " + format + " report", e);
        }
    }

    private static byte[] pdf(ReportData data) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 60, 60);
        PdfWriter writer = PdfWriter.getInstance(doc, out);
        
        // Page event handler for page numbers and footer
        writer.setPageEvent(new com.lowagie.text.pdf.PdfPageEventHelper() {
            @Override
            public void onEndPage(com.lowagie.text.pdf.PdfWriter writer, com.lowagie.text.Document document) {
                try {
                    com.lowagie.text.pdf.PdfContentByte canvas = writer.getDirectContent();
                    canvas.saveState();
                    canvas.beginText();
                    canvas.setFontAndSize(com.lowagie.text.pdf.BaseFont.createFont(), 8);
                    canvas.showTextAligned(com.lowagie.text.pdf.PdfContentByte.ALIGN_CENTER,
                        "Page " + document.getPageNumber() + " of " + writer.getPageNumber(),
                        (document.right() - document.left()) / 2 + document.leftMargin(),
                        document.bottom() - 15, 0);
                    canvas.endText();
                    canvas.restoreState();
                } catch (Exception e) {
                    // Silently ignore page number errors to not break report generation
                }
            }
        });
        
        doc.open();
        
        // Title with professional styling
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, java.awt.Color.BLUE);
        Paragraph title = new Paragraph(data.title(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(5);
        doc.add(title);
        
        // Subtitle with row count and date
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, java.awt.Color.GRAY);
        Paragraph subtitle = new Paragraph("Total Records: " + data.rows().size() + " | Generated: " + 
            java.time.LocalDate.now().toString(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(25);
        doc.add(subtitle);
        
        // Create table with intelligent column widths
        PdfPTable table = new PdfPTable(data.columns().size());
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        
        // Calculate column widths based on content type
        float[] columnWidths = calculateColumnWidths(data.columns());
        table.setWidths(columnWidths);
        
        // Header row with professional styling
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, java.awt.Color.WHITE);
        java.awt.Color headerBg = new java.awt.Color(41, 128, 185); // Professional blue
        
        for (String column : data.columns()) {
            PdfPCell cell = new PdfPCell(new Phrase(formatColumnName(column), headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(8);
            cell.setMinimumHeight(28);
            cell.setBorderColor(new java.awt.Color(200, 200, 200));
            table.addCell(cell);
        }
        table.setHeaderRows(1);
        
        // Data rows with improved styling
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
        java.awt.Color rowBg1 = new java.awt.Color(248, 250, 252);
        java.awt.Color rowBg2 = new java.awt.Color(255, 255, 255);
        
        int rowNum = 0;
        for (Map<String, Object> row : data.rows()) {
            java.awt.Color bgColor = (rowNum % 2 == 0) ? rowBg1 : rowBg2;
            for (String column : data.columns()) {
                Object value = row.get(column);
                String displayValue = formatValue(value, column);
                
                PdfPCell cell = new PdfPCell(new Phrase(displayValue, bodyFont));
                cell.setBackgroundColor(bgColor);
                cell.setPadding(6);
                cell.setBorderColor(new java.awt.Color(230, 230, 230));
                
                // Alignment based on data type
                if (value instanceof Number) {
                    cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                } else if (column.toLowerCase().contains("date") || column.toLowerCase().contains("time")) {
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                } else {
                    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                }
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setMinimumHeight(22);
                table.addCell(cell);
            }
            rowNum++;
        }
        
        doc.add(table);
        doc.close();
        return out.toByteArray();
    }
    
    private static float[] calculateColumnWidths(java.util.List<String> columns) {
        float[] widths = new float[columns.size()];
        for (int i = 0; i < columns.size(); i++) {
            String column = columns.get(i).toLowerCase();
            // Assign widths based on column type
            if (column.contains("amount") || column.contains("principal") || column.contains("rate") || 
                column.contains("interest") || column.contains("balance")) {
                widths[i] = 1.5f; // Wider for currency/numbers
            } else if (column.contains("date") || column.contains("time")) {
                widths[i] = 1.2f; // Medium for dates
            } else if (column.contains("id") || column.contains("no") || column.contains("code")) {
                widths[i] = 1.0f; // Narrower for IDs
            } else if (column.contains("name") || column.contains("address")) {
                widths[i] = 2.0f; // Wider for text fields
            } else {
                widths[i] = 1.3f; // Default
            }
        }
        return widths;
    }
    
    private static String formatColumnName(String column) {
        // Convert snake_case to Title Case
        String[] words = column.split("_");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (i > 0) result.append(" ");
            String word = words[i];
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) {
                    result.append(word.substring(1).toLowerCase());
                }
            }
        }
        return result.toString();
    }
    
    private static String formatValue(Object value, String column) {
        if (value == null) return "-";
        
        String colLower = column.toLowerCase();
        
        // Currency formatting
        if (colLower.contains("amount") || colLower.contains("principal") || colLower.contains("balance") ||
            colLower.contains("interest") || colLower.contains("return")) {
            if (value instanceof BigDecimal bd) {
                return String.format("₹%,.2f", bd);
            } else if (value instanceof Number n) {
                return String.format("₹%,.2f", n.doubleValue());
            }
        }
        
        // Percentage formatting
        if (colLower.contains("rate") || colLower.contains("percent")) {
            if (value instanceof BigDecimal bd) {
                return String.format("%.2f%%", bd.doubleValue());
            } else if (value instanceof Number n) {
                return String.format("%.2f%%", n.doubleValue());
            }
        }
        
        // Date formatting
        if (colLower.contains("date") || colLower.contains("time")) {
            String strVal = String.valueOf(value);
            // Try to parse and format date
            try {
                if (strVal.contains("T")) {
                    // ISO datetime
                    java.time.LocalDateTime dt = java.time.LocalDateTime.parse(strVal.substring(0, 19));
                    return dt.format(java.time.format.DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"));
                } else if (strVal.length() >= 10) {
                    // Date only
                    java.time.LocalDate date = java.time.LocalDate.parse(strVal.substring(0, 10));
                    return date.format(java.time.format.DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
                }
            } catch (Exception e) {
                // Return original if parsing fails
            }
        }
        
        return text(value);
    }

    private static byte[] xlsx(ReportData data) throws IOException {
        try (XSSFWorkbook book = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = book.createSheet("Portfolio Report");
            
            // Create header style with background color
            CellStyle headerStyle = book.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = book.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            
            // Create number format for currency
            CellStyle currencyStyle = book.createCellStyle();
            org.apache.poi.ss.usermodel.DataFormat currencyFormat = book.createDataFormat();
            currencyStyle.setDataFormat(currencyFormat.getFormat("₹#,##0.00"));
            currencyStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            currencyStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            currencyStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            currencyStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // Create percentage format
            CellStyle percentStyle = book.createCellStyle();
            org.apache.poi.ss.usermodel.DataFormat percentFormat = book.createDataFormat();
            percentStyle.setDataFormat(percentFormat.getFormat("0.00%"));
            percentStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            percentStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            percentStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            percentStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // Create date format
            CellStyle dateStyle = book.createCellStyle();
            org.apache.poi.ss.usermodel.DataFormat dateFormat = book.createDataFormat();
            dateStyle.setDataFormat(dateFormat.getFormat("dd-MMM-yyyy"));
            dateStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dateStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dateStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dateStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // Create default cell style with borders
            CellStyle defaultStyle = book.createCellStyle();
            defaultStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            defaultStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            defaultStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            defaultStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // Header row
            Row header = sheet.createRow(0);
            for (int c = 0; c < data.columns().size(); c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(formatColumnName(data.columns().get(c)));
                cell.setCellStyle(headerStyle);
            }
            
            // Data rows
            int r = 1;
            for (Map<String, Object> row : data.rows()) {
                Row excelRow = sheet.createRow(r++);
                for (int c = 0; c < data.columns().size(); c++) {
                    String column = data.columns().get(c);
                    Object value = row.get(column);
                    Cell cell = excelRow.createCell(c);
                    
                    String colLower = column.toLowerCase();
                    
                    // Apply appropriate formatting based on column type
                    if (value instanceof BigDecimal bd) {
                        cell.setCellValue(bd.doubleValue());
                        if (colLower.contains("amount") || colLower.contains("principal") || 
                            colLower.contains("balance") || colLower.contains("interest")) {
                            cell.setCellStyle(currencyStyle);
                        } else if (colLower.contains("rate") || colLower.contains("percent")) {
                            cell.setCellStyle(percentStyle);
                        } else {
                            cell.setCellStyle(defaultStyle);
                        }
                    } else if (value instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                        if (colLower.contains("rate") || colLower.contains("percent")) {
                            cell.setCellStyle(percentStyle);
                        } else {
                            cell.setCellStyle(defaultStyle);
                        }
                    } else if (value != null) {
                        String strVal = text(value);
                        cell.setCellValue(strVal);
                        if (colLower.contains("date")) {
                            cell.setCellStyle(dateStyle);
                        } else {
                            cell.setCellStyle(defaultStyle);
                        }
                    }
                }
            }
            
            // Intelligent column widths based on content type
            for (int c = 0; c < data.columns().size(); c++) {
                String column = data.columns().get(c).toLowerCase();
                int width;
                if (column.contains("amount") || column.contains("principal") || column.contains("balance")) {
                    width = 18; // Wider for currency
                } else if (column.contains("name") || column.contains("address")) {
                    width = 25; // Wider for text
                } else if (column.contains("id") || column.contains("no") || column.contains("code")) {
                    width = 15; // Medium for IDs
                } else if (column.contains("date")) {
                    width = 14; // Medium for dates
                } else {
                    width = 16; // Default
                }
                sheet.setColumnWidth(c, width * 256);
            }
            
            // Freeze header row
            sheet.createFreezePane(0, 1);
            
            book.write(out);
            return out.toByteArray();
        }
    }

    private static String text(Object value) {
        if (value == null) return "";
        return value instanceof BigDecimal bd ? bd.toPlainString() : String.valueOf(value);
    }
}
