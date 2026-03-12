package com.delanes.backend.dto;

public class CreatePaymentOrderRequest {
    private String listing_id;
    private Integer amount; // Amount in paise (1 INR = 100 paise)

    public String getListing_id() {
        return listing_id;
    }

    public void setListing_id(String listing_id) {
        this.listing_id = listing_id;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }
}
