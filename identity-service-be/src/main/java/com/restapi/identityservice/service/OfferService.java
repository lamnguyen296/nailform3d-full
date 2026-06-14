package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.OfferCreationRequest;
import com.restapi.identityservice.entity.Offer;
import com.restapi.identityservice.repository.OfferRepository;
import com.restapi.identityservice.repository.ServiceRequestRepository;
import com.restapi.identityservice.entity.ServiceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    public Offer createOffer(OfferCreationRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() == null || 
            !SecurityContextHolder.getContext().getAuthentication().isAuthenticated() || 
            SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized: Invalid token or not logged in.");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Offer offer = new Offer();
        offer.setRequestId(request.getRequestId());
        offer.setSalonId(username);
        offer.setPrice(request.getPrice());
        offer.setMessage(request.getMessage());
        return offerRepository.save(offer);
    }

    public List<Offer> getOffersForRequest(String requestId) {
        return offerRepository.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    public List<Offer> getOffersBySalon(String salonId) {
        return offerRepository.findBySalonIdOrderByCreatedAtDesc(salonId);
    }

    public Offer acceptOffer(String offerId) {
        Offer acceptedOffer = offerRepository.findById(offerId).orElseThrow(() -> new RuntimeException("Offer not found"));
        acceptedOffer.setStatus("ACCEPTED");
        offerRepository.save(acceptedOffer);

        // Reject other offers for the same request
        List<Offer> otherOffers = offerRepository.findByRequestIdOrderByCreatedAtDesc(acceptedOffer.getRequestId());
        for (Offer o : otherOffers) {
            if (!o.getId().equals(offerId)) {
                o.setStatus("REJECTED");
                offerRepository.save(o);
            }
        }

        // Close the service request
        ServiceRequest request = serviceRequestRepository.findById(acceptedOffer.getRequestId()).orElse(null);
        if (request != null) {
            request.setStatus("CLOSED");
            serviceRequestRepository.save(request);
        }

        return acceptedOffer;
    }

    public Offer rejectOffer(String offerId) {
        Offer offer = offerRepository.findById(offerId).orElseThrow(() -> new RuntimeException("Offer not found"));
        offer.setStatus("REJECTED");
        return offerRepository.save(offer);
    }
}
