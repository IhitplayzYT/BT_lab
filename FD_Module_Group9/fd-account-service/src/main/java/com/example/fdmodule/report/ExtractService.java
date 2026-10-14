package com.example.fdmodule.report;

import com.example.fdmodule.clock.BusinessClock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;

/**
 * Nightly file extract: one CSV of every FD account per business date, written to a local folder.
 * Idempotent: if the file for that date already exists it is left untouched, so a re-run (or a second instance)
 * never overwrites or duplicates it. The file is written to a temp name and moved into place, so a reader never
 * sees a half-written file.
 */
@Service
public class ExtractService {
    private static final Logger log = LoggerFactory.getLogger(ExtractService.class);

    public record ExtractResult(LocalDate businessDate, Path file, boolean created, int accounts) { }

    private final ReportService reports;
    private final BusinessClock clock;
    private final Path directory;
    private final boolean enabled;

    public ExtractService(ReportService reports, BusinessClock clock,
                          @Value("${app.extract.dir:extracts}") String directory,
                          @Value("${app.extract.enabled:true}") boolean enabled) {
        this.reports = reports;
        this.clock = clock;
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        this.enabled = enabled;
    }

    public Path directory() { return directory; }

    public Path fileFor(LocalDate date) { return directory.resolve("fd-accounts-" + date + ".csv"); }

    @Scheduled(cron = "${app.extract.cron:0 30 5 * * *}", zone = "Asia/Kolkata")
    public void nightly() {
        if (!enabled) return;
        try {
            ExtractResult r = run(clock.today());
            log.info("Nightly extract {} ({} accounts, {})", r.file(), r.accounts(), r.created() ? "written" : "already existed");
        } catch (Exception e) {
            log.error("Nightly extract failed", e);
        }
    }

    public ExtractResult run(LocalDate businessDate) {
        if (businessDate.isAfter(clock.today())) throw new IllegalArgumentException("Cannot extract a future business date");
        Path target = fileFor(businessDate);
        if (Files.exists(target)) return new ExtractResult(businessDate, target, false, countRows(target));
        ReportData data = reports.allAccounts();
        try {
            Files.createDirectories(directory);
            Path temp = Files.createTempFile(directory, "fd-accounts-", ".tmp");
            Files.writeString(temp, CsvWriter.toCsv(data.columns(), data.rows()), StandardCharsets.UTF_8);
            try {
                Files.move(temp, target, StandardCopyOption.ATOMIC_MOVE);
            } catch (FileAlreadyExistsException e) {
                Files.deleteIfExists(temp);
                return new ExtractResult(businessDate, target, false, countRows(target));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Could not write extract " + target, e);
        }
        return new ExtractResult(businessDate, target, true, data.rows().size());
    }

    private static int countRows(Path file) {
        try (var lines = Files.lines(file, StandardCharsets.UTF_8)) {
            return (int) Math.max(0, lines.count() - 1);
        } catch (IOException e) {
            return 0;
        }
    }
}
