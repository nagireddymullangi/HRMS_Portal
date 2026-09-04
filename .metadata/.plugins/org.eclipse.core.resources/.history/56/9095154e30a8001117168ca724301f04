
//controller/DailyWorkController.java
package com.hrms.controller;

import com.hrms.dto.response.*;
import com.hrms.model.*;
import com.hrms.repository.UserRepository;
import com.hrms.service.DailyWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-work")
@RequiredArgsConstructor
public class DailyWorkController {

 private final DailyWorkService service;
 private final UserRepository userRepository;

 // ============ ASSIGNMENTS ============

 @PostMapping("/assignments")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> create(
         @RequestBody DailyWorkAssignment assignment,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Assignment created",
         service.createAssignment(assignment, user.getId())));
 }

 @PostMapping("/assignments/bulk")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<AssignmentResponse>>> createBulk(
         @RequestBody List<DailyWorkAssignment> assignments,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Bulk assignments created",
         service.createBulkAssignments(assignments, user.getId())));
 }

 @PutMapping("/assignments/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> update(
         @PathVariable Long id,
         @RequestBody DailyWorkAssignment assignment) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateAssignment(id, assignment)));
 }

 @GetMapping("/assignments/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAssignment(id)));
 }

 @GetMapping("/assignments")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAll(
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
     List<AssignmentResponse> data = date != null
         ? service.getAssignmentsByDate(date)
         : service.getAllAssignments();
     return ResponseEntity.ok(ApiResponse.success("Success", data));
 }

 @GetMapping("/assignments/overdue")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getOverdue() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getOverdueAssignments()));
 }

 @GetMapping("/assignments/my/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getMy(
         @PathVariable Long empId,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

     List<AssignmentResponse> data;
     if (startDate != null && endDate != null) {
         data = service.getMyAssignmentsByDateRange(empId, startDate, endDate);
     } else if (date != null) {
         data = service.getMyAssignmentsByDate(empId, date);
     } else {
         data = service.getMyAssignments(empId);
     }

     return ResponseEntity.ok(ApiResponse.success("Success", data));
 }

 @DeleteMapping("/assignments/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteAssignment(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // ============ WORKFLOW ============

 @PatchMapping("/assignments/{id}/accept")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> accept(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Accepted",
         service.acceptAssignment(id)));
 }

 @PatchMapping("/assignments/{id}/start")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> start(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Started",
         service.startTask(id)));
 }

 @PatchMapping("/assignments/{id}/pause")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> pause(
         @PathVariable Long id,
         @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Paused",
         service.pauseTask(id, body.get("reason"))));
 }

 @PatchMapping("/assignments/{id}/block")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> block(
         @PathVariable Long id,
         @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Blocked",
         service.blockTask(id, body.get("blockerReason"))));
 }

 @PatchMapping("/assignments/{id}/resume")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> resume(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Resumed",
         service.resumeTask(id)));
 }

 @PatchMapping("/assignments/{id}/complete")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> complete(
         @PathVariable Long id,
         @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Completed",
         service.completeTask(id, body.get("notes"))));
 }

 @PatchMapping("/assignments/{id}/progress")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentResponse>> updateProgress(
         @PathVariable Long id,
         @RequestBody Map<String, Integer> body) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateProgress(id, body.get("percentage"))));
 }

 // ============ COMMENTS ============

 @PostMapping("/assignments/{id}/comments")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AssignmentComment>> addComment(
         @PathVariable Long id,
         @RequestBody Map<String, String> body,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Comment added",
         service.addComment(id, user.getId(),
             body.get("comment"), body.get("type"))));
 }

 @GetMapping("/assignments/{id}/comments")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<AssignmentComment>>> getComments(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getComments(id)));
 }

 // ============ BREAKS ============

 @PostMapping("/breaks/start")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<BreakSessionResponse>> startBreak(
         @RequestBody Map<String, Object> body) {
     Long empId = Long.valueOf(body.get("employeeId").toString());
     String breakType = (String) body.get("breakType");
     String reason = (String) body.get("reason");
     String location = (String) body.get("location");
     return ResponseEntity.ok(ApiResponse.success("Break started",
         service.startBreak(empId, breakType, reason, location)));
 }

 @PatchMapping("/breaks/{id}/end")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<BreakSessionResponse>> endBreak(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Break ended",
         service.endBreak(id)));
 }

 @GetMapping("/breaks/current/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<BreakSessionResponse>> getCurrentBreak(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getCurrentBreak(empId)));
 }

 @GetMapping("/breaks/my/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<BreakSessionResponse>>> getMyBreaks(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getMyBreaks(empId)));
 }

 @GetMapping("/breaks/active")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<BreakSessionResponse>>> getActiveBreaks() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllActiveBreaks()));
 }

 @PatchMapping("/breaks/{id}/force-end")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<BreakSessionResponse>> forceEnd(
         @PathVariable Long id,
         @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Break force ended",
         service.forceEndBreak(id, body.get("adminNote"))));
 }

 // ============ DASHBOARD ============

 @GetMapping("/dashboard/my/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<DailyWorkDashboard>> getMyDashboard(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getMyDashboard(empId)));
 }

 @GetMapping("/dashboard/team")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getTeamDashboard() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getTeamDashboard()));
 }

 @GetMapping("/stats/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStats(
         @PathVariable Long empId,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate startDate,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate endDate) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeStats(empId, startDate, endDate)));
 }
}