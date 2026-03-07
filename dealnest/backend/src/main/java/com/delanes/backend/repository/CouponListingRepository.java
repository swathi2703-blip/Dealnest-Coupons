package com.delanes.backend.repository;

import com.delanes.backend.model.CouponListing;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CouponListingRepository extends MongoRepository<CouponListing, String> {
}
