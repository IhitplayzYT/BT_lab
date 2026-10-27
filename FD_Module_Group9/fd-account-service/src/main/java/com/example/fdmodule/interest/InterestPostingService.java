package com.example.fdmodule.interest;
import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.service.GLAccounts;
import com.example.fdmodule.client.AuthServiceClient;
import com.example.fdshared.Outbox;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;import java.time.*;import java.util.*;
@Service public class InterestPostingService {
 private final JdbcTemplate jdbc;private final FDTransactionRepository ledger;private final Outbox outbox;private final AuthServiceClient authServiceClient;
 public InterestPostingService(JdbcTemplate jdbc,FDTransactionRepository ledger,Outbox outbox,AuthServiceClient authServiceClient){this.jdbc=jdbc;this.ledger=ledger;this.outbox=outbox;this.authServiceClient=authServiceClient;}
 private com.example.fdmodule.clock.BusinessClock clock;
 @org.springframework.beans.factory.annotation.Autowired(required = false) void setClock(com.example.fdmodule.clock.BusinessClock c){this.clock=c;}
 private LocalDate today(){return clock!=null?clock.today():LocalDate.now(ZoneId.of("Asia/Kolkata"));}
 @Transactional public void configure(String account,String mode){
  if(!Set.of("SIMPLE","MONTHLY_COMPOUND").contains(mode)) throw new IllegalArgumentException("Unsupported interest mode");
  var fd=lock(account); if(!"ACTIVE".equals(fd.get("status")))throw new IllegalArgumentException("Account must be ACTIVE");
  ensureState(fd);var s=state(account);
  String currentMode=Objects.toString(s.get("interest_mode"),"SIMPLE");
  if(currentMode.equalsIgnoreCase(mode))return;
  if("MONTHLY_COMPOUND".equals(mode)&&s.get("last_accrual_date")!=null){
   LocalDate start=date(fd.get("created_at"));
   LocalDate effectiveDate=today();
   LocalDate lastAccrual=date(s.get("last_accrual_date"));
   if(lastAccrual.isAfter(effectiveDate))effectiveDate=lastAccrual;
   long elapsedMonths=java.time.temporal.ChronoUnit.MONTHS.between(start.withDayOfMonth(1),effectiveDate.withDayOfMonth(1));
   LocalDate nextCapitalization=start.plusMonths(Math.max(1,elapsedMonths+1));
   jdbc.update("UPDATE fd_interest_state SET interest_mode=?,next_capitalization_date=? WHERE fd_account_no=?",mode,nextCapitalization,account);
   return;
  }
  jdbc.update("UPDATE fd_interest_state SET interest_mode=? WHERE fd_account_no=?",mode,account);
 }
 @Transactional public Map<String,Object> processBatch(String requestId,LocalDate target,String actor){
  return process(requestId,target,actor,true);
 }
 /** A clock-triggered run has no row in fd_batch.batch_requests, so it must not publish a batch result event. */
 @Transactional public Map<String,Object> processClockAdvance(String requestId,LocalDate target,String actor){
  return process(requestId,target,actor,false);
 }
 private Map<String,Object> process(String requestId,LocalDate target,String actor,boolean reportBatchResult){
  if(target.isAfter(today()))throw new IllegalArgumentException("Future accrual dates are not permitted");
  if(jdbc.queryForObject("SELECT COUNT(*) FROM processed_interest_requests WHERE request_id=?",Integer.class,requestId)>0)return Map.of("requestId",requestId,"duplicate",true);
  var accounts=jdbc.queryForList("SELECT fd_account_no FROM fd_accounts WHERE status='ACTIVE' ORDER BY fd_account_no",String.class);
  int events=0; for(String account:accounts)events+=processAccount(account,target,actor);
  jdbc.update("INSERT INTO processed_interest_requests(request_id,processed_at) VALUES(?,CURRENT_TIMESTAMP)",requestId);
  var result=Map.<String,Object>of("requestId",requestId,"accounts",accounts.size(),"accrualEvents",events,"businessDate",target.toString(),"status","COMPLETED");
  if(reportBatchResult)outbox.emit("event.batch.completed","InterestBatchCompleted",requestId,result);
  jdbc.update("INSERT INTO admin_operation_logs(actor,operation_type,target_type,target_id,summary) VALUES(?,?,?,?,?)",
   actor,"INTEREST_BATCH_PROCESSED","INTEREST_BATCH",requestId,
   "Processed interest for "+accounts.size()+" active FD accounts through "+target+" ("+events+" daily accrual events)");
  return result;
 }
 private int processAccount(String account,LocalDate target,String actor){
  var fd=lock(account); if(!"ACTIVE".equals(fd.get("status")))return 0;ensureState(fd);var s=state(account);
  LocalDate start=date(fd.get("created_at"));LocalDate maturity=date(fd.get("maturity_date"));
  LocalDate last=s.get("last_accrual_date")==null?start.minusDays(1):date(s.get("last_accrual_date"));
  LocalDate end=target.isBefore(maturity)?target:maturity.minusDays(1);
  if(java.time.temporal.ChronoUnit.DAYS.between(last,end)>366)throw new IllegalArgumentException("Catch-up exceeds 366 days; submit intermediate dates first");
  BigDecimal principal=decimal(fd.get("principal_amount")),rate=decimal(fd.get("interest_rate")), balance=decimal(s.get("current_balance")), accrued=decimal(s.get("accrued_precise"));
  LocalDate next=date(s.get("next_capitalization_date"));
  BigDecimal totalInterestAccrued=BigDecimal.ZERO;
  int emittedEvents=0;
  for(LocalDate day=last.plusDays(1);!day.isAfter(end);day=day.plusDays(1)){
   BigDecimal openingBalance=balance;
   BigDecimal capitalized=BigDecimal.ZERO;
   // Settle the previous monthly period before accruing the anniversary day.
   if("MONTHLY_COMPOUND".equals(s.get("interest_mode")) && !day.isBefore(next)){
    capitalized=accrued.setScale(2,RoundingMode.DOWN);balance=balance.add(capitalized);accrued=accrued.subtract(capitalized);
    if(capitalized.signum()>0){ledger.save(new FDTransaction(account,FDTransaction.TYPE_INTEREST,capitalized,Objects.toString(fd.get("currency")),GLAccounts.LIABILITY_INTEREST_PAYABLE,GLAccounts.LIABILITY_FD_DEPOSITS,"Monthly capitalization for "+day,actor));
     jdbc.update("UPDATE fd_interest_transactions SET capitalized_flag=true,settlement_status='CAPITALIZED' WHERE fd_account_no=? AND accrual_date<=? AND settlement_status='PENDING'",account,day);}
    long elapsed=java.time.temporal.ChronoUnit.MONTHS.between(start.withDayOfMonth(1),next.withDayOfMonth(1));next=start.plusMonths(elapsed+1);
   }
   BigDecimal interest=InterestEngine.daily("SIMPLE".equals(s.get("interest_mode"))?principal:balance,rate);accrued=accrued.add(interest);
   totalInterestAccrued=totalInterestAccrued.add(interest);
   jdbc.update("INSERT INTO fd_interest_transactions(fd_account_no,accrual_date,interest_amount,cumulative_interest,capitalized_flag) VALUES(?,?,?,?,false)",account,day,interest,accrued);
   saveState(account,balance,accrued,day,next);
   if(interest.signum()>0||capitalized.signum()>0){
    var data=new LinkedHashMap<String,Object>();data.put("fdAccountNo",account);data.put("customerId",fd.get("customer_id"));data.put("businessDate",day.toString());data.put("currency",fd.get("currency"));data.put("openingBalance",openingBalance);data.put("interestAccrued",interest);data.put("interestCapitalized",capitalized);data.put("interestPaid",BigDecimal.ZERO);data.put("closingBalance",balance);data.put("outstandingInterest",accrued);data.put("actor",actor);
    com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, data);
    outbox.emit("event.interest.accrued","InterestAccrued",account,data);emittedEvents++;
   }
  }
  if(totalInterestAccrued.signum()>0){
   ledger.save(new FDTransaction(account,FDTransaction.TYPE_INTEREST_ACCRUAL,totalInterestAccrued,Objects.toString(fd.get("currency")),GLAccounts.EXPENSE_INTEREST,GLAccounts.LIABILITY_INTEREST_PAYABLE,"Interest accrued through "+end,actor));
  }
  return emittedEvents;
 }
 @Transactional public Map<String,Object> payout(String requestId,String account,LocalDate day,String actor){
  if(jdbc.queryForObject("SELECT COUNT(*) FROM processed_interest_requests WHERE request_id=?",Integer.class,requestId)>0)return Map.of("requestId",requestId,"duplicate",true);
  if(day.isAfter(today()))throw new IllegalArgumentException("Future payout dates are not permitted");
  var fd=lock(account);if(!"ACTIVE".equals(fd.get("status")))throw new IllegalArgumentException("Account must be ACTIVE");ensureState(fd);var before=state(account);
  if(before.get("last_accrual_date")!=null && day.isBefore(date(before.get("last_accrual_date"))))throw new IllegalArgumentException("Payout cannot precede processed interest");
  if(!day.isBefore(date(fd.get("maturity_date"))))throw new IllegalArgumentException("Maturity payout belongs to L18/L19");
  processAccount(account,day,actor);var s=state(account);BigDecimal accrued=decimal(s.get("accrued_precise"));BigDecimal amount=accrued.setScale(2,RoundingMode.DOWN);
  if(amount.signum()<=0)throw new IllegalArgumentException("No payable accrued interest");
  BigDecimal balance=decimal(s.get("current_balance")),remaining=accrued.subtract(amount);
  jdbc.update("UPDATE fd_interest_transactions SET settlement_status='PAID' WHERE fd_account_no=? AND accrual_date<=? AND settlement_status='PENDING'",account,day);
  ledger.save(new FDTransaction(account,FDTransaction.TYPE_INTEREST,amount,Objects.toString(fd.get("currency")),GLAccounts.LIABILITY_INTEREST_PAYABLE,GLAccounts.ASSET_CUSTOMER_SETTLEMENT,"Interest payout request "+requestId,actor));
  saveState(account,balance,remaining,date(s.get("last_accrual_date")),date(s.get("next_capitalization_date")));
  jdbc.update("INSERT INTO processed_interest_requests(request_id,processed_at) VALUES(?,CURRENT_TIMESTAMP)",requestId);
  var data=new LinkedHashMap<String,Object>();data.put("requestId",requestId);data.put("fdAccountNo",account);data.put("customerId",fd.get("customer_id"));data.put("businessDate",day.toString());data.put("currency",fd.get("currency"));data.put("openingBalance",balance);data.put("interestAccrued",BigDecimal.ZERO);data.put("interestCapitalized",BigDecimal.ZERO);data.put("interestPaid",amount);data.put("closingBalance",balance);data.put("outstandingInterest",remaining);data.put("actor",actor);
  com.example.fdmodule.service.NotificationContacts.enrich(jdbc, account, data);
   outbox.emit("event.interest.paid","InterestPaid",account,data);
  outbox.emit("event.batch.completed","InterestPayoutCompleted",requestId,Map.of("requestId",requestId,"status","COMPLETED","amount",amount));return data;
 }
 /** L18/L19 hook: accrue through maturity minus one day inside the caller's transaction, in steps of at most 366 days. */
 @Transactional(propagation=org.springframework.transaction.annotation.Propagation.MANDATORY) public void accrueToMaturity(String account,String actor){
  accrueThrough(account,date(lock(account).get("maturity_date")).minusDays(1),actor);
 }
 /** Premature-withdrawal hook: same catch-up as accrueToMaturity, but only through {@code lastDay} (never past maturity - 1). */
 @Transactional(propagation=org.springframework.transaction.annotation.Propagation.MANDATORY) public void accrueThrough(String account,LocalDate lastDay,String actor){
  var fd=lock(account);ensureState(fd);
  while(true){var s=state(account);LocalDate last=s.get("last_accrual_date")==null?date(fd.get("created_at")).minusDays(1):date(s.get("last_accrual_date"));
   if(!last.isBefore(lastDay))return;
   LocalDate step=last.plusDays(366);if(processAccount(account,step.isBefore(lastDay)?step:lastDay,actor)==0)return;}
 }
 private Map<String,Object> lock(String account){var rows=jdbc.queryForList("SELECT * FROM fd_accounts WHERE fd_account_no=? FOR UPDATE",account);if(rows.isEmpty())throw new IllegalArgumentException("FD account not found: "+account);return rows.get(0);}
 private void ensureState(Map<String,Object> fd){String a=fd.get("fd_account_no").toString();if(jdbc.queryForObject("SELECT COUNT(*) FROM fd_interest_state WHERE fd_account_no=?",Integer.class,a)==0){
  if(decimal(fd.get("accrued_interest")).signum()!=0)throw new IllegalArgumentException("Existing accrued interest requires reconciliation before enrolment");
  jdbc.update("INSERT INTO fd_interest_state(fd_account_no,interest_mode,current_balance,accrued_precise,next_capitalization_date) VALUES(?,'SIMPLE',?,0,?)",a,fd.get("principal_amount"),date(fd.get("created_at")).plusMonths(1));}}
 private Map<String,Object> state(String a){return jdbc.queryForMap("SELECT * FROM fd_interest_state WHERE fd_account_no=? FOR UPDATE",a);}
 private void saveState(String a,BigDecimal b,BigDecimal i,LocalDate last,LocalDate next){jdbc.update("UPDATE fd_interest_state SET current_balance=?,accrued_precise=?,last_accrual_date=?,next_capitalization_date=? WHERE fd_account_no=?",b,i,last,next,a);jdbc.update("UPDATE fd_accounts SET accrued_interest=?,modified_at=CURRENT_TIMESTAMP WHERE fd_account_no=?",i.setScale(2,RoundingMode.HALF_UP),a);}
 public List<Map<String,Object>> accounts(){return jdbc.queryForList("SELECT a.fd_account_no,a.customer_id,a.currency,a.principal_amount,a.interest_rate,a.status,a.maturity_date,COALESCE(s.interest_mode,'SIMPLE') AS interest_mode,COALESCE(s.current_balance,a.principal_amount) AS current_balance,COALESCE(s.accrued_precise,0) AS accrued_interest,s.last_accrual_date FROM fd_accounts a LEFT JOIN fd_interest_state s ON a.fd_account_no=s.fd_account_no ORDER BY a.fd_account_no");}
 public List<Map<String,Object>> accountsForCustomer(String username){Long userId=authServiceClient.getUserIdByUsername(username);if(userId==null)return List.of();return jdbc.queryForList("SELECT a.fd_account_no,a.customer_id,a.currency,a.principal_amount,a.interest_rate,a.status,a.maturity_date,COALESCE(s.interest_mode,'SIMPLE') AS interest_mode,COALESCE(s.current_balance,a.principal_amount) AS current_balance,COALESCE(s.accrued_precise,0) AS accrued_interest,s.last_accrual_date FROM fd_accounts a JOIN customer_profile c ON c.customer_id=a.customer_id LEFT JOIN fd_interest_state s ON a.fd_account_no=s.fd_account_no WHERE c.user_id=? ORDER BY a.fd_account_no",userId);}
 private static BigDecimal decimal(Object o){return o==null?BigDecimal.ZERO:new BigDecimal(o.toString());}
 private static LocalDate date(Object o){if(o instanceof java.sql.Timestamp t)return t.toLocalDateTime().toLocalDate();if(o instanceof LocalDateTime t)return t.toLocalDate();if(o instanceof java.sql.Date d)return d.toLocalDate();return LocalDate.parse(o.toString().substring(0,10));}
}
