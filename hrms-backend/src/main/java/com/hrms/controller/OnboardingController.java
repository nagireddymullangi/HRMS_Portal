
//controller/OnboardingController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.OnboardingProcess;
import com.hrms.model.OnboardingTask;
import com.hrms.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

 private final OnboardingService service;

 @PostMapping("/initiate/{employeeId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<OnboardingProcess>> initiate(
         @PathVariable Long employeeId,
         @RequestBody OnboardingProcess process) {
     return ResponseEntity.ok(ApiResponse.success("Onboarding initiated",
         service.initiate(employeeId, process)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<OnboardingProcess>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<OnboardingProcess>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<OnboardingProcess>> getByEmployee(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByEmployee(employeeId)));
 }

 @PatchMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<OnboardingProcess>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateStatus(id, status)));
 }

 @PostMapping("/{onboardingId}/tasks")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<OnboardingTask>> addTask(
         @PathVariable Long onboardingId,
         @RequestBody OnboardingTask task) {
     return ResponseEntity.ok(ApiResponse.success("Task added",
         service.addTask(onboardingId, task)));
 }

 @PutMapping("/tasks/{taskId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<OnboardingTask>> updateTask(
         @PathVariable Long taskId, @RequestBody OnboardingTask task) {
     return ResponseEntity.ok(ApiResponse.success("Task updated",
         service.updateTask(taskId, task)));
 }

 @PatchMapping("/tasks/{taskId}/complete")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<OnboardingTask>> completeTask(
         @PathVariable Long taskId) {
     return ResponseEntity.ok(ApiResponse.success("Task completed",
         service.completeTask(taskId)));
 }

 @DeleteMapping("/tasks/{taskId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> deleteTask(
         @PathVariable Long taskId) {
     service.deleteTask(taskId);
     return ResponseEntity.ok(ApiResponse.success("Task deleted"));
 }

 @GetMapping("/{onboardingId}/tasks")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<OnboardingTask>>> getTasks(
         @PathVariable Long onboardingId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getTasks(onboardingId)));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }
}