package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.UserCreationRequest;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.UserRepository;
import com.restapi.identityservice.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

import java.time.LocalDate;
import com.restapi.identityservice.dto.request.AdminUserUpdateRequest;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ServiceRequestRepository serviceRequestRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(UserCreationRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDate.now());
        user.setStatus("ACTIVE");
        
        // Set default role if empty
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            user.setRole("USER");
        } else {
            user.setRole(request.getRole().toUpperCase());
        }
        
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserByAdmin(String id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getRole() != null) user.setRole(request.getRole().toUpperCase());
        if (request.getStatus() != null) user.setStatus(request.getStatus().toUpperCase());
        if (request.getCurrentPlan() != null) user.setCurrentPlan(request.getCurrentPlan());
        
        return userRepository.save(user);
    }

    public User getUserMe(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User updateUserMe(String username, com.restapi.identityservice.dto.request.UserUpdateRequest request) {
        User user = getUserMe(username);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        return userRepository.save(user);
    }

    public com.restapi.identityservice.dto.response.DashboardStatsResponse getDashboardStats() {
        List<User> allUsers = userRepository.findAll();
        
        long totalRevenue = 0;
        long totalB2BSalons = 0;
        long totalB2CCustomers = 0;
        java.util.Map<String, Long> planDistribution = new java.util.HashMap<>();

        // Initialize map with all enum values to ensure they exist even if 0
        for (String plan : new String[]{"FREE", "PRO", "PREMIUM", "STUDIO_5", "STUDIO_10", "ACADEMY_20"}) {
            planDistribution.put(plan, 0L);
        }

        for (User user : allUsers) {
            // Count roles
            String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
            if ("SALON".equals(role) || "ROLE_SALON".equals(role)) {
                totalB2BSalons++;
            } else if (!"ADMIN".equals(role) && !"ROLE_ADMIN".equals(role)) {
                totalB2CCustomers++; // Count USER, CUSTOMER, TECHNICIAN here
            }

            // Count plan distribution
            String plan = user.getCurrentPlan();
            if (plan == null) {
                plan = "FREE";
            }
            planDistribution.put(plan, planDistribution.getOrDefault(plan, 0L) + 1);

            // Calculate revenue (simplified: based on active plan pricing)
            // Skip sub-users (TECHNICIAN) so we don't double count revenue for parent's plan
            if ("TECHNICIAN".equals(role) && user.getParentSalonId() != null) {
                continue;
            }

            switch (plan) {
                case "PRO": totalRevenue += 299000; break;
                case "PREMIUM": totalRevenue += 499000; break;
                case "STUDIO_5": totalRevenue += 1790000; break;
                case "STUDIO_10": totalRevenue += 2990000; break;
                case "ACADEMY_20": totalRevenue += 4990000; break;
                default: break;
            }
        }

        com.restapi.identityservice.dto.response.DashboardStatsResponse stats = new com.restapi.identityservice.dto.response.DashboardStatsResponse();
        stats.setTotalRevenue(totalRevenue);
        stats.setTotalB2BSalons(totalB2BSalons);
        stats.setTotalB2CCustomers(totalB2CCustomers);
        stats.setActiveDesigns(serviceRequestRepository.count());
        stats.setPlanDistribution(planDistribution);
        
        return stats;
    }
}
