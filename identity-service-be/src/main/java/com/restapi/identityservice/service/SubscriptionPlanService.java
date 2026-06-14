package com.restapi.identityservice.service;

import com.restapi.identityservice.entity.SubscriptionPlanEntity;
import com.restapi.identityservice.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionPlanService {

    @Autowired
    private SubscriptionPlanRepository repository;

    public List<SubscriptionPlanEntity> getAllPlans() {
        return repository.findAll();
    }

    public List<SubscriptionPlanEntity> getActivePlans() {
        return repository.findByIsActiveTrue();
    }

    public SubscriptionPlanEntity createPlan(SubscriptionPlanEntity plan) {
        if (repository.existsById(plan.getCode())) {
            throw new RuntimeException("Plan with code " + plan.getCode() + " already exists!");
        }
        return repository.save(plan);
    }

    public SubscriptionPlanEntity updatePlan(String code, SubscriptionPlanEntity updateData) {
        SubscriptionPlanEntity existing = repository.findById(code)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        existing.setName(updateData.getName());
        existing.setPrice(updateData.getPrice());
        existing.setMaxUsers(updateData.getMaxUsers());
        existing.setDescription(updateData.getDescription());
        existing.setActive(updateData.isActive());
        
        return repository.save(existing);
    }

    public SubscriptionPlanEntity togglePlanStatus(String code) {
        SubscriptionPlanEntity existing = repository.findById(code)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        existing.setActive(!existing.isActive());
        return repository.save(existing);
    }

    public void deletePlan(String code) {
        if (!repository.existsById(code)) {
            throw new RuntimeException("Plan not found");
        }
        repository.deleteById(code);
    }
}
