package com.restapi.identityservice.dto.request;

public class JobApplicationRequest {
    private String message;
    private String portfolioUrl;
    private String jobPostingId;

    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(String jobPostingId) { this.jobPostingId = jobPostingId; }
}
