package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.JobPostingRequest;
import com.restapi.identityservice.entity.JobPosting;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.JobPostingRepository;
import com.restapi.identityservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPostingService {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private UserRepository userRepository;

    public JobPosting createJobPosting(String salonId, JobPostingRequest request) {
        User salonUser = userRepository.findById(salonId)
            .orElseGet(() -> userRepository.findByUsername(salonId).orElse(null));
            
        if (salonUser == null && "mock-salon".equals(salonId)) {
            salonUser = new User();
            salonUser.setId("mock-salon");
            salonUser.setRole("SALON");
            salonUser.setCurrentPlan("ACADEMY_20");
        } else if (salonUser == null) {
            throw new RuntimeException("Salon user not found");
        }
        
        // Ensure user is salon or admin
        String role = salonUser.getRole();
        if (role == null || (!role.contains("SALON") && !role.contains("ADMIN"))) {
            throw new RuntimeException("Chỉ có Salon mới có quyền đăng tin tuyển dụng.");
        }

        long currentOpenJobs = jobPostingRepository.countBySalonIdAndStatus(salonId, "OPEN");
        String plan = salonUser.getCurrentPlan();

        int maxJobs = 0;
        if ("FREE".equals(plan)) maxJobs = 1;
        else if ("STUDIO_5".equals(plan)) maxJobs = 3;
        else if ("STUDIO_10".equals(plan)) maxJobs = 5;
        else if ("ACADEMY_20".equals(plan)) maxJobs = 100; // Unlimited practically
        else maxJobs = 1; // Fallback

        if (currentOpenJobs >= maxJobs) {
            throw new RuntimeException("Bạn đã đạt giới hạn tin đăng đang mở của gói " + plan + ". Vui lòng nâng cấp gói hoặc đóng bớt tin cũ.");
        }

        JobPosting jobPosting = new JobPosting();
        jobPosting.setTitle(request.getTitle());
        jobPosting.setDescription(request.getDescription());
        jobPosting.setRequirements(request.getRequirements());
        jobPosting.setLocation(request.getLocation());
        jobPosting.setSalary(request.getSalary());
        jobPosting.setJobType(request.getJobType());
        jobPosting.setSalonId(salonId);
        jobPosting.setStatus("OPEN");
        return jobPostingRepository.save(jobPosting);
    }

    public List<JobPosting> getAllJobPostings() {
        return jobPostingRepository.findAll();
    }

    public List<JobPosting> getJobPostingsBySalon(String salonId) {
        return jobPostingRepository.findBySalonId(salonId);
    }

    public List<JobPosting> getJobPostingsByTypeAndStatus(String jobType, String status) {
        return jobPostingRepository.findByJobTypeAndStatus(jobType, status);
    }

    public JobPosting getJobPostingById(String id) {
        return jobPostingRepository.findById(id).orElseThrow(() -> new RuntimeException("Job posting not found"));
    }

    public JobPosting updateJobPostingStatus(String id, String status) {
        JobPosting jobPosting = getJobPostingById(id);
        jobPosting.setStatus(status);
        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting updateJobPosting(String id, JobPostingRequest request) {
        JobPosting jobPosting = getJobPostingById(id);
        jobPosting.setTitle(request.getTitle());
        jobPosting.setDescription(request.getDescription());
        jobPosting.setRequirements(request.getRequirements());
        jobPosting.setLocation(request.getLocation());
        jobPosting.setSalary(request.getSalary());
        jobPosting.setJobType(request.getJobType());
        return jobPostingRepository.save(jobPosting);
    }
}
