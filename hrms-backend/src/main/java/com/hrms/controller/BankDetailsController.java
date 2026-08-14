
//controller/BankDetailsController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.BankDetails;
import com.hrms.service.BankDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-details")
@RequiredArgsConstructor
public class BankDetailsController {

 private final BankDetailsService service;

 @PostMapping("/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<BankDetails>> save(
         @PathVariable Long employeeId,
         @RequestBody BankDetails details) {
     return ResponseEntity.ok(ApiResponse.success("Saved",
         service.createOrUpdate(employeeId, details)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<BankDetails>> get(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByEmployeeId(employeeId)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<BankDetails>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @PatchMapping("/{id}/verify")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<BankDetails>> verify(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Verified",
         service.verify(id)));
 }
}