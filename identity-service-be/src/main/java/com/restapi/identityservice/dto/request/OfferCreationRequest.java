package com.restapi.identityservice.dto.request;

public class OfferCreationRequest {
    private String requestId;
    private Double price;
    private String message;

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
