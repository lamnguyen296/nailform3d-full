package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.SubscriptionRequestCreationRequest;
import com.restapi.identityservice.dto.response.SubscriptionRequestResponse;
import com.restapi.identityservice.entity.SubscriptionRequest;
import com.restapi.identityservice.entity.SubscriptionStatus;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.SubscriptionRequestRepository;
import com.restapi.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    @Autowired
    private SubscriptionRequestRepository subscriptionRequestRepository;
    
    @Autowired
    private UserRepository userRepository;

    public SubscriptionRequestResponse createRequest(SubscriptionRequestCreationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SubscriptionRequest subReq = new SubscriptionRequest();
        subReq.setUser(user);
        subReq.setRequestedPlan(request.getRequestedPlan());
        subReq.setStatus(SubscriptionStatus.PENDING);
        subReq.setPaymentReference(request.getPaymentReference());

        SubscriptionRequest saved = subscriptionRequestRepository.save(subReq);
        return mapToResponse(saved);
    }

    public List<SubscriptionRequestResponse> getPendingRequests() {
        return subscriptionRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubscriptionRequestResponse approveRequest(String requestId) {
        SubscriptionRequest request = subscriptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (request.getStatus() != SubscriptionStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus(SubscriptionStatus.APPROVED);
        
        // Update user plan
        User user = request.getUser();
        user.setCurrentPlan(request.getRequestedPlan());
        
        // Add 1 year to expiration
        // Always set expiration to 1 year from today as requested
        user.setSubscriptionEndDate(LocalDate.now().plusYears(1));
        
        userRepository.save(user);
        SubscriptionRequest saved = subscriptionRequestRepository.save(request);
        return mapToResponse(saved);
    }

    public SubscriptionRequestResponse rejectRequest(String requestId) {
        SubscriptionRequest request = subscriptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (request.getStatus() != SubscriptionStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus(SubscriptionStatus.REJECTED);
        SubscriptionRequest saved = subscriptionRequestRepository.save(request);
        return mapToResponse(saved);
    }

    private SubscriptionRequestResponse mapToResponse(SubscriptionRequest entity) {
        SubscriptionRequestResponse dto = new SubscriptionRequestResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUsername(entity.getUser().getUsername());
        dto.setRequestedPlan(entity.getRequestedPlan());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setPaymentReference(entity.getPaymentReference());
        return dto;
    }
}
