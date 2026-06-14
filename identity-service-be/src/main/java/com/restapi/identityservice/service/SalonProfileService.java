package com.restapi.identityservice.service;

import com.restapi.identityservice.entity.SalonProfile;
import com.restapi.identityservice.repository.SalonProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;

@Service
public class SalonProfileService {

    @Autowired
    private SalonProfileRepository salonProfileRepository;

    public SalonProfile getProfile(String salonId) {
        return salonProfileRepository.findBySalonId(salonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salon profile not found"));
    }

    public Optional<SalonProfile> getProfileOptional(String salonId) {
        return salonProfileRepository.findBySalonId(salonId);
    }

    public SalonProfile createOrUpdateProfile(SalonProfile incoming) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Check if profile already exists
        Optional<SalonProfile> existing = salonProfileRepository.findBySalonId(incoming.getSalonId());

        if (existing.isPresent()) {
            // Only the owner can update
            if (!existing.get().getSalonId().equals(currentUser)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own profile");
            }
            SalonProfile profile = existing.get();
            // Update all fields
            if (incoming.getSalonName() != null) profile.setSalonName(incoming.getSalonName());
            if (incoming.getBio() != null) profile.setBio(incoming.getBio());
            if (incoming.getPhone() != null) profile.setPhone(incoming.getPhone());
            if (incoming.getEmail() != null) profile.setEmail(incoming.getEmail());
            if (incoming.getOpeningHours() != null) profile.setOpeningHours(incoming.getOpeningHours());
            if (incoming.getPriceRange() != null) profile.setPriceRange(incoming.getPriceRange());
            if (incoming.getCoverPhotoBase64() != null) profile.setCoverPhotoBase64(incoming.getCoverPhotoBase64());
            if (incoming.getAvatarBase64() != null) profile.setAvatarBase64(incoming.getAvatarBase64());
            if (incoming.getPhotoGalleryJson() != null) profile.setPhotoGalleryJson(incoming.getPhotoGalleryJson());
            if (incoming.getNailBoxProductsJson() != null) profile.setNailBoxProductsJson(incoming.getNailBoxProductsJson());
            if (incoming.getTechniciansJson() != null) profile.setTechniciansJson(incoming.getTechniciansJson());
            if (incoming.getAddress() != null) profile.setAddress(incoming.getAddress());
            if (incoming.getMapEmbedUrl() != null) profile.setMapEmbedUrl(incoming.getMapEmbedUrl());
            return salonProfileRepository.save(profile);
        } else {
            // Create new — salonId must match the logged-in user
            incoming.setSalonId(currentUser);
            return salonProfileRepository.save(incoming);
        }
    }
}
