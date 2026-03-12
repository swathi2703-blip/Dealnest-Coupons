package com.delanes.backend.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "coupon_listings")
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CouponListing {

    @Id
    private String id;
    private String sellerId;
    private String brandName;
    private String couponCode;
    private String description;
    private Double originalValue;
    private Double sellingPrice;
    private Integer discountPercentage;
    private String category;
    private String expiryDate;
    private String websiteLink;
    private String payoutMethod;
    private String accountHolderName;
    private String payoutUpiId;
    private String payoutBankName;
    private String payoutBankAccountNumber;
    private String payoutBankIfsc;
    private Boolean isSold;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getOriginalValue() {
        return originalValue;
    }

    public void setOriginalValue(Double originalValue) {
        this.originalValue = originalValue;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getWebsiteLink() {
        return websiteLink;
    }

    public void setWebsiteLink(String websiteLink) {
        this.websiteLink = websiteLink;
    }

    public String getPayoutMethod() {
        return payoutMethod;
    }

    public void setPayoutMethod(String payoutMethod) {
        this.payoutMethod = payoutMethod;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getPayoutUpiId() {
        return payoutUpiId;
    }

    public void setPayoutUpiId(String payoutUpiId) {
        this.payoutUpiId = payoutUpiId;
    }

    public String getPayoutBankName() {
        return payoutBankName;
    }

    public void setPayoutBankName(String payoutBankName) {
        this.payoutBankName = payoutBankName;
    }

    public String getPayoutBankAccountNumber() {
        return payoutBankAccountNumber;
    }

    public void setPayoutBankAccountNumber(String payoutBankAccountNumber) {
        this.payoutBankAccountNumber = payoutBankAccountNumber;
    }

    public String getPayoutBankIfsc() {
        return payoutBankIfsc;
    }

    public void setPayoutBankIfsc(String payoutBankIfsc) {
        this.payoutBankIfsc = payoutBankIfsc;
    }

    public Boolean getIsSold() {
        return isSold;
    }

    public void setIsSold(Boolean isSold) {
        this.isSold = isSold;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
