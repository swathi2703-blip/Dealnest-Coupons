package com.delanes.backend.controller;

import com.delanes.backend.dto.CreatePaymentOrderRequest;
import com.delanes.backend.dto.CreatePaymentOrderResponse;
import com.delanes.backend.dto.PaymentVerificationResponse;
import com.delanes.backend.dto.VerifyPaymentRequest;
import com.delanes.backend.model.CouponListing;
import com.delanes.backend.model.TransactionRecord;
import com.delanes.backend.repository.CouponListingRepository;
import com.delanes.backend.repository.TransactionRecordRepository;
import com.delanes.backend.service.FirebaseAuthService;
import com.delanes.backend.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String PAYOUT_PENDING = "PENDING";

    private final PaymentService paymentService;
    private final CouponListingRepository listingRepository;
    private final TransactionRecordRepository transactionRepository;
    private final FirebaseAuthService firebaseAuthService;

    @Value("${app.payment.reveal-link-base-url:http://localhost:8080/coupon/reveal}")
    private String revealLinkBaseUrl;

    @Value("${app.payment.reveal-expiry-seconds:300}")
    private long revealExpirySeconds;

    @Value("${app.payment.platform-fee-percent:15}")
    private double platformFeePercent;

    public PaymentController(
            PaymentService paymentService,
            CouponListingRepository listingRepository,
            TransactionRecordRepository transactionRepository,
            FirebaseAuthService firebaseAuthService
    ) {
        this.paymentService = paymentService;
        this.listingRepository = listingRepository;
        this.transactionRepository = transactionRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(
            @RequestBody CreatePaymentOrderRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);

            if (!StringUtils.hasText(request.getListing_id())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Listing ID is required"));
            }

            Optional<CouponListing> listingOptional = listingRepository.findById(request.getListing_id());
            if (listingOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
            }

            CouponListing listing = listingOptional.get();

            // Validate listing
            if (Boolean.TRUE.equals(listing.getIsSold()) || !Boolean.TRUE.equals(listing.getIsActive())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Listing is no longer available"));
            }

            if (user.getUid().equals(listing.getSellerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You cannot buy your own coupon"));
            }

            // Calculate amount (convert to paise: INR * 100)
            Double price = listing.getSellingPrice();
            if (price == null || price <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid listing price"));
            }

            Integer amountInPaise = (int) (price * 100);
            String receipt = "TXN-" + UUID.randomUUID().toString().substring(0, 8);

            // Create Razorpay order
            Order razorpayOrder = paymentService.createOrder(amountInPaise, "INR", receipt);
            String orderId = (String) razorpayOrder.get("id");

            // Store transaction record
            double normalizedPrice = roundToTwoDecimals(price);
            double normalizedPlatformFeePercent = Math.max(0, Math.min(100, platformFeePercent));
            double platformFeeAmount = roundToTwoDecimals(normalizedPrice * (normalizedPlatformFeePercent / 100.0));
            double sellerPayoutAmount = roundToTwoDecimals(normalizedPrice - platformFeeAmount);

            TransactionRecord record = new TransactionRecord();
            record.setTransactionId(UUID.randomUUID().toString());
            record.setListingId(listing.getId());
            record.setBuyerId(user.getUid());
            record.setSellerId(listing.getSellerId());
            record.setAmount(normalizedPrice);
            record.setPlatformFeePercent(normalizedPlatformFeePercent);
            record.setPlatformFeeAmount(platformFeeAmount);
            record.setSellerPayoutAmount(sellerPayoutAmount);
            record.setStatus(STATUS_PENDING);
            record.setRazorpayOrderId(orderId);
            record.setCreatedAt(Instant.now());

            transactionRepository.save(record);

            // Return order details
            CreatePaymentOrderResponse response = new CreatePaymentOrderResponse(
                    orderId,
                    amountInPaise,
                    "INR",
                    paymentService.getRazorpayKeyId()
            );

            return ResponseEntity.ok(response);

        } catch (RazorpayException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create payment order: " + ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + ex.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);

            if (!StringUtils.hasText(request.getOrder_id()) || 
                !StringUtils.hasText(request.getPayment_id()) || 
                !StringUtils.hasText(request.getSignature())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order ID, Payment ID, and Signature are required"));
            }

            // Verify signature
            Boolean isSignatureValid = paymentService.verifyPaymentSignature(
                    request.getOrder_id(),
                    request.getPayment_id(),
                    request.getSignature()
            );

            if (!isSignatureValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid payment signature"));
            }

            // Find transaction by order ID
            Optional<TransactionRecord> recordOptional = transactionRepository.findByRazorpayOrderId(request.getOrder_id());
            if (recordOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Transaction not found"));
            }

            TransactionRecord record = recordOptional.get();

            // Verify ownership
            if (!user.getUid().equals(record.getBuyerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
            }

            // Check if already completed
            if (STATUS_SUCCESS.equals(record.getStatus())) {
                return ResponseEntity.ok(new PaymentVerificationResponse(true, record.getTransactionId(), "Payment already verified"));
            }

            // Update transaction
            record.setStatus(STATUS_SUCCESS);
            record.setRazorpayPaymentId(request.getPayment_id());
            record.setPaymentReference(request.getPayment_id());
            record.setCompletedAt(Instant.now());
            record.setRevealExpiresAt(Instant.now().plusSeconds(revealExpirySeconds));
            record.setSellerPayoutStatus(PAYOUT_PENDING);

            // Mark listing as sold
            Optional<CouponListing> listingOptional = listingRepository.findById(record.getListingId());
            if (listingOptional.isPresent()) {
                CouponListing listing = listingOptional.get();
                listing.setIsSold(true);
                listingRepository.save(listing);

                PaymentService.PayoutResult payoutResult = paymentService.transferSellerPayout(listing, record);
                record.setSellerPayoutStatus(payoutResult.getStatus());
                record.setSellerPayoutReference(payoutResult.getPayoutReference());
                record.setSellerPayoutFailureReason(payoutResult.getMessage());
                record.setSellerPayoutProcessedAt(Instant.now());
            } else {
                record.setSellerPayoutStatus(STATUS_FAILED);
                record.setSellerPayoutFailureReason("Seller payout failed: listing not found");
                record.setSellerPayoutProcessedAt(Instant.now());
            }

            transactionRepository.save(record);

            return ResponseEntity.ok(new PaymentVerificationResponse(true, record.getTransactionId(), "Payment verified successfully"));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + ex.getMessage()));
        }
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
