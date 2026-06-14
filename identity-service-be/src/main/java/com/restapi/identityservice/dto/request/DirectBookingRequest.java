package com.restapi.identityservice.dto.request;

import java.time.LocalDate;

public class DirectBookingRequest {
    private String salonId;
    private String technicianName;  // nullable — null means "let salon assign"
    private String designRequestId; // ID of the user's ServiceRequest (design), nullable
    private String thumbnailBase64; // snapshot of the design
    private String designData;      // JSON design config
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String notes;
    private Double price;           // estimated, may be 0 for now
    private String location;

    public String getSalonId() { return salonId; }
    public void setSalonId(String salonId) { this.salonId = salonId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getDesignRequestId() { return designRequestId; }
    public void setDesignRequestId(String designRequestId) { this.designRequestId = designRequestId; }

    public String getThumbnailBase64() { return thumbnailBase64; }
    public void setThumbnailBase64(String thumbnailBase64) { this.thumbnailBase64 = thumbnailBase64; }

    public String getDesignData() { return designData; }
    public void setDesignData(String designData) { this.designData = designData; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
