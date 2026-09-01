
//controller/SettlementController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.FnFSettlementResponse;
import com.hrms.model.FullFinalSettlement;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

 private final SettlementService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> create(
         @RequestBody FullFinalSettlement settlement) {
     return ResponseEntity.ok(ApiResponse.success("Settlement created",
         service.create(settlement)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> update(
         @PathVariable Long id, @RequestBody FullFinalSettlement settlement) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.update(id, settlement)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id)));
 }

 @GetMapping("/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> getByEmployee(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByEmployee(empId)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<FnFSettlementResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @GetMapping("/status/{status}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<FnFSettlementResponse>>> getByStatus(
         @PathVariable String status) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByStatus(status)));
 }

 @GetMapping("/auto-calculate/{empId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> autoCalculate(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Calculated",
         service.autoCalculate(empId)));
 }

 @PatchMapping("/{id}/submit")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> submit(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submitForApproval(id)));
 }

 @PatchMapping("/{id}/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> approve(
         @PathVariable Long id, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Approved",
         service.approve(id, user.getId())));
 }

 @PatchMapping("/{id}/mark-paid")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> markPaid(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Marked as paid",
         service.markPaid(id, body.get("paymentReference"),
             body.get("paymentMode"))));
 }

 @PatchMapping("/{id}/hold")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<FnFSettlementResponse>> putOnHold(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("On Hold",
         service.putOnHold(id, body.get("reason"))));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @GetMapping("/{id}/pdf")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable Long id) {
     byte[] pdf = service.generatePdf(id);
     return ResponseEntity.ok()
             .contentType(MediaType.APPLICATION_PDF)
             .header(HttpHeaders.CONTENT_DISPOSITION,
                 "attachment; filename=\"FnF_Settlement_" + id + ".pdf\"")
             .contentLength(pdf.length)
             .body(new ByteArrayResource(pdf));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }
}