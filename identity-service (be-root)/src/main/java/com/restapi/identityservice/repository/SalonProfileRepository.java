package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.SalonProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SalonProfileRepository extends JpaRepository<SalonProfile, String> {
    Optional<SalonProfile> findBySalonId(String salonId);
    boolean existsBySalonId(String salonId);
}
