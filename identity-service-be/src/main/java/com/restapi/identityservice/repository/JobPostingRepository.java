package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, String> {
    List<JobPosting> findByJobType(String jobType);
    List<JobPosting> findBySalonId(String salonId);
    List<JobPosting> findByJobTypeAndStatus(String jobType, String status);
    long countBySalonIdAndStatus(String salonId, String status);
}
