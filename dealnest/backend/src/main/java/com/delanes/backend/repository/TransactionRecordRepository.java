package com.delanes.backend.repository;

import com.delanes.backend.model.TransactionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TransactionRecordRepository extends MongoRepository<TransactionRecord, String> {

    Optional<TransactionRecord> findByTransactionId(String transactionId);

    boolean existsByTransactionId(String transactionId);

    boolean existsByPaymentReferenceAndIdNot(String paymentReference, String id);
}
