package com.example.fdstatement;
import com.example.fdshared.DomainEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
@Service public class StatementService {
 private final JdbcTemplate jdbc;public StatementService(JdbcTemplate jdbc){this.jdbc=jdbc;}
 @Transactional public void project(DomainEvent event){
  if(event.schemaVersion()!=1 || !(event.eventType().equals("InterestAccrued")||event.eventType().equals("InterestPaid")))throw new IllegalArgumentException("Unsupported statement event");
  if(jdbc.queryForObject("SELECT COUNT(*) FROM consumed_events WHERE event_id=?",Integer.class,event.eventId())>0)return;
  var d=event.data();String account=d.path("fdAccountNo").asText(),date=d.path("businessDate").asText();
  var rows=jdbc.queryForList("SELECT * FROM fd_statements WHERE fd_account_no=? AND statement_date=? FOR UPDATE",account,date);
  if(rows.isEmpty()){jdbc.update("INSERT INTO fd_statements(fd_account_no,customer_id,currency,statement_date,opening_balance,interest_accrued,interest_credited,interest_paid,closing_balance,outstanding_interest,last_occurred_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",account,d.path("customerId").asText(),d.path("currency").asText(),date,money(d,"openingBalance"),money(d,"interestAccrued"),money(d,"interestCapitalized"),money(d,"interestPaid"),money(d,"closingBalance"),money(d,"outstandingInterest"),event.occurredAt().toString());}
  else {var old=rows.get(0);boolean newer=event.occurredAt().isAfter(java.time.Instant.parse(old.get("last_occurred_at").toString()));
   jdbc.update("UPDATE fd_statements SET interest_accrued=interest_accrued+?,interest_credited=interest_credited+?,interest_paid=interest_paid+? WHERE fd_account_no=? AND statement_date=?",money(d,"interestAccrued"),money(d,"interestCapitalized"),money(d,"interestPaid"),account,date);
   // Preserve snapshots by event time even when a retried outbox message arrives late.
   if(newer)jdbc.update("UPDATE fd_statements SET closing_balance=?,outstanding_interest=?,last_occurred_at=? WHERE fd_account_no=? AND statement_date=?",money(d,"closingBalance"),money(d,"outstandingInterest"),event.occurredAt().toString(),account,date);
   // The daily accrual event carries the actual day's opening balance. A payout
   // event can arrive first on its separate topic, so let that accrual snapshot
   // correct the opening balance regardless of arrival order.
   if(event.eventType().equals("InterestAccrued"))jdbc.update("UPDATE fd_statements SET opening_balance=? WHERE fd_account_no=? AND statement_date=?",money(d,"openingBalance"),account,date);
  }jdbc.update("INSERT INTO consumed_events(event_id) VALUES(?)",event.eventId());
 }
 private BigDecimal money(com.fasterxml.jackson.databind.JsonNode node,String field){if(!node.hasNonNull(field))throw new IllegalArgumentException("Missing "+field);return new BigDecimal(node.get(field).asText());}
 public Object list(String account){return jdbc.queryForList("SELECT * FROM fd_statements WHERE fd_account_no=? ORDER BY statement_date DESC",account);}
 public Object summary(){return java.util.Map.of("statements",jdbc.queryForObject("SELECT COUNT(*) FROM fd_statements",Integer.class),"totalsByCurrency",jdbc.queryForList("SELECT currency,SUM(interest_accrued) AS total_interest_accrued,SUM(interest_credited) AS total_interest_capitalized,SUM(interest_paid) AS total_interest_paid FROM fd_statements GROUP BY currency"));}
}
