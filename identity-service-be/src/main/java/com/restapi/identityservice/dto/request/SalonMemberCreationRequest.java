package com.restapi.identityservice.dto.request;

public class SalonMemberCreationRequest {
    private String username;
    private String password;
    private String firstName;
    private String lastName;

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username != null ? username.trim() : null;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password != null ? password.trim() : null;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
