package com.restapi.identityservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class SubscriptionPlanEntity {
    @Id
    private String code; // e.g., "FREE", "PRO", "STUDIO_5"
    
    private String name; // e.g., "B2C Pro", "B2B Studio 5 Users"
    private double price; // e.g., 299000
    private int maxUsers; // e.g., 1 for B2C, 5 for STUDIO_5
    private String description;
    private boolean isActive = true;

    // Default constructor
    public SubscriptionPlanEntity() {}

    public SubscriptionPlanEntity(String code, String name, double price, int maxUsers, String description) {
        this.code = code;
        this.name = name;
        this.price = price;
        this.maxUsers = maxUsers;
        this.description = description;
        this.isActive = true;
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getMaxUsers() { return maxUsers; }
    public void setMaxUsers(int maxUsers) { this.maxUsers = maxUsers; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
