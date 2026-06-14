package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.SubscriptionRequest;
import com.restapi.identityservice.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRequestRepository extends JpaRepository<SubscriptionRequest, String> {
    List<SubscriptionRequest> findByStatusOrderByCreatedAtDesc(SubscriptionStatus status);
    List<SubscriptionRequest> findByUserIdOrderByCreatedAtDesc(String userId);
    List<SubscriptionRequest> findAllByOrderByCreatedAtDesc();
}
