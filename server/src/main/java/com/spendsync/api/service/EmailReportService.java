package com.spendsync.api.service;

import com.spendsync.api.model.Transaction;
import com.spendsync.api.model.User;
import com.spendsync.api.repository.TransactionRepository;
import com.spendsync.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailReportService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    // Runs on the 1st of every month at 9:00 AM
    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyReports() {
        log.info("Starting monthly email report job...");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                sendMonthlyReport(user);
            } catch (Exception e) {
                log.error("Failed to send monthly report to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    public void sendMonthlyReport(User user) throws Exception {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDate start = lastMonth.atDay(1);
        LocalDate end = lastMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), start, end);

        BigDecimal income = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expense = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String html = buildEmailHtml(user.getName(), lastMonth.toString(), income, expense,
                income.subtract(expense), transactions.size(), user.getCurrency());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(user.getEmail());
        helper.setSubject("💰 SpendSync Monthly Report - " + lastMonth.getMonth().name());
        helper.setText(html, true);
        mailSender.send(message);

        log.info("Monthly report sent to {}", user.getEmail());
    }

    private String buildEmailHtml(String name, String month, BigDecimal income, BigDecimal expense,
                                   BigDecimal balance, int txCount, String currency) {
        String balanceColor = balance.compareTo(BigDecimal.ZERO) >= 0 ? "#10b981" : "#ef4444";
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: 'Inter', Arial, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px;">
                  <div style="max-width:600px; margin:0 auto; background:#1e293b; border-radius:16px; padding:40px; border:1px solid #334155;">
                    <h1 style="color:#6366f1; margin:0 0 8px;">💰 SpendSync</h1>
                    <p style="color:#94a3b8; margin:0 0 32px;">Monthly Report · %s</p>
                    <h2 style="color:#f1f5f9;">Hi %s! 👋</h2>
                    <p>Here's your financial summary for <strong>%s</strong>:</p>
                    <div style="display:grid; gap:16px; margin:24px 0;">
                      <div style="background:#0f172a; padding:20px; border-radius:12px; border-left:4px solid #10b981;">
                        <p style="margin:0; color:#94a3b8; font-size:14px;">TOTAL INCOME</p>
                        <p style="margin:4px 0 0; font-size:28px; font-weight:700; color:#10b981;">%s %.2f</p>
                      </div>
                      <div style="background:#0f172a; padding:20px; border-radius:12px; border-left:4px solid #ef4444;">
                        <p style="margin:0; color:#94a3b8; font-size:14px;">TOTAL EXPENSES</p>
                        <p style="margin:4px 0 0; font-size:28px; font-weight:700; color:#ef4444;">%s %.2f</p>
                      </div>
                      <div style="background:#0f172a; padding:20px; border-radius:12px; border-left:4px solid %s;">
                        <p style="margin:0; color:#94a3b8; font-size:14px;">NET BALANCE</p>
                        <p style="margin:4px 0 0; font-size:28px; font-weight:700; color:%s;">%s %.2f</p>
                      </div>
                    </div>
                    <p style="color:#94a3b8;">You made <strong style="color:#6366f1;">%d transactions</strong> this month.</p>
                    <a href="https://spendsync.vercel.app" style="display:inline-block; background:#6366f1; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;">View Dashboard →</a>
                    <p style="margin-top:32px; color:#475569; font-size:12px;">© 2024 SpendSync. Manage your finances wisely.</p>
                  </div>
                </body>
                </html>
                """.formatted(month, name, month, currency, income, currency, expense,
                balanceColor, balanceColor, currency, balance, txCount);
    }
}
