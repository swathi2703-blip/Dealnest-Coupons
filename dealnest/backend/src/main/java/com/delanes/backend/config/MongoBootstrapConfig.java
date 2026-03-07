package com.delanes.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class MongoBootstrapConfig {

    private final MongoTemplate mongoTemplate;

    public MongoBootstrapConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initializeCollectionsAndIndexes() {
        Set<String> existing = new HashSet<>();
        mongoTemplate.getDb().listCollectionNames().forEach(existing::add);

        ensureCollection("profiles", existing);
        ensureCollection("coupon_listings", existing);
        ensureCollection("transactions", existing);

        mongoTemplate.indexOps("profiles")
                .ensureIndex(new Index().on("userId", Sort.Direction.ASC).unique().named("profiles_user_id_unique"));
        mongoTemplate.indexOps("profiles")
                .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC).named("profiles_created_at_desc"));

        mongoTemplate.indexOps("coupon_listings")
                .ensureIndex(new Index().on("sellerId", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC)
                        .named("listings_seller_created_desc"));
        mongoTemplate.indexOps("coupon_listings")
                .ensureIndex(new Index().on("isActive", Sort.Direction.ASC).on("isSold", Sort.Direction.ASC)
                        .on("createdAt", Sort.Direction.DESC).named("listings_active_sold_created_desc"));
        mongoTemplate.indexOps("coupon_listings")
                .ensureIndex(new Index().on("category", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC)
                        .named("listings_category_created_desc"));
        mongoTemplate.indexOps("coupon_listings")
                .ensureIndex(new Index().on("expiryDate", Sort.Direction.ASC).named("listings_expiry_date"));

        mongoTemplate.indexOps("transactions")
                .ensureIndex(new Index().on("listingId", Sort.Direction.ASC).named("transactions_listing_id"));
        mongoTemplate.indexOps("transactions")
                .ensureIndex(new Index().on("buyerId", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC)
                        .named("transactions_buyer_created_desc"));
        mongoTemplate.indexOps("transactions")
                .ensureIndex(new Index().on("sellerId", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC)
                        .named("transactions_seller_created_desc"));
        mongoTemplate.indexOps("transactions")
                .ensureIndex(new Index().on("status", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC)
                        .named("transactions_status_created_desc"));
    }

    private void ensureCollection(String name, Set<String> existing) {
        if (!existing.contains(name)) {
            mongoTemplate.createCollection(name);
        }
    }
}
