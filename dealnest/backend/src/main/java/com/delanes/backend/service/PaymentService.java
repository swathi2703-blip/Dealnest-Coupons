package com.delanes.backend.service;

import com.delanes.backend.model.CouponListing;
import com.delanes.backend.model.TransactionRecord;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class PaymentService {

    @Value("${RAZORPAY_KEY_ID:${razorpay.key.id:}}")
    private String razorpayKeyId;

    @Value("${RAZORPAY_KEY_SECRET:${razorpay.key.secret:}}")
    private String razorpayKeySecret;

    @Value("${app.payment.payout.auto-enabled:true}")
    private boolean autoPayoutEnabled;

    @Value("${app.payment.payout.source-account-number:}")
    private String payoutSourceAccountNumber;

    private RazorpayClient razorpayClient;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public PaymentService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    private RazorpayClient getRazorpayClient() {
        if (razorpayClient == null) {
            if (!StringUtils.hasText(razorpayKeyId) || !StringUtils.hasText(razorpayKeySecret)) {
                throw new IllegalStateException("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
            }

            try {
                razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            } catch (RazorpayException e) {
                throw new IllegalStateException("Failed to initialize Razorpay client: " + e.getMessage(), e);
            }
        }
        return razorpayClient;
    }

    public Order createOrder(Integer amount, String currency, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount); // Amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receipt);

        return getRazorpayClient().orders.create(orderRequest);
    }

    public Boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            String calculatedSignature = hmacSHA256(data, razorpayKeySecret);
            return calculatedSignature.equals(signature);
        } catch (Exception e) {
            System.err.println("Signature verification failed: " + e.getMessage());
            return false;
        }
    }

    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(rawHmac.length * 2);
        for (byte b : rawHmac) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public PayoutResult transferSellerPayout(CouponListing listing, TransactionRecord record) {
        if (!autoPayoutEnabled) {
            return PayoutResult.skipped("Automatic seller payout is disabled");
        }

        if (!StringUtils.hasText(payoutSourceAccountNumber)) {
            return PayoutResult.failed("Payout source account number is not configured");
        }

        if (record.getSellerPayoutAmount() == null || record.getSellerPayoutAmount() <= 0) {
            return PayoutResult.skipped("Seller payout amount is zero");
        }

        if (!StringUtils.hasText(listing.getPayoutMethod()) || !StringUtils.hasText(listing.getAccountHolderName())) {
            return PayoutResult.failed("Seller payout details are incomplete");
        }

        try {
            String payoutMethod = listing.getPayoutMethod().trim().toUpperCase();
            String contactId = createContact(listing, record.getSellerId());
            String fundAccountId = createFundAccount(contactId, listing, payoutMethod);

            int payoutAmountInPaise = (int) Math.round(record.getSellerPayoutAmount() * 100.0);
            ObjectNode payoutPayload = objectMapper.createObjectNode();
            payoutPayload.put("account_number", payoutSourceAccountNumber);
            payoutPayload.put("fund_account_id", fundAccountId);
            payoutPayload.put("amount", payoutAmountInPaise);
            payoutPayload.put("currency", "INR");
            payoutPayload.put("mode", "UPI".equals(payoutMethod) ? "UPI" : "IMPS");
            payoutPayload.put("purpose", "payout");
            payoutPayload.put("queue_if_low_balance", true);
            payoutPayload.put("reference_id", record.getTransactionId());
            payoutPayload.put("narration", "DealNest seller payout");

            JsonNode payoutResponse = razorpayPost("/v1/payouts", payoutPayload);
            String payoutId = payoutResponse.path("id").asText(null);
            String payoutStatus = payoutResponse.path("status").asText("queued");
            return PayoutResult.success(payoutId, payoutStatus);
        } catch (Exception ex) {
            return PayoutResult.failed(ex.getMessage());
        }
    }

    private String createContact(CouponListing listing, String sellerId) throws Exception {
        ObjectNode contactPayload = objectMapper.createObjectNode();
        contactPayload.put("name", listing.getAccountHolderName());
        contactPayload.put("type", "vendor");
        contactPayload.put("reference_id", sellerId);

        JsonNode response = razorpayPost("/v1/contacts", contactPayload);
        String contactId = response.path("id").asText(null);
        if (!StringUtils.hasText(contactId)) {
            throw new IllegalStateException("Failed to create payout contact");
        }
        return contactId;
    }

    private String createFundAccount(String contactId, CouponListing listing, String payoutMethod) throws Exception {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("contact_id", contactId);

        if ("UPI".equals(payoutMethod)) {
            if (!StringUtils.hasText(listing.getPayoutUpiId())) {
                throw new IllegalStateException("UPI ID missing for seller payout");
            }

            payload.put("account_type", "vpa");
            ObjectNode vpa = payload.putObject("vpa");
            vpa.put("address", listing.getPayoutUpiId().trim());
        } else if ("BANK".equals(payoutMethod)) {
            if (!StringUtils.hasText(listing.getPayoutBankName()) ||
                    !StringUtils.hasText(listing.getPayoutBankAccountNumber()) ||
                    !StringUtils.hasText(listing.getPayoutBankIfsc())) {
                throw new IllegalStateException("Bank payout details missing for seller payout");
            }

            payload.put("account_type", "bank_account");
            ObjectNode bankAccount = payload.putObject("bank_account");
            bankAccount.put("name", listing.getAccountHolderName().trim());
            bankAccount.put("ifsc", listing.getPayoutBankIfsc().trim().toUpperCase());
            bankAccount.put("account_number", listing.getPayoutBankAccountNumber().trim());
        } else {
            throw new IllegalStateException("Unsupported payout method: " + payoutMethod);
        }

        JsonNode response = razorpayPost("/v1/fund_accounts", payload);
        String fundAccountId = response.path("id").asText(null);
        if (!StringUtils.hasText(fundAccountId)) {
            throw new IllegalStateException("Failed to create seller fund account");
        }
        return fundAccountId;
    }

    private JsonNode razorpayPost(String path, ObjectNode payload) throws Exception {
        String auth = Base64.getEncoder().encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.razorpay.com" + path))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode body = objectMapper.readTree(response.body());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String errorDescription = body.path("error").path("description").asText("Unknown Razorpay payout error");
            throw new IllegalStateException("Razorpay payout API failed: " + errorDescription);
        }

        return body;
    }

    public static class PayoutResult {
        private final boolean success;
        private final String status;
        private final String payoutReference;
        private final String message;

        private PayoutResult(boolean success, String status, String payoutReference, String message) {
            this.success = success;
            this.status = status;
            this.payoutReference = payoutReference;
            this.message = message;
        }

        public static PayoutResult success(String payoutReference, String status) {
            return new PayoutResult(true, status, payoutReference, null);
        }

        public static PayoutResult failed(String message) {
            return new PayoutResult(false, "FAILED", null, message);
        }

        public static PayoutResult skipped(String message) {
            return new PayoutResult(false, "SKIPPED", null, message);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getStatus() {
            return status;
        }

        public String getPayoutReference() {
            return payoutReference;
        }

        public String getMessage() {
            return message;
        }
    }
}
