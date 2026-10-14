package com.example.fdmodule.report;

import java.util.List;
import java.util.Map;

/** One report: a title, its fixed column list (so an empty report still has a header) and its rows. */
public record ReportData(String title, List<String> columns, List<Map<String, Object>> rows) { }
