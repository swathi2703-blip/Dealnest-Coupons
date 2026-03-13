package com.delanes.backend.dto;

public class PaymentVerificationResponse {
    private Boolean success;
    private String transaction_id;
    private String message;
    private String reveal_link;
    private String reveal_expires_at;
    private Boolean email_sent;

    public PaymentVerificationResponse(Boolean success, String transaction_id, String message) {
        this.success = success;
        this.transaction_id = transaction_id;
        this.message = message;
        this.reveal_link = null;
        this.reveal_expires_at = null;
        this.email_sent = false;
    }

    public PaymentVerificationResponse(Boolean success, String transaction_id, String message, String reveal_link, String reveal_expires_at, Boolean email_sent) {
        this.success = success;
        this.transaction_id = transaction_id;
        this.message = message;
        this.reveal_link = reveal_link;
        this.reveal_expires_at = reveal_expires_at;
        this.email_sent = email_sent;
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

    public String getReveal_link() {
        return reveal_link;
    }

    public void setReveal_link(String reveal_link) {
        this.reveal_link = reveal_link;
    }

    public String getReveal_expires_at() {
        return reveal_expires_at;
    }

    public void setReveal_expires_at(String reveal_expires_at) {
        this.reveal_expires_at = reveal_expires_at;
    }

    public Boolean getEmail_sent() {
        return email_sent;
    }

    public void setEmail_sent(Boolean email_sent) {
        this.email_sent = email_sent;
    }
}
