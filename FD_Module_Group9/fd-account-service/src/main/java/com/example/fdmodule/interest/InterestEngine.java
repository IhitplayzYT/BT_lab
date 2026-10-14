package com.example.fdmodule.interest;
import java.math.*;
public final class InterestEngine {
 private static final MathContext MC=MathContext.DECIMAL128;
 private InterestEngine(){}
 public static BigDecimal quote(BigDecimal principal,BigDecimal annualRate,int months,String mode){
  if(principal==null||annualRate==null||principal.signum()<=0||annualRate.signum()<0||annualRate.compareTo(new BigDecimal("100"))>0||months<1||months>1200) throw new IllegalArgumentException("Positive principal, rate 0-100 and months 1-1200 required");
  if("SIMPLE".equals(mode)) return principal.add(principal.multiply(annualRate,MC).multiply(BigDecimal.valueOf(months),MC).divide(new BigDecimal("1200"),MC)).setScale(2,RoundingMode.HALF_UP);
  if("MONTHLY_COMPOUND".equals(mode)) return principal.multiply(BigDecimal.ONE.add(annualRate.divide(new BigDecimal("1200"),MC)).pow(months,MC),MC).setScale(2,RoundingMode.HALF_UP);
  throw new IllegalArgumentException("Mode must be SIMPLE or MONTHLY_COMPOUND");
 }
 public static BigDecimal daily(BigDecimal balance,BigDecimal annualRate){return balance.multiply(annualRate,MC).divide(new BigDecimal("36500"),MC).setScale(6,RoundingMode.HALF_UP);}
}
