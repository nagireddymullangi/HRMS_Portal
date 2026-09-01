
//controller/ComplianceController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.ComplianceEvent;
import com.hrms.model.StatutoryRecord;
import com.hrms.service.ComplianceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ComplianceController {

 private final ComplianceService service;

 // STATUTORY RECORDS
 @PostMapping("/records")
 public ResponseEntity<ApiResponse<StatutoryRecord>> createRecord(
         @RequestBody StatutoryRecord record) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createRecord(record)));
 }

 @GetMapping("/records")
 public ResponseEntity<ApiResponse<List<StatutoryRecord>>> getAllRecords() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllRecords()));
 }

 @GetMapping("/records/{id}")
 public ResponseEntity<ApiResponse<StatutoryRecord>> getRecord(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRecord(id)));
 }

 @GetMapping("/records/type/{type}")
 public ResponseEntity<ApiResponse<List<StatutoryRecord>>> getByType(
         @PathVariable String type) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRecordsByType(type)));
 }

 @GetMapping("/records/period")
 public ResponseEntity<ApiResponse<List<StatutoryRecord>>> getByPeriod(
         @RequestParam Integer year,
         @RequestParam(required = false) Integer month) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRecordsByPeriod(year, month)));
 }

 @PutMapping("/records/{id}")
 public ResponseEntity<ApiResponse<StatutoryRecord>> updateRecord(
         @PathVariable Long id, @RequestBody StatutoryRecord record) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateRecord(id, record)));
 }

 @PatchMapping("/records/{id}/file")
 public ResponseEntity<ApiResponse<StatutoryRecord>> markFiled(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Filed",
         service.markFiled(id, body.get("acknowledgmentNumber"))));
 }

 @PatchMapping("/records/{id}/pay")
 public ResponseEntity<ApiResponse<StatutoryRecord>> markPaid(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Paid",
         service.markPaid(id, body.get("challanNumber"))));
 }

 @DeleteMapping("/records/{id}")
 public ResponseEntity<ApiResponse<String>> deleteRecord(
         @PathVariable Long id) {
     service.deleteRecord(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // COMPLIANCE EVENTS
 @PostMapping("/events")
 public ResponseEntity<ApiResponse<ComplianceEvent>> createEvent(
         @RequestBody ComplianceEvent event) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createEvent(event)));
 }

 @GetMapping("/events")
 public ResponseEntity<ApiResponse<List<ComplianceEvent>>> getAllEvents() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllEvents()));
 }

 @GetMapping("/events/upcoming")
 public ResponseEntity<ApiResponse<List<ComplianceEvent>>> getUpcoming(
         @RequestParam(defaultValue = "30") int days) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getUpcomingEvents(days)));
 }

 @GetMapping("/events/overdue")
 public ResponseEntity<ApiResponse<List<ComplianceEvent>>> getOverdue() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getOverdueEvents()));
 }

 @PutMapping("/events/{id}")
 public ResponseEntity<ApiResponse<ComplianceEvent>> updateEvent(
         @PathVariable Long id, @RequestBody ComplianceEvent event) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateEvent(id, event)));
 }

 @PatchMapping("/events/{id}/complete")
 public ResponseEntity<ApiResponse<ComplianceEvent>> completeEvent(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Completed",
         service.completeEvent(id, body.get("notes"))));
 }

 @DeleteMapping("/events/{id}")
 public ResponseEntity<ApiResponse<String>> deleteEvent(
         @PathVariable Long id) {
     service.deleteEvent(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // ANALYTICS
 @GetMapping("/dashboard")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getDashboardStats()));
 }

 @GetMapping("/report")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getReport(
         @RequestParam Integer year) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getComplianceReport(year)));
 }
}