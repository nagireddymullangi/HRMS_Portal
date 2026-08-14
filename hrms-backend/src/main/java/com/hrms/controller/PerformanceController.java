
//controller/PerformanceController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.EmployeeKra;
import com.hrms.model.PerformanceCycle;
import com.hrms.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

 private final PerformanceService service;

 @PostMapping("/cycles")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<PerformanceCycle>> createCycle(
         @RequestBody PerformanceCycle cycle) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createCycle(cycle)));
 }

 @GetMapping("/cycles")
 public ResponseEntity<ApiResponse<List<PerformanceCycle>>> getCycles() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllCycles()));
 }

 @PatchMapping("/cycles/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<PerformanceCycle>> updateCycleStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateCycleStatus(id, status)));
 }

 @PostMapping("/kras")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EmployeeKra>> createKra(
         @RequestBody EmployeeKra kra) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createKra(kra)));
 }

 @GetMapping("/kras/{employeeId}/{cycleId}")
 public ResponseEntity<ApiResponse<List<EmployeeKra>>> getKras(
         @PathVariable Long employeeId, @PathVariable Long cycleId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeKras(employeeId, cycleId)));
 }

 @PutMapping("/kras/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EmployeeKra>> updateKra(
         @PathVariable Long id, @RequestBody EmployeeKra kra) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateKra(id, kra)));
 }

 @PostMapping("/kras/{id}/self-review")
 public ResponseEntity<ApiResponse<EmployeeKra>> selfReview(
         @PathVariable Long id, @RequestBody Map<String, Object> body) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submitSelfReview(id,
             (Integer) body.get("rating"),
             (String) body.get("comments"))));
 }

 @PostMapping("/kras/{id}/manager-review")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EmployeeKra>> managerReview(
         @PathVariable Long id, @RequestBody Map<String, Object> body) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submitManagerReview(id,
             (Integer) body.get("rating"),
             (String) body.get("comments"))));
 }

 @GetMapping("/summary/{employeeId}/{cycleId}")
 public ResponseEntity<ApiResponse<Map<String, Object>>> summary(
         @PathVariable Long employeeId, @PathVariable Long cycleId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeePerformanceSummary(employeeId, cycleId)));
 }
}