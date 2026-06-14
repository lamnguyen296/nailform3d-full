package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.ServiceRequestCreationRequest;
import com.restapi.identityservice.entity.ServiceRequest;
import com.restapi.identityservice.service.ServiceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@CrossOrigin(origins = "*") // Allow frontend to call
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    public ServiceRequest createRequest(@RequestBody ServiceRequestCreationRequest request) {
        return serviceRequestService.createRequest(request);
    }

    @GetMapping
    public List<ServiceRequest> getAllOpenRequests() {
        return serviceRequestService.getAllOpenRequests();
    }

    @GetMapping("/user/{userId}")
    public List<ServiceRequest> getRequestsByUser(@PathVariable String userId) {
        return serviceRequestService.getRequestsByUser(userId);
    }

    @GetMapping("/{id}")
    public ServiceRequest getRequestById(@PathVariable String id) {
        return serviceRequestService.getRequestById(id);
    }
}
