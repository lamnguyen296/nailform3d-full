package com.restapi.identityservice.dto.request;


public class AdminUserUpdateRequest {
    private String firstName;
    private String lastName;
    private String role;
    private String status;
    private String currentPlan;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCurrentPlan() { return currentPlan; }
    public void setCurrentPlan(String currentPlan) { this.currentPlan = currentPlan; }
}
