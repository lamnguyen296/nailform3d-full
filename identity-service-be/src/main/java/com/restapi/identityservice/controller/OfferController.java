package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.OfferCreationRequest;
import com.restapi.identityservice.entity.Offer;
import com.restapi.identityservice.service.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    @Autowired
    private OfferService offerService;

    @PostMapping
    public Offer createOffer(@RequestBody OfferCreationRequest request) {
        return offerService.createOffer(request);
    }

    @GetMapping("/request/{requestId}")
    public List<Offer> getOffersForRequest(@PathVariable String requestId) {
        return offerService.getOffersForRequest(requestId);
    }

    @GetMapping("/salon/{salonId}")
    public List<Offer> getOffersBySalon(@PathVariable String salonId) {
        return offerService.getOffersBySalon(salonId);
    }

    @PostMapping("/{offerId}/accept")
    public Offer acceptOffer(@PathVariable String offerId) {
        return offerService.acceptOffer(offerId);
    }

    @PostMapping("/{offerId}/reject")
    public Offer rejectOffer(@PathVariable String offerId) {
        return offerService.rejectOffer(offerId);
    }
}
