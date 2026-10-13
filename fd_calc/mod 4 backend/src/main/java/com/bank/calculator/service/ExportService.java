package com.bank.calculator.service;

import com.bank.calculator.model.CalculationAudit;
import org.springframework.stereotype.Service;

import java.io.StringWriter;

/**
 * Generates safe CSV exports from calculation audit records.
 *
 * <p>No shell commands are executed. No unsanitised data is concatenated into
 * command strings.  Values are escaped using RFC 4180 CSV rules.
 */
@Service
public class ExportService {

    private static final String CSV_HEADER =
            "Calculation ID,UUID,Customer ID,Product Code,Principal,Term (Months)," +
            "Base Rate (%),Effective Rate (%),Interest Type," +
            "Interest Earned,Maturity Amount,Estimated Maturity Date,Created At\n";

    /**
     * Produces a CSV string from a single calculation audit record.
     *
     * @param audit the audit record to export
     * @return RFC 4180 compliant CSV string
     */
    public String toCsv(CalculationAudit audit) {
        StringWriter sw = new StringWriter();
        sw.write(CSV_HEADER);
        sw.write(String.join(",",
                csvEscape(audit.getCalculationId()),
                csvEscape(audit.getUuid()),
                csvEscape(audit.getCustomerId()),
                csvEscape(audit.getProductCode()),
                csvEscape(audit.getPrincipal().toPlainString()),
                String.valueOf(audit.getTermMonths()),
                csvEscape(audit.getBaseRate().toPlainString()),
                csvEscape(audit.getEffectiveRate().toPlainString()),
                csvEscape(audit.getInterestType()),
                csvEscape(audit.getInterestEarned().toPlainString()),
                csvEscape(audit.getMaturityAmount().toPlainString()),
                csvEscape(audit.getEstimatedMaturityDate() != null
                          ? audit.getEstimatedMaturityDate().toString() : ""),
                csvEscape(audit.getCreatedAt().toString())
        ));
        sw.write("\n");
        return sw.toString();
    }

    /**
     * RFC 4180 CSV escaping: wrap in quotes if value contains comma, quote, or newline;
     * double internal quotes; sanitize formula injection (CWE-1236).
     */
    private String csvEscape(String value) {
        if (value == null) return "";
        if ((value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@"))
                && !isNumeric(value)) {
            value = "\t" + value;
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private boolean isNumeric(String str) {
        if (str == null || str.isBlank()) return false;
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
