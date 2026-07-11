package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.JobPostingRequest;
import com.restapi.identityservice.entity.JobPosting;
import com.restapi.identityservice.service.JobPostingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "*")
public class JobPostingController {

    @Autowired
    private JobPostingService jobPostingService;

    @PostMapping("/salon/{salonId}")
    public JobPosting createJobPosting(@PathVariable String salonId, @RequestBody JobPostingRequest request) {
        return jobPostingService.createJobPosting(salonId, request);
    }

    @GetMapping
    public List<JobPosting> getAllJobPostings() {
        return jobPostingService.getAllJobPostings();
    }

    @GetMapping("/{id}")
    public JobPosting getJobPostingById(@PathVariable String id) {
        return jobPostingService.getJobPostingById(id);
    }

    @GetMapping("/salon/{salonId}")
    public List<JobPosting> getJobPostingsBySalon(@PathVariable String salonId) {
        return jobPostingService.getJobPostingsBySalon(salonId);
    }

    @GetMapping("/type/{jobType}/status/{status}")
    public List<JobPosting> getJobPostingsByTypeAndStatus(@PathVariable String jobType, @PathVariable String status) {
        return jobPostingService.getJobPostingsByTypeAndStatus(jobType, status);
    }

    @PutMapping("/{id}/status")
    public JobPosting updateJobPostingStatus(@PathVariable String id, @RequestParam String status) {
        return jobPostingService.updateJobPostingStatus(id, status);
    }

    @PutMapping("/{id}")
    public JobPosting updateJobPosting(@PathVariable String id, @RequestBody JobPostingRequest request) {
        return jobPostingService.updateJobPosting(id, request);
    }
}
