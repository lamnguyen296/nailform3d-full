package com.restapi.identityservice.controller;

import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.service.UserService;
import com.restapi.identityservice.dto.response.SubscriptionRequestResponse;
import com.restapi.identityservice.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @GetMapping("/subscriptions/requests")
    public List<SubscriptionRequestResponse> getPendingRequests() {
        return subscriptionService.getPendingRequests();
    }

    @PutMapping("/subscriptions/requests/{id}/approve")
    public SubscriptionRequestResponse approveRequest(@PathVariable String id) {
        return subscriptionService.approveRequest(id);
    }

    @PutMapping("/subscriptions/requests/{id}/reject")
    public SubscriptionRequestResponse rejectRequest(@PathVariable String id) {
        return subscriptionService.rejectRequest(id);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable String id, @org.springframework.web.bind.annotation.RequestBody com.restapi.identityservice.dto.request.AdminUserUpdateRequest request) {
        return userService.updateUserByAdmin(id, request);
    }

    @GetMapping("/dashboard-stats")
    public com.restapi.identityservice.dto.response.DashboardStatsResponse getDashboardStats() {
        return userService.getDashboardStats();
    }
}
