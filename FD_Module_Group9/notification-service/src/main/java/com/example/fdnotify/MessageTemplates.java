package com.example.fdnotify;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
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
            case "FdApplied" -> new Message(
                    "Fixed Deposit application received: " + acc,
                    htmlFdApplied(name, acc, cur, f));
            case "FdStatusChanged" -> new Message(
                    "Fixed Deposit status update: " + acc,
                    htmlFdStatusChanged(name, acc, cur, f));
            case "InterestAccrued" -> new Message(
                    "Interest accrued on your Fixed Deposit " + acc,
                    htmlInterestAccrued(name, acc, cur, date, f));
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

    private static String htmlFdApplied(String name, String acc, String cur, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 40px 70px, #f6b945, transparent),
                            radial-gradient(1px 1px at 90px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 130px 80px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 160px 120px, #f6b945, transparent),
                            radial-gradient(2px 2px at 200px 50px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 250px 90px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 300px 30px, #f6b945, transparent),
                            radial-gradient(1px 1px at 350px 70px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 400px 100px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 450px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 500px 80px, #2be0cc, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #2be0cc 0%%, #f6b945 55%%, #ff5c9a 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(43, 224, 204, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #2be0cc; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(43, 224, 204, 0.1) 0%%, rgba(246, 185, 69, 0.1) 100%%);
                        border: 1px solid rgba(43, 224, 204, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(43, 224, 204, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #2be0cc;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(43, 224, 204, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #f6b945; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #2be0cc, #f6b945);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(43, 224, 204, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #2be0cc;
                        text-shadow: 0 0 10px rgba(43, 224, 204, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>📝 Fixed Deposit Application Received</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">Thank you for your interest in opening a Fixed Deposit with UNO Bank. Your application has been received and is currently under review. Like a star waiting to shine brightly, your investment journey is about to begin.</p>
                            
                            <div class="info-box">
                                <h3>Application Details</h3>
                                <div class="info-row">
                                    <span class="label">Application Reference:</span>
                                    <span class="value highlight">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Status:</span>
                                    <span class="value" style="color: #f6b945;">Pending Approval</span>
                                </div>
                            </div>
                            
                            <p class="message">We will review your application and notify you once it has been approved. This process typically takes 1-2 business days.</p>
                            
                            <p class="message">Thank you for choosing UNO Bank. We look forward to welcoming you among our constellation of valued customers.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, acc);
    }

    private static String htmlFdStatusChanged(String name, String acc, String cur, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #f6b945, transparent),
                            radial-gradient(2px 2px at 40px 70px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 90px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 130px 80px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 160px 120px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 200px 50px, #f6b945, transparent),
                            radial-gradient(1px 1px at 250px 90px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 300px 30px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 350px 70px, #f6b945, transparent),
                            radial-gradient(2px 2px at 400px 100px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 450px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 500px 80px, #f6b945, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #f6b945 0%%, #2be0cc 55%%, #ff5c9a 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(246, 185, 69, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #f6b945; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(246, 185, 69, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(246, 185, 69, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(246, 185, 69, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #f6b945;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(246, 185, 69, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #ff5c9a; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #f6b945, #2be0cc);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .status-approved { color: #2be0cc; font-weight: 600; }
                    .status-rejected { color: #ff5c9a; font-weight: 600; }
                    .status-pending { color: #f6b945; font-weight: 600; }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(246, 185, 69, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #f6b945;
                        text-shadow: 0 0 10px rgba(246, 185, 69, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>🔄 Fixed Deposit Status Update</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">We are writing to inform you about an update to your Fixed Deposit application. Like stars that shift in the night sky, your application status has changed.</p>
                            
                            <div class="info-box">
                                <h3>Status Update Details</h3>
                                <div class="info-row">
                                    <span class="label">Account Number:</span>
                                    <span class="value highlight">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Current Status:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Reason:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            
                            <p class="message">If you have any questions about this status change, please contact our customer service team.</p>
                            
                            <p class="message">Thank you for your patience as we process your application among the stars of our financial universe.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                f.getOrDefault("status", "-"),
                f.getOrDefault("reason", "No reason provided")
            );
    }

    private static String htmlInterestAccrued(String name, String acc, String cur, String date, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 40px 70px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 90px 40px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 130px 80px, #f6b945, transparent),
                            radial-gradient(1px 1px at 160px 120px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 200px 50px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 250px 90px, #f6b945, transparent),
                            radial-gradient(2px 2px at 300px 30px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 350px 70px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 400px 100px, #f6b945, transparent),
                            radial-gradient(1px 1px at 450px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 500px 80px, #ff5c9a, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #ff5c9a 0%%, #2be0cc 55%%, #f6b945 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(255, 92, 154, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #ff5c9a; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(255, 92, 154, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(255, 92, 154, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(255, 92, 154, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #ff5c9a;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(255, 92, 154, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #2be0cc; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #ff5c9a, #f6b945);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 92, 154, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #ff5c9a;
                        text-shadow: 0 0 10px rgba(255, 92, 154, 0.5);
                    }
                    .note {
                        background: rgba(246, 185, 69, 0.1);
                        border-left: 3px solid #f6b945;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #f6b945;
                        position: relative;
                        z-index: 1;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>✨ Interest Accrued on Your Fixed Deposit</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">Interest has been accrued on your Fixed Deposit account. Like stars gathering to form brilliant constellations, your interest continues to accumulate day by day.</p>
                            
                            <div class="info-box">
                                <h3>Accrual Details</h3>
                                <div class="info-row">
                                    <span class="label">Account Number:</span>
                                    <span class="value highlight">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Accrual Date:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Interest Accrued:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Outstanding Interest:</span>
                                    <span class="value highlight">%s</span>
                                </div>
                            </div>
                            
                            <div class="note">
                                <strong>Note:</strong> This is an accrual entry, not a payout. The accrued interest will be paid out according to your FD's interest payment schedule.
                            </div>
                            
                            <p class="message">Your Fixed Deposit continues to grow steadily. The accrued interest will compound until it is paid out or your FD matures.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                name,
                acc,
                date,
                money(cur, f.get("interestAccrued")),
                money(cur, f.get("outstandingInterest"))
            );
    }

    private static String htmlFdCreated(String name, String acc, String cur, Map<String, String> f) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #f6b945, transparent),
                            radial-gradient(2px 2px at 40px 70px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 90px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 130px 80px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 160px 120px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 200px 50px, #f6b945, transparent),
                            radial-gradient(1px 1px at 250px 90px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 300px 30px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 350px 70px, #f6b945, transparent),
                            radial-gradient(2px 2px at 400px 100px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 450px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 500px 80px, #f6b945, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #f6b945 0%%, #2be0cc 55%%, #ff5c9a 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(246, 185, 69, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #f6b945; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(246, 185, 69, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(246, 185, 69, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(246, 185, 69, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #f6b945;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(246, 185, 69, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #2be0cc; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #f6b945, #ff5c9a);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(246, 185, 69, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #f6b945;
                        text-shadow: 0 0 10px rgba(246, 185, 69, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>✨ Fixed Deposit Opened Successfully</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">We are pleased to inform you that your Fixed Deposit account has been successfully opened with us under the stars of prosperity.</p>
                            
                            <div class="info-box">
                                <h3>Account Details</h3>
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
                            
                            <p class="message">Your Fixed Deposit is now active and will start earning interest from the opening date. Like stars that shine brighter with time, your investment will grow steadily. The maturity amount will be credited to your linked account on the maturity date.</p>
                            
                            <p class="message">Thank you for choosing to bank with us. Should you have any questions, please don't hesitate to contact our customer service.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
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
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 40px 70px, #f6b945, transparent),
                            radial-gradient(1px 1px at 90px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 130px 80px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 160px 120px, #f6b945, transparent),
                            radial-gradient(2px 2px at 200px 50px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 250px 90px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 300px 30px, #f6b945, transparent),
                            radial-gradient(1px 1px at 350px 70px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 400px 100px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 450px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 500px 80px, #2be0cc, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #2be0cc 0%%, #f6b945 55%%, #ff5c9a 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(43, 224, 204, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #2be0cc; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(43, 224, 204, 0.1) 0%%, rgba(246, 185, 69, 0.1) 100%%);
                        border: 1px solid rgba(43, 224, 204, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(43, 224, 204, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #2be0cc;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(43, 224, 204, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #f6b945; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #2be0cc, #f6b945);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(43, 224, 204, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #2be0cc;
                        text-shadow: 0 0 10px rgba(43, 224, 204, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>✨ Interest Credit Notification</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">We are pleased to inform you that interest has been credited to your Fixed Deposit account, adding to the constellation of your growing wealth.</p>
                            
                            <div class="info-box">
                                <h3>Transaction Details</h3>
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
                            
                            <p class="message">The interest has been added to your Fixed Deposit account and will continue to compound until maturity. Like stars that gather to form brilliant constellations, your interest accumulates to create a brighter financial future.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
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
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 40px 70px, #f6b945, transparent),
                            radial-gradient(1px 1px at 90px 40px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 130px 80px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 160px 120px, #f6b945, transparent),
                            radial-gradient(2px 2px at 200px 50px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 250px 90px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 300px 30px, #f6b945, transparent),
                            radial-gradient(1px 1px at 350px 70px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 400px 100px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 450px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 500px 80px, #ff5c9a, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #ff5c9a 0%%, #f6b945 55%%, #2be0cc 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(255, 92, 154, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #ff5c9a; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .success {
                        background: linear-gradient(135deg, rgba(255, 92, 154, 0.2) 0%%, rgba(246, 185, 69, 0.2) 100%%);
                        border: 1px solid rgba(255, 92, 154, 0.4);
                        color: #ff5c9a;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        text-align: center;
                        font-weight: 600;
                        position: relative;
                        z-index: 1;
                    }
                    .info-box {
                        background: linear-gradient(135deg, rgba(255, 92, 154, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(255, 92, 154, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(255, 92, 154, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #ff5c9a;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(255, 92, 154, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #f6b945; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #ff5c9a, #2be0cc);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 92, 154, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #ff5c9a;
                        text-shadow: 0 0 10px rgba(255, 92, 154, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>� Your Fixed Deposit Has Matured!</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">Congratulations! Your Fixed Deposit has reached maturity and the maturity amount has been processed. Like a constellation completing its journey across the night sky, your investment has reached its shining destination.</p>
                            
                            <div class="success">
                                ✨ Maturity Amount Successfully Credited
                            </div>
                            
                            <div class="info-box">
                                <h3>Maturity Details</h3>
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
                            
                            <p class="message">The maturity amount has been credited to your linked account. You can view the transaction details in your account statement.</p>
                            
                            <p class="message">Thank you for your trust in us. We look forward to serving you again as you continue your journey among the stars of financial prosperity.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
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
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #f6b945, transparent),
                            radial-gradient(2px 2px at 40px 70px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 90px 40px, #f6b945, transparent),
                            radial-gradient(2px 2px at 130px 80px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 160px 120px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 200px 50px, #f6b945, transparent),
                            radial-gradient(1px 1px at 250px 90px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 300px 30px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 350px 70px, #f6b945, transparent),
                            radial-gradient(2px 2px at 400px 100px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 450px 40px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 500px 80px, #f6b945, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #f6b945 0%%, #ff5c9a 55%%, #2be0cc 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(246, 185, 69, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #f6b945; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .warning {
                        background: linear-gradient(135deg, rgba(246, 185, 69, 0.2) 0%%, rgba(255, 92, 154, 0.2) 100%%);
                        border: 1px solid rgba(246, 185, 69, 0.4);
                        color: #f6b945;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        text-align: center;
                        font-weight: 600;
                        position: relative;
                        z-index: 1;
                    }
                    .info-box {
                        background: linear-gradient(135deg, rgba(246, 185, 69, 0.1) 0%%, rgba(255, 92, 154, 0.1) 100%%);
                        border: 1px solid rgba(246, 185, 69, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(246, 185, 69, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #f6b945;
                        position: relative;
                        z-index: 1;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(246, 185, 69, 0.2);
                        position: relative;
                        z-index: 1;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #ff5c9a; }
                    .value { color: #e0e0e0; font-weight: 500; }
                    .highlight {
                        background: linear-gradient(135deg, #f6b945, #2be0cc);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .penalty { color: #ff5c9a; font-weight: 600; }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(246, 185, 69, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #f6b945;
                        text-shadow: 0 0 10px rgba(246, 185, 69, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>⚠ Fixed Deposit Prematurely Closed</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">Your Fixed Deposit account has been closed before the scheduled maturity date as per your request. Like a star departing from its constellation before completing its journey, your investment has been withdrawn early.</p>
                            
                            <div class="warning">
                                ⚠ Premature closure penalty may apply
                            </div>
                            
                            <div class="info-box">
                                <h3>Closure Details</h3>
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
                                    <span class="value penalty">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Net Amount Paid:</span>
                                    <span class="value highlight">%s</span>
                                </div>
                            </div>
                            
                            <p class="message">The net amount has been credited to your linked account. Please note that premature closure may result in reduced interest earnings. We hope to welcome you back for a new journey among the stars of financial growth.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
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

    /**
     * Generate a batched email for multiple interest accruals
     */
    public static Message forBatchedInterestAccrual(String customerName, List<InterestAccrualBatch.AccrualEntry> accruals) {
        StringBuilder tableRows = new StringBuilder();
        String currency = accruals.isEmpty() ? "INR" : accruals.get(0).currency();
        
        for (InterestAccrualBatch.AccrualEntry entry : accruals) {
            tableRows.append("""
                <tr>
                    <td>%s</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td style="font-weight: 600; color: #ff5c9a;">%s</td>
                </tr>
                """.formatted(
                    entry.fdAccountNo(),
                    entry.businessDate(),
                    money(currency, entry.interestAccrued()),
                    money(currency, entry.outstandingInterest())
                ));
        }

        String body = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #0a0a1a; }
                    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
                    .email-wrapper {
                        background: linear-gradient(135deg, #0a0a1a 0%%, #1a1a2e 50%%, #0a0a1a 100%%);
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .stars {
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(2px 2px at 20px 30px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 40px 70px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 90px 40px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 130px 80px, #f6b945, transparent),
                            radial-gradient(1px 1px at 160px 120px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 200px 50px, #ff5c9a, transparent),
                            radial-gradient(1px 1px at 250px 90px, #f6b945, transparent),
                            radial-gradient(2px 2px at 300px 30px, #2be0cc, transparent),
                            radial-gradient(1px 1px at 350px 70px, #ff5c9a, transparent),
                            radial-gradient(2px 2px at 400px 100px, #f6b945, transparent),
                            radial-gradient(1px 1px at 450px 40px, #2be0cc, transparent),
                            radial-gradient(2px 2px at 500px 80px, #ff5c9a, transparent);
                        background-size: 550px 150px;
                        animation: twinkle 4s ease-in-out infinite;
                        opacity: 0.6;
                    }
                    @keyframes twinkle { 0%%, 100%% { opacity: 0.6; } 50%% { opacity: 0.9; } }
                    .header {
                        background: linear-gradient(135deg, #ff5c9a 0%%, #2be0cc 55%%, #f6b945 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0a0a1a;
                        text-shadow: 0 2px 10px rgba(255, 92, 154, 0.3);
                        letter-spacing: -0.5px;
                    }
                    .content {
                        background: rgba(26, 26, 46, 0.95);
                        padding: 40px 30px;
                        position: relative;
                        z-index: 1;
                    }
                    .greeting { font-size: 18px; margin-bottom: 20px; color: #ff5c9a; }
                    .message { color: #b0b0c0; margin-bottom: 25px; line-height: 1.8; }
                    .info-box {
                        background: linear-gradient(135deg, rgba(255, 92, 154, 0.1) 0%%, rgba(43, 224, 204, 0.1) 100%%);
                        border: 1px solid rgba(255, 92, 154, 0.3);
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 12px;
                        position: relative;
                        overflow: hidden;
                    }
                    .info-box::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        left: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(255, 92, 154, 0.1) 0%%, transparent 70%%);
                        animation: rotate 20s linear infinite;
                    }
                    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .info-box h3 {
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #ff5c9a;
                        position: relative;
                        z-index: 1;
                    }
                    table {
                        width: 100%%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        position: relative;
                        z-index: 1;
                    }
                    th {
                        background: rgba(246, 185, 69, 0.2);
                        color: #f6b945;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                        border-bottom: 2px solid rgba(246, 185, 69, 0.3);
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid rgba(255, 92, 154, 0.2);
                        color: #e0e0e0;
                    }
                    tr:last-child td { border-bottom: none; }
                    tr:hover { background: rgba(43, 224, 204, 0.05); }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 92, 154, 0.2);
                        color: #666;
                        font-size: 12px;
                        position: relative;
                        z-index: 1;
                    }
                    .footer p { margin: 5px 0; }
                    .glow-text {
                        color: #ff5c9a;
                        text-shadow: 0 0 10px rgba(255, 92, 154, 0.5);
                    }
                    .note {
                        background: rgba(246, 185, 69, 0.1);
                        border-left: 3px solid #f6b945;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #f6b945;
                        position: relative;
                        z-index: 1;
                    }
                    .summary {
                        background: linear-gradient(135deg, rgba(43, 224, 204, 0.15) 0%%, rgba(246, 185, 69, 0.15) 100%%);
                        border: 1px solid rgba(43, 224, 204, 0.3);
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        text-align: center;
                        position: relative;
                        z-index: 1;
                    }
                    .summary-number {
                        font-size: 32px;
                        font-weight: 700;
                        background: linear-gradient(135deg, #2be0cc, #f6b945);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="stars"></div>
                        <div class="header">
                            <h1>✨ Interest Accrual Summary</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear <strong class="glow-text">%s</strong>,</p>
                            <p class="message">Interest has been accrued on your Fixed Deposit accounts. Like stars gathering to form brilliant constellations, your interest continues to accumulate across all your investments.</p>
                            
                            <div class="summary">
                                <div style="font-size: 16px; color: #b0b0c0; margin-bottom: 10px;">Total FD Accounts with Accruals</div>
                                <div class="summary-number">%d</div>
                            </div>
                            
                            <div class="info-box">
                                <h3>Accrual Breakdown</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>FD Account</th>
                                            <th>Accrual Date</th>
                                            <th>Interest Accrued</th>
                                            <th>Outstanding Interest</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        %s
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="note">
                                <strong>Note:</strong> These are accrual entries, not payouts. The accrued interest will be paid out according to your FDs' interest payment schedules.
                            </div>
                            
                            <p class="message">Your Fixed Deposits continue to grow steadily. The accrued interest will compound until it is paid out or your FDs mature.</p>
                            
                            <div class="footer">
                                <p>This is an automated email. Please do not reply.</p>
                                <p>&copy; 2026 UNO Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(customerName, accruals.size(), tableRows.toString());

        return new Message(
            "Interest Accrual Summary - " + accruals.size() + " Fixed Deposits",
            body
        );
    }
}
