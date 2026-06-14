package com.restapi.identityservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String requestId; // The ServiceRequest this offer belongs to
    private String salonId;   // The Salon making the offer

    private Double price;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String status; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getSalonId() { return salonId; }
    public void setSalonId(String salonId) { this.salonId = salonId; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
