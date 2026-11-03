package com.spendsync.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private long transactionCount;
    private Map<String, BigDecimal> expenseByCategory;   // category -> total
    private Map<String, BigDecimal> incomeByCategory;
    private List<MonthlyData> monthlyData;               // last 6 months
    private List<TransactionResponse> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;    // e.g., "Jan 2024"
        private BigDecimal income;
        private BigDecimal expense;
    }
}
