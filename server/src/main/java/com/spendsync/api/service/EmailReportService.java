package com.spendsync.api.service;

import com.spendsync.api.model.Transaction;
import com.spendsync.api.model.User;
import com.spendsync.api.repository.TransactionRepository;
import com.spendsync.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailReportService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    // Runs on the 1st of every month at 9:00 AM
    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyReports() {
        log.info("Email reports are disabled (no mail sender configured). Skipping.");
    }

    public void sendMonthlyReport(User user) {
        log.info("Email reports are disabled (no mail sender configured). Skipping for {}", user.getEmail());
    }
}
