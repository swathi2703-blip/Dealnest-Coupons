package com.delanes.backend.controller;

import com.delanes.backend.dto.AuthResponse;
import com.delanes.backend.dto.LoginRequest;
import com.delanes.backend.dto.SignupRequest;
import com.delanes.backend.service.FirebaseAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    private final FirebaseAuthService firebaseAuthService;

    public AuthController(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }

    @PostMapping("/api/auth/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            if (!StringUtils.hasText(request.getEmail()) || !StringUtils.hasText(request.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            AuthResponse response = firebaseAuthService.signup(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            if (!StringUtils.hasText(request.getEmail()) || !StringUtils.hasText(request.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            AuthResponse response = firebaseAuthService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }
}
