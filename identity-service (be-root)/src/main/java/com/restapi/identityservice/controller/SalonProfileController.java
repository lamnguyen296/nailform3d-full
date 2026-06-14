package com.restapi.identityservice.controller;

import com.restapi.identityservice.entity.SalonProfile;
import com.restapi.identityservice.repository.SalonProfileRepository;
import com.restapi.identityservice.service.SalonProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/salon-profiles")
@CrossOrigin(origins = "*")
public class SalonProfileController {

    @Autowired
    private SalonProfileService salonProfileService;

    @Autowired
    private SalonProfileRepository salonProfileRepository;

    @GetMapping
    public ResponseEntity<?> getAllProfiles() {
        return ResponseEntity.ok(salonProfileRepository.findAll());
    }

    @GetMapping("/{salonId}")
    public ResponseEntity<?> getProfile(@PathVariable String salonId) {
        Optional<SalonProfile> profile = salonProfileService.getProfileOptional(salonId);
        if (profile.isPresent()) {
            return ResponseEntity.ok(profile.get());
        } else {
            // Return empty profile skeleton so frontend knows salon exists but has no profile yet
            SalonProfile empty = new SalonProfile();
            empty.setSalonId(salonId);
            empty.setSalonName(salonId);
            return ResponseEntity.ok(empty);
        }
    }

    @PostMapping
    public ResponseEntity<SalonProfile> createProfile(@RequestBody SalonProfile profile) {
        return ResponseEntity.ok(salonProfileService.createOrUpdateProfile(profile));
    }

    @PutMapping("/{salonId}")
    public ResponseEntity<SalonProfile> updateProfile(@PathVariable String salonId,
                                                       @RequestBody SalonProfile profile) {
        profile.setSalonId(salonId);
        return ResponseEntity.ok(salonProfileService.createOrUpdateProfile(profile));
    }
}
