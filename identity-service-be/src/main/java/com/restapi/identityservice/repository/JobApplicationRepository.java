package com.restapi.identityservice.repository;

import com.restapi.identityservice.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, String> {
    List<JobApplication> findByApplicantId(String applicantId);
    List<JobApplication> findByJobPostingId(String jobPostingId);
    long countByApplicantId(String applicantId);
}
