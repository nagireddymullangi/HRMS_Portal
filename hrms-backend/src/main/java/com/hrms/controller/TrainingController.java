
//controller/TrainingController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.TrainingEnrollmentResponse;
import com.hrms.dto.response.TrainingProgramResponse;
import com.hrms.model.TrainingEnrollment;
import com.hrms.model.TrainingProgram;
import com.hrms.service.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class TrainingController {

 private final TrainingService service;

 // PROGRAMS
 @PostMapping("/programs")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TrainingProgramResponse>> createProgram(
         @RequestBody TrainingProgram program) {
     return ResponseEntity.ok(ApiResponse.success("Program created",
         service.createProgram(program)));
 }

 @PutMapping("/programs/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TrainingProgramResponse>> updateProgram(
         @PathVariable Long id, @RequestBody TrainingProgram program) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateProgram(id, program)));
 }

 @GetMapping("/programs/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TrainingProgramResponse>> getProgram(
         @PathVariable Long id,
         @RequestParam(required = false) Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getProgram(id, employeeId)));
 }

 @GetMapping("/programs")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<TrainingProgramResponse>>>
         getAllPrograms() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllPrograms()));
 }

 @GetMapping("/programs/open")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<TrainingProgramResponse>>>
         getOpenPrograms(@RequestParam(required = false) Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getOpenPrograms(employeeId)));
 }

 @DeleteMapping("/programs/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> deleteProgram(
         @PathVariable Long id) {
     service.deleteProgram(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/programs/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TrainingProgramResponse>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateStatus(id, status)));
 }

 // ENROLLMENTS
 @PostMapping("/enroll")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TrainingEnrollmentResponse>> enroll(
         @RequestBody Map<String, Long> body) {
     return ResponseEntity.ok(ApiResponse.success("Enrolled",
         service.enroll(body.get("programId"), body.get("employeeId"))));
 }

 @GetMapping("/enrollments/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<TrainingEnrollmentResponse>>>
         getMyEnrollments(@PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getMyEnrollments(empId)));
 }

 @GetMapping("/enrollments/program/{programId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<TrainingEnrollmentResponse>>>
         getEnrollmentsByProgram(@PathVariable Long programId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEnrollmentsByProgram(programId)));
 }

 @PatchMapping("/enrollments/{id}/complete")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TrainingEnrollmentResponse>>
         markComplete(@PathVariable Long id,
                       @RequestBody Map<String, Object> body) {
     BigDecimal score = body.get("score") != null
         ? new BigDecimal(body.get("score").toString()) : null;
     String grade = (String) body.get("grade");
     String certUrl = (String) body.get("certificateUrl");
     return ResponseEntity.ok(ApiResponse.success("Completed",
         service.markComplete(id, score, grade, certUrl)));
 }

 @PatchMapping("/enrollments/{id}/feedback")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TrainingEnrollmentResponse>>
         submitFeedback(@PathVariable Long id,
                         @RequestBody Map<String, Object> body) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submitFeedback(id,
             (Integer) body.get("rating"),
             (String) body.get("feedback"))));
 }

 @DeleteMapping("/enrollments/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> dropEnrollment(
         @PathVariable Long id) {
     service.dropEnrollment(id);
     return ResponseEntity.ok(ApiResponse.success("Dropped"));
 }

 // STATISTICS
 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }

 @GetMapping("/statistics/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>>
         getEmployeeStats(@PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeLearningStats(empId)));
 }
}