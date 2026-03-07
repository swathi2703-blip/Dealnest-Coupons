package com.delanes.backend.controller;

import com.delanes.backend.dto.ConfirmTransactionRequest;
import com.delanes.backend.dto.InitiateTransactionRequest;
import com.delanes.backend.model.CouponListing;
import com.delanes.backend.model.TransactionRecord;
import com.delanes.backend.repository.CouponListingRepository;
import com.delanes.backend.repository.TransactionRecordRepository;
import com.delanes.backend.service.FirebaseAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private final CouponListingRepository listingRepository;
    private final TransactionRecordRepository transactionRepository;
    private final FirebaseAuthService firebaseAuthService;

    @Value("${app.payment.google-form-url:https://forms.gle/pN1vTyCemqh3MPSX6}")
    private String googleFormUrl;

    @Value("${app.payment.qr-url:}")
    private String qrUrl;

    @Value("${app.payment.qr-expiry-seconds:300}")
    private long qrExpirySeconds;

    @Value("${app.payment.reveal-expiry-seconds:360}")
    private long revealExpirySeconds;

    public TransactionController(
            CouponListingRepository listingRepository,
            TransactionRecordRepository transactionRepository,
            FirebaseAuthService firebaseAuthService
    ) {
        this.listingRepository = listingRepository;
        this.transactionRepository = transactionRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateTransaction(
            @RequestBody InitiateTransactionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);

            if (!StringUtils.hasText(request.getListingId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Listing is required"));
            }

            Optional<CouponListing> listingOptional = listingRepository.findById(request.getListingId());
            if (listingOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
            }

            CouponListing listing = listingOptional.get();
            if (Boolean.TRUE.equals(listing.getIsSold()) || !Boolean.TRUE.equals(listing.getIsActive())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Listing is no longer available"));
            }

            if (user.getUid().equals(listing.getSellerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You cannot buy your own coupon"));
            }

            String transactionId = generateTransactionId();
            Instant now = Instant.now();

            TransactionRecord record = new TransactionRecord();
            record.setTransactionId(transactionId);
            record.setListingId(listing.getId());
            record.setBuyerId(user.getUid());
            record.setSellerId(listing.getSellerId());
            record.setAmount(listing.getSellingPrice());
            record.setStatus(STATUS_PENDING);
            record.setCreatedAt(now);
            record.setExpiresAt(now.plusSeconds(qrExpirySeconds));

            transactionRepository.save(record);

            String formUrl = StringUtils.hasText(googleFormUrl)
                    ? googleFormUrl + (googleFormUrl.contains("?") ? "&" : "?") + "transaction_id=" + transactionId
                    : "";

            return ResponseEntity.ok(Map.of(
                    "data", record,
                    "form_url", formUrl,
                    "qr_url", qrUrl,
                    "listing", listing
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmTransaction(
            @RequestBody ConfirmTransactionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);

            if (!StringUtils.hasText(request.getTransactionId()) || !StringUtils.hasText(request.getPaymentReference())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Transaction ID and payment reference are required"));
            }

            Optional<TransactionRecord> recordOptional = transactionRepository.findByTransactionId(request.getTransactionId().trim());
            if (recordOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Transaction not found"));
            }

            TransactionRecord record = recordOptional.get();
            if (!user.getUid().equals(record.getBuyerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized transaction access"));
            }

            if (!STATUS_PENDING.equals(record.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Transaction is already processed"));
            }

            Instant now = Instant.now();
            if (record.getExpiresAt() != null && now.isAfter(record.getExpiresAt())) {
                record.setStatus(STATUS_CANCELLED);
                record.setFailureReason("QR payment window expired");
                transactionRepository.save(record);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Transaction expired. Please retry."));
            }

            String paymentReference = request.getPaymentReference().trim().toUpperCase(Locale.ROOT);
            if (transactionRepository.existsByPaymentReferenceAndIdNot(paymentReference, record.getId())) {
                record.setStatus(STATUS_CANCELLED);
                record.setFailureReason("Duplicate payment reference detected");
                record.setPaymentReference(paymentReference);
                transactionRepository.save(record);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Duplicate transaction ID detected. Transaction cancelled."));
            }

            Optional<CouponListing> listingOptional = listingRepository.findById(record.getListingId());
            if (listingOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
            }

            CouponListing listing = listingOptional.get();
            if (Boolean.TRUE.equals(listing.getIsSold()) || !Boolean.TRUE.equals(listing.getIsActive())) {
                record.setStatus(STATUS_CANCELLED);
                record.setFailureReason("Listing unavailable during confirmation");
                transactionRepository.save(record);
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Listing already sold"));
            }

            listing.setIsSold(true);
            listing.setIsActive(false);
            listing.setUpdatedAt(now);
            listingRepository.save(listing);

            record.setStatus(STATUS_SUCCESS);
            record.setPaymentReference(paymentReference);
            record.setCompletedAt(now);
            record.setRevealExpiresAt(now.plusSeconds(revealExpirySeconds));
            transactionRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "data", record,
                    "coupon_code", listing.getCouponCode(),
                    "website_link", listing.getWebsiteLink(),
                    "reveal_expires_at", record.getRevealExpiresAt()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

    private String generateTransactionId() {
        for (int attempts = 0; attempts < 5; attempts++) {
            String transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
            if (!transactionRepository.existsByTransactionId(transactionId)) {
                return transactionId;
            }
        }

        throw new IllegalStateException("Failed to generate unique transaction ID");
    }
}
