package com.spendsync.api.controller;

import com.spendsync.api.dto.request.TransactionRequest;
import com.spendsync.api.dto.response.DashboardSummaryResponse;
import com.spendsync.api.dto.response.TransactionResponse;
import com.spendsync.api.model.Transaction;
import com.spendsync.api.model.User;
import com.spendsync.api.repository.UserRepository;
import com.spendsync.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow();
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(getUserId(userDetails), request));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(
                transactionService.getAll(getUserId(userDetails), type, category, startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        return ResponseEntity.ok(transactionService.getById(getUserId(userDetails), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.update(getUserId(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        transactionService.delete(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getDashboardSummary(getUserId(userDetails)));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws Exception {

        List<TransactionResponse> transactions = transactionService.getAll(
                getUserId(userDetails), type, null, startDate, endDate);

        StringWriter sw = new StringWriter();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader("ID", "Date", "Type", "Category", "Amount", "Description", "Notes")
                .build();

        try (CSVPrinter printer = new CSVPrinter(sw, format)) {
            for (TransactionResponse t : transactions) {
                printer.printRecord(t.getId(), t.getDate(), t.getType(),
                        t.getCategory(), t.getAmount(), t.getDescription(), t.getNotes());
            }
        }

        byte[] csvBytes = sw.toString().getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "spendsync-transactions.csv");
        headers.setContentLength(csvBytes.length);

        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }
}
