package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.SubscriptionRequestCreationRequest;
import com.restapi.identityservice.dto.response.SubscriptionRequestResponse;
import com.restapi.identityservice.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/request")
    public SubscriptionRequestResponse createRequest(@RequestBody SubscriptionRequestCreationRequest request) {
        return subscriptionService.createRequest(request);
    }
}
