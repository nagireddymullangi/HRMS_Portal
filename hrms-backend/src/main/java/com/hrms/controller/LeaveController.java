
//controller/LeaveController.java
package com.hrms.controller;

import com.hrms.dto.request.LeaveRequest;
import com.hrms.dto.request.LeaveStatusRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.LeaveResponse;
import com.hrms.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

 private final LeaveService leaveService;

 @PostMapping("/apply/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<LeaveResponse>> apply(
         @PathVariable Long employeeId,
         @Valid @RequestBody LeaveRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Leave applied successfully",
                     leaveService.applyLeave(employeeId, request)),
             HttpStatus.CREATED);
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<LeaveResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", leaveService.getLeaveById(id)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<LeaveResponse>>> getByEmployee(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     leaveService.getLeavesByEmployee(employeeId)));
 }

 @GetMapping("/all")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAll() {
     return ResponseEntity.ok(
             ApiResponse.success("Success", leaveService.getAllLeaves()));
 }

 @GetMapping("/pending")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<LeaveResponse>>> getPending() {
     return ResponseEntity.ok(
             ApiResponse.success("Success", leaveService.getPendingLeaves()));
 }

 @PutMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<LeaveResponse>> updateStatus(
         @PathVariable Long id,
         @RequestBody LeaveStatusRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Leave status updated",
                     leaveService.updateLeaveStatus(id, request)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     leaveService.deleteLeave(id);
     return ResponseEntity.ok(
             ApiResponse.success("Leave deleted successfully"));
 }

 @GetMapping("/types")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<Object>>> getLeaveTypes() {
     return ResponseEntity.ok(
             ApiResponse.success("Success", leaveService.getLeaveTypes()));
 }
}