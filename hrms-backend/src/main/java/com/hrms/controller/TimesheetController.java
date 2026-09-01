
//controller/TimesheetController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.TimesheetResponse;
import com.hrms.model.Timesheet;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.TimesheetService;
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
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

 private final TimesheetService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> create(
         @RequestBody Timesheet timesheet) {
     return ResponseEntity.ok(ApiResponse.success("Timesheet created",
         service.create(timesheet)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> update(
         @PathVariable Long id, @RequestBody Timesheet timesheet) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.update(id, timesheet)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @GetMapping("/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getByEmployee(
         @PathVariable Long empId,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

     List<TimesheetResponse> data = (startDate != null && endDate != null)
         ? service.getByEmployeeAndDateRange(empId, startDate, endDate)
         : service.getByEmployee(empId);

     return ResponseEntity.ok(ApiResponse.success("Success", data));
 }

 @GetMapping("/project/{projectId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getByProject(
         @PathVariable Long projectId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByProject(projectId)));
 }

 @GetMapping("/status/{status}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getByStatus(
         @PathVariable String status) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByStatus(status)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/{id}/submit")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> submit(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submit(id)));
 }

 @PatchMapping("/{id}/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> approve(
         @PathVariable Long id, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Approved",
         service.approve(id, user.getId())));
 }

 @PatchMapping("/{id}/reject")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<TimesheetResponse>> reject(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Rejected",
         service.reject(id, body.get("reason"))));
 }

 @PostMapping("/bulk/submit")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> submitBulk(
         @RequestBody List<Long> ids) {
     service.submitBulk(ids);
     return ResponseEntity.ok(ApiResponse.success(
         ids.size() + " timesheets submitted"));
 }

 @PostMapping("/bulk/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> approveBulk(
         @RequestBody List<Long> ids, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     service.approveBulk(ids, user.getId());
     return ResponseEntity.ok(ApiResponse.success(
         ids.size() + " timesheets approved"));
 }

 @GetMapping("/stats/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStats(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeStats(empId)));
 }

 @GetMapping("/stats/project/{projectId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectStats(
         @PathVariable Long projectId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getProjectStats(projectId)));
 }

 @GetMapping("/weekly/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getWeekly(
         @PathVariable Long empId,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate weekStart) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getWeeklySummary(empId, weekStart)));
 }
}