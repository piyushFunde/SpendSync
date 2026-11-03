package com.spendsync.api.dto.response;

import com.spendsync.api.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private String id;
    private String userId;
    private Transaction.TransactionType type;
    private String category;
    private BigDecimal amount;
    private String description;
    private String notes;
    private LocalDate date;
    private boolean recurring;
    private String recurringFrequency;
    private LocalDateTime createdAt;
}
