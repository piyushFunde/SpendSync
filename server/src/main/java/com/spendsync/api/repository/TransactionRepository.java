package com.spendsync.api.repository;

import com.spendsync.api.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    List<Transaction> findByUserIdAndType(String userId, Transaction.TransactionType type);

    List<Transaction> findByUserIdAndCategory(String userId, String category);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
            String userId, LocalDate startDate, LocalDate endDate);

    @Query("{ 'userId': ?0, 'type': ?1, 'date': { $gte: ?2, $lte: ?3 } }")
    List<Transaction> findByUserIdAndTypeAndDateBetween(
            String userId, Transaction.TransactionType type, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserIdAndIsRecurringTrue(String userId);
}
