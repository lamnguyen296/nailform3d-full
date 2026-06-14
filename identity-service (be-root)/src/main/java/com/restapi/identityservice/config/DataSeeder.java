package com.restapi.identityservice.config;

import com.restapi.identityservice.entity.SubscriptionPlanEntity;
import com.restapi.identityservice.entity.SubscriptionPlanEnum;
import com.restapi.identityservice.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Override
    public void run(String... args) throws Exception {
        if (planRepository.count() == 0) {
            for (SubscriptionPlanEnum planEnum : SubscriptionPlanEnum.values()) {
                SubscriptionPlanEntity entity = new SubscriptionPlanEntity(
                        planEnum.name(),
                        planEnum.getName(),
                        planEnum.getPrice(),
                        planEnum.getMaxUsers(),
                        planEnum.getDescription()
                );
                planRepository.save(entity);
            }
            System.out.println("Default Subscription Plans have been seeded to the database.");
        }
    }
}
