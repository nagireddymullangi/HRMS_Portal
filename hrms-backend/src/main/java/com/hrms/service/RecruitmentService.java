
//service/RecruitmentService.java
package com.hrms.service;

import com.hrms.model.*;
import java.util.List;
import java.util.Map;

public interface RecruitmentService {
 // Job Postings
 JobPosting createJob(JobPosting job);
 JobPosting updateJob(Long id, JobPosting job);
 JobPosting getJob(Long id);
 List<JobPosting> getAllJobs();
 List<JobPosting> getOpenJobs();
 void deleteJob(Long id);
 JobPosting updateJobStatus(Long id, String status);

 // Candidates
 Candidate createCandidate(Candidate candidate);
 Candidate updateCandidate(Long id, Candidate candidate);
 Candidate getCandidate(Long id);
 List<Candidate> getAllCandidates();

 // Applications
 JobApplication applyForJob(Long jobId, Long candidateId, String coverLetter);
 JobApplication updateApplicationStage(Long id, String stage);
 JobApplication getApplication(Long id);
 List<JobApplication> getAllApplications();
 List<JobApplication> getApplicationsByJob(Long jobId);

 // Interviews
 Interview scheduleInterview(Interview interview);
 Interview updateInterview(Long id, Interview interview);
 Interview submitFeedback(Long id, String feedback, Double rating, String recommendation);
 List<Interview> getInterviewsByApplication(Long appId);

 Map<String, Object> getStatistics();
}