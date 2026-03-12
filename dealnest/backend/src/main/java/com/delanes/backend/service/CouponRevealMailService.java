package com.delanes.backend.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class CouponRevealMailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:no-reply@dealnest.local}")
    private String fromAddress;

    public CouponRevealMailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public boolean sendRevealLink(String toEmail, String listingBrand, String revealUrl, long validSeconds) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || !StringUtils.hasText(toEmail) || !StringUtils.hasText(revealUrl)) {
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("DealNest coupon link (valid for 5 minutes)");
            message.setText(buildBody(listingBrand, revealUrl, validSeconds));
            sender.send(message);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private String buildBody(String listingBrand, String revealUrl, long validSeconds) {
        String brandLabel = StringUtils.hasText(listingBrand) ? listingBrand : "your purchase";
        return "Your payment has been verified for " + brandLabel + ".\n\n"
                + "Open this secure link to reveal your coupon details:\n"
                + revealUrl + "\n\n"
                + "This link is valid for " + (validSeconds / 60) + " minutes.\n"
                + "If you did not make this purchase, contact support immediately.";
    }
}
