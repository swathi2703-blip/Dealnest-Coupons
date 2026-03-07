package com.delanes.backend.controller;

import com.delanes.backend.dto.UpsertProfileRequest;
import com.delanes.backend.model.UserProfile;
import com.delanes.backend.repository.UserProfileRepository;
import com.delanes.backend.service.FirebaseAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class ProfileController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserProfileRepository userProfileRepository;

    public ProfileController(FirebaseAuthService firebaseAuthService, UserProfileRepository userProfileRepository) {
        this.firebaseAuthService = firebaseAuthService;
        this.userProfileRepository = userProfileRepository;
    }

    @GetMapping("/api/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var authUser = firebaseAuthService.verifyToken(authorization);
            UserProfile profile = userProfileRepository.findByUserId(authUser.getUid()).orElseGet(() -> {
                UserProfile fallback = new UserProfile();
                fallback.setUserId(authUser.getUid());
                fallback.setEmail(authUser.getEmail());
                fallback.setFullName(authUser.getDisplayName());
                fallback.setPhoneNumber(null);
                return fallback;
            });

            return ResponseEntity.ok(Map.of("data", profile));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load user profile"));
        }
    }

    @PostMapping("/api/profile")
    public ResponseEntity<?> upsertProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) UpsertProfileRequest request
    ) {
        try {
            var authUser = firebaseAuthService.verifyToken(authorization);
            String normalizedPhone = normalizePhoneNumber(request == null ? null : request.getPhoneNumber());
            if (!StringUtils.hasText(normalizedPhone)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
            }

            UserProfile profile = userProfileRepository.findByUserId(authUser.getUid()).orElseGet(UserProfile::new);
            if (profile.getCreatedAt() == null) {
                profile.setCreatedAt(Instant.now());
            }

            profile.setUserId(authUser.getUid());
            profile.setEmail(authUser.getEmail());
            profile.setFullName(StringUtils.hasText(request == null ? null : request.getFullName())
                    ? request.getFullName().trim()
                    : authUser.getDisplayName());
            profile.setPhoneNumber(normalizedPhone);
            profile.setUpdatedAt(Instant.now());

            UserProfile saved = userProfileRepository.save(profile);
            return ResponseEntity.ok(Map.of("data", saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save user profile"));
        }
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            return "";
        }

        String digits = phoneNumber.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return "+91" + digits;
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return "+" + digits;
        }

        String normalized = phoneNumber.trim();
        if (normalized.startsWith("+") && normalized.matches("^\\+[1-9]\\d{7,14}$")) {
            return normalized;
        }

        return "";
    }
}
