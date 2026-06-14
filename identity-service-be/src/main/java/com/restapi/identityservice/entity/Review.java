package com.restapi.identityservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true) // Each appointment can only have 1 review
    private String appointmentId;

    private String salonId;
    private String userId;

    private Integer rating;           // 1-5 overall rating
    private Integer designSimilarity; // 1-5 how similar to 3D design

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(columnDefinition = "LONGTEXT")
    private String afterPhotoBase64; // Photo of the actual result

    @Column(columnDefinition = "LONGTEXT")
    private String designThumbnailBase64; // Snapshot of the 3D design from the appointment

    @Column(columnDefinition = "LONGTEXT")
    private String designDataJson; // JSON of {skinColor, baseNailColor, placedCharms} for 3D re-render

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getSalonId() { return salonId; }
    public void setSalonId(String salonId) { this.salonId = salonId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getDesignSimilarity() { return designSimilarity; }
    public void setDesignSimilarity(Integer designSimilarity) { this.designSimilarity = designSimilarity; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getAfterPhotoBase64() { return afterPhotoBase64; }
    public void setAfterPhotoBase64(String afterPhotoBase64) { this.afterPhotoBase64 = afterPhotoBase64; }

    public String getDesignThumbnailBase64() { return designThumbnailBase64; }
    public void setDesignThumbnailBase64(String designThumbnailBase64) { this.designThumbnailBase64 = designThumbnailBase64; }

    public String getDesignDataJson() { return designDataJson; }
    public void setDesignDataJson(String designDataJson) { this.designDataJson = designDataJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
