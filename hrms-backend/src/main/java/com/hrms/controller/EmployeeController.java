
//controller/EmployeeController.java
package com.hrms.controller;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeController {

 private final EmployeeService employeeService;

 @PostMapping
 public ResponseEntity<ApiResponse<EmployeeResponse>> create(
         @Valid @RequestBody EmployeeRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Employee created successfully",
                     employeeService.createEmployee(request)),
             HttpStatus.CREATED);
 }

 @GetMapping("/{id}")
 public ResponseEntity<ApiResponse<EmployeeResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     employeeService.getEmployeeById(id)));
 }

 @GetMapping("/user/{userId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<EmployeeResponse>> getByUserId(
         @PathVariable Long userId) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     employeeService.getEmployeeByUserId(userId)));
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAll() {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     employeeService.getAllEmployees()));
 }

 @PutMapping("/{id}")
 public ResponseEntity<ApiResponse<EmployeeResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody EmployeeRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Employee updated successfully",
                     employeeService.updateEmployee(id, request)));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     employeeService.deleteEmployee(id);
     return ResponseEntity.ok(
             ApiResponse.success("Employee deleted successfully"));
 }

 @GetMapping("/search")
 public ResponseEntity<ApiResponse<List<EmployeeResponse>>> search(
         @RequestParam String keyword) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     employeeService.searchEmployees(keyword)));
 }
}