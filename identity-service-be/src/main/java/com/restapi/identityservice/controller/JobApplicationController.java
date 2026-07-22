package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.JobApplicationRequest;
import com.restapi.identityservice.entity.JobApplication;
import com.restapi.identityservice.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @PostMapping("/user/{applicantId}")
    public JobApplication createApplication(@PathVariable String applicantId, @RequestBody JobApplicationRequest request) {
        return jobApplicationService.createApplication(applicantId, request);
    }

    @GetMapping("/user/{applicantId}")
    public List<JobApplication> getApplicationsByApplicant(@PathVariable String applicantId) {
        return jobApplicationService.getApplicationsByApplicant(applicantId);
    }

    @GetMapping("/job/{jobPostingId}")
    public List<JobApplication> getApplicationsByJobPosting(@PathVariable String jobPostingId) {
        return jobApplicationService.getApplicationsByJobPosting(jobPostingId);
    }

    @PutMapping("/{id}/status")
    public JobApplication updateApplicationStatus(@PathVariable String id, @RequestParam String status) {
        return jobApplicationService.updateApplicationStatus(id, status);
    }
}
