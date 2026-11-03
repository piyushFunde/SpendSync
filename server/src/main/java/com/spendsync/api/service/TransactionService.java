package com.spendsync.api.service;

import com.spendsync.api.dto.request.TransactionRequest;
import com.spendsync.api.dto.response.DashboardSummaryResponse;
import com.spendsync.api.dto.response.TransactionResponse;
import com.spendsync.api.exception.BadRequestException;
import com.spendsync.api.exception.ResourceNotFoundException;
import com.spendsync.api.model.Transaction;
import com.spendsync.api.model.User;
import com.spendsync.api.repository.TransactionRepository;
import com.spendsync.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionResponse create(String userId, TransactionRequest request) {
        validateUser(userId);
        Transaction transaction = Transaction.builder()
                .userId(userId)
                .type(request.getType())
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .notes(request.getNotes())
                .date(request.getDate())
                .isRecurring(request.isRecurring())
                .recurringFrequency(request.getRecurringFrequency())
                .build();
        return toResponse(transactionRepository.save(transaction));
    }

    public List<TransactionResponse> getAll(String userId, String type, String category,
                                            LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions;

        if (startDate != null && endDate != null) {
            transactions = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        }

        return transactions.stream()
                .filter(t -> type == null || t.getType().name().equalsIgnoreCase(type))
                .filter(t -> category == null || t.getCategory().equalsIgnoreCase(category))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getById(String userId, String transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }
        return toResponse(transaction);
    }

    public TransactionResponse update(String userId, String transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setNotes(request.getNotes());
        transaction.setDate(request.getDate());
        transaction.setRecurring(request.isRecurring());
        transaction.setRecurringFrequency(request.getRecurringFrequency());
        return toResponse(transactionRepository.save(transaction));
    }

    public void delete(String userId, String transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }
        transactionRepository.delete(transaction);
    }

    public DashboardSummaryResponse getDashboardSummary(String userId) {
        List<Transaction> allTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        BigDecimal totalIncome = allTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = allTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Category breakdown - expenses
        Map<String, BigDecimal> expenseByCategory = allTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        // Category breakdown - income
        Map<String, BigDecimal> incomeByCategory = allTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        // Monthly data - last 6 months
        List<DashboardSummaryResponse.MonthlyData> monthlyData = buildMonthlyData(allTransactions);

        // Recent transactions - last 5
        List<TransactionResponse> recent = allTransactions.stream()
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .transactionCount(allTransactions.size())
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(incomeByCategory)
                .monthlyData(monthlyData)
                .recentTransactions(recent)
                .build();
    }

    private List<DashboardSummaryResponse.MonthlyData> buildMonthlyData(List<Transaction> transactions) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        List<DashboardSummaryResponse.MonthlyData> result = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            BigDecimal income = transactions.stream()
                    .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                    .filter(t -> !t.getDate().isBefore(start) && !t.getDate().isAfter(end))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = transactions.stream()
                    .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                    .filter(t -> !t.getDate().isBefore(start) && !t.getDate().isAfter(end))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(DashboardSummaryResponse.MonthlyData.builder()
                    .month(ym.atDay(1).format(formatter))
                    .income(income)
                    .expense(expense)
                    .build());
        }
        return result;
    }

    private void validateUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .type(t.getType())
                .category(t.getCategory())
                .amount(t.getAmount())
                .description(t.getDescription())
                .notes(t.getNotes())
                .date(t.getDate())
                .recurring(t.isRecurring())
                .recurringFrequency(t.getRecurringFrequency())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
