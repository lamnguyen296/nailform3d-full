package com.restapi.identityservice.dto.response;

import java.util.Map;

public class DashboardStatsResponse {
    private long totalRevenue;
    private long totalB2BSalons;
    private long totalB2CCustomers;
    private long activeDesigns;
    private Map<String, Long> planDistribution;

    // Getters and Setters
    public long getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(long totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalB2BSalons() {
        return totalB2BSalons;
    }

    public void setTotalB2BSalons(long totalB2BSalons) {
        this.totalB2BSalons = totalB2BSalons;
    }

    public long getTotalB2CCustomers() {
        return totalB2CCustomers;
    }

    public void setTotalB2CCustomers(long totalB2CCustomers) {
        this.totalB2CCustomers = totalB2CCustomers;
    }

    public long getActiveDesigns() {
        return activeDesigns;
    }

    public void setActiveDesigns(long activeDesigns) {
        this.activeDesigns = activeDesigns;
    }

    public Map<String, Long> getPlanDistribution() {
        return planDistribution;
    }

    public void setPlanDistribution(Map<String, Long> planDistribution) {
        this.planDistribution = planDistribution;
    }
}
