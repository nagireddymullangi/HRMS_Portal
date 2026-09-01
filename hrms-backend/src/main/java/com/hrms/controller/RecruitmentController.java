
//controller/RecruitmentController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.*;
import com.hrms.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
public class RecruitmentController {

 private final RecruitmentService service;

 // ============ JOBS ============
 @PostMapping("/jobs")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<JobPosting>> createJob(
         @RequestBody JobPosting job) {
     return ResponseEntity.ok(ApiResponse.success("Job created",
         service.createJob(job)));
 }

 @GetMapping("/jobs")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<JobPosting>>> getAllJobs() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllJobs()));
 }

 @GetMapping("/jobs/open")
 public ResponseEntity<ApiResponse<List<JobPosting>>> getOpenJobs() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getOpenJobs()));
 }

 @GetMapping("/jobs/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<JobPosting>> getJob(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getJob(id)));
 }

 @PutMapping("/jobs/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<JobPosting>> updateJob(
         @PathVariable Long id, @RequestBody JobPosting job) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateJob(id, job)));
 }

 @DeleteMapping("/jobs/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Long id) {
     service.deleteJob(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/jobs/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<JobPosting>> updateJobStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Status updated",
         service.updateJobStatus(id, status)));
 }

 // ============ CANDIDATES ============
 @PostMapping("/candidates")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Candidate>> createCandidate(
         @RequestBody Candidate candidate) {
     return ResponseEntity.ok(ApiResponse.success("Candidate created",
         service.createCandidate(candidate)));
 }

 @GetMapping("/candidates")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Candidate>>> getAllCandidates() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllCandidates()));
 }

 @GetMapping("/candidates/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Candidate>> getCandidate(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getCandidate(id)));
 }

 @PutMapping("/candidates/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Candidate>> updateCandidate(
         @PathVariable Long id, @RequestBody Candidate candidate) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateCandidate(id, candidate)));
 }

 // ============ APPLICATIONS ============
 @PostMapping("/applications")
 public ResponseEntity<ApiResponse<JobApplication>> apply(
         @RequestBody Map<String, Object> body) {
     Long jobId = Long.valueOf(body.get("jobId").toString());
     Long candidateId = Long.valueOf(body.get("candidateId").toString());
     String coverLetter = (String) body.get("coverLetter");
     return ResponseEntity.ok(ApiResponse.success("Applied",
         service.applyForJob(jobId, candidateId, coverLetter)));
 }

 @GetMapping("/applications")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<JobApplication>>> getAllApplications() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllApplications()));
 }

 @GetMapping("/applications/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<JobApplication>> getApplication(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getApplication(id)));
 }

 @GetMapping("/applications/job/{jobId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<JobApplication>>>
         getApplicationsByJob(@PathVariable Long jobId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getApplicationsByJob(jobId)));
 }

 @PatchMapping("/applications/{id}/stage")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<JobApplication>> updateStage(
         @PathVariable Long id, @RequestParam String stage) {
     return ResponseEntity.ok(ApiResponse.success("Stage updated",
         service.updateApplicationStage(id, stage)));
 }

 // ============ INTERVIEWS ============
 @PostMapping("/interviews")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Interview>> scheduleInterview(
         @RequestBody Interview interview) {
     return ResponseEntity.ok(ApiResponse.success("Interview scheduled",
         service.scheduleInterview(interview)));
 }

 @PutMapping("/interviews/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Interview>> updateInterview(
         @PathVariable Long id, @RequestBody Interview interview) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateInterview(id, interview)));
 }

 @GetMapping("/interviews/application/{appId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Interview>>> getInterviews(
         @PathVariable Long appId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getInterviewsByApplication(appId)));
 }

 @PostMapping("/interviews/{id}/feedback")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Interview>> submitFeedback(
         @PathVariable Long id,
         @RequestBody Map<String, Object> body) {
     return ResponseEntity.ok(ApiResponse.success("Feedback submitted",
         service.submitFeedback(id,
             (String) body.get("feedback"),
             Double.valueOf(body.get("rating").toString()),
             (String) body.get("recommendation"))));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }
}