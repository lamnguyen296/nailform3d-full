package com.restapi.identityservice.service;

import com.restapi.identityservice.entity.Appointment;
import com.restapi.identityservice.entity.Review;
import com.restapi.identityservice.repository.AppointmentRepository;
import com.restapi.identityservice.repository.ReviewRepository;
import com.restapi.identityservice.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    public List<Review> getReviewsForSalon(String salonId) {
        List<Review> reviews = reviewRepository.findBySalonIdOrderByCreatedAtDesc(salonId);
        // For historical records missing snapshots, populate dynamically
        reviews.forEach(rev -> {
            if ((rev.getDesignThumbnailBase64() == null || rev.getDesignDataJson() == null)
                    && rev.getAppointmentId() != null) {
                appointmentRepository.findById(rev.getAppointmentId()).ifPresent(appt -> {
                    String thumb = appt.getThumbnailBase64();
                    String designData = null;
                    if (appt.getRequestId() != null) {
                        var sr = serviceRequestRepository.findById(appt.getRequestId()).orElse(null);
                        if (sr != null) {
                            if (thumb == null) thumb = sr.getThumbnailBase64();
                            designData = sr.getDesignData();
                        }
                    }
                    if (rev.getDesignThumbnailBase64() == null) rev.setDesignThumbnailBase64(thumb);
                    if (rev.getDesignDataJson() == null) rev.setDesignDataJson(designData);
                });
            }
        });
        return reviews;
    }

    public Map<String, Object> canReview(String appointmentId) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        boolean isCompleted = "COMPLETED".equals(appt.getStatus());
        boolean isOwner = appt.getUserId().equals(currentUser);
        boolean alreadyReviewed = reviewRepository.existsByAppointmentId(appointmentId);

        return Map.of(
            "canReview", isCompleted && isOwner && !alreadyReviewed,
            "alreadyReviewed", alreadyReviewed,
            "isCompleted", isCompleted
        );
    }

    public Review createReview(Review review) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        Appointment appt = appointmentRepository.findById(review.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!appt.getUserId().equals(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review your own appointments");
        }
        if (!"COMPLETED".equals(appt.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only review completed appointments");
        }
        if (reviewRepository.existsByAppointmentId(review.getAppointmentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this appointment");
        }

        review.setUserId(currentUser);
        review.setSalonId(appt.getSalonId());

        // Snapshot thumbnail + designData from the ServiceRequest for future 3D re-render
        if (appt.getRequestId() != null) {
            serviceRequestRepository.findById(appt.getRequestId()).ifPresent(sr -> {
                String thumb = appt.getThumbnailBase64() != null
                        ? appt.getThumbnailBase64() : sr.getThumbnailBase64();
                review.setDesignThumbnailBase64(thumb);
                review.setDesignDataJson(sr.getDesignData()); // JSON: {skinColor, baseNailColor, placedCharms}
            });
        } else if (appt.getThumbnailBase64() != null) {
            review.setDesignThumbnailBase64(appt.getThumbnailBase64());
        }

        return reviewRepository.save(review);
    }
}
