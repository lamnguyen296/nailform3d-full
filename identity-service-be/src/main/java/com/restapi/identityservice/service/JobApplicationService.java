package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.JobApplicationRequest;
import com.restapi.identityservice.entity.JobApplication;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.JobApplicationRepository;
import com.restapi.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    public JobApplication createApplication(String applicantId, JobApplicationRequest request) {
        User applicant = userRepository.findById(applicantId)
            .orElseGet(() -> userRepository.findByUsername(applicantId).orElse(null));
            
        if (applicant == null && "mock-user".equals(applicantId)) {
            applicant = new User();
            applicant.setId("mock-user");
            applicant.setRole("USER");
            applicant.setCurrentPlan("PREMIUM");
        } else if (applicant == null) {
            throw new RuntimeException("Applicant not found");
        }

        long totalApplications = jobApplicationRepository.countByApplicantId(applicantId);
        String plan = applicant.getCurrentPlan();

        int maxApplications = 0;
        if ("FREE".equals(plan)) maxApplications = 5;
        else if ("PRO".equals(plan)) maxApplications = 100;
        else if ("PREMIUM".equals(plan)) maxApplications = 1000;
        else maxApplications = 5; // Default for normal users

        if (totalApplications >= maxApplications) {
            throw new RuntimeException("Bạn đã đạt giới hạn nộp đơn ứng tuyển của gói " + plan + " (" + maxApplications + " lần). Vui lòng nâng cấp gói Pro/Premium để tiếp tục.");
        }

        JobApplication application = new JobApplication();
        application.setApplicantId(applicantId);
        application.setJobPostingId(request.getJobPostingId());
        application.setMessage(request.getMessage());
        application.setPortfolioUrl(request.getPortfolioUrl());
        application.setStatus("PENDING");
        return jobApplicationRepository.save(application);
    }

    public List<JobApplication> getApplicationsByApplicant(String applicantId) {
        return jobApplicationRepository.findByApplicantId(applicantId);
    }

    public List<JobApplication> getApplicationsByJobPosting(String jobPostingId) {
        return jobApplicationRepository.findByJobPostingId(jobPostingId);
    }

    public JobApplication updateApplicationStatus(String id, String status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        return jobApplicationRepository.save(application);
    }
}
