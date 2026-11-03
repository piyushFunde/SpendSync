package com.spendsync.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    private TransactionType type; // INCOME or EXPENSE

    private String category;

    private BigDecimal amount;

    private String description;

    private String notes;

    private LocalDate date;

    private boolean isRecurring;

    private String recurringFrequency; // DAILY, WEEKLY, MONTHLY, YEARLY

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TransactionType {
        INCOME, EXPENSE
    }
}
