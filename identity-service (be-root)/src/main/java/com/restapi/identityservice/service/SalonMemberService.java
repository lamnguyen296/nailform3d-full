package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.SalonMemberCreationRequest;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SalonMemberService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public List<User> getMembers(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        return userRepository.findByParentSalonId(admin.getId());
    }

    public User addMember(String adminUsername, SalonMemberCreationRequest request) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        String plan = admin.getCurrentPlan();
        if (plan == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin does not have a subscription plan");
        }

        long maxMembers = 0;
        switch (plan) {
            case "STUDIO_5":
                maxMembers = 5;
                break;
            case "STUDIO_10":
                maxMembers = 10;
                break;
            case "ACADEMY_20":
                maxMembers = 20;
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin plan does not support members");
        }

        long currentMembers = userRepository.countByParentSalonId(admin.getId());
        if (currentMembers >= maxMembers) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Member limit reached for your plan");
        }

        Optional<User> existingUserOpt = userRepository.findByUsername(request.getUsername());
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (existing.getParentSalonId() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This user is already active in a salon.");
            }
            String existingRole = existing.getRole();
            if ("ADMIN".equals(existingRole) || "ROLE_ADMIN".equals(existingRole) || 
                "SALON".equals(existingRole) || "ROLE_SALON".equals(existingRole)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add. This email belongs to a Salon Owner or System Admin.");
            }
            
            // Re-claim the user and upgrade them to TECHNICIAN
            existing.setRole("TECHNICIAN");
            existing.setParentSalonId(admin.getId());
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
            existing.setFirstName(request.getFirstName());
            existing.setLastName(request.getLastName());
            existing.setCurrentPlan("FREE");
            
            User savedExisting = userRepository.save(existing);
            
            new Thread(() -> {
                emailService.sendMemberCredentials(
                    request.getUsername(), 
                    request.getFirstName(), 
                    request.getUsername(), 
                    request.getPassword()
                );
            }).start();
            
            return savedExisting;
        }

        User member = new User();
        member.setUsername(request.getUsername());
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setCreatedAt(LocalDate.now());
        member.setStatus("ACTIVE");
        member.setRole("TECHNICIAN");
        member.setParentSalonId(admin.getId());
        // member shares premium benefits, but structurally their current plan might just be FREE 
        // with the parentSalonId linking them to Premium benefits.
        member.setCurrentPlan("FREE"); 

        User savedMember = userRepository.save(member);

        // Send real email asynchronously
        new Thread(() -> {
            emailService.sendMemberCredentials(
                request.getUsername(), 
                request.getFirstName(), 
                request.getUsername(), 
                request.getPassword()
            );
        }).start();

        return savedMember;
    }

    public void removeMember(String adminUsername, String memberId) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if (member.getParentSalonId() == null || !member.getParentSalonId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This user is not your member");
        }

        member.setParentSalonId(null);
        member.setCurrentPlan("FREE");
        userRepository.save(member);
    }

    public User updateMember(String adminUsername, String memberId, com.restapi.identityservice.dto.request.SalonMemberUpdateRequest request) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if (member.getParentSalonId() == null || !member.getParentSalonId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This user is not your member");
        }

        if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
            member.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isEmpty()) {
            member.setLastName(request.getLastName());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(request.getPassword()));
            
            // Optionally, send an email to notify them of the password change
            new Thread(() -> {
                emailService.sendMemberCredentials(
                    member.getUsername(), 
                    member.getFirstName(), 
                    member.getUsername(), 
                    request.getPassword()
                );
            }).start();
        }

        return userRepository.save(member);
    }
}
