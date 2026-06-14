package com.restapi.identityservice.dto.request;

public class ServiceRequestCreationRequest {
    private String location;
    private String description;
    private String thumbnailBase64;
    private String designData;

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getThumbnailBase64() { return thumbnailBase64; }
    public void setThumbnailBase64(String thumbnailBase64) { this.thumbnailBase64 = thumbnailBase64; }

    public String getDesignData() { return designData; }
    public void setDesignData(String designData) { this.designData = designData; }
}
