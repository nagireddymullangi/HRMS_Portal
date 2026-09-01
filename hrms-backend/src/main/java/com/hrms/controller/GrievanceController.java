
//controller/GrievanceController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.GrievanceResponse;
import com.hrms.model.Grievance;
import com.hrms.model.GrievanceComment;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.GrievanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
public class GrievanceController {

 private final GrievanceService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> create(
         @RequestBody Grievance grievance) {
     return ResponseEntity.ok(ApiResponse.success("Grievance submitted",
         service.create(grievance)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @GetMapping("/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getByEmployee(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByEmployee(empId)));
 }

 @GetMapping("/status/{status}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getByStatus(
         @PathVariable String status) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByStatus(status)));
 }

 @GetMapping("/assigned/me")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getMyAssigned(
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getMyAssigned(user.getId())));
 }

 @PatchMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateStatus(id, status)));
 }

 @PatchMapping("/{id}/assign")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> assign(
         @PathVariable Long id, @RequestBody Map<String, Long> body) {
     return ResponseEntity.ok(ApiResponse.success("Assigned",
         service.assign(id, body.get("userId"))));
 }

 @PatchMapping("/{id}/resolve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> resolve(
         @PathVariable Long id,
         @RequestBody Map<String, String> body,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Resolved",
         service.resolve(id, body.get("resolution"), user.getId())));
 }

 @PatchMapping("/{id}/escalate")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> escalate(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Escalated",
         service.escalate(id)));
 }

 @PatchMapping("/{id}/feedback")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<GrievanceResponse>> submitFeedback(
         @PathVariable Long id, @RequestBody Map<String, Object> body) {
     return ResponseEntity.ok(ApiResponse.success("Feedback submitted",
         service.submitFeedback(id,
             (Integer) body.get("rating"),
             (String) body.get("feedback"))));
 }

 @PostMapping("/{id}/comments")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<GrievanceComment>> addComment(
         @PathVariable Long id,
         @RequestBody Map<String, Object> body,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Comment added",
         service.addComment(id, user.getId(),
             (String) body.get("comment"),
             (Boolean) body.get("isInternal"))));
 }

 @GetMapping("/{id}/comments")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<GrievanceComment>>> getComments(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getComments(id)));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }
}