package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, String> {
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<ServiceRequest> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    
    long countByUserIdAndCreatedAtBetween(String userId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
