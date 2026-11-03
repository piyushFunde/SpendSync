package com.spendsync.api.dto.request;

import com.spendsync.api.model.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotNull(message = "Transaction type is required")
    private Transaction.TransactionType type;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String description;

    private String notes;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private boolean recurring = false;

    private String recurringFrequency;
}
