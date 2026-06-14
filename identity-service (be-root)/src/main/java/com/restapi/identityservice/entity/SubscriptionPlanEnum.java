package com.restapi.identityservice.entity;

public enum SubscriptionPlanEnum {
    FREE("B2C Free", 0, 1, "Basic free access"),
    PRO("B2C Pro", 299000, 1, "Pro features"),
    PREMIUM("B2C Premium", 499000, 1, "Premium features"),
    STUDIO_5("B2B Studio (5 users)", 1790000, 5, "Studio license up to 5 members"),
    STUDIO_10("B2B Studio (10 users)", 2990000, 10, "Studio license up to 10 members"),
    ACADEMY_20("B2B Academy (20 users)", 4990000, 20, "Academy license up to 20 members");

    private final String name;
    private final double price;
    private final int maxUsers;
    private final String description;

    SubscriptionPlanEnum(String name, double price, int maxUsers, String description) {
        this.name = name;
        this.price = price;
        this.maxUsers = maxUsers;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public int getMaxUsers() {
        return maxUsers;
    }

    public String getDescription() {
        return description;
    }
}
