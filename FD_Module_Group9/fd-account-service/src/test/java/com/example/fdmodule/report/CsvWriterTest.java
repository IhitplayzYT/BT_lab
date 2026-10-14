package com.example.fdmodule.report;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CsvWriterTest {

    @Test
    void emptyReportStillHasTheHeaderRow() {
        assertThat(CsvWriter.toCsv(List.of("a", "b"), List.of())).isEqualTo("a,b\r\n");
    }

    @Test
    void usesCrlfAndPlainBigDecimalAndEmptyForNull() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("amount", new BigDecimal("1E+3"));
        row.put("note", null);
        assertThat(CsvWriter.toCsv(List.of("amount", "note"), List.of(row))).isEqualTo("amount,note\r\n1000,\r\n");
    }

    @Test
    void quotesCommasQuotesAndNewlines() {
        assertThat(CsvWriter.cell("a,b")).isEqualTo("\"a,b\"");
        assertThat(CsvWriter.cell("say \"hi\"")).isEqualTo("\"say \"\"hi\"\"\"");
        assertThat(CsvWriter.cell("line1\nline2")).isEqualTo("\"line1\nline2\"");
    }

    @Test
    void textThatLooksLikeAFormulaIsDefused() {
        assertThat(CsvWriter.cell("=SUM(A1:A9)")).isEqualTo("'=SUM(A1:A9)");
        assertThat(CsvWriter.cell("+1")).isEqualTo("'+1");
        assertThat(CsvWriter.cell("-1")).isEqualTo("'-1");
        assertThat(CsvWriter.cell("@cmd")).isEqualTo("'@cmd");
    }

    @Test
    void realNegativeNumbersAreNotPrefixed() {
        assertThat(CsvWriter.cell(new BigDecimal("-12.50"))).isEqualTo("-12.50");
        assertThat(CsvWriter.cell(-5)).isEqualTo("-5");
    }
}
