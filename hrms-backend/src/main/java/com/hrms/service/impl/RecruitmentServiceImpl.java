
//service/impl/RecruitmentServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecruitmentServiceImpl implements RecruitmentService {

 private final JobPostingRepository jobRepository;
 private final CandidateRepository candidateRepository;
 private final JobApplicationRepository applicationRepository;
 private final InterviewRepository interviewRepository;

 @Override
 @Transactional
 public JobPosting createJob(JobPosting job) {
     if (job.getJobCode() == null) {
         job.setJobCode(generateJobCode());
     }
     job.setPostedDate(LocalDate.now());
     job.setStatus(JobPosting.Status.OPEN);
     return jobRepository.save(job);
 }

 @Override
 @Transactional
 public JobPosting updateJob(Long id, JobPosting job) {
     JobPosting existing = getJob(id);
     existing.setTitle(job.getTitle());
     existing.setDescription(job.getDescription());
     existing.setRequirements(job.getRequirements());
     existing.setResponsibilities(job.getResponsibilities());
     existing.setSalaryMin(job.getSalaryMin());
     existing.setSalaryMax(job.getSalaryMax());
     existing.setLocation(job.getLocation());
     existing.setEmploymentType(job.getEmploymentType());
     existing.setClosingDate(job.getClosingDate());
     existing.setOpenings(job.getOpenings());
     existing.setSkillsRequired(job.getSkillsRequired());
     return jobRepository.save(existing);
 }

 @Override
 public JobPosting getJob(Long id) {
     return jobRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "JobPosting", "id", id));
 }

 @Override
 public List<JobPosting> getAllJobs() {
     return jobRepository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 public List<JobPosting> getOpenJobs() {
     return jobRepository.findByStatus(JobPosting.Status.OPEN);
 }

 @Override
 public void deleteJob(Long id) {
     jobRepository.deleteById(id);
 }

 @Override
 @Transactional
 public JobPosting updateJobStatus(Long id, String status) {
     JobPosting job = getJob(id);
     job.setStatus(JobPosting.Status.valueOf(status));
     return jobRepository.save(job);
 }

 @Override
 @Transactional
 public Candidate createCandidate(Candidate candidate) {
     if (candidateRepository.findByEmail(candidate.getEmail()).isPresent()) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Candidate with email already exists");
     }
     return candidateRepository.save(candidate);
 }

 @Override
 @Transactional
 public Candidate updateCandidate(Long id, Candidate candidate) {
     Candidate existing = getCandidate(id);
     existing.setFirstName(candidate.getFirstName());
     existing.setLastName(candidate.getLastName());
     existing.setPhone(candidate.getPhone());
     existing.setCurrentCompany(candidate.getCurrentCompany());
     existing.setCurrentDesignation(candidate.getCurrentDesignation());
     existing.setTotalExperience(candidate.getTotalExperience());
     existing.setSkills(candidate.getSkills());
     return candidateRepository.save(existing);
 }

 @Override
 public Candidate getCandidate(Long id) {
     return candidateRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Candidate", "id", id));
 }

 @Override
 public List<Candidate> getAllCandidates() {
     return candidateRepository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 @Transactional
 public JobApplication applyForJob(Long jobId, Long candidateId,
                                     String coverLetter) {
     JobPosting job = getJob(jobId);
     Candidate candidate = getCandidate(candidateId);

     JobApplication application = JobApplication.builder()
             .applicationNumber(generateApplicationNumber())
             .jobPosting(job)
             .candidate(candidate)
             .stage(JobApplication.Stage.APPLIED)
             .status(JobApplication.Status.ACTIVE)
             .coverLetter(coverLetter)
             .build();

     JobApplication saved = applicationRepository.save(application);
     job.setTotalApplications(job.getTotalApplications() + 1);
     jobRepository.save(job);

     return saved;
 }

 @Override
 @Transactional
 public JobApplication updateApplicationStage(Long id, String stage) {
     JobApplication app = getApplication(id);
     app.setStage(JobApplication.Stage.valueOf(stage));
     return applicationRepository.save(app);
 }

 @Override
 public JobApplication getApplication(Long id) {
     return applicationRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Application", "id", id));
 }

 @Override
 public List<JobApplication> getAllApplications() {
     return applicationRepository.findAllByOrderByAppliedDateDesc();
 }

 @Override
 public List<JobApplication> getApplicationsByJob(Long jobId) {
     return applicationRepository.findByJobPostingIdOrderByAppliedDateDesc(jobId);
 }

 @Override
 @Transactional
 public Interview scheduleInterview(Interview interview) {
     if (interview.getApplication() == null) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Application is required");
     }

     Interview saved = interviewRepository.save(interview);

     // Update application stage
     JobApplication app = interview.getApplication();
     app.setStage(JobApplication.Stage.INTERVIEW_SCHEDULED);
     applicationRepository.save(app);

     return saved;
 }

 @Override
 @Transactional
 public Interview updateInterview(Long id, Interview interview) {
     Interview existing = interviewRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Interview", "id", id));

     existing.setScheduledDate(interview.getScheduledDate());
     existing.setDurationMinutes(interview.getDurationMinutes());
     existing.setMode(interview.getMode());
     existing.setLocation(interview.getLocation());
     existing.setMeetingLink(interview.getMeetingLink());
     existing.setInterviewerIds(interview.getInterviewerIds());
     existing.setStatus(interview.getStatus());

     return interviewRepository.save(existing);
 }

 @Override
 @Transactional
 public Interview submitFeedback(Long id, String feedback, Double rating,
                                   String recommendation) {
     Interview interview = interviewRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Interview", "id", id));

     interview.setFeedback(feedback);
     interview.setRating(BigDecimal.valueOf(rating));
     interview.setRecommendation(Interview.Recommendation.valueOf(recommendation));
     interview.setStatus(Interview.Status.COMPLETED);
     interview.setCompletedAt(LocalDateTime.now());

     return interviewRepository.save(interview);
 }

 @Override
 public List<Interview> getInterviewsByApplication(Long appId) {
     return interviewRepository.findByApplicationIdOrderByRoundNumberAsc(appId);
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     stats.put("totalJobs", jobRepository.count());
     stats.put("openJobs", jobRepository.countByStatus(JobPosting.Status.OPEN));
     stats.put("totalCandidates", candidateRepository.count());
     stats.put("totalApplications", applicationRepository.count());
     stats.put("appliedCount",
         applicationRepository.countByStage(JobApplication.Stage.APPLIED));
     stats.put("interviewedCount",
         applicationRepository.countByStage(JobApplication.Stage.INTERVIEWED));
     stats.put("hiredCount",
         applicationRepository.countByStage(JobApplication.Stage.HIRED));
     return stats;
 }

 private String generateJobCode() {
     long count = jobRepository.count() + 1;
     return String.format("JOB-%d-%04d", LocalDate.now().getYear(), count);
 }

 private String generateApplicationNumber() {
     long count = applicationRepository.count() + 1;
     return String.format("APP-%d-%05d", LocalDate.now().getYear(), count);
 }
}