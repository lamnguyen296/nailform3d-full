package com.restapi.identityservice.dto.response;


public class AuthResponse {
    private String token;
    private String role;
    private String currentPlan;
    
    public AuthResponse(String token, String role, String currentPlan) {
        this.token = token;
        this.role = role;
        this.currentPlan = currentPlan;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCurrentPlan() {
        return currentPlan;
    }

    public void setCurrentPlan(String currentPlan) {
        this.currentPlan = currentPlan;
    }
}
