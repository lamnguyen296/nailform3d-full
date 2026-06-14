package com.restapi.identityservice.dto.response;

import com.restapi.identityservice.entity.SubscriptionStatus;
import java.time.LocalDateTime;

public class SubscriptionRequestResponse {
    private String id;
    private String userId;
    private String username;
    private String requestedPlan;
    private SubscriptionStatus status;
    private LocalDateTime createdAt;
    private String paymentReference;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRequestedPlan() { return requestedPlan; }
    public void setRequestedPlan(String requestedPlan) { this.requestedPlan = requestedPlan; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
}
