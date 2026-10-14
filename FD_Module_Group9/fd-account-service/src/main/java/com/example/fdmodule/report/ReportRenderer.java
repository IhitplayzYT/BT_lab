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

    private static byte[] pdf(ReportData data) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 28, 28, 28, 28);
        PdfWriter.getInstance(doc, out);
        doc.open();
        doc.add(new Paragraph(data.title(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
        doc.add(new Paragraph(data.rows().size() + " row(s)", FontFactory.getFont(FontFactory.HELVETICA, 9)));
        doc.add(new Paragraph(" "));
        PdfPTable table = new PdfPTable(data.columns().size());
        table.setWidthPercentage(100);
        Font head = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8);
        Font body = FontFactory.getFont(FontFactory.HELVETICA, 8);
        for (String column : data.columns()) {
            PdfPCell cell = new PdfPCell(new Phrase(column, head));
            cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
            table.addCell(cell);
        }
        table.setHeaderRows(1);
        for (Map<String, Object> row : data.rows()) {
            for (String column : data.columns()) {
                PdfPCell cell = new PdfPCell(new Phrase(text(row.get(column)), body));
                if (row.get(column) instanceof Number) cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cell);
            }
        }
        doc.add(table);
        doc.close();
        return out.toByteArray();
    }

    private static byte[] xlsx(ReportData data) throws IOException {
        try (XSSFWorkbook book = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = book.createSheet("report");
            CellStyle bold = book.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = book.createFont();
            font.setBold(true);
            bold.setFont(font);
            Row header = sheet.createRow(0);
            for (int c = 0; c < data.columns().size(); c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(data.columns().get(c));
                cell.setCellStyle(bold);
            }
            int r = 1;
            for (Map<String, Object> row : data.rows()) {
                Row excelRow = sheet.createRow(r++);
                for (int c = 0; c < data.columns().size(); c++) {
                    Object value = row.get(data.columns().get(c));
                    Cell cell = excelRow.createCell(c);
                    // Numbers stay numbers; everything else is written as plain text (never as a formula).
                    if (value instanceof BigDecimal bd) cell.setCellValue(bd.doubleValue());
                    else if (value instanceof Number n) cell.setCellValue(n.doubleValue());
                    else if (value != null) cell.setCellValue(text(value));
                }
            }
            // Fixed widths: autoSizeColumn needs system fonts, which a bare server may not have.
            for (int c = 0; c < data.columns().size(); c++) sheet.setColumnWidth(c, 20 * 256);
            book.write(out);
            return out.toByteArray();
        }
    }

    private static String text(Object value) {
        if (value == null) return "";
        return value instanceof BigDecimal bd ? bd.toPlainString() : String.valueOf(value);
    }
}
