package com.restapi.identityservice.dto.request;


public class SubscriptionRequestCreationRequest {
    private String requestedPlan;
    private String paymentReference;

    public String getRequestedPlan() {
        return requestedPlan;
    }

    public void setRequestedPlan(String requestedPlan) {
        this.requestedPlan = requestedPlan;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}
