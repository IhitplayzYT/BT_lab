package com.example.fdmodule.report;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/** Minimal RFC-4180 CSV writer: CRLF line ends, header always written, protection against spreadsheet formula injection. */
public final class CsvWriter {
    private CsvWriter() { }

    public static String toCsv(List<String> columns, List<Map<String, Object>> rows) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < columns.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(cell(columns.get(i)));
        }
        sb.append("\r\n");
        for (Map<String, Object> row : rows) {
            for (int i = 0; i < columns.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(cell(row.get(columns.get(i))));
            }
            sb.append("\r\n");
        }
        return sb.toString();
    }

    public static void writeCsv(ReportData data, String filePath) throws IOException {
        String csvContent = toCsv(data.columns(), data.rows());
        Files.writeString(Path.of(filePath), csvContent);
    }

    static String cell(Object value) {
        if (value == null) return "";
        String s = value instanceof BigDecimal bd ? bd.toPlainString() : String.valueOf(value);
        // A text cell starting with = + - @ would be executed as a formula by Excel, so prefix it with a quote.
        if (value instanceof CharSequence && !s.isEmpty() && "=+-@".indexOf(s.charAt(0)) >= 0) s = "'" + s;
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) s = "\"" + s.replace("\"", "\"\"") + "\"";
        return s;
    }
}
