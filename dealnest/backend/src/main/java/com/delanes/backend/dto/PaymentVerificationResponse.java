package com.delanes.backend.dto;

public class PaymentVerificationResponse {
    private Boolean success;
    private String transaction_id;
    private String message;

    public PaymentVerificationResponse(Boolean success, String transaction_id, String message) {
        this.success = success;
        this.transaction_id = transaction_id;
        this.message = message;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getTransaction_id() {
        return transaction_id;
    }

    public void setTransaction_id(String transaction_id) {
        this.transaction_id = transaction_id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
