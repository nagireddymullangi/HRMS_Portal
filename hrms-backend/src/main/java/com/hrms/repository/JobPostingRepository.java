
//repository/JobPostingRepository.java
package com.hrms.repository;

import com.hrms.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
 List<JobPosting> findByStatus(JobPosting.Status status);
 List<JobPosting> findAllByOrderByCreatedAtDesc();
 Long countByStatus(JobPosting.Status status);
}