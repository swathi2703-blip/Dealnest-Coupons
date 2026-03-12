package com.delanes.backend.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "transactions")
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TransactionRecord {

    @Id
    private String id;
    private String transactionId;
    private String listingId;
    private String buyerId;
    private String sellerId;
    private Double amount;
    private Double platformFeeAmount;
    private Double sellerPayoutAmount;
    private Double platformFeePercent;
    private String paymentReference;
    private String revealToken;
    private String status;
    private String failureReason;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String sellerPayoutStatus;
    private String sellerPayoutReference;
    private String sellerPayoutFailureReason;
    private Instant sellerPayoutProcessedAt;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant completedAt;
    private Instant revealExpiresAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getListingId() {
        return listingId;
    }

    public void setListingId(String listingId) {
        this.listingId = listingId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getPlatformFeeAmount() {
        return platformFeeAmount;
    }

    public void setPlatformFeeAmount(Double platformFeeAmount) {
        this.platformFeeAmount = platformFeeAmount;
    }

    public Double getSellerPayoutAmount() {
        return sellerPayoutAmount;
    }

    public void setSellerPayoutAmount(Double sellerPayoutAmount) {
        this.sellerPayoutAmount = sellerPayoutAmount;
    }

    public Double getPlatformFeePercent() {
        return platformFeePercent;
    }

    public void setPlatformFeePercent(Double platformFeePercent) {
        this.platformFeePercent = platformFeePercent;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getRevealToken() {
        return revealToken;
    }

    public void setRevealToken(String revealToken) {
        this.revealToken = revealToken;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getRevealExpiresAt() {
        return revealExpiresAt;
    }

    public void setRevealExpiresAt(Instant revealExpiresAt) {
        this.revealExpiresAt = revealExpiresAt;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getSellerPayoutStatus() {
        return sellerPayoutStatus;
    }

    public void setSellerPayoutStatus(String sellerPayoutStatus) {
        this.sellerPayoutStatus = sellerPayoutStatus;
    }

    public String getSellerPayoutReference() {
        return sellerPayoutReference;
    }

    public void setSellerPayoutReference(String sellerPayoutReference) {
        this.sellerPayoutReference = sellerPayoutReference;
    }

    public String getSellerPayoutFailureReason() {
        return sellerPayoutFailureReason;
    }

    public void setSellerPayoutFailureReason(String sellerPayoutFailureReason) {
        this.sellerPayoutFailureReason = sellerPayoutFailureReason;
    }

    public Instant getSellerPayoutProcessedAt() {
        return sellerPayoutProcessedAt;
    }

    public void setSellerPayoutProcessedAt(Instant sellerPayoutProcessedAt) {
        this.sellerPayoutProcessedAt = sellerPayoutProcessedAt;
    }
}
