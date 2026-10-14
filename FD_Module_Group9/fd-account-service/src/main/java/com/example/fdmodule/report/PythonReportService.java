package com.example.fdmodule.report;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Runs reports/python/generate_fd_report.py on the nightly extract CSV and returns where the outputs were written.
 * Safety: the command is an argument array (no shell), the only inputs are file paths the server builds itself
 * and a LocalDate, and the process is killed if it runs longer than the timeout.
 */
@Service
public class PythonReportService {
    private final ExtractService extracts;
    private final String executable;
    private final Path script;
    private final long timeoutSeconds;

    public PythonReportService(ExtractService extracts,
                               @Value("${app.python.executable:python}") String executable,
                               @Value("${app.python.script:reports/python/generate_fd_report.py}") String script,
                               @Value("${app.python.timeout-seconds:60}") long timeoutSeconds) {
        this.extracts = extracts;
        this.executable = executable;
        this.script = Path.of(script).toAbsolutePath().normalize();
        this.timeoutSeconds = timeoutSeconds;
    }

    public Map<String, Object> generate(LocalDate businessDate) {
        if (!Files.isRegularFile(script)) throw new IllegalStateException("Python report script not found: " + script);
        ExtractService.ExtractResult extract = extracts.run(businessDate);
        Path outDir = extracts.directory().resolve("python").resolve(businessDate.toString());
        List<String> command = List.of(executable, script.toString(), "--input", extract.file().toString(),
                "--out", outDir.toString(), "--date", businessDate.toString());
        try {
            Files.createDirectories(outDir);
            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            // Read the output on this thread only after the process ends or is killed; the script prints very little.
            if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IllegalStateException("Python report timed out after " + timeoutSeconds + "s");
            }
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            if (process.exitValue() != 0) throw new IllegalStateException("Python report failed: " + output);
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("businessDate", businessDate.toString());
            result.put("extractFile", extract.file().toString());
            result.put("outputDirectory", outDir.toString());
            result.put("summaryFile", outDir.resolve("fd_report_" + businessDate + ".json").toString());
            result.put("chartFile", outDir.resolve("fd_report_" + businessDate + ".svg").toString());
            result.put("scriptOutput", output);
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Could not start Python (" + executable + "): " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Python report interrupted", e);
        }
    }
}
