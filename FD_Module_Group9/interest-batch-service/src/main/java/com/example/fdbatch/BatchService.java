package com.example.fdbatch;
import com.example.fdshared.*;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import java.time.*;import java.util.*;
@Service public class BatchService {
 private final JdbcTemplate jdbc;private final Outbox outbox;@org.springframework.beans.factory.annotation.Value("${app.time-travel.max-days-ahead:0}") private int maxDaysAhead;public BatchService(JdbcTemplate jdbc,Outbox outbox){this.jdbc=jdbc;this.outbox=outbox;}
 @Transactional public Map<String,Object> request(String id,String type,LocalDate date,String account,String actor){
  UUID.fromString(id); if(!Set.of("ACCRUAL","PAYOUT").contains(type))throw new IllegalArgumentException("Unsupported request type");
  if(date.isAfter(LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(maxDaysAhead)))throw new IllegalArgumentException("Future dates are not permitted");
  if("PAYOUT".equals(type)&&(account==null||account.isBlank()))throw new IllegalArgumentException("FD account required for payout");
  List<Map<String,Object>> existing=jdbc.queryForList("SELECT * FROM batch_requests WHERE request_id=?",id);
  if(!existing.isEmpty()){var prior=existing.get(0);if(!type.equals(prior.get("request_type"))||!date.toString().equals(prior.get("business_date").toString())||!Objects.equals(account,prior.get("fd_account_no")))throw new IllegalArgumentException("Request ID already used for different inputs");return prior;}
  jdbc.update("INSERT INTO batch_requests(request_id,request_type,business_date,fd_account_no,actor,status,created_at) VALUES(?,?,?,?,?,'QUEUED',CURRENT_TIMESTAMP)",id,type,date,account,actor);
  var data=new LinkedHashMap<String,Object>();data.put("requestId",id);data.put("businessDate",date.toString());data.put("actor",actor);if(account!=null)data.put("fdAccountNo",account);
  outbox.emit("command.interest."+type.toLowerCase(),"ACCRUAL".equals(type)?"InterestBatchRequested":"InterestPayoutRequested",id,data);
  return jdbc.queryForMap("SELECT * FROM batch_requests WHERE request_id=?",id);
 }
 @Transactional public void scheduled(LocalDate date){
  // Database key serializes replicas; a loser rolls back without enqueueing a duplicate.
  if(jdbc.queryForObject("SELECT COUNT(*) FROM scheduler_guard WHERE business_date=?",Integer.class,date)>0)return;
  String id=UUID.nameUUIDFromBytes(("daily:"+date).getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString();
  jdbc.update("INSERT INTO scheduler_guard(business_date,request_id) VALUES(?,?)",date,id);request(id,"ACCRUAL",date,null,"scheduler");
 }
 @Transactional public void result(DomainEvent e){
  if(e.schemaVersion()!=1)throw new IllegalArgumentException("Unsupported schema");
  if(jdbc.queryForObject("SELECT COUNT(*) FROM consumed_events WHERE event_id=?",Integer.class,e.eventId())>0)return;
  int updated=jdbc.update("UPDATE batch_requests SET status=?,result=? WHERE request_id=?",e.data().path("status").asText(),e.data().toString(),e.data().path("requestId").asText());
  if(updated!=1)throw new IllegalStateException("Unknown request result");
  jdbc.update("INSERT INTO consumed_events(event_id) VALUES(?)",e.eventId());
 }
 public Object list(){return jdbc.queryForList("SELECT * FROM batch_requests ORDER BY created_at DESC LIMIT 100");}
 public Object get(String id){var rows=jdbc.queryForList("SELECT * FROM batch_requests WHERE request_id=?",id);if(rows.isEmpty())throw new IllegalArgumentException("Request not found");return rows.get(0);}
}
