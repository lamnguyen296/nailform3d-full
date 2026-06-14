package com.restapi.identityservice.controller;

import com.restapi.identityservice.entity.Review;
import com.restapi.identityservice.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/salon/{salonId}")
    public List<Review> getReviewsForSalon(@PathVariable String salonId) {
        return reviewService.getReviewsForSalon(salonId);
    }

    @GetMapping("/can-review/{appointmentId}")
    public Map<String, Object> canReview(@PathVariable String appointmentId) {
        return reviewService.canReview(appointmentId);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewService.createReview(review);
    }
}
