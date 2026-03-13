package com.delanes.backend.dto;

import com.delanes.backend.model.TransactionRecord;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AdminEarningsSummaryResponse {

    private double totalGrossAmount;
    private double totalAdminAmount;
    private double totalSellerPayoutAmount;
    private long totalSuccessfulTransactions;
    private long successfulSellerPayouts;
    private long failedSellerPayouts;
    private List<TransactionRecord> recentTransactions;

    public double getTotalGrossAmount() {
        return totalGrossAmount;
    }

    public void setTotalGrossAmount(double totalGrossAmount) {
        this.totalGrossAmount = totalGrossAmount;
    }

    public double getTotalAdminAmount() {
        return totalAdminAmount;
    }

    public void setTotalAdminAmount(double totalAdminAmount) {
        this.totalAdminAmount = totalAdminAmount;
    }

    public double getTotalSellerPayoutAmount() {
        return totalSellerPayoutAmount;
    }

    public void setTotalSellerPayoutAmount(double totalSellerPayoutAmount) {
        this.totalSellerPayoutAmount = totalSellerPayoutAmount;
    }

    public long getTotalSuccessfulTransactions() {
        return totalSuccessfulTransactions;
    }

    public void setTotalSuccessfulTransactions(long totalSuccessfulTransactions) {
        this.totalSuccessfulTransactions = totalSuccessfulTransactions;
    }

    public long getSuccessfulSellerPayouts() {
        return successfulSellerPayouts;
    }

    public void setSuccessfulSellerPayouts(long successfulSellerPayouts) {
        this.successfulSellerPayouts = successfulSellerPayouts;
    }

    public long getFailedSellerPayouts() {
        return failedSellerPayouts;
    }

    public void setFailedSellerPayouts(long failedSellerPayouts) {
        this.failedSellerPayouts = failedSellerPayouts;
    }

    public List<TransactionRecord> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionRecord> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
