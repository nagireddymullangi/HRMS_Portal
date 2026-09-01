
//controller/PolicyController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.HrPolicy;
import com.hrms.model.PolicyAcknowledgment;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.PolicyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

 private final PolicyService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<HrPolicy>> create(
         @RequestBody HrPolicy policy) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createPolicy(policy)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<HrPolicy>> update(
         @PathVariable Long id, @RequestBody HrPolicy policy) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updatePolicy(id, policy)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<HrPolicy>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getPolicy(id)));
 }

 @GetMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<HrPolicy>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllPolicies()));
 }

 @GetMapping("/active")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<HrPolicy>>> getActive() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getActivePolicies()));
 }

 @GetMapping("/category/{category}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<HrPolicy>>> getByCategory(
         @PathVariable String category) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getPoliciesByCategory(category)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deletePolicy(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<HrPolicy>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateStatus(id, status)));
 }

 @PatchMapping("/{id}/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<HrPolicy>> approve(
         @PathVariable Long id, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Approved",
         service.approvePolicy(id, user.getId())));
 }

 @PostMapping("/{id}/acknowledge")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<PolicyAcknowledgment>> acknowledge(
         @PathVariable Long id,
         @RequestBody Map<String, Object> body,
         HttpServletRequest request) {

     Long employeeId = Long.valueOf(body.get("employeeId").toString());
     String signature = (String) body.get("signature");
     String comments = (String) body.get("comments");
     String ip = request.getRemoteAddr();

     return ResponseEntity.ok(ApiResponse.success("Acknowledged",
         service.acknowledgePolicy(id, employeeId, ip, signature, comments)));
 }

 @GetMapping("/{id}/acknowledgments")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<PolicyAcknowledgment>>>
         getAcknowledgments(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAcknowledgments(id)));
 }

 @GetMapping("/pending/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<HrPolicy>>> getPending(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getPendingPoliciesForEmployee(employeeId)));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }

 @GetMapping("/{id}/compliance-report")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>>
         getComplianceReport(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getPolicyComplianceReport(id)));
 }
}