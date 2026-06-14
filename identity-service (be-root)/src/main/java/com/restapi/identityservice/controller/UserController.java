package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.UserCreationRequest;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import com.restapi.identityservice.dto.request.UserUpdateRequest;

import jakarta.persistence.EntityManager;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private com.restapi.identityservice.repository.UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @PostMapping("/users")
    User createUser(@RequestBody UserCreationRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/users/me")
    public User getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserMe(username);
        
        if (user.getParentSalonId() != null) {
            entityManager.detach(user); // Prevent Hibernate from saving this temporary change
            User admin = userRepository.findById(user.getParentSalonId()).orElse(null);
            if (admin != null) {
                user.setCurrentPlan(admin.getCurrentPlan());
                user.setSubscriptionEndDate(admin.getSubscriptionEndDate());
            }
        }
        return user;
    }

    @PutMapping("/users/me")
    public User updateMyProfile(@RequestBody UserUpdateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateUserMe(username, request);
    }
}
