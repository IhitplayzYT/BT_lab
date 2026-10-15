package com.example.fdnotify;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/** HTML email templates (no Spring), easy to unit test and to read. */
public final class MessageTemplates {
    public record Message(String subject, String body) { }

    private MessageTemplates() { }

    /** Returns null when the event type has no customer message. */
    public static Message forEvent(String eventType, Map<String, String> f) {
        String name = f.get("customerName");
        if (name == null || name.isBlank()) name = "Customer";
        String acc = f.getOrDefault("fdAccountNo", "");
        String cur = f.getOrDefault("currency", "INR");
        String date = f.getOrDefault("businessDate", "-");
        return switch (eventType == null ? "" : eventType) {
            case "FdCreated" -> new Message(
                    "Your Fixed Deposit " + acc + " has been opened",
                    htmlFdCreated(name, acc, cur, f));
            case "InterestPaid" -> new Message(
                    "Interest paid on your Fixed Deposit " + acc,
                    htmlInterestPaid(name, acc, cur, date, f));
            case "FdMatured" -> new Message(
                    "Your Fixed Deposit Has Matured Successfully",
                    htmlFdMatured(name, acc, cur, f));
            case "FdPrematurelyClosed" -> new Message(
                    "Your Fixed Deposit " + acc + " was closed before maturity",
                    htmlFdPrematurelyClosed(name, acc, cur, date, f));
            default -> null;
        };
    }

    private static String htmlFdCreated(String name, String acc, String cur, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                    .highlight { color: #667eea; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Fixed Deposit Opened Successfully</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>We are pleased to inform you that your Fixed Deposit account has been successfully opened with us.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">Account Details</h3>
                            <div class="info-row">
                                <span class="label">Account Number:</span>
                                <span class="value highlight">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Principal Amount:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Interest Rate:</span>
                                <span class="value">%s%% p.a.</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Tenure:</span>
                                <span class="value">%s months</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Maturity Date:</span>
                                <span class="value">%s</span>
                            </div>
                        </div>
                        
                        <p>Your Fixed Deposit is now active and will start earning interest from the opening date. The maturity amount will be credited to your linked account on the maturity date.</p>
                        
                        <p>Thank you for choosing to bank with us. Should you have any questions, please don't hesitate to contact our customer service.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; 2026 SecureBank. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                money(cur, f.get("principal")),
                f.getOrDefault("annualRate", "-"),
                f.getOrDefault("termMonths", "-"),
                f.getOrDefault("maturityDate", "-")
            );
    }

    private static String htmlInterestPaid(String name, String acc, String cur, String date, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #11998e; border-radius: 5px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                    .highlight { color: #11998e; font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 Interest Credit Notification</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>We are pleased to inform you that interest has been credited to your Fixed Deposit account.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">Transaction Details</h3>
                            <div class="info-row">
                                <span class="label">Account Number:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Interest Amount:</span>
                                <span class="value highlight">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Credit Date:</span>
                                <span class="value">%s</span>
                            </div>
                        </div>
                        
                        <p>The interest has been added to your Fixed Deposit account and will continue to compound until maturity.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; 2026 SecureBank. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                money(cur, f.get("interestPaid")),
                date
            );
    }

    private static String htmlFdMatured(String name, String acc, String cur, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; border-radius: 5px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                    .highlight { color: #f5576c; font-weight: bold; font-size: 18px; }
                    .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎊 Your Fixed Deposit Has Matured!</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>Congratulations! Your Fixed Deposit has reached maturity and the maturity amount has been processed.</p>
                        
                        <div class="success">
                            <strong>✓ Maturity Amount Successfully Credited</strong>
                        </div>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">Maturity Details</h3>
                            <div class="info-row">
                                <span class="label">Account Number:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Maturity Date:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Total Interest Earned:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Maturity Amount:</span>
                                <span class="value highlight">%s</span>
                            </div>
                        </div>
                        
                        <p>The maturity amount has been credited to your linked account. You can view the transaction details in your account statement.</p>
                        
                        <p>Thank you for your trust in us. We look forward to serving you again.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; 2026 SecureBank. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                f.getOrDefault("maturityDate", f.getOrDefault("businessDate", "-")),
                money(cur, f.get("interestPaid")),
                money(cur, f.get("totalPaid"))
            );
    }

    private static String htmlFdPrematurelyClosed(String name, String acc, String cur, String date, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #eb3349 0%%, #f45c43 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #eb3349; border-radius: 5px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                    .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                    .highlight { color: #eb3349; font-weight: bold; font-size: 18px; }
                    .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Fixed Deposit Prematurely Closed</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>Your Fixed Deposit account has been closed before the scheduled maturity date as per your request.</p>
                        
                        <div class="warning">
                            <strong>⚠ Premature closure penalty may apply</strong>
                        </div>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0;">Closure Details</h3>
                            <div class="info-row">
                                <span class="label">Account Number:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Closure Date:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Interest Earned:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Penalty Applied:</span>
                                <span class="value" style="color: #eb3349;">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Net Amount Paid:</span>
                                <span class="value highlight">%s</span>
                            </div>
                        </div>
                        
                        <p>The net amount has been credited to your linked account. Please note that premature closure may result in reduced interest earnings.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; 2026 SecureBank. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                date,
                money(cur, f.get("interest")),
                money(cur, f.get("penalty")),
                money(cur, f.get("totalPaid"))
            );
    }

    static String money(String currency, String amount) {
        if (amount == null || amount.isBlank()) return currency + " -";
        try {
            return currency + " " + new BigDecimal(amount).setScale(2, RoundingMode.HALF_UP).toPlainString();
        } catch (NumberFormatException e) {
            return currency + " " + amount;
        }
    }
}
