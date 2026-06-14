package com.restapi.identityservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SalonProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String salonId; // = username of the salon account

    private String salonName;
    private String phone;
    private String email;
    private String openingHours;
    private String priceRange;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "LONGTEXT")
    private String coverPhotoBase64;

    @Column(columnDefinition = "LONGTEXT")
    private String avatarBase64;

    // JSON Arrays stored as strings
    @Column(columnDefinition = "LONGTEXT")
    private String photoGalleryJson; // [{base64}]

    @Column(columnDefinition = "LONGTEXT")
    private String nailBoxProductsJson; // [{title, description, oldPrice, newPrice, imageBase64}]

    @Column(columnDefinition = "LONGTEXT")
    private String techniciansJson; // [{name, experience, specialty, skills, avatarBase64}]

    // Location tab
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String mapEmbedUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSalonId() { return salonId; }
    public void setSalonId(String salonId) { this.salonId = salonId; }

    public String getSalonName() { return salonName; }
    public void setSalonName(String salonName) { this.salonName = salonName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCoverPhotoBase64() { return coverPhotoBase64; }
    public void setCoverPhotoBase64(String coverPhotoBase64) { this.coverPhotoBase64 = coverPhotoBase64; }

    public String getAvatarBase64() { return avatarBase64; }
    public void setAvatarBase64(String avatarBase64) { this.avatarBase64 = avatarBase64; }

    public String getPhotoGalleryJson() { return photoGalleryJson; }
    public void setPhotoGalleryJson(String photoGalleryJson) { this.photoGalleryJson = photoGalleryJson; }

    public String getNailBoxProductsJson() { return nailBoxProductsJson; }
    public void setNailBoxProductsJson(String nailBoxProductsJson) { this.nailBoxProductsJson = nailBoxProductsJson; }

    public String getTechniciansJson() { return techniciansJson; }
    public void setTechniciansJson(String techniciansJson) { this.techniciansJson = techniciansJson; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMapEmbedUrl() { return mapEmbedUrl; }
    public void setMapEmbedUrl(String mapEmbedUrl) { this.mapEmbedUrl = mapEmbedUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
