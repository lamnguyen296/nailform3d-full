package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.ServiceRequestCreationRequest;
import com.restapi.identityservice.entity.ServiceRequest;
import com.restapi.identityservice.repository.UserRepository;
import com.restapi.identityservice.repository.ServiceRequestRepository;
import com.restapi.identityservice.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public ServiceRequest createRequest(ServiceRequestCreationRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() == null || 
            !SecurityContextHolder.getContext().getAuthentication().isAuthenticated() || 
            SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Invalid token or not logged in.");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        );

        if (user.getCurrentPlan() == "PRO") {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

            long projectsThisMonth = serviceRequestRepository.countByUserIdAndCreatedAtBetween(
                username, startOfMonth, endOfMonth
            );

            if (projectsThisMonth >= 3) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro plan limit reached (3 design projects per month).");
            }
        }

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setUserId(username);
        serviceRequest.setLocation(request.getLocation());
        serviceRequest.setDescription(request.getDescription());
        serviceRequest.setThumbnailBase64(request.getThumbnailBase64());
        serviceRequest.setDesignData(request.getDesignData());
        
        return serviceRequestRepository.save(serviceRequest);
    }

    public List<ServiceRequest> getAllOpenRequests() {
        return serviceRequestRepository.findByStatusOrderByCreatedAtDesc("OPEN");
    }

    public List<ServiceRequest> getRequestsByUser(String userId) {
        return serviceRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ServiceRequest getRequestById(String id) {
        return serviceRequestRepository.findById(id).orElse(null);
    }
}
