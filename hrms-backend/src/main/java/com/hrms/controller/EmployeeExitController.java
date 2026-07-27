
//controller/EmployeeExitController.java
package com.hrms.controller;

import com.hrms.dto.request.EmployeeExitRequest;
import com.hrms.dto.request.ExitUpdateRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.EmployeeExitResponse;
import com.hrms.service.EmployeeExitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-exits")
@RequiredArgsConstructor
public class EmployeeExitController {

 private final EmployeeExitService service;

 @PostMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<EmployeeExitResponse>> initiate(
         @Valid @RequestBody EmployeeExitRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Exit initiated", service.initiate(request)),
             HttpStatus.CREATED);
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<EmployeeExitResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<EmployeeExitResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", service.getById(id)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<EmployeeExitResponse>>> getByEmployee(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", service.getByEmployee(employeeId)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EmployeeExitResponse>> update(
         @PathVariable Long id, @RequestBody ExitUpdateRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Updated", service.update(id, request)));
 }

 @PatchMapping("/{id}/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EmployeeExitResponse>> approve(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Approved", service.approveExit(id)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> cancel(@PathVariable Long id) {
     service.cancel(id);
     return ResponseEntity.ok(ApiResponse.success("Cancelled"));
 }
}