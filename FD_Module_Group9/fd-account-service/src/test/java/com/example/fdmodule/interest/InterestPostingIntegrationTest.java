package com.example.fdmodule.interest;
import org.junit.jupiter.api.*;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.context.SpringBootTest;import org.springframework.test.context.ActiveProfiles;import org.springframework.test.context.jdbc.Sql;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.transaction.support.TransactionTemplate;import java.time.*;import java.util.*;import static org.assertj.core.api.Assertions.*;
@SpringBootTest @ActiveProfiles("test") @Sql(scripts="/interest-schema.sql",executionPhase=Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class InterestPostingIntegrationTest {
 @Autowired InterestPostingService service;@Autowired JdbcTemplate jdbc;@Autowired TransactionTemplate tx;
 LocalDate start;String account="BR001TEST";
 @BeforeEach void seed(){
  for(String table:List.of("event_outbox","processed_interest_requests","fd_interest_transactions","fd_interest_state","fd_transactions","fd_accounts","products","customer_profile"))jdbc.update("DELETE FROM "+table);
  start=LocalDate.now(ZoneId.of("Asia/Kolkata")).minusMonths(2).withDayOfMonth(1);
  jdbc.update("INSERT INTO products(product_code,currency,status) VALUES('FDSTD','INR','ACTIVE')");
  jdbc.update("INSERT INTO customer_profile(customer_id) VALUES('CUST001')");
  jdbc.update("INSERT INTO fd_accounts(fd_account_no,customer_id,product_code,currency,principal_amount,interest_rate,tenure_months,status,maturity_date,accrued_interest,created_at) VALUES(?,'CUST001','FDSTD','INR',100000,12,12,'ACTIVE',?,0,?)",account,start.plusYears(1),start.atStartOfDay());
 }
 String id(){return UUID.randomUUID().toString();}int count(String table){return jdbc.queryForObject("SELECT COUNT(*) FROM "+table,Integer.class);}
 @Test void accrualCatchUpAndReplay(){String id=id();service.processBatch(id,start.plusDays(2),"admin1");assertThat(count("fd_interest_transactions")).isEqualTo(3);assertThat(count("event_outbox")).isEqualTo(4);service.processBatch(id,start.plusDays(2),"admin1");service.processBatch(id(),start.plusDays(2),"admin1");assertThat(count("fd_interest_transactions")).isEqualTo(3);assertThat(jdbc.queryForObject("SELECT current_balance FROM fd_interest_state",java.math.BigDecimal.class)).isEqualByComparingTo("100000");}
 @Test void monthlyCapitalizationAndOriginalPrincipal(){service.configure(account,"MONTHLY_COMPOUND");service.processBatch(id(),start.plusMonths(1),"admin1");assertThat(jdbc.queryForObject("SELECT current_balance FROM fd_interest_state",java.math.BigDecimal.class)).isGreaterThan(new java.math.BigDecimal("100000"));assertThat(jdbc.queryForObject("SELECT principal_amount FROM fd_accounts",java.math.BigDecimal.class)).isEqualByComparingTo("100000");assertThat(count("fd_transactions")).isEqualTo(2);assertThatThrownBy(()->service.configure(account,"SIMPLE")).isInstanceOf(IllegalArgumentException.class);}
 @Test void payoutReplayDoesNotPayTwice(){service.processBatch(id(),start.plusDays(2),"admin1");String request=id();var result=service.payout(request,account,start.plusDays(2),"admin1");assertThat(new java.math.BigDecimal(result.get("interestPaid").toString())).isEqualByComparingTo("98.63");service.payout(request,account,start.plusDays(2),"admin1");assertThat(count("fd_transactions")).isEqualTo(2);assertThat(jdbc.queryForObject("SELECT accrued_precise FROM fd_interest_state",java.math.BigDecimal.class)).isLessThan(new java.math.BigDecimal("0.01"));}
 @Test void accrualCarriesAccountContactWithoutCreationEvent(){
  jdbc.update("UPDATE fd_accounts SET applicant_email='owner@example.org', applicant_phone='9876543210' WHERE fd_account_no=?",account);
  service.processBatch(id(),start,"admin1");
  String payload=jdbc.queryForObject("SELECT payload FROM event_outbox WHERE routing_key='event.interest.accrued'",String.class);
  assertThat(payload).contains("owner@example.org").contains("9876543210");
 }
 @Test void closedAccountsSkipped(){jdbc.update("UPDATE fd_accounts SET status='CLOSED'");service.processBatch(id(),start.plusDays(2),"admin1");assertThat(count("fd_interest_transactions")).isZero();}
 @Test void futureDatesRejected(){assertThatThrownBy(()->service.processBatch(id(),LocalDate.now().plusDays(2),"admin1")).isInstanceOf(IllegalArgumentException.class);assertThat(count("event_outbox")).isZero();}
 @Test void outboxFailureRollsBackAccrual(){jdbc.execute("ALTER TABLE event_outbox ADD CONSTRAINT reject_event CHECK(routing_key='never')");try{assertThatThrownBy(()->service.processBatch(id(),start,"admin1")).isInstanceOf(org.springframework.dao.DataAccessException.class);assertThat(count("fd_interest_transactions")).isZero();assertThat(count("fd_interest_state")).isZero();}finally{jdbc.execute("ALTER TABLE event_outbox DROP CONSTRAINT reject_event");}}
 @Test void stopsBeforeMaturity(){jdbc.update("UPDATE fd_accounts SET maturity_date=?",start.plusDays(2));service.processBatch(id(),start.plusDays(4),"admin1");assertThat(count("fd_interest_transactions")).isEqualTo(2);}
 @Test void rejectsPayoutBeforeCursor(){service.processBatch(id(),start.plusDays(3),"admin1");assertThatThrownBy(()->service.payout(id(),account,start.plusDays(1),"admin1")).isInstanceOf(IllegalArgumentException.class);}
}
