package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findBySalonIdOrderByCreatedAtDesc(String salonId);
    Optional<Review> findByAppointmentId(String appointmentId);
    boolean existsByAppointmentId(String appointmentId);
}
