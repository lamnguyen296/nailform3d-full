package com.restapi.identityservice.dto.response;

public class PaymentResponseDTO {
    private String status;
    private String message;
    private String url;

    public PaymentResponseDTO() {}

    public PaymentResponseDTO(String status, String message, String url) {
        this.status = status;
        this.message = message;
        this.url = url;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
