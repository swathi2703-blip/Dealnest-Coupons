package com.delanes.backend.controller;

import com.delanes.backend.dto.AdminEarningsSummaryResponse;
import com.delanes.backend.model.TransactionRecord;
import com.delanes.backend.repository.TransactionRecordRepository;
import com.delanes.backend.service.FirebaseAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String STATUS_SUCCESS = "SUCCESS";

    private final TransactionRecordRepository transactionRepository;
    private final FirebaseAuthService firebaseAuthService;

    @Value("${app.admin.emails:}")
    private String adminEmailsConfig;

    public AdminController(
            TransactionRecordRepository transactionRepository,
            FirebaseAuthService firebaseAuthService
    ) {
        this.transactionRepository = transactionRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    @GetMapping("/earnings-summary")
    public ResponseEntity<?> getEarningsSummary(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);
            if (!isAdminUser(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            List<TransactionRecord> successfulTransactions = transactionRepository.findByStatus(STATUS_SUCCESS);
            List<TransactionRecord> recentTransactions = transactionRepository.findTop20ByStatusOrderByCompletedAtDesc(STATUS_SUCCESS);

            double totalGross = roundToTwoDecimals(successfulTransactions.stream()
                    .map(TransactionRecord::getAmount)
                    .filter(value -> value != null && value > 0)
                    .reduce(0.0, Double::sum));

            double totalAdminAmount = roundToTwoDecimals(successfulTransactions.stream()
                    .map(TransactionRecord::getPlatformFeeAmount)
                    .filter(value -> value != null && value > 0)
                    .reduce(0.0, Double::sum));

            double totalSellerPayoutAmount = roundToTwoDecimals(successfulTransactions.stream()
                    .map(TransactionRecord::getSellerPayoutAmount)
                    .filter(value -> value != null && value > 0)
                    .reduce(0.0, Double::sum));

            long successfulSellerPayouts = successfulTransactions.stream()
                    .filter(record -> "processed".equalsIgnoreCase(record.getSellerPayoutStatus())
                            || "queued".equalsIgnoreCase(record.getSellerPayoutStatus())
                            || "pending".equalsIgnoreCase(record.getSellerPayoutStatus()))
                    .count();

            long failedSellerPayouts = successfulTransactions.stream()
                    .filter(record -> "failed".equalsIgnoreCase(record.getSellerPayoutStatus()))
                    .count();

            AdminEarningsSummaryResponse response = new AdminEarningsSummaryResponse();
            response.setTotalGrossAmount(totalGross);
            response.setTotalAdminAmount(totalAdminAmount);
            response.setTotalSellerPayoutAmount(totalSellerPayoutAmount);
            response.setTotalSuccessfulTransactions(successfulTransactions.size());
            response.setSuccessfulSellerPayouts(successfulSellerPayouts);
            response.setFailedSellerPayouts(failedSellerPayouts);
            response.setRecentTransactions(recentTransactions);

            return ResponseEntity.ok(Map.of("data", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

    private boolean isAdminUser(String email) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(adminEmailsConfig)) {
            return false;
        }

        Set<String> adminEmails = Arrays.stream(adminEmailsConfig.split(","))
                .map(String::trim)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        return adminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
