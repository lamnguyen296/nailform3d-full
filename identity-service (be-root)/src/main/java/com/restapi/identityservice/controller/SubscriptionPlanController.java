package com.restapi.identityservice.controller;

import com.restapi.identityservice.entity.SubscriptionPlanEntity;
import com.restapi.identityservice.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubscriptionPlanController {

    @Autowired
    private SubscriptionPlanService planService;

    // Public endpoint for Frontend Pricing Page
    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanEntity>> getActivePlans() {
        return ResponseEntity.ok(planService.getActivePlans());
    }

    // Admin endpoints
    @GetMapping("/admin/plans")
    public ResponseEntity<List<SubscriptionPlanEntity>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @PostMapping("/admin/plans")
    public ResponseEntity<SubscriptionPlanEntity> createPlan(@RequestBody SubscriptionPlanEntity plan) {
        return ResponseEntity.ok(planService.createPlan(plan));
    }

    @PutMapping("/admin/plans/{code}")
    public ResponseEntity<SubscriptionPlanEntity> updatePlan(
            @PathVariable String code, 
            @RequestBody SubscriptionPlanEntity plan) {
        return ResponseEntity.ok(planService.updatePlan(code, plan));
    }

    @PutMapping("/admin/plans/{code}/toggle")
    public ResponseEntity<SubscriptionPlanEntity> togglePlan(@PathVariable String code) {
        return ResponseEntity.ok(planService.togglePlanStatus(code));
    }

    @DeleteMapping("/admin/plans/{code}")
    public ResponseEntity<Void> deletePlan(@PathVariable String code) {
        planService.deletePlan(code);
        return ResponseEntity.ok().build();
    }
}
