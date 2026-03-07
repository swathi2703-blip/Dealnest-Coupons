package com.delanes.backend.service;

import com.delanes.backend.dto.AuthResponse;
import com.delanes.backend.dto.LoginRequest;
import com.delanes.backend.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class FirebaseAuthService {

    private static final String ALLOWED_EMAIL_DOMAIN = "@klh.edu.in";

    @Value("${FIREBASE_API_KEY:}")
    private String firebaseApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse signup(SignupRequest request) {
        validateEmailDomain(request.getEmail());

        Map<String, Object> payload = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword(),
                "returnSecureToken", true
        );

        Map<String, Object> signupResult = postToFirebase("accounts:signUp", payload);

        if (StringUtils.hasText(request.getFullName())) {
            Map<String, Object> updatePayload = Map.of(
                    "idToken", signupResult.get("idToken"),
                    "displayName", request.getFullName().trim(),
                    "returnSecureToken", true
            );
            signupResult = postToFirebase("accounts:update", updatePayload);
        }

        return buildAuthResponse(signupResult);
    }

    public AuthResponse login(LoginRequest request) {
        validateEmailDomain(request.getEmail());

        Map<String, Object> payload = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword(),
                "returnSecureToken", true
        );

        Map<String, Object> loginResult = postToFirebase("accounts:signInWithPassword", payload);
        Map<String, Object> firebaseUser = lookupFirebaseUser(asString(loginResult.get("idToken")));

        return buildAuthResponse(loginResult, firebaseUser);
    }

    public AuthResponse.AuthUser verifyToken(String authHeader) {
        String idToken = extractBearerToken(authHeader);
        Map<String, Object> userMap = lookupFirebaseUser(idToken);

        AuthResponse.AuthUser user = new AuthResponse.AuthUser();
        user.setUid(asString(userMap.get("localId")));
        user.setEmail(asString(userMap.get("email")));
        user.setDisplayName(asString(userMap.get("displayName")));
        user.setPhoneNumber(asString(userMap.get("phoneNumber")));

        validateEmailDomain(user.getEmail());
        return user;
    }

    private Map<String, Object> lookupFirebaseUser(String idToken) {
        Map<String, Object> payload = Map.of("idToken", idToken);
        Map<String, Object> lookupResult = postToFirebase("accounts:lookup", payload);

        Object usersObject = lookupResult.get("users");
        if (!(usersObject instanceof List<?> users) || users.isEmpty()) {
            throw new IllegalArgumentException("Invalid authentication token");
        }

        Object first = users.get(0);
        if (!(first instanceof Map<?, ?> userMap)) {
            throw new IllegalArgumentException("Invalid authentication token");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> typedUserMap = (Map<String, Object>) userMap;
        return typedUserMap;
    }

    private void validateEmailDomain(String email) {
        if (!StringUtils.hasText(email) || !email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
            throw new IllegalArgumentException("Only @klh.edu.in emails are allowed");
        }
    }

    private String extractBearerToken(String authHeader) {
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return authHeader.substring("Bearer ".length()).trim();
    }

    private AuthResponse buildAuthResponse(Map<String, Object> result) {
        return buildAuthResponse(result, result);
    }

    private AuthResponse buildAuthResponse(Map<String, Object> result, Map<String, Object> userSource) {
        AuthResponse response = new AuthResponse();
        response.setIdToken(asString(result.get("idToken")));
        response.setRefreshToken(asString(result.get("refreshToken")));
        response.setExpiresIn(asString(result.get("expiresIn")));

        AuthResponse.AuthUser user = new AuthResponse.AuthUser();
        user.setUid(asString(userSource.get("localId")));
        user.setEmail(asString(userSource.get("email")));
        user.setDisplayName(asString(userSource.get("displayName")));
        user.setPhoneNumber(asString(userSource.get("phoneNumber")));
        response.setUser(user);

        return response;
    }

    private Map<String, Object> postToFirebase(String endpoint, Map<String, Object> payload) {
        if (!StringUtils.hasText(firebaseApiKey)) {
            throw new IllegalStateException("Firebase API key is not configured on backend");
        }

        String url = "https://identitytoolkit.googleapis.com/v1/" + endpoint + "?key=" + firebaseApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<?> response = restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Object.class);
            if (!(response.getBody() instanceof Map<?, ?> rawBody)) {
                throw new IllegalStateException("Empty response from Firebase");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> typedBody = (Map<String, Object>) rawBody;
            return typedBody;
        } catch (HttpStatusCodeException e) {
            throw new IllegalArgumentException("Firebase auth failed");
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
