package com.delanes.backend.controller;

import com.delanes.backend.dto.CreateListingRequest;
import com.delanes.backend.model.CouponListing;
import com.delanes.backend.repository.CouponListingRepository;
import com.delanes.backend.repository.UserProfileRepository;
import com.delanes.backend.service.FirebaseAuthService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class ListingController {

    private final MongoTemplate mongoTemplate;
    private final CouponListingRepository repository;
    private final UserProfileRepository userProfileRepository;
    private final FirebaseAuthService firebaseAuthService;

    public ListingController(
            MongoTemplate mongoTemplate,
            CouponListingRepository repository,
            UserProfileRepository userProfileRepository,
            FirebaseAuthService firebaseAuthService
    ) {
        this.mongoTemplate = mongoTemplate;
        this.repository = repository;
        this.userProfileRepository = userProfileRepository;
        this.firebaseAuthService = firebaseAuthService;
    }

    @GetMapping("/api/health")
    public Map<String, Boolean> health() {
        return Map.of("ok", true);
    }

    @GetMapping("/api/listings")
    public ResponseEntity<?> getListings(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sellerId,
            @RequestParam(required = false) String active,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            if (StringUtils.hasText(sellerId)) {
                var user = firebaseAuthService.verifyToken(authorization);
                if (!sellerId.equals(user.getUid())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized seller access"));
                }
            }

            Query query = new Query();

            if (StringUtils.hasText(sellerId)) {
                query.addCriteria(Criteria.where("sellerId").is(sellerId));
            }

            if ("true".equalsIgnoreCase(active)) {
                query.addCriteria(Criteria.where("isActive").is(true));
                query.addCriteria(Criteria.where("isSold").is(false));
            }

            if (StringUtils.hasText(category) && !"All".equalsIgnoreCase(category)) {
                query.addCriteria(Criteria.where("category").is(category));
            }

            query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

            List<CouponListing> data = mongoTemplate.find(query, CouponListing.class);
            return ResponseEntity.ok(Map.of("data", data));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

    @GetMapping("/api/listings/{id}")
    public ResponseEntity<?> getListingById(@PathVariable String id) {
        try {
            Optional<CouponListing> found = repository.findById(id);
            if (found.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
            }

            return ResponseEntity.ok(Map.of("data", found.get()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

        @GetMapping("/api/public/stats")
        public ResponseEntity<?> getPublicStats() {
        try {
            List<CouponListing> listings = repository.findAll();
            long activeListings = listings.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()) && !Boolean.TRUE.equals(item.getIsSold()))
                .count();

            double savingsGenerated = listings.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsSold()))
                .mapToDouble(item -> {
                double original = item.getOriginalValue() == null ? 0 : item.getOriginalValue();
                double selling = item.getSellingPrice() == null ? 0 : item.getSellingPrice();
                return Math.max(0, original - selling);
                })
                .sum();

            long happyUsers = userProfileRepository.count();

            return ResponseEntity.ok(Map.of(
                "data", Map.of(
                    "savings_generated", Math.round(savingsGenerated),
                    "active_listings", activeListings,
                    "happy_users", happyUsers
                )
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
        }

    @PostMapping("/api/listings")
    public ResponseEntity<?> createListing(
            @RequestBody CreateListingRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);

            if (!StringUtils.hasText(request.getBrandName()) ||
                    request.getOriginalValue() == null ||
                    request.getSellingPrice() == null ||
                    !StringUtils.hasText(request.getCategory()) ||
                    !StringUtils.hasText(request.getWebsiteLink())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            if (!StringUtils.hasText(request.getPayoutMethod()) ||
                    !StringUtils.hasText(request.getAccountHolderName())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payout method and account holder name are required"));
            }

            String payoutMethod = request.getPayoutMethod().trim().toUpperCase();
            if (!"UPI".equals(payoutMethod) && !"BANK".equals(payoutMethod)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid payout method. Use UPI or BANK"));
            }

            if ("UPI".equals(payoutMethod) && !StringUtils.hasText(request.getPayoutUpiId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "UPI ID is required for UPI payout"));
            }

            if ("BANK".equals(payoutMethod) &&
                    (!StringUtils.hasText(request.getPayoutBankName()) ||
                            !StringUtils.hasText(request.getPayoutBankAccountNumber()) ||
                            !StringUtils.hasText(request.getPayoutBankIfsc()))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bank name, account number and IFSC are required for BANK payout"));
            }

            if (request.getOriginalValue() <= 0 || request.getSellingPrice() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid price values"));
            }

            CouponListing listing = new CouponListing();
            listing.setSellerId(user.getUid());
            listing.setBrandName(request.getBrandName());
            listing.setCouponCode(StringUtils.hasText(request.getCouponCode()) ? request.getCouponCode() : null);
            listing.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription() : null);
            listing.setOriginalValue(request.getOriginalValue());
            listing.setSellingPrice(request.getSellingPrice());
            listing.setDiscountPercentage(
                    (int) Math.round(((request.getOriginalValue() - request.getSellingPrice()) / request.getOriginalValue()) * 100)
            );
            listing.setCategory(request.getCategory());
            listing.setExpiryDate(StringUtils.hasText(request.getExpiryDate()) ? request.getExpiryDate() : null);
            listing.setWebsiteLink(request.getWebsiteLink().trim());
                listing.setPayoutMethod(payoutMethod);
                listing.setAccountHolderName(request.getAccountHolderName().trim());
                listing.setPayoutUpiId("UPI".equals(payoutMethod) && StringUtils.hasText(request.getPayoutUpiId())
                    ? request.getPayoutUpiId().trim()
                    : null);
                listing.setPayoutBankName("BANK".equals(payoutMethod) && StringUtils.hasText(request.getPayoutBankName())
                    ? request.getPayoutBankName().trim()
                    : null);
                listing.setPayoutBankAccountNumber("BANK".equals(payoutMethod) && StringUtils.hasText(request.getPayoutBankAccountNumber())
                    ? request.getPayoutBankAccountNumber().trim()
                    : null);
                listing.setPayoutBankIfsc("BANK".equals(payoutMethod) && StringUtils.hasText(request.getPayoutBankIfsc())
                    ? request.getPayoutBankIfsc().trim().toUpperCase()
                    : null);
            listing.setIsSold(false);
            listing.setIsActive(true);
            listing.setCreatedAt(Instant.now());
            listing.setUpdatedAt(Instant.now());

            CouponListing saved = repository.save(listing);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }

    @DeleteMapping("/api/listings/{id}")
    public ResponseEntity<?> deleteListing(
            @PathVariable String id,
            @RequestParam(required = false) String sellerId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            var user = firebaseAuthService.verifyToken(authorization);
            String effectiveSellerId = StringUtils.hasText(sellerId) ? sellerId : user.getUid();

            if (!effectiveSellerId.equals(user.getUid())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized seller access"));
            }

            if (!StringUtils.hasText(sellerId)) {
                sellerId = user.getUid();
            }

            Optional<CouponListing> found = repository.findById(id);
            if (found.isEmpty() || !sellerId.equals(found.get().getSellerId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
            }

            repository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Database is temporarily unavailable. Please try again."));
        }
    }
}
