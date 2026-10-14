package com.example.fdbatch;
import org.springframework.scheduling.annotation.Scheduled;import org.springframework.stereotype.Component;import java.time.*;import org.springframework.dao.DuplicateKeyException;
@Component public class DailyInterestScheduler {
 private final BatchService service;public DailyInterestScheduler(BatchService service){this.service=service;}
 @Scheduled(cron="${interest.cron:0 0 3 * * *}",zone="Asia/Kolkata") public void daily(){
  try{service.scheduled(LocalDate.now(ZoneId.of("Asia/Kolkata")).minusDays(1));}catch(DuplicateKeyException competingReplica){/* other replica owns this banking date */}
 }
}
