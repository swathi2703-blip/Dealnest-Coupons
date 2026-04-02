package com.delanes.backend.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CouponRevealMailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CouponRevealMailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:no-reply@dealnest.local}")
    private String fromAddress;

    public CouponRevealMailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public boolean sendRevealLink(String toEmail, String listingBrand, String revealUrl, long validSeconds) {
        return sendCouponDetails(toEmail, listingBrand, null, revealUrl, validSeconds);
    }

    public boolean sendCouponDetails(String toEmail, String listingBrand, String couponCode, String revealUrl, long validSeconds) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || !StringUtils.hasText(toEmail)) {
            LOGGER.warn("Coupon email not sent. mailSenderAvailable={}, toEmailPresent={}", sender != null, StringUtils.hasText(toEmail));
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("DealNest coupon purchase details");
            message.setText(buildBody(listingBrand, couponCode, revealUrl, validSeconds));
            sender.send(message);
            LOGGER.info("Coupon email sent successfully to {}", toEmail);
            return true;
        } catch (Exception ex) {
            LOGGER.error("Failed to send coupon email to {}", toEmail, ex);
            return false;
        }
    }

    private String buildBody(String listingBrand, String couponCode, String revealUrl, long validSeconds) {
        String brandLabel = StringUtils.hasText(listingBrand) ? listingBrand : "your purchase";
        String couponLine = StringUtils.hasText(couponCode)
                ? "Coupon code: " + couponCode + "\n"
                : "Coupon code: Not available in this email.\n";
        String linkSection = StringUtils.hasText(revealUrl)
                ? "\nReveal link (optional):\n" + revealUrl + "\n"
                + "This link is valid for " + (validSeconds / 60) + " minutes.\n"
                : "";

        return "Your payment has been verified for " + brandLabel + ".\n\n"
                + couponLine
                + linkSection
                + "If you did not make this purchase, contact support immediately.";
    }
}
