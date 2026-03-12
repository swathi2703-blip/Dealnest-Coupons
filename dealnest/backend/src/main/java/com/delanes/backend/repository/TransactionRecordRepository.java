package com.delanes.backend.repository;

import com.delanes.backend.model.TransactionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRecordRepository extends MongoRepository<TransactionRecord, String> {

    Optional<TransactionRecord> findByTransactionId(String transactionId);

    boolean existsByTransactionId(String transactionId);

    boolean existsByPaymentReferenceAndIdNot(String paymentReference, String id);

    Optional<TransactionRecord> findByRevealToken(String revealToken);

    Optional<TransactionRecord> findByRazorpayOrderId(String razorpayOrderId);

    Optional<TransactionRecord> findByRazorpayPaymentId(String razorpayPaymentId);

    List<TransactionRecord> findByStatus(String status);

    List<TransactionRecord> findTop20ByStatusOrderByCompletedAtDesc(String status);
}
