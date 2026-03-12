package com.delanes.backend.dto;

public class CreatePaymentOrderResponse {
    private String order_id;
    private Integer amount;
    private String currency;
    private String razorpay_key;

    public CreatePaymentOrderResponse(String order_id, Integer amount, String currency, String razorpay_key) {
        this.order_id = order_id;
        this.amount = amount;
        this.currency = currency;
        this.razorpay_key = razorpay_key;
    }

    public String getOrder_id() {
        return order_id;
    }

    public void setOrder_id(String order_id) {
        this.order_id = order_id;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getRazorpay_key() {
        return razorpay_key;
    }

    public void setRazorpay_key(String razorpay_key) {
        this.razorpay_key = razorpay_key;
    }
}
