
//repository/JobApplicationRepository.java
package com.hrms.repository;

import com.hrms.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
 List<JobApplication> findByJobPostingIdOrderByAppliedDateDesc(Long jobId);
 List<JobApplication> findByCandidateIdOrderByAppliedDateDesc(Long candId);
 List<JobApplication> findByStageOrderByAppliedDateDesc(JobApplication.Stage stage);
 List<JobApplication> findAllByOrderByAppliedDateDesc();
 Long countByStage(JobApplication.Stage stage);
}
