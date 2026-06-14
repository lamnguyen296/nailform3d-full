package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, String> {
    List<Offer> findByRequestIdOrderByCreatedAtDesc(String requestId);
    List<Offer> findBySalonIdOrderByCreatedAtDesc(String salonId);
}
